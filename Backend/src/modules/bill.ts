// src/modules/Bills/bill.ts
import { Router } from "express";
import prisma from "../prisma";
import { authMiddleware } from "../middleware/authMiddleware";
import { sendFlexMessage } from "../utils/lineFlex";

// ⚙️ Helper
const formatThaiDate = (dateInput?: string | Date | null) => {
  if (!dateInput) return "-";
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  return date.toLocaleDateString("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

// 🌐 Router
const billRouter = Router();
const logTime = () => new Date().toISOString().replace("T", " ").split(".")[0];

// 🧾 สร้างบิลใหม่
billRouter.post("/create", authMiddleware, async (req, res) => {
  try {
    const adminId = req.admin!.adminId;
    const {
      roomId,
      customerId,
      bookingId,
      month,
      wBefore,
      wAfter,
      eBefore,
      eAfter,
    } = req.body;

    if (!roomId || !customerId) throw new Error("ข้อมูลห้องหรือผู้เช่าไม่ครบ");
    if (!month) throw new Error("กรุณาเลือกเดือน");
    if (wAfter === undefined || eAfter === undefined)
      throw new Error("กรุณากรอกหน่วยน้ำและหน่วยไฟ");

    const billMonth = new Date(month);
    if (isNaN(billMonth.getTime())) throw new Error("เดือนของบิลไม่ถูกต้อง");

    const room = await prisma.room.findUnique({
      where: { roomId },
      select: { roomId: true, number: true, rent: true },
    });
    if (!room) throw new Error("ไม่พบข้อมูลห้อง");

    const rent = room.rent;
    const service = 20;
    const wPrice = 19;
    const ePrice = 7;

    // ดึงบิลเดือนก่อนหน้ามาคำนวณค่าน้ำ/ไฟ
    const prevMonth = new Date(billMonth);
    prevMonth.setMonth(prevMonth.getMonth() - 1);
    const prevBill = await prisma.bill.findFirst({
      where: {
        roomId,
        month: {
          gte: new Date(prevMonth.getFullYear(), prevMonth.getMonth(), 1),
          lt: new Date(billMonth.getFullYear(), billMonth.getMonth(), 1),
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const finalWBefore = prevBill?.wAfter ?? wBefore ?? 0;
    const finalEBefore = prevBill?.eAfter ?? eBefore ?? 0;

    const wUnits = Math.max(0, wAfter - finalWBefore);
    const eUnits = Math.max(0, eAfter - finalEBefore);
    const waterCost = wUnits * wPrice;
    const electricCost = eUnits * ePrice;
    const fine = 0;
    const total = rent + service + waterCost + electricCost + fine;

    const createdAt = new Date();
    const dueDate = new Date(createdAt);
    dueDate.setMonth(dueDate.getMonth() + 1);
    dueDate.setDate(5);

    // 💾 บันทึกลงฐานข้อมูล
    const bill = await prisma.bill.create({
      data: {
        month: billMonth,
        rent,
        service,
        wBefore: finalWBefore,
        wAfter,
        wUnits,
        wPrice,
        waterCost,
        eBefore: finalEBefore,
        eAfter,
        eUnits,
        ePrice,
        electricCost,
        fine,
        total,
        dueDate,
        status: 0,
        slipUrl: "",
        room: { connect: { roomId } },
        customer: { connect: { customerId } },
        booking: bookingId ? { connect: { bookingId } } : undefined,
        adminCreated: { connect: { adminId } },
      },
      include: {
        room: true,
        customer: true,
        booking: true,
      },
    });

    // 📩 แจ้ง LINE ลูกค้า
    if (bill.customer?.userId) {
      const billUrl = `https://smartdorm-detail.biwbong.shop/bill/${bill.billId}`;
      const formattedMonth = bill.month.toLocaleDateString("th-TH", {
        year: "numeric",
        month: "long",
      });

      await sendFlexMessage(
        bill.customer.userId,
        `🧾 SmartDorm แจ้งบิลค่าเช่าห้อง ประจำเดือน ${formattedMonth}`,
        [
          { label: "🏠 ห้อง", value: bill.room.number },
          {
            label: "ค่าน้ำ",
            value: `${bill.wUnits} หน่วย (${bill.waterCost} บาท)`,
          },
          {
            label: "ค่าไฟ",
            value: `${bill.eUnits} หน่วย (${bill.electricCost} บาท)`,
          },
          { label: "ค่าส่วนกลาง", value: `${bill.service} บาท` },
          { label: "ค่าเช่าห้อง", value: `${bill.rent} บาท` },
          {
            label: "ยอดรวมทั้งหมด",
            value: `${bill.total} บาท`,
            color: "#27ae60",
          },
          {
            label: "ครบกำหนดชำระ",
            value: formatThaiDate(bill.dueDate),
            color: "#e67e22",
          },
        ],
        [
          {
            label: "ดูรายละเอียดและชำระเงิน",
            url: billUrl,
            style: "primary",
          },
        ]
      );
    }
    console.log(
      `[${logTime()}] ส่งแจ้งเตือนไลน์ สำเร็จแล้ว รหัสการจอง ${bill.customer?.userName} : `
    );
    res.json({ message: "สร้างบิลสำเร็จและแจ้งลูกค้าแล้ว", bill });
  } catch (err: any) {
    console.error("❌ [createBill] Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// 🏠 สร้างบิลจาก roomId โดยค้นหา booking ปัจจุบันอัตโนมัติ
billRouter.post("/createFromRoom/:roomId", authMiddleware, async (req, res) => {
  try {
    const adminId = req.admin!.adminId;
    const roomId = req.params.roomId;
    const { month, wBefore, wAfter, eBefore, eAfter } = req.body;

    const booking = await prisma.booking.findFirst({
      where: { roomId, approveStatus: 1, checkoutStatus: 0 },
      select: {
        bookingId: true,
        fullName: true,
        cphone: true,
        customer: {
          select: { customerId: true, userId: true, userName: true },
        },
      },
    });

    if (!booking) throw new Error("ไม่พบบุ๊กกิ้งของห้องนี้");

    const data = {
      roomId,
      customerId: booking.customer.customerId,
      bookingId: booking.bookingId,
      month,
      wBefore,
      wAfter,
      eBefore,
      eAfter,
    };

    const response = await fetch(
      `${req.protocol}://${req.get("host")}/bill/create`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          cookie: req.headers.cookie || "",
        },
        body: JSON.stringify(data),
      }
    );
    const result = await response.json();

    res.json({ message: "สร้างบิลสำเร็จและเชื่อม Booking แล้ว", result });
  } catch (err: any) {
    console.error("❌ [createFromRoom] Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// 📋 ดึงบิลทั้งหมด
billRouter.get("/getall", async (_req, res) => {
  try {
    const bills = await prisma.bill.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        room: true,
        booking: true,
        customer: true,
        payment: true,
      },
    });
    res.json(bills);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 🔍 ดึงบิลรายตัว
billRouter.get("/:billId", async (req, res) => {
  try {
    const bill = await prisma.bill.findUnique({
      where: { billId: req.params.billId },
      include: {
        room: true,
        booking: true,
        customer: true,
        payment: true,
      },
    });
    if (!bill) throw new Error("ไม่พบบิลในระบบ");
    res.json(bill);
  } catch (err: any) {
    res.status(404).json({ error: err.message });
  }
});

billRouter.put("/:billId", authMiddleware, async (req, res) => {
  try {
    const updated = await prisma.bill.update({
      where: { billId: req.params.billId },
      data: { ...req.body, updatedBy: req.admin!.adminId },
      include: { room: true, booking: true, customer: true, payment: true }, // ✅ เพิ่ม
    });
    res.json({ message: "อัปเดตบิลสำเร็จ", updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

//ลบ
billRouter.delete("/:billId", authMiddleware, async (req, res) => {
  try {
    const { billId } = req.params;

    // ลบ payment ก่อน (ถ้ามี)
    await prisma.payment.deleteMany({ where: { billId } });

   // 🗑️ ลบบิล
    await prisma.bill.delete({ where: { billId } });

    res.json({ message: "ลบบิลและข้อมูลการชำระสำเร็จ" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});