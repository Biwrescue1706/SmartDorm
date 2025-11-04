// src/modules/Users/userService.ts
import prisma from "../../prisma";
import { userRepository } from "./userRepository";
import { RegisterInput } from "./userModel";
import { verifyLineToken } from "../../utils/verifyLineToken";
import { supabase } from "../../utils/supabaseClient";

export const userService = {
  // 🧩 สมัครหรืออัปเดตข้อมูลลูกค้า
  async register(input: RegisterInput) {
    const { accessToken } = input;
    const { userId, displayName } = await verifyLineToken(accessToken);

    let customer = await userRepository.findCustomerByUserId(userId);

    if (customer) {
      // อัปเดตเฉพาะชื่อ LINE
      customer = await userRepository.updateCustomer(customer.customerId, {
        userName: displayName,
      });
    } else {
      // ถ้ายังไม่มี → สร้างใหม่
      customer = await userRepository.createCustomer({
        userId,
        userName: displayName,
      });
    }

    return customer;
  },

  // 📋 ดึงลูกค้าทั้งหมด (Admin)
  async getAllUsers() {
    const users = await userRepository.findAllCustomers();
    return users || [];
  },

  // 👤 ดึงโปรไฟล์ลูกค้า
  async getProfile(accessToken: string) {
    const { userId, displayName } = await verifyLineToken(accessToken);

    let customer = await userRepository.findCustomerByUserId(userId);
    if (!customer) {
      customer = await userRepository.createCustomer({
        userId,
        userName: displayName,
      });
    }
    return customer;
  },

  // 💰 ดึงบิลที่ชำระแล้ว
  async getPaidBills(accessToken: string) {
    const { userId } = await verifyLineToken(accessToken);
    const customer = await userRepository.findCustomerByUserId(userId);
    if (!customer) throw new Error("ไม่พบลูกค้า");

    const bills = await userRepository.findPaidBills(customer.customerId);
    return bills.map((b) => ({
      billCode: b.billId.slice(-6).toUpperCase(),
      roomNumber: b.room.number,
      total: b.total,
      slipUrl: b.payment?.slipUrl,
      paidAt: b.payment?.createdAt,
    }));
  },

  // 💸 ดึงบิลที่ยังไม่ชำระ
  async getUnpaidBills(accessToken: string) {
    try {
      const { userId } = await verifyLineToken(accessToken);
      const customer = await userRepository.findCustomerByUserId(userId);
      if (!customer) throw new Error("ไม่พบลูกค้า");
      return userRepository.findUnpaidBills(customer.customerId);
    } catch (err: any) {
      throw new Error("Token ไม่ถูกต้องหรือหมดอายุ");
    }
  },

  // 🚪 ดึงการจองที่สามารถคืนห้องได้
  async getReturnableBookings(accessToken: string) {
    const { userId } = await verifyLineToken(accessToken);
    const customer = await userRepository.findCustomerByUserId(userId);
    if (!customer) throw new Error("ไม่พบลูกค้า");
    return userRepository.findReturnableBookings(customer.customerId);
  },

  // 🔍 ค้นหาลูกค้า
  async searchUsers(keyword: string) {
    return userRepository.searchCustomers(keyword);
  },

 // ❌ ลบลูกค้า (และอัปเดตห้องให้ว่าง)
  async deleteUser(customerId: string) {
    return prisma.$transaction(async (tx) => {
      // ✅ ดึงรายการ booking ที่มี slipUrl
      const bookingsWithSlip = await tx.booking.findMany({
        where: { customerId },
        select: { slipUrl: true, roomId: true },
      });

      // ✅ อัปเดตสถานะห้องทั้งหมดของลูกค้าให้ว่าง (status = 0)
      const roomIds = bookingsWithSlip.map((b) => b.roomId).filter(Boolean);
      if (roomIds.length > 0) {
        await tx.room.updateMany({
          where: { roomId: { in: roomIds } },
          data: { status: 0 },
        });
        console.log("🏠 ตั้งค่าห้องเป็นว่างแล้ว:", roomIds.length, "ห้อง");
      }

      // ✅ ลบรูป slip ทั้งหมดใน Supabase (ถ้ามี)
      for (const booking of bookingsWithSlip) {
        if (!booking.slipUrl) continue;
        try {
          const path = booking.slipUrl.split("/storage/v1/object/public/")[1];
          if (path) {
            const bucket = path.split("/")[0];
            const filePath = path.substring(bucket.length + 1);
            await supabase.storage.from(bucket).remove([filePath]);
            console.log("🧹 ลบรูปออกจาก Supabase:", filePath);
          }
        } catch (err) {
          console.error("⚠️ ลบรูปจาก Supabase ไม่สำเร็จ:", err);
        }
      }

      // ✅ ลบ bookings ก่อน
      await tx.booking.deleteMany({ where: { customerId } });

      // ✅ ลบข้อมูลลูกค้า
      return tx.customer.delete({ where: { customerId } });
    });
  },
};