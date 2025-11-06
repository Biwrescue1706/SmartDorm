// src/modules/Bookings/bookingRepository.ts
import prisma from "../../prisma";
import { createClient } from "@supabase/supabase-js";
import { BookingUpdateInput } from "./bookingModel";

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_KEY!);

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

  /* 🧾 สร้างการจอง */
  async createBooking(data: any, tx: any) {
    return tx.booking.create({
      data,
      include: { room: true, customer: true },
    });
  },

  /* ✏️ อัปเดตการจอง */
  async updateBooking(bookingId: string, data: BookingUpdateInput) {
    return prisma.booking.update({
      where: { bookingId },
      data,
      include: { room: true, customer: true },
    });
  },

  /* 🏠 อัปเดตสถานะห้อง */
  async updateRoomStatus(roomId: string, status: number, tx?: any) {
    const db = tx ?? prisma;
    return db.room.update({ where: { roomId }, data: { status } });
  },

  /* 🔍 ค้นหาการจอง */
  async searchBookings(keyword: string) {
    const kw = keyword.trim();
    if (!kw)
      return prisma.booking.findMany({
        orderBy: { createdAt: "desc" },
        include: { room: true, customer: true },
      });

    return prisma.booking.findMany({
      where: {
        OR: [
          { bookingId: { contains: kw, mode: "insensitive" } },
          { fullName: { contains: kw, mode: "insensitive" } },
          { cphone: { contains: kw, mode: "insensitive" } },
          { room: { number: { contains: kw, mode: "insensitive" } } },
        ],
      },
      orderBy: { createdAt: "desc" },
      include: { room: true, customer: true },
    });
  },

  /* 🗑️ ลบการจอง */
  async deleteBooking(bookingId: string) {
    return prisma.booking.delete({ where: { bookingId } });
  },

  /* 📸 อัปโหลดสลิป (บันทึกใน booking-slips/ โดยไม่มีวันที่ในชื่อ) */
  async uploadSlip(file: Express.Multer.File) {
    if (!file) throw new Error("ไม่พบไฟล์สลิป");

    const bucket = process.env.SUPABASE_BUCKET!;
    const fileName = `booking-slips/${file.originalname}`;

    const { error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        upsert: true, // ✅ ถ้ามีชื่อซ้ำให้อัปทับได้
      });

    if (error) {
      console.error("❌ Upload Error:", error.message);
      throw new Error("อัปโหลดสลิปไม่สำเร็จ");
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(fileName);
    return data.publicUrl;
  },

  /* 🧹 ลบสลิปออกจาก Supabase */
  async deleteSlip(url: string) {
    if (!url) return;

    const bucket = process.env.SUPABASE_BUCKET!;
    const basePath = `/storage/v1/object/public/${bucket}/`;

    // ดึง path จริงจาก public URL เช่น booking-slips/slip.jpg
    const path = url.split(basePath)[1];
    if (!path) return;

    const { error } = await supabase.storage.from(bucket).remove([path]);
    if (error) console.warn("⚠️ ลบสลิปไม่สำเร็จ:", error.message);
  },
};
