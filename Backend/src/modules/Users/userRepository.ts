// src/modules/Users/userRepository.ts
import prisma from "../../prisma";
import { verifyLineToken } from "../../utils/verifyLineToken";

export const userRepository = {
  // 👤 ดึงลูกค้าทั้งหมด
  async findAllCustomers() {
    return prisma.customer.findMany({
      include: { bookings: { include: { room: true } } },
      orderBy: { createdAt: "desc" },
    });
  },

  // 🔍 ดึงลูกค้าจาก userId (LINE)
  async findCustomerByUserId(userId: string) {
    return prisma.customer.findFirst({ where: { userId } });
  },

  // ➕ สร้างลูกค้าใหม่
  async createCustomer(data: any) {
    return prisma.customer.create({ data });
  },

  // ✏️ อัปเดตข้อมูลลูกค้า
  async updateCustomer(customerId: string, data: any) {
    return prisma.customer.update({ where: { customerId }, data });
  },

  // 📦 ดึงลูกค้าพร้อม bookings และ bills
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

  // 🔍 ค้นหาลูกค้าจากชื่อ LINE หรือเลขห้อง
  async searchCustomers(keyword: string) {
    return prisma.customer.findMany({
      where: {
        OR: [
          // 🔹 ค้นหาชื่อ LINE
          { userName: { contains: keyword, mode: "insensitive" } },
          // 🔹 ค้นหา userId
          { userId: { contains: keyword, mode: "insensitive" } },
          // 🔹 ค้นหาใน bookings (เฉพาะคนที่มี bookings)
          {
            bookings: {
              some: {
                OR: [
                  { fullName: { contains: keyword, mode: "insensitive" } },
                  { cphone: { contains: keyword, mode: "insensitive" } },
                  {
                    room: {
                      number: { contains: keyword, mode: "insensitive" },
                    },
                  },
                ],
              },
            },
          },
        ],
      },
      include: {
        bookings: {
          include: { room: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  },

  // ❌ ลบลูกค้า (และ bookings)
  async deleteCustomer(customerId: string) {
    return prisma.customer.delete({ where: { customerId } });
  },

  // 👤 ดึงโปรไฟล์ลูกค้าจาก accessToken
  async getAllUsers(accessToken: string) {
    const { userId } = await verifyLineToken(accessToken);
    const customer = await this.getCustomerWithRelations(userId);
    if (!customer) throw new Error("ไม่พบข้อมูลลูกค้า");
    return customer;
  },
};
