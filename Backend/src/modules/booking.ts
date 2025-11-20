// src/modules/booking.ts

import { Router } from "express";
import multer from "multer";
import prisma from "../prisma";
import { createClient } from "@supabase/supabase-js";
import { verifyLineToken } from "../utils/verifyLineToken";
import { sendFlexMessage } from "../utils/lineFlex";

// ===========================================================
// Supabase
// ===========================================================
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_KEY!
);

const upload = multer({ storage: multer.memoryStorage() });
const bookingRouter = Router();

const LOCK_MINUTES = 15;

// ===========================================================
// FORMAT DATE THAI
// ===========================================================
const formatThai = (d?: string | Date | null) =>
  d
    ? new Date(d).toLocaleDateString("th-TH", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "-";

// ===========================================================
// deleteSlip ให้ไฟล์ user.ts ใช้
// ===========================================================
export const deleteSlip = async (url: string) => {
  const bucket = process.env.SUPABASE_BUCKET!;
  if (!url || !bucket) return;

  const path = url.split(`/${bucket}/`)[1];
  if (path) {
    const { error } = await supabase.storage.from(bucket).remove([path]);
    if (error) {
      console.error("❌ Delete Slip Error:", error.message);
    }
  }
};

/* ===========================================================
   ⭐ ล็อคห้อง (เฉพาะตอน “เลือกกำลังจะจอง”)
   =========================================================== */
bookingRouter.post("/lock", async (req, res) => {
  try {
    const { roomId, userId } = req.body;

    const room = await prisma.room.findUnique({ where: { roomId } });

    // ห้องถูกล็อคโดยคนอื่น + ยังไม่หมดเวลา → ห้ามเลือก
    if (
      room?.lockedUntil &&
      room.lockedUntil > new Date() &&
      room.lockedBy !== userId
    ) {
      return res.status(400).json({
        error: "ห้องนี้กำลังถูกเลือกโดยผู้ใช้อื่นอยู่",
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
   ⭐ ปลดล็อค (เฉพาะตอนออกจากหน้า / Cancel)
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
   GET ALL
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
   ⭐ CREATE BOOKING (จองจริง)
   - ปลดล็อคทันที
   - เปลี่ยนห้องเป็นไม่ว่าง
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

    // --------------------------
    // Upload slip
    // --------------------------
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

    // ⭐ Transaction ( create booking + ปลดล็อค + ปิดห้อง )
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

      // ปลดล็อค + ปิดห้อง (status=1)
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
   APPROVE BOOKING
   =========================================================== */
bookingRouter.put("/:bookingId/approve", async (req, res) => {
  try {
    const updated = await prisma.booking.update({
      where: { bookingId: req.params.bookingId },
      data: { approveStatus: 1 },
      include: { room: true, customer: true },
    });

    // ส่งข้อความ
    try {
      await sendFlexMessage(
        updated.customer?.userId ?? "",
        "✔️ SmartDorm อนุมัติการจอง",
        [
          { label: "รหัส", value: updated.bookingId },
          { label: "ชื่อ", value: updated.fullName ?? "-" },
          { label: "ห้อง", value: updated.room.number },
          { label: "วันที่เข้าพัก", value: formatThai(updated.checkin) },
        ],
        [
          {
            label: "รายละเอียด",
            url: `https://smartdorm-detail.biwbong.shop/booking/${updated.bookingId}`,
            style: "primary",
          },
        ]
      );
    } catch {}

    res.json({ message: "อนุมัติสำเร็จ", booking: updated });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

/* ===========================================================
   REJECT BOOKING → คืนห้อง (แต่ไม่แตะ lock)
   =========================================================== */
bookingRouter.put("/:bookingId/reject", async (req, res) => {
  try {
    const updated = await prisma.booking.update({
      where: { bookingId: req.params.bookingId },
      data: { approveStatus: 2 },
    });

    // คืนห้อง (status = 0)
    await prisma.room.update({
      where: { roomId: updated.roomId },
      data: { status: 0 },
    });

    res.json({ message: "ปฏิเสธสำเร็จ" });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

/* ===========================================================
   CHECKIN (ไม่ต้องแตะ Lock)
   =========================================================== */
bookingRouter.put("/:bookingId/checkin", async (req, res) => {
  try {
    const updated = await prisma.booking.update({
      where: { bookingId: req.params.bookingId },
      data: { checkinStatus: 1, actualCheckin: new Date() },
      include: { room: true, customer: true },
    });

    // ส่ง Flex …
    try {
      await sendFlexMessage(
        updated.customer?.userId ?? "",
        "🏠 SmartDorm เช็คอินสำเร็จ",
        [
          { label: "รหัส", value: updated.bookingId },
          { label: "ชื่อ", value: updated.fullName ?? "-" },
          { label: "ห้อง", value: updated.room.number },
          { label: "เช็คอิน", value: formatThai(updated.actualCheckin) },
        ],
        [
          {
            label: "รายละเอียด",
            url: `https://smartdorm-detail.biwbong.shop/booking/${updated.bookingId}`,
            style: "primary",
          },
        ]
      );
    } catch {}

    res.json({ message: "เช็คอินสำเร็จ", booking: updated });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

/* ===========================================================
   CHECKOUT → ห้องกลับเป็นว่าง แต่ไม่แตะ Lock
   =========================================================== */
bookingRouter.put("/:bookingId/checkout", async (req, res) => {
  try {
    const updated = await prisma.booking.update({
      where: { bookingId: req.params.bookingId },
      data: { checkoutStatus: 1, actualCheckout: new Date() },
      include: { room: true, customer: true },
    });

    // ทำห้องว่าง
    await prisma.room.update({
      where: { roomId: updated.roomId },
      data: { status: 0 },
    });

    // ส่ง Flex …
    try {
      await sendFlexMessage(
        updated.customer?.userId ?? "",
        "🚪 SmartDorm เช็คเอาท์สำเร็จ",
        [
          { label: "รหัส", value: updated.bookingId },
          { label: "ชื่อ", value: updated.fullName ?? "-" },
          { label: "ห้อง", value: updated.room.number },
          { label: "เช็คเอาท์", value: formatThai(updated.actualCheckout) },
        ],
        [
          {
            label: "รายละเอียด",
            url: `https://smartdorm-detail.biwbong.shop/booking/${updated.bookingId}`,
            style: "primary",
          },
        ]
      );
    } catch {}

    res.json({ message: "เช็คเอาท์สำเร็จ", booking: updated });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

/* ===========================================================
   DELETE BOOKING → คืนห้อง (ไม่แตะ lock)
   =========================================================== */
bookingRouter.delete("/:bookingId", async (req, res) => {
  try {
    const deleted = await prisma.booking.delete({
      where: { bookingId: req.params.bookingId },
    });

    await prisma.room.update({
      where: { roomId: deleted.roomId },
      data: { status: 0 },
    });

    res.json({ message: "ลบสำเร็จ" });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default bookingRouter;