import prisma from "../../prisma";

export const billRepository = {
  // 📋 ดึงบิลทั้งหมด (เรียงจากใหม่ไปเก่า)
  async findAll() {
    return prisma.bill.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        room: true,
        customer: true,
        payment: { select: { slipUrl: true } }, // ✅ ดึง slipUrl ของ Payment
      },
    });
  },

  // 🔍 ดึงบิลรายตัว
  async findById(billId: string) {
    return prisma.bill.findUnique({
      where: { billId },
      include: {
        room: true,
        booking: { select: { fullName: true, cphone: true } },
        customer: { select: { userName: true } },
        payment: { select: { slipUrl: true } }, // ✅ ดึง slipUrl ด้วย
      },
    });
  },

  // 🕓 ดึงบิลเดือนก่อนหน้า (สำหรับดูหน่วยน้ำ/ไฟ)
  async findPrevBill(roomId: string, billMonth: Date) {
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

  // 🧾 สร้างบิลใหม่ (✅ ใช้ connect เชื่อม relation)
  async create(data: any) {
    const { roomId, customerId, createdBy, ...rest } = data;

    return prisma.bill.create({
      data: {
        ...rest,
        room: { connect: { roomId } },
        customer: customerId ? { connect: { customerId } } : undefined,
        adminCreated: { connect: { adminId: createdBy } },
      },
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

  // 🧍‍♂️ ดึง Booking ปัจจุบันของห้อง (ที่เช่าอยู่)
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
