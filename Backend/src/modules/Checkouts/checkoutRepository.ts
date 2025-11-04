import prisma from "../../prisma";

export const checkoutRepository = {
  // 📋 ดึงข้อมูลการขอคืนทั้งหมด (Admin)
  async findAllCheckouts() {
    return prisma.booking.findMany({
      where: { checkout: { not: null } },
      orderBy: { createdAt: "desc" },
      include: { room: true, customer: true },
    });
  },

  // 🔍 ค้นหาการคืนห้อง (Admin)
  async searchCheckouts(keyword: string) {
    const kw = keyword.trim();
    if (!kw) return this.findAllCheckouts();

    return prisma.booking.findMany({
      where: {
        checkout: { not: null },
        OR: [
          { bookingId: { contains: kw, mode: "insensitive" } },
          { fullName: { contains: kw, mode: "insensitive" } },
          { cphone: { contains: kw, mode: "insensitive" } },
          { room: { number: { contains: kw, mode: "insensitive" } } },
        ],
      },
      include: { room: true, customer: true },
      orderBy: { createdAt: "desc" },
    });
  },

  // 👤 ค้นหาลูกค้าจาก userId (LINE)
  async findCustomerByUserId(userId: string) {
    return prisma.customer.findFirst({
      where: { userId },
    });
  },

  // 🏠 ดึง Booking ทั้งหมดของลูกค้า (ที่ยังไม่คืน)
  async findBookingsByCustomer(customerId: string) {
    return prisma.booking.findMany({
      where: {
        customerId,
        approveStatus: 1, // ผ่านอนุมัติแล้ว
        checkoutStatus: 0, // ยังไม่คืน
      },
      orderBy: { createdAt: "desc" },
      include: { room: true },
    });
  },

  // 🔍 ดึงข้อมูล Booking ตาม bookingId
  async findBookingById(bookingId: string) {
    return prisma.booking.findUnique({
      where: { bookingId },
      include: { customer: true, room: true },
    });
  },

  // ✏️ อัปเดตข้อมูล Booking
  async updateBooking(bookingId: string, data: any) {
    return prisma.booking.update({
      where: { bookingId },
      data,
      include: { customer: true, room: true },
    });
  },

  // 🚪 เปลี่ยนสถานะห้อง (0=ว่าง, 1=ไม่ว่าง)
  async updateRoomStatus(roomId: string, status: number) {
    return prisma.room.update({
      where: { roomId },
      data: { status },
    });
  },
};
