import { Router } from "express";
import prisma from "../prisma";
import { authMiddleware } from "../middleware/authMiddleware";
import { sendFlexMessage } from "../utils/lineFlex";
import { createClient } from "@supabase/supabase-js";

/* ================= Helpers ================= */
const formatThaiDate = (dateInput?: string | Date | null) => {
  if (!dateInput) return "-";
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  return date.toLocaleDateString("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const logTime = () => new Date().toISOString().replace("T", " ").split(".")[0];

/* ================= Supabase ================= */
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_KEY!
);

const deleteSlip = async (url: string) => {
  const bucket = process.env.SUPABASE_BUCKET!;
  if (!url || !bucket) return;

  const marker = `/object/public/${bucket}/`;
  const idx = url.indexOf(marker);
  if (idx === -1) return;

  const path = url.substring(idx + marker.length);
  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) console.error("❌ Delete Slip Error:", error.message);
};

/* ================= Router ================= */
const billRouter = Router();

/* =================================================
   CREATE BILL
================================================= */
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
      throw new Error("กรุณากรอกหน่วยน้ำและไฟ");

    const billMonth = new Date(month);
    if (isNaN(billMonth.getTime())) throw new Error("เดือนของบิลไม่ถูกต้อง");

    // ❗ ป้องกันบิลซ้ำ (ห้อง + เดือนเดียวกัน)
    const existed = await prisma.bill.findFirst({
      where: { roomId, month: billMonth },
    });
    if (existed) throw new Error("มีบิลของเดือนนี้แล้ว");

    const room = await prisma.room.findUnique({
      where: { roomId },
      select: { number: true, rent: true },
    });
    if (!room) throw new Error("ไม่พบข้อมูลห้อง");

    const service = 50;
    const wPrice = 19;
    const ePrice = 7;

    // บิลเดือนก่อน
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
    const total = room.rent + service + waterCost + electricCost;

    const dueDate = new Date(billMonth);
    dueDate.setMonth(dueDate.getMonth() + 1);
    dueDate.setDate(5);
    dueDate.setHours(0, 0, 0, 0);

    const bill = await prisma.bill.create({
      data: {
        month: billMonth,
        rent: room.rent,
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
        total,
        dueDate,
        status: "UNPAID", // ✅ enum
        room: { connect: { roomId } },
        customer: { connect: { customerId } },
        booking: bookingId ? { connect: { bookingId } } : undefined,
        adminCreated: { connect: { adminId } },
      },
      include: { room: true, customer: true },
    });

    // แจ้ง LINE ลูกค้า
    if (bill.customer?.userId) {
      const billUrl = `https://smartdorm-detail.biwbong.shop/bill/${bill.billId}`;
      const formattedMonth = bill.month.toLocaleDateString("th-TH", {
        year: "numeric",
        month: "long",
      });

      await sendFlexMessage(
        bill.customer.userId,
        `🧾 SmartDorm แจ้งบิลค่าเช่าห้อง เดือน ${formattedMonth}`,
        [
          { label: "🏠 ห้อง", value: bill.room.number },
          { label: "ค่าน้ำ", value: `${bill.waterCost} บาท` },
          { label: "ค่าไฟ", value: `${bill.electricCost} บาท` },
          { label: "ค่าส่วนกลาง", value: `${bill.service} บาท` },
          { label: "ยอดรวม", value: `${bill.total} บาท`, color: "#27ae60" },
          { label: "ครบกำหนด", value: formatThaiDate(bill.dueDate) },
        ],
        [{ label: "ดูบิล", url: billUrl, style: "primary" }]
      );
    }

    console.log(`[${logTime()}] สร้างบิลสำเร็จ`);
    res.json({ message: "สร้างบิลสำเร็จ", bill });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

/* =================================================
   GET ALL
================================================= */
billRouter.get("/getall", async (_req, res) => {
  const bills = await prisma.bill.findMany({
    orderBy: { createdAt: "desc" },
    include: { room: true, booking: true, customer: true, payment: true },
  });
  res.json(bills);
});

/* =================================================
   GET BY ID
================================================= */
billRouter.get("/:billId", async (req, res) => {
  const bill = await prisma.bill.findUnique({
    where: { billId: req.params.billId },
    include: { room: true, booking: true, customer: true, payment: true },
  });
  if (!bill) return res.status(404).json({ error: "ไม่พบบิล" });
  res.json(bill);
});

/* =================================================
   APPROVE BILL (VERIFYING -> PAID)
================================================= */
billRouter.put("/:billId/approve", authMiddleware, async (req, res) => {
  const bill = await prisma.bill.findUnique({
    where: { billId: req.params.billId },
    select: { status: true },
  });
  if (!bill) return res.status(404).json({ error: "ไม่พบบิล" });
  if (bill.status === "PAID")
    return res.status(400).json({ error: "บิลนี้ชำระแล้ว" });

  const updated = await prisma.bill.update({
    where: { billId: req.params.billId },
    data: { status: "PAID" }, // ✅ enum
  });

  res.json({ message: "อนุมัติบิลสำเร็จ", updated });
});

/* =================================================
   REJECT BILL (VERIFYING -> UNPAID)
================================================= */
billRouter.put("/:billId/reject", authMiddleware, async (req, res) => {
  const bill = await prisma.bill.findUnique({
    where: { billId: req.params.billId },
    select: { status: true },
  });
  if (!bill) return res.status(404).json({ error: "ไม่พบบิล" });
  if (bill.status === "PAID")
    return res.status(400).json({ error: "บิลนี้ชำระแล้ว ปฏิเสธไม่ได้" });

  const updated = await prisma.bill.update({
    where: { billId: req.params.billId },
    data: { status: "UNPAID" }, // ✅ enum
  });

  res.json({ message: "ปฏิเสธบิลสำเร็จ", updated });
});

/* =================================================
   DELETE BILL
================================================= */
billRouter.delete("/:billId", authMiddleware, async (req, res) => {
  const billId = req.params.billId;

  const payments = await prisma.payment.findMany({
    where: { billId },
    select: { slipUrl: true },
  });

  for (const p of payments) {
    if (p.slipUrl) await deleteSlip(p.slipUrl);
  }

  await prisma.payment.deleteMany({ where: { billId } });
  await prisma.bill.delete({ where: { billId } });

  res.json({ message: "ลบบิลสำเร็จ" });
});

export default billRouter;
