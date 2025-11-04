// src/modules/Bills/billService.ts
import { billRepository } from "./billRepository";
import { CreateBillInput, BillUpdateInput } from "./billModel";
import { sendFlexMessage } from "../../utils/lineFlex";

const formatThaiDate = (dateInput: string | Date) => {
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  return date.toLocaleDateString("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export const billService = {
  // 📋 ดึงบิลทั้งหมด
  async getAllBills() {
    return await billRepository.findAll();
  },

  // 🔍 ดึงบิลรายตัว
  async getBillById(billId: string) {
    const bill = await billRepository.findById(billId);
    if (!bill) throw new Error("ไม่พบบิลในระบบ");

    return {
      ...bill,
      fullName: bill.booking?.fullName || "-",
      cphone: bill.booking?.cphone || "-",
      lineName: bill.customer?.userName || "-",
    };
  },

  // 🧾 ✅ สร้างบิลใหม่ (เหลืออันเดียวเท่านั้น)
  async createBill(data: CreateBillInput, adminId: string) {
    try {
      const { roomId, customerId, month, wBefore, wAfter, eBefore, eAfter } =
        data;

      // ✅ ตรวจสอบข้อมูลเบื้องต้น
      if (!roomId || !customerId)
        throw new Error("ข้อมูลห้องหรือผู้เช่าไม่ครบ");
      if (!month) throw new Error("กรุณาเลือกเดือน");
      if (wAfter === undefined || eAfter === undefined)
        throw new Error("กรุณากรอกหน่วยน้ำและหน่วยไฟ");

      const billMonth = new Date(month);
      if (isNaN(billMonth.getTime())) throw new Error("เดือนไม่ถูกต้อง");

      console.log("DEBUG - createBill:", { roomId, month, billMonth });

      // ดึงข้อมูลห้อง
      const room = await billRepository.findRoom(roomId);
      if (!room) throw new Error("ไม่พบข้อมูลห้อง");

      // คำนวณราคาพื้นฐาน
      const rent = room.rent;
      const service = 20;
      const wPrice = 19;
      const ePrice = 7;

      // 🔙 ดึงบิลเดือนก่อนหน้า
      const prevBill = await billRepository.findPrevBill(roomId, billMonth);
      console.log("DEBUG - prevBill:", prevBill);

      const finalWBefore = prevBill?.wAfter ?? wBefore ?? 0;
      const finalEBefore = prevBill?.eAfter ?? eBefore ?? 0;

      const wUnits = Math.max(0, wAfter - finalWBefore);
      const eUnits = Math.max(0, eAfter - finalEBefore);
      const waterCost = wUnits * wPrice;
      const electricCost = eUnits * ePrice;

      const createdAt = new Date();
      const dueDate = new Date(createdAt);
      dueDate.setMonth(dueDate.getMonth() + 1);
      dueDate.setDate(5);

      const fine = 0;
      const total = rent + service + waterCost + electricCost + fine;

      const bill = await billRepository.create({
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
        slipUrl: "",
        status: 0,
        roomId,
        customerId,
        createdBy: adminId,
        createdAt,
      });

      // ✅ ส่งข้อความ LINE ถ้ามี
      if (bill.customer && bill.customer.userId) {
        const billUrl = `https://smartdorm-detail.biwbong.shop/bill/${bill.billId}`;
        await sendFlexMessage(
          bill.customer.userId,
          "🧾 บิลค่าเช่าห้อง SmartDorm ของคุณ",
          [
            { label: "🏠 ห้อง", value: bill.room.number },
            {
              label: "เดือน",
              value: bill.month.toLocaleDateString("th-TH", {
                year: "numeric",
                month: "long",
              }),
            },
            {
              label: "💧 ค่าน้ำ",
              value: `${bill.wUnits} หน่วย (${bill.waterCost.toLocaleString()} บาท)`,
            },
            {
              label: "⚡ ค่าไฟ",
              value: `${bill.eUnits} หน่วย (${bill.electricCost.toLocaleString()} บาท)`,
            },
            {
              label: "🏢 ค่าส่วนกลาง",
              value: `${bill.service.toLocaleString()} บาท`,
            },
            {
              label: "💰 ค่าเช่าห้อง",
              value: `${bill.rent.toLocaleString()} บาท`,
            },
            {
              label: "💵 ยอดรวมทั้งหมด",
              value: `${bill.total.toLocaleString()} บาท`,
              color: "#27ae60",
            },
            {
              label: "📅 ครบกำหนดชำระ",
              value: formatThaiDate(bill.dueDate),
              color: "#e67e22",
            },
          ],
          "🔗 ดูรายละเอียดบิล",
          billUrl
        );
      }

      return bill;
    } catch (err: any) {
      console.error("❌ [createBill] ERROR:", err);
      throw new Error(err.message || "เกิดข้อผิดพลาดระหว่างสร้างบิล");
    }
  },

  // 🧾 สร้างบิลจาก roomId (แอดมินใช้)
  async createBillFromRoom(roomId: string, body: any, adminId: string) {
    const { month, wBefore, wAfter, eBefore, eAfter } = body;
    const booking = await billRepository.findBooking(roomId);
    if (!booking) throw new Error("ไม่พบบุ๊กกิ้งของห้องนี้");

    return await this.createBill(
      {
        roomId,
        customerId: booking.customerId,
        month,
        wBefore,
        wAfter,
        eBefore,
        eAfter,
      },
      adminId
    );
  },

  // ✏️ อัปเดตบิล
  async updateBill(billId: string, data: BillUpdateInput, adminId: string) {
    return await billRepository.update(billId, { ...data, updatedBy: adminId });
  },

  // 🗑️ ลบบิล
  async deleteBill(billId: string) {
    return await billRepository.delete(billId);
  },
};
