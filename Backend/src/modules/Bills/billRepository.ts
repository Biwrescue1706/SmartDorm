import prisma from "../../prisma";

export const billRepository = {
  // 📋 ดึงบิลทั้งหมด
  async findAll() {
    return prisma.bill.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        room: true,
        booking: { select: { fullName: true, cphone: true } },
        customer: { select: { userId: true, userName: true } },
        payment: { select: { slipUrl: true } },
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
        customer: { select: { userId: true, userName: true } },
        payment: { select: { slipUrl: true } },
      },
    });
  },

  // 🕓 ดึงบิลเดือนก่อนหน้า
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

  // 🧾 สร้างบิลใหม่
  async create(data: any) {
    const { roomId, customerId, bookingId, createdBy, ...rest } = data;
    if (!createdBy) throw new Error("Admin ID ไม่ถูกต้อง");

    return prisma.bill.create({
      data: {
        ...rest,
        room: { connect: { roomId } },
        customer: customerId ? { connect: { customerId } } : undefined,
        booking: bookingId ? { connect: { bookingId } } : undefined, // ✅ เชื่อม booking
        adminCreated: { connect: { adminId: createdBy } },
      },
      include: {
        room: true,
        booking: { select: { fullName: true, cphone: true } },
        customer: { select: { userId: true, userName: true } },
        payment: { select: { slipUrl: true } },
        adminCreated: true,
      },
    });
  },

  // ✏️ อัปเดตบิล
  async update(billId: string, data: any) {
    return prisma.bill.update({
      where: { billId },
      data,
      include: {
        room: true,
        booking: { select: { fullName: true, cphone: true } },
        customer: { select: { userId: true, userName: true } },
        payment: { select: { slipUrl: true } },
        adminUpdated: true,
      },
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
      select: {
        bookingId: true, // ✅ เพิ่มตรงนี้
        fullName: true,
        cphone: true,
        customer: {
          select: { customerId: true, userId: true, userName: true },
        },
      },
    });
  },

  // 🏠 ดึงข้อมูลห้อง
  async findRoom(roomId: string) {
    return prisma.room.findUnique({
      where: { roomId },
      select: { roomId: true, number: true, rent: true, size: true },
    });
  },
};
