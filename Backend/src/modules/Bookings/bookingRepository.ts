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

  /* 📸 อัปโหลดสลิป */
  async uploadSlip(file: Express.Multer.File) {
    const random = Math.random().toString(36).substring(2, 8);
    const fileName = `slips/${Date.now()}_${random}_${file.originalname}`;

    const { error } = await supabase
      .storage
      .from(process.env.SUPABASE_BUCKET!)
      .upload(fileName, file.buffer, { contentType: file.mimetype });

    if (error) throw new Error("อัปโหลดสลิปไม่สำเร็จ");

    const { data } = supabase
      .storage
      .from(process.env.SUPABASE_BUCKET!)
      .getPublicUrl(fileName);

    return data.publicUrl;
  },

  /* 🧹 ลบสลิป */
  async deleteSlip(url: string) {
    const bucket = process.env.SUPABASE_BUCKET!;
    const path = url.split(`/${bucket}/`)[1];
    if (path) await supabase.storage.from(bucket).remove([path]);
  },
};

