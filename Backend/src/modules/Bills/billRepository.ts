// src/modules/Bills/billRepository.ts
import prisma from "../../prisma";

export const billRepository = {
  // 📋 ดึงบิลทั้งหมด (เรียงตามวันที่สร้าง)
  async findAll() {
    return prisma.bill.findMany({
      orderBy: { createdAt: "desc" },
      include: { room: true, customer: true, payment: true },
    });
  },

  // 🔍 ดึงบิลตาม billId
  async findById(billId: string) {
    return prisma.bill.findUnique({
      where: { billId },
      include: {
        room: true,
        payment: true,
        booking: {
          select: {
            fullName: true,
            cphone: true,
          },
        },
        customer: {
          select: {
            userName: true,
          },
        },
      },
    });
  },

  // 🕓 ดึงบิลเดือนก่อนหน้า (ใช้ค่าน้ำ/ไฟก่อนหน้า)
  async findPrevBill(roomId: string, billMonth: Date) {
    // คำนวณเดือนก่อนหน้า
    const prevMonth = new Date(billMonth);
    prevMonth.setMonth(prevMonth.getMonth() - 1);

    return prisma.bill.findFirst({
      where: {
        roomId,
        month: {
          gte: new Date(prevMonth.getFullYear(), prevMonth.getMonth(), 1),
          lt: new Date(billMonth.getFullYear(), billMonth.getMonth(), 1),
        },
      },
      orderBy: { createdAt: "desc" },
    });
  },

  // 🧾 สร้างบิลใหม่
  async create(data: any) {
    return prisma.bill.create({
      data,
      include: { room: true, customer: true, adminCreated: true },
    });
  },

  // ✏️ อัปเดตบิล
  async update(billId: string, data: any) {
    return prisma.bill.update({
      where: { billId },
      data,
      include: { room: true, customer: true, adminUpdated: true },
    });
  },

  // 🗑️ ลบบิล
  async delete(billId: string) {
    return prisma.bill.delete({ where: { billId } });
  },

  // 🧍‍♂️ ดึง Booking ปัจจุบันของห้อง (เช่าอยู่)
  async findBooking(roomId: string) {
    return prisma.booking.findFirst({
      where: { roomId, approveStatus: 1, checkoutStatus: 0 },
      include: { customer: true },
    });
  },

  // 🏠 ดึงข้อมูลห้อง
  async findRoom(roomId: string) {
    return prisma.room.findUnique({ where: { roomId } });
  },
};
