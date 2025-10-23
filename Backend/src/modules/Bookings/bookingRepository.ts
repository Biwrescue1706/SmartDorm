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
      include: {
        room: true,
        customer: true,
      },
    });
  },

  /* 🔍 ดึงข้อมูลตาม bookingId */
  async findById(bookingId: string) {
    return await prisma.booking.findUnique({
      where: { bookingId },
      include: {
        room: true,
        customer: true,
      },
    });
  },

  /* 👤 สร้างลูกค้าใหม่ หรืออัปเดตถ้ามีอยู่แล้ว */
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

  /* 🧾 สร้างรายการจอง */
  async createBooking(data: any, tx: Prisma.TransactionClient) {
    return await tx.booking.create({
      data,
      include: {
        room: true,
        customer: true,
      },
    });
  },

  /* ✏️ อัปเดตการจอง */
  async updateBooking(bookingId: string, data: any) {
    return await prisma.booking.update({
      where: { bookingId },
      data,
      include: {
        room: true,
        customer: true,
      },
    });
  },

  /* 🗑️ ลบการจอง */
  async deleteBooking(bookingId: string) {
    await prisma.booking.delete({
      where: { bookingId },
    });
  },

  /* 🏠 เปลี่ยนสถานะห้อง */
  async updateRoomStatus(roomId: string, status: number, tx?: Prisma.TransactionClient) {
    const executor = tx ?? prisma;
    await executor.room.update({
      where: { roomId },
      data: { status },
    });
  },

  /* 📸 อัปโหลดสลิปไป Supabase */
  async uploadSlip(file: Express.Multer.File) {
    const fileName = `slip_${Date.now()}_${file.originalname}`;
    const { data, error } = await supabase.storage
      .from("slips")
      .upload(fileName, file.buffer, { contentType: file.mimetype });

    if (error) throw new Error("อัปโหลดสลิปไม่สำเร็จ");
    const { data: publicUrl } = supabase.storage
      .from("slips")
      .getPublicUrl(fileName);

    return publicUrl.publicUrl;
  },

  /* 🗑️ ลบสลิปใน Supabase */
  async deleteSlip(slipUrl: string) {
    try {
      const path = slipUrl.split("/").pop();
      if (!path) return;
      await supabase.storage.from("slips").remove([path]);
    } catch (err) {
      console.error("❌ ลบสลิปไม่สำเร็จ:", err);
    }
  },
};
