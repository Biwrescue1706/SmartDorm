import prisma from "../../prisma";
import { createClient } from "@supabase/supabase-js";
import type { Prisma } from "@prisma/client";

/* ===========================
   🧩 CONFIG: Supabase
=========================== */
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_KEY!
);

/* ===========================
   🧱 Repository Layer
=========================== */
export const bookingRepository = {
  /* 📋 ดึงข้อมูลทั้งหมด */
  async findAll() {
    return await prisma.booking.findMany({
      orderBy: { createdAt: "desc" },
      include: { room: true, customer: true },
    });
  },

  /* 🔍 ดึงข้อมูลตาม bookingId */
  async findById(bookingId: string) {
    return await prisma.booking.findUnique({
      where: { bookingId },
      include: { room: true, customer: true },
    });
  },

  /* 👤 สร้างหรืออัปเดตข้อมูลลูกค้า */
  async createCustomer(data: any, tx: Prisma.TransactionClient) {
    const existing = await tx.customer.findFirst({
      where: { userId: data.userId },
    });

    if (existing) {
      return await tx.customer.update({
        where: { customerId: existing.customerId },
        data,
      });
    }

    return await tx.customer.create({ data });
  },

  /* 🧾 สร้างการจอง */
  async createBooking(data: any, tx: Prisma.TransactionClient) {
    return await tx.booking.create({
      data,
      include: { room: true, customer: true },
    });
  },

  /* ✏️ อัปเดตการจอง */
  async updateBooking(bookingId: string, data: any) {
    return await prisma.booking.update({
      where: { bookingId },
      data,
      include: { room: true, customer: true },
    });
  },

  /* 🏠 อัปเดตสถานะห้อง */
  async updateRoomStatus(roomId: string, status: number, tx?: Prisma.TransactionClient) {
    const db = tx ?? prisma;
    return await db.room.update({
      where: { roomId },
      data: { status },
    });
  },

  /* 🗑️ ลบการจอง */
  async deleteBooking(bookingId: string) {
    return await prisma.booking.delete({ where: { bookingId } });
  },

  /* 📸 อัปโหลดสลิปไปยัง Supabase */
  async uploadSlip(file: Express.Multer.File) {
    try {
      // ✅ ป้องกันชื่อไฟล์ซ้ำด้วย timestamp + random string
      const random = Math.random().toString(36).substring(2, 8);
      const fileName = `slips/${Date.now()}_${random}_${file.originalname}`;

      const { error } = await supabase.storage
        .from("smartdorm-slips")
        .upload(fileName, file.buffer, {
          contentType: file.mimetype,
          upsert: false,
        });

      if (error) {
        console.error("❌ Supabase Upload Error:", error);
        throw new Error("อัปโหลดสลิปไม่สำเร็จ");
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("smartdorm-slips").getPublicUrl(fileName);

      return publicUrl;
    } catch (err) {
      console.error("❌ uploadSlip() Error:", err);
      throw new Error("เกิดข้อผิดพลาดระหว่างอัปโหลดสลิป");
    }
  },

  /* 🧹 ลบสลิปจาก Supabase */
  async deleteSlip(url: string) {
    try {
      const path = url.split("/smartdorm-slips/")[1];
      if (!path) return;

      const { error } = await supabase.storage
        .from("smartdorm-slips")
        .remove([path]);

      if (error) console.warn("⚠️ ลบสลิปจาก Supabase ไม่สำเร็จ:", error);
    } catch (err) {
      console.error("⚠️ deleteSlip() Error:", err);
    }
  },
};
