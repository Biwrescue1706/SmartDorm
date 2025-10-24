import prisma from "../../prisma";

export const userRepository = {

    // 👤 ดึงข้อมูลลูกค้าทั้งหมด
  async findAllCustomers() {
    return prisma.customer.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        bookings: true,
        bills: true,
      },
    });
  },

  // 👤 ดึงข้อมูลลูกค้าจาก userId (LINE)
  async findCustomerByUserId(userId: string) {
    return prisma.customer.findFirst({ where: { userId } });
  },

  // 🧾 สร้างข้อมูลลูกค้าใหม่
  async createCustomer(data: any) {
    return prisma.customer.create({ data });
  },

  // ✏️ อัปเดตข้อมูลลูกค้า
  async updateCustomer(customerId: string, data: any) {
    return prisma.customer.update({ where: { customerId }, data });
  },

  // 📦 ดึงข้อมูลลูกค้าพร้อม bookings และ bills
  async getCustomerWithRelations(userId: string) {
    return prisma.customer.findFirst({
      where: { userId },
      include: {
        bookings: { include: { room: true }, orderBy: { createdAt: "desc" } },
        bills: {
          include: { room: true, payment: true },
          orderBy: { createdAt: "desc" },
        },
      },
    });
  },

  // 💰 ดึงบิลที่ชำระแล้ว
  async findPaidBills(customerId: string) {
    return prisma.bill.findMany({
      where: { customerId, status: 1 },
      orderBy: { createdAt: "desc" },
      include: { room: true, payment: true },
    });
  },

  // 💸 ดึงบิลที่ยังไม่ชำระ
  async findUnpaidBills(customerId: string) {
    return prisma.bill.findMany({
      where: { customerId, status: 0 },
      orderBy: { createdAt: "desc" },
      include: { room: true },
    });
  },

  // 🚪 ดึงการจองที่สามารถคืนห้องได้
  async findReturnableBookings(customerId: string) {
    return prisma.booking.findMany({
      where: {
        customerId,
        approveStatus: 1,
        checkinStatus: 1,
        checkoutStatus: 0,
      },
      include: { room: true },
      orderBy: { createdAt: "desc" },
    });
  },

    // 🔍 ค้นหาลูกค้าจากชื่อ / เบอร์โทร / ห้อง
  async searchCustomers(keyword: string) {
    const kw = keyword.trim();

    // ถ้าไม่มี keyword ให้ return ลูกค้าทั้งหมดแทน
    if (!kw) return this.findAllCustomers();

    return prisma.customer.findMany({
      where: {
        OR: [
          { fullName: { contains: kw, mode: "insensitive" } },
          { userName: { contains: kw, mode: "insensitive" } },
          { cphone: { contains: kw, mode: "insensitive" } },
          {
            bookings: {
              some: {
                room: {
                  number: { contains: kw, mode: "insensitive" },
                },
              },
            },
          },
        ],
      },
      include: {
        bookings: { include: { room: true }, orderBy: { createdAt: "desc" } },
        bills: { include: { room: true }, orderBy: { createdAt: "desc" } },
      },
      orderBy: { createdAt: "desc" },
    });
  },

};
