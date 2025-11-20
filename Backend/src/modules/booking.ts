// src/modules/booking.ts

import { Router } from "express";
import multer from "multer";
import prisma from "../prisma";
import { createClient } from "@supabase/supabase-js";
import { verifyLineToken } from "../utils/verifyLineToken";
import { sendFlexMessage } from "../utils/lineFlex";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_KEY!
);

const upload = multer({ storage: multer.memoryStorage() });
const bookingRouter = Router();

const LOCK_MINUTES = 15;

const formatThai = (d?: string | Date | null) =>
  d
    ? new Date(d).toLocaleDateString("th-TH", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "-";

/* ===========================================================
   ⭐ ล็อคห้อง (Lock Room)
   User A เลือก → user B เลือกไม่ได้
   =========================================================== */
bookingRouter.post("/lock", async (req, res) => {
  try {
    const { roomId, userId } = req.body;

    const room = await prisma.room.findUnique({ where: { roomId } });

    // ถ้าห้องติดล็อค และยังไม่หมดเวลา → ห้ามล็อคซ้ำ
    if (room?.lockedUntil && room.lockedUntil > new Date()) {
      return res.status(400).json({
        error: "ห้องนี้กำลังถูกเลือกอยู่",
        lockedUntil: room.lockedUntil,
      });
    }

    // ล็อคใหม่ 15 นาที
    const lockedUntil = new Date(Date.now() + LOCK_MINUTES * 60 * 1000);

    await prisma.room.update({
      where: { roomId },
      data: {
        lockedBy: userId,
        lockedUntil,
      },
    });

    res.json({ message: "ล็อคห้องสำเร็จ", lockedUntil });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

/* ===========================================================
   ⭐ ปลดล็อคห้อง (Unlock Room)
   =========================================================== */
bookingRouter.post("/unlock", async (req, res) => {
  try {
    const { roomId } = req.body;

    await prisma.room.update({
      where: { roomId },
      data: {
        lockedBy: null,
        lockedUntil: null,
      },
    });

    res.json({ message: "ปลดล็อคสำเร็จ" });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

/* ===========================================================
   GET ALL BOOKINGS
   =========================================================== */
bookingRouter.get("/getall", async (_req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      orderBy: { createdAt: "desc" },
      include: { room: true, customer: true },
    });
    res.json(bookings);
  } catch {
    res.status(500).json({ error: "ไม่สามารถดึงข้อมูลการจองได้" });
  }
});

/* ===========================================================
   GET BY ID
   =========================================================== */
bookingRouter.get("/:bookingId", async (req, res) => {
  try {
    const booking = await prisma.booking.findUnique({
      where: { bookingId: req.params.bookingId },
      include: { room: true, customer: true },
    });

    if (!booking) throw new Error("ไม่พบข้อมูลการจอง");
    res.json(booking);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

/* ===========================================================
   ⭐ CREATE BOOKING
   - สร้างการจองจริง
   - ปลดล็อคห้องทันที
   - เปลี่ยนสถานะห้องเป็นไม่ว่าง
   =========================================================== */
bookingRouter.post("/create", upload.single("slip"), async (req, res) => {
  try {
    const {
      accessToken,
      ctitle,
      cname,
      csurname,
      cphone,
      cmumId,
      roomId,
      checkin,
      checkout,
    } = req.body;

    const { userId, displayName } = await verifyLineToken(accessToken);

    let slipUrl = "";
    if (req.file) {
      const name = `slips/${Date.now()}_${req.file.originalname}`;
      const { error } = await supabase.storage
        .from(process.env.SUPABASE_BUCKET!)
        .upload(name, req.file.buffer, {
          contentType: req.file.mimetype,
        });
      if (error) throw new Error("อัปโหลดสลิปไม่สำเร็จ");

      const { data } = supabase.storage
        .from(process.env.SUPABASE_BUCKET!)
        .getPublicUrl(name);

      slipUrl = data.publicUrl;
    }

    // ⭐ transaction: จอง + ปลดล็อค + ปิดห้อง
    const booking = await prisma.$transaction(async (tx) => {
      let customer = await tx.customer.findFirst({ where: { userId } });

      if (!customer) {
        customer = await tx.customer.create({
          data: {
            userId,
            userName: displayName ?? "-",
          },
        });
      }

      // ปลดล็อคห้อง + ปิดห้องให้ไม่ว่าง
      await tx.room.update({
        where: { roomId },
        data: {
          lockedBy: null,
          lockedUntil: null,
          status: 1,
        },
      });

      const newBooking = await tx.booking.create({
        data: {
          roomId,
          customerId: customer.customerId,
          ctitle,
          cname,
          csurname,
          fullName: `${ctitle}${cname} ${csurname}`,
          cphone,
          cmumId,
          slipUrl,
          checkin: new Date(checkin),
          checkout: checkout ? new Date(checkout) : null,
        },
      });

      return newBooking;
    });

    res.json({ message: "จองสำเร็จ", booking });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

/* ===========================================================
   REJECT BOOKING → คืนห้อง + ปลดล็อค
   =========================================================== */
bookingRouter.put("/:bookingId/reject", async (req, res) => {
  try {
    const updated = await prisma.booking.update({
      where: { bookingId: req.params.bookingId },
      data: { approveStatus: 2 },
    });

    // คืนห้อง
    await prisma.room.update({
      where: { roomId: updated.roomId },
      data: {
        status: 0,
        lockedBy: null,
        lockedUntil: null,
      },
    });

    res.json({ message: "ปฏิเสธสำเร็จ" });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

/* ===========================================================
   DELETE BOOKING → คืนห้อง + ปลดล็อค
   =========================================================== */
bookingRouter.delete("/:bookingId", async (req, res) => {
  try {
    const deleted = await prisma.booking.delete({
      where: { bookingId: req.params.bookingId },
    });

    await prisma.room.update({
      where: { roomId: deleted.roomId },
      data: {
        status: 0,
        lockedBy: null,
        lockedUntil: null,
      },
    });

    res.json({ message: "ลบสำเร็จ" });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default bookingRouter;