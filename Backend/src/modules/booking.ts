import { Router } from "express";
import multer from "multer";
import prisma from "../prisma";
import { createClient } from "@supabase/supabase-js";
import { verifyLineToken } from "../utils/verifyLineToken";
import { sendFlexMessage } from "../utils/lineFlex";

/* ===================== Supabase ===================== */
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_KEY!
);

const upload = multer({ storage: multer.memoryStorage() });
const bookingRouter = Router();

/* ===================== Helpers ===================== */
const formatThai = (d?: string | Date | null) =>
  d
    ? new Date(d).toLocaleDateString("th-TH", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "-";

// ลบสลิป (ใช้ตอนลบ booking)
export const deleteSlip = async (url: string) => {
  const bucket = process.env.SUPABASE_BUCKET!;
  if (!url || !bucket) return;

  const marker = `/object/public/${bucket}/`;
  const idx = url.indexOf(marker);
  if (idx === -1) return;

  const path = url.substring(idx + marker.length);
  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) console.error("❌ Delete Slip Error:", error.message);
};

/* =====================================================
   GET ALL BOOKINGS
===================================================== */
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

/* =====================================================
   SEARCH BOOKINGS
===================================================== */
bookingRouter.get("/search", async (req, res) => {
  try {
    const keyword = (req.query.keyword as string)?.trim() || "";

    const results = await prisma.booking.findMany({
      where: keyword
        ? {
            OR: [
              { bookingId: { contains: keyword, mode: "insensitive" } },
              { fullName: { contains: keyword, mode: "insensitive" } },
              { cphone: { contains: keyword, mode: "insensitive" } },
              { room: { number: { contains: keyword, mode: "insensitive" } } },
            ],
          }
        : undefined,
      include: { room: true, customer: true },
      orderBy: { createdAt: "desc" },
    });

    res.json(results);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

/* =====================================================
   GET BOOKING BY ID
===================================================== */
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

/* =====================================================
   CREATE BOOKING
===================================================== */
bookingRouter.post("/create", async (req, res) => {
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
    } = req.body;

    const { userId, displayName } = await verifyLineToken(accessToken);
    if (!userId) throw new Error("Token LINE ไม่ถูกต้อง");

    const booking = await prisma.$transaction(async (tx) => {
      const customer =
        (await tx.customer.findFirst({ where: { userId } })) ??
        (await tx.customer.create({
          data: {
            userId,
            userName: displayName ?? "-",
          },
        }));

      const newBooking = await tx.booking.create({
        data: {
          roomId,
          customerId: customer.customerId,
          ctitle: ctitle ?? "",
          cname: cname ?? "",
          csurname: csurname ?? "",
          fullName: `${ctitle ?? ""}${cname ?? ""} ${csurname ?? ""}`.trim(),
          cphone: cphone ?? "",
          cmumId: cmumId ?? "",
          checkin: new Date(checkin),

          // ✅ enum
          approveStatus: "PENDING",
          checkinStatus: "NOT_CHECKED_IN",
        },
        include: { room: true, customer: true },
      });

      await tx.room.update({
        where: { roomId },
        data: { status: "OCCUPIED" },
      });

      return newBooking;
    });

    const detailUrl = `https://smartdorm-detail.biwbong.shop/booking/${booking.bookingId}`;

    // แจ้งลูกค้า
    await sendFlexMessage(
      booking.customer.userId,
      "📢 SmartDorm ยืนยันการจองห้อง",
      [
        { label: "รหัสการจอง", value: booking.bookingId },
        { label: "ชื่อ", value: booking.fullName ?? "-" },
        { label: "ห้อง", value: booking.room.number },
        { label: "วันที่เข้าพัก", value: formatThai(booking.checkin) },
        { label: "สถานะ", value: "รออนุมัติ", color: "#f39c12" },
      ],
      [{ label: "ดูรายละเอียด", url: detailUrl, style: "primary" }]
    );

    res.json({ message: "สร้างการจองสำเร็จ", booking });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/* =====================================================
   UPLOAD SLIP
===================================================== */
bookingRouter.post(
  "/:bookingId/uploadSlip",
  upload.single("slip"),
  async (req, res) => {
    try {
      const { bookingId } = req.params;
      const booking = await prisma.booking.findUnique({
        where: { bookingId },
      });
      if (!booking || !req.file)
        throw new Error("ไม่พบ booking หรือไฟล์สลิป");

      const fileName = `Booking-slips/Booking_${bookingId}_${Date.now()}`;

      await supabase.storage
        .from(process.env.SUPABASE_BUCKET!)
        .upload(fileName, req.file.buffer, {
          contentType: req.file.mimetype,
          upsert: true,
        });

      const { data } = supabase.storage
        .from(process.env.SUPABASE_BUCKET!)
        .getPublicUrl(fileName);

      await prisma.booking.update({
        where: { bookingId },
        data: { slipUrl: data.publicUrl },
      });

      res.json({ message: "อัปโหลดสลิปสำเร็จ", slipUrl: data.publicUrl });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }
);

/* =====================================================
   APPROVE / REJECT BOOKING
===================================================== */
bookingRouter.put("/:bookingId/approve", async (req, res) => {
  try {
    const updated = await prisma.booking.update({
      where: { bookingId: req.params.bookingId },
      data: { approveStatus: "APPROVED" },
      include: { room: true, customer: true },
    });

    await sendFlexMessage(
      updated.customer.userId,
      "✔️ SmartDorm อนุมัติการจอง",
      [
        { label: "รหัส", value: updated.bookingId },
        { label: "ห้อง", value: updated.room.number },
        { label: "วันที่เข้าพัก", value: formatThai(updated.checkin) },
        { label: "สถานะ", value: "อนุมัติแล้ว", color: "#27ae60" },
      ],
      [
        {
          label: "ดูรายละเอียด",
          url: `https://smartdorm-detail.biwbong.shop/booking/${updated.bookingId}`,
          style: "primary",
        },
      ]
    );

    res.json({ message: "อนุมัติการจองสำเร็จ", booking: updated });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

bookingRouter.put("/:bookingId/reject", async (req, res) => {
  try {
    const updated = await prisma.booking.update({
      where: { bookingId: req.params.bookingId },
      data: { approveStatus: "REJECTED" },
    });

    await prisma.room.update({
      where: { roomId: updated.roomId },
      data: { status: "AVAILABLE" },
    });

    res.json({ message: "ปฏิเสธการจองสำเร็จ" });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

/* =====================================================
   CHECK-IN
===================================================== */
bookingRouter.put("/:bookingId/checkin", async (req, res) => {
  try {
    const updated = await prisma.booking.update({
      where: { bookingId: req.params.bookingId },
      data: {
        checkinStatus: "CHECKED_IN",
        actualCheckin: new Date(),
      },
      include: { room: true, customer: true },
    });

    res.json({ message: "เช็คอินสำเร็จ", booking: updated });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

/* =====================================================
   DELETE BOOKING
===================================================== */
bookingRouter.delete("/:bookingId", async (req, res) => {
  try {
    const booking = await prisma.booking.findUnique({
      where: { bookingId: req.params.bookingId },
    });
    if (!booking) throw new Error("ไม่พบข้อมูลการจอง");

    if (booking.slipUrl) await deleteSlip(booking.slipUrl);

    await prisma.booking.delete({
      where: { bookingId: booking.bookingId },
    });

    await prisma.room.update({
      where: { roomId: booking.roomId },
      data: { status: "AVAILABLE" },
    });

    res.json({ message: "ลบการจองสำเร็จ" });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default bookingRouter;
