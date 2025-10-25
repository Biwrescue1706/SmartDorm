// src/modules/Bookings/bookingRepository.ts
import prisma from "../../prisma";
import { createClient } from "@supabase/supabase-js";
import type { Prisma } from "@prisma/client";
import { BookingUpdateInput } from "./bookingModel";

// 🧩 CONFIG: Supabase
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_KEY!
);

// 🧱 Repository Layer
export const bookingRepository = {
  /* 📋 ดึงข้อมูลทั้งหมด */
  async findAll() {
    return prisma.booking.findMany({
      orderBy: { createdAt: "desc" },
      include: { room: true, customer: true },
    });
  },

  /* 🔍 ดึงข้อมูลตาม bookingId */
  async findById(bookingId: string) {
    return prisma.booking.findUnique({
      where: { bookingId },
      include: { room: true, customer: true },
    });
  },

  /* 👤 สร้างลูกค้า */
  async createCustomer(data: any, tx: Prisma.TransactionClient) {
    return tx.customer.create({ data });
  },

  /* 🧾 สร้างการจอง */
  async createBooking(data: any, tx: Prisma.TransactionClient) {
    return tx.booking.create({
      data,
      include: { room: true, customer: true },
    });
  },

  /* ✏️ อัปเดตการจอง (แก้ไขแล้ว ✅ ไม่มี recursive call) */
  async updateBooking(bookingId: string, data: BookingUpdateInput) {
    const booking = await prisma.booking.findUnique({ where: { bookingId } });
    if (!booking) throw new Error("ไม่พบข้อมูลการจอง");

    // 🧠 Debug log
    console.log("🧩 [DEBUG] updateBooking():", bookingId, data);

    return prisma.booking.update({
      where: { bookingId },
      data,
      include: { room: true, customer: true },
    });
  },

  /* 🏠 อัปเดตสถานะห้อง */
  async updateRoomStatus(
    roomId: string,
    status: number,
    tx?: Prisma.TransactionClient
  ) {
    const db = tx ?? prisma;
    return db.room.update({
      where: { roomId },
      data: { status },
    });
  },

  /* 🗑️ ลบการจอง */
  async deleteBooking(bookingId: string) {
    return prisma.booking.delete({ where: { bookingId } });
  },

  /* 📸 อัปโหลดสลิปไปยัง Supabase */
  async uploadSlip(file: Express.Multer.File) {
    const random = Math.random().toString(36).substring(2, 8);
    const fileName = `slips/${Date.now()}_${random}_${file.originalname}`;

    const { error } = await supabase.storage
      .from(process.env.SUPABASE_BUCKET!)
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
      });

    if (error) throw new Error("อัปโหลดสลิปไม่สำเร็จ");

    const { data } = supabase.storage
      .from(process.env.SUPABASE_BUCKET!)
      .getPublicUrl(fileName);

    return data.publicUrl;
  },

  /* 🧹 ลบสลิปจาก Supabase */
  async deleteSlip(url: string) {
    const path = url.split("/smartdorm-slips/")[1];
    if (!path) return;
    await supabase.storage.from("smartdorm-slips").remove([path]);
  },
};
