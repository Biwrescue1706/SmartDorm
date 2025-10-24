// src/modules/Bills/billService.ts
import { billRepository } from "./billRepository";
import { CreateBillInput, BillUpdateInput } from "./billModel";
import { notifyUser } from "../../utils/lineNotify";

// 🗓️ ฟังก์ชันแปลงวันที่ให้อยู่ในรูปแบบไทย
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
    if (!bill) throw new Error("ไม่พบบิล");
    return bill;
  },

  // 🧾 สร้างบิลใหม่
  async createBill(data: CreateBillInput, adminId: string) {
    const { roomId, customerId, month, wBefore, wAfter, eBefore, eAfter } =
      data;

    // ✅ ตรวจสอบข้อมูลครบถ้วน
    if (!roomId || !customerId || !month || !wAfter || !eAfter)
      throw new Error("กรุณากรอกข้อมูลให้ครบถ้วน");

    // 🏠 ดึงข้อมูลห้อง
    const room = await billRepository.findRoom(roomId);
    if (!room) throw new Error("ไม่พบห้อง");

    // 💰 คำนวณราคาพื้นฐาน
    const rent = room.rent;
    const service = 20;
    const wPrice = 19;
    const ePrice = 7;

    // 📅 หาค่าของเดือนก่อนหน้า
    const billMonth = new Date(month);
    const prevMonth = new Date(billMonth);
    prevMonth.setMonth(prevMonth.getMonth() - 1);

    // 🔙 ดึงบิลก่อนหน้า (เพื่อใช้ค่า wBefore/eBefore)
    const prevBill = await billRepository.findPrevBill(
      roomId,
      billMonth,
      prevMonth
    );
    const finalWBefore = prevBill ? prevBill.wAfter : (wBefore ?? 0);
    const finalEBefore = prevBill ? prevBill.eAfter : (eBefore ?? 0);

    // ⚙️ คำนวณหน่วยน้ำ/ไฟ
    const wUnits = wAfter - finalWBefore;
    const eUnits = eAfter - finalEBefore;
    const waterCost = wUnits * wPrice;
    const electricCost = eUnits * ePrice;

    // ⏰ วันครบกำหนดชำระ
    const createdAt = new Date();
    const dueDate = new Date(createdAt);
    dueDate.setMonth(dueDate.getMonth() + 1);
    dueDate.setDate(5);

    // 💸 คำนวณค่าปรับถ้าชำระเกินกำหนด
    let fine = 0;
    const today = new Date();
    if (today > dueDate) {
      const diff = today.getTime() - dueDate.getTime();
      const overdueDays = Math.ceil(diff / (1000 * 60 * 60 * 24));
      fine = overdueDays * 50;
    }

    // 💵 รวมยอดทั้งหมด
    const total = rent + service + waterCost + electricCost + fine;

    // 💾 บันทึกลงฐานข้อมูล
    const bill = await billRepository.create({
      month: new Date(month),
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
    const msg = `📢 บิลใหม่ ของคุณ ${bill.customer.userName}
ห้อง: ${bill.room.number}
เดือน : ${bill.month.toLocaleDateString("th-TH", { year: "numeric", month: "long" })}\n
-------------------\n
ค่าเช่า : ${bill.rent.toLocaleString()} บาท
ค่าส่วนกลาง : ${bill.service.toLocaleString()} บาท
ค่าน้ำ : ${bill.wUnits} หน่วย ( ${bill.waterCost.toLocaleString()} บาท )
ค่าไฟ : ${bill.eUnits} หน่วย ( ${bill.electricCost.toLocaleString()} บาท )
ยอดรวมทั้งหมด: ${bill.total.toLocaleString()} บาท
ครบกำหนดชำระ: ${formatThaiDate(bill.dueDate)}\n
-------------------\n
ขอบคุณที่ใช้บริการ 🏫SmartDorm🎉`;

    await notifyUser(bill.customer.userId, msg);
    return bill;
  },

  // 🧾 สร้างบิลจาก roomId (แอดมินใช้)
  async createBillFromRoom(roomId: string, body: any, adminId: string) {
    const { month, wBefore, wAfter, eBefore, eAfter } = body;
    const booking = await billRepository.findBooking(roomId);
    if (!booking) throw new Error("ไม่พบบุ๊กกิ้งของห้องนี้");

    // สร้างบิลใหม่โดยใช้ข้อมูลลูกค้าจาก booking
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