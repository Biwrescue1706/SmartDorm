// src/modules/Users/userRepository.ts
import prisma from "../../prisma";
import fetch from "node-fetch";
import { LineProfile } from "./userModel";

export const userRepository = {
  /* ============================================================
     🔑 ตรวจสอบ Token จาก LINE
  ============================================================ */
  async verifyLineToken(accessToken: string): Promise<LineProfile> {
    const res = await fetch("https://api.line.me/v2/profile", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) throw new Error("LINE token ไม่ถูกต้องหรือหมดอายุ");
    const data = (await res.json()) as LineProfile;
    return data;
  },

  /* ============================================================
     👤 ดึงข้อมูลลูกค้าจาก userId (LINE)
  ============================================================ */
  async findCustomerByUserId(userId: string) {
    return prisma.customer.findFirst({
      where: { userId },
    });
  },

  /* ============================================================
     🧾 สร้างข้อมูลลูกค้าใหม่
  ============================================================ */
  async createCustomer(data: any) {
    return prisma.customer.create({ data });
  },

  /* ============================================================
     ✏️ อัปเดตข้อมูลลูกค้า
  ============================================================ */
  async updateCustomer(customerId: string, data: any) {
    return prisma.customer.update({
      where: { customerId },
      data,
    });
  },

  /* ============================================================
     📦 ดึงข้อมูลลูกค้าพร้อมความสัมพันธ์ (Bookings / Bills)
  ============================================================ */
  async getCustomerWithRelations(userId: string) {
    return prisma.customer.findFirst({
      where: { userId },
      include: {
        bookings: {
          include: { room: true },
          orderBy: { createdAt: "desc" },
        },
        bills: {
          include: { room: true, payment: true },
          orderBy: { createdAt: "desc" },
        },
      },
    });
  },

  /* ============================================================
     💰 ดึงบิลที่ชำระแล้ว
  ============================================================ */
  async findPaidBills(customerId: string) {
    return prisma.bill.findMany({
      where: { customerId, status: 1 },
      orderBy: { createdAt: "desc" },
      include: { room: true, payment: true },
    });
  },

  /* ============================================================
     💸 ดึงบิลที่ยังไม่ชำระ
  ============================================================ */
  async findUnpaidBills(customerId: string) {
    return prisma.bill.findMany({
      where: { customerId, status: 0 },
      orderBy: { createdAt: "desc" },
      include: { room: true },
    });
  },

  /* ============================================================
     🚪 ดึงการจองที่สามารถ “ขอคืนห้องได้”
     (เช่าจริง, ผ่านอนุมัติ, ยังไม่เช็คเอาท์)
  ============================================================ */
  async findReturnableBookings(customerId: string) {
    return prisma.booking.findMany({
      where: {
        customerId,
        approveStatus: 1,   // ผ่านการอนุมัติแล้ว
        checkinStatus: 1,   // เช็คอินแล้ว
        checkoutStatus: 0,  // ยังไม่เช็คเอาท์
      },
      include: { room: true },
      orderBy: { createdAt: "desc" },
    });
  },
};
