import { Router } from "express";
import multer from "multer";
import prisma from "../prisma";
import { createClient } from "@supabase/supabase-js";
import { verifyLineToken } from "../utils/verifyLineToken";
import { sendFlexMessage } from "../utils/lineFlex";

// ---------------- Supabase ----------------
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_KEY!
);

// ---------------- Utils ----------------
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

const upload = multer({ storage: multer.memoryStorage() });
const bookingRouter = Router();

const formatThai = (d?: Date | string | null) =>
  d
    ? new Date(d).toLocaleDateString("th-TH", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "-";


// 📋 GET ALL BOOKINGS
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


// 🔍 SEARCH
bookingRouter.get("/search", async (req, res) => {
  try {
    const keyword = (req.query.keyword as string)?.trim();

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


// 🔎 GET BY ID
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


// ➕ CREATE BOOKING
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
          slipUrl: null,
          checkin: new Date(checkin),
          approveStatus: 0,
          checkinStatus: 0,
        },
        include: { room: true, customer: true },
      });

      await tx.room.update({
        where: { roomId },
        data: { status: 1 },
      });

      return newBooking;
    });

    const detailUrl = `https://smartdorm-detail.biwbong.shop/booking/${booking.bookingId}`;

    await sendFlexMessage(
      booking.customer?.userId ?? "",
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

// 📤 UPLOAD SLIP
bookingRouter.post(
  "/:bookingId/uploadSlip",
  upload.single("slip"),
  async (req, res) => {
    try {
      const { bookingId } = req.params;
      const booking = await prisma.booking.findUnique({
        where: { bookingId },
      });

      if (!booking || !req.file) throw new Error("ข้อมูลไม่ครบ");

      const created = booking.createdAt.toISOString().replace(/[:.]/g, "-");

      const fileName = `Booking-slips/Booking-slip_${bookingId}_${created}`;

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

// ✅ APPROVE BOOKING
bookingRouter.put("/:bookingId/approve", async (req, res) => {
  try {
    const updated = await prisma.booking.update({
      where: { bookingId: req.params.bookingId },
      data: { approveStatus: 1 },
      include: { room: true, customer: true },
    });

    await sendFlexMessage(
      updated.customer?.userId ?? "",
      "✔️ SmartDorm อนุมัติการจอง",
      [
        { label: "รหัส", value: updated.bookingId },
        { label: "ห้อง", value: updated.room.number },
        { label: "วันที่เข้าพัก", value: formatThai(updated.checkin) },
        { label: "สถานะ", value: "อนุมัติแล้ว", color: "#27ae60" },
      ],
      [
        {
          label: "รายละเอียด",
          url: `https://smartdorm-detail.biwbong.shop/booking/${updated.bookingId}`,
          style: "primary",
        },
      ]
    );

    res.json({ message: "อนุมัติสำเร็จ", booking: updated });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// ❌ REJECT BOOKING
bookingRouter.put("/:bookingId/reject", async (req, res) => {
  try {
    const updated = await prisma.booking.update({
      where: { bookingId: req.params.bookingId },
      data: { approveStatus: 2 },
      include: { room: true, customer: true },
    });

    // คืนสถานะห้อง
    await prisma.room.update({
      where: { roomId: updated.roomId },
      data: { status: 0 },
    });

    // 🔔 แจ้งลูกค้าทาง LINE
    try {
      await sendFlexMessage(
        updated.customer?.userId ?? "",
        "❌ SmartDorm ปฏิเสธการจอง",
        [
          { label: "รหัสการจอง", value: updated.bookingId },
          { label: "ชื่อ", value: updated.fullName ?? "-" },
          { label: "ห้อง", value: updated.room.number },
          { label: "วันที่แจ้งเข้าพัก", value: formatThai(updated.checkin) },
          { label: "สถานะ", value: "ไม่อนุมัติ", color: "#e74c3c" },
          {
            label: "หมายเหตุ",
            value: "กรุณาติดต่อแอดมินเพื่อสอบถามรายละเอียดเพิ่มเติม",
          },
        ],
        [
          {
            label: "ดูรายละเอียด",
            url: `https://smartdorm-detail.biwbong.shop/booking/${updated.bookingId}`,
            style: "primary",
          },
        ]
      );
    } catch (err) {
      console.error("❌ LINE Error (reject):", err);
    }

    res.json({ message: "ปฏิเสธการจองสำเร็จ", booking: updated });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});


// 🗑️ DELETE BOOKING
bookingRouter.delete("/:bookingId", async (req, res) => {
  try {
    const existing = await prisma.booking.findUnique({
      where: { bookingId: req.params.bookingId },
    });

    if (!existing) throw new Error("ไม่พบข้อมูลการจอง");

    if (existing.slipUrl) await deleteSlip(existing.slipUrl);

    const booking = await prisma.booking.delete({
      where: { bookingId: req.params.bookingId },
    });

    await prisma.room.update({
      where: { roomId: booking.roomId },
      data: { status: 0 },
    });

    res.json({ message: "ลบการจองสำเร็จ" });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default bookingRouter;
