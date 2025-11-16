// src/modules/booking.ts
import { Router } from "express";
import multer from "multer";
import QRCode from "qrcode";
import prisma from "../prisma";
import { createClient } from "@supabase/supabase-js";
import { verifyLineToken } from "../utils/verifyLineToken";
import { sendFlexMessage } from "../utils/lineFlex";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_KEY!
);

export const deleteSlip = async (url: string) => {
  const bucket = process.env.SUPABASE_BUCKET!;
  if (!url || !bucket) return;
  const path = url.split(`/${bucket}/`)[1];
  if (path) {
    const { error } = await supabase.storage.from(bucket).remove([path]);
    if (error) console.error("⚠️ Delete slip error:", error);
  }
};

const upload = multer({ storage: multer.memoryStorage() });
const bookingRouter = Router();

const formatThai = (d?: string | Date | null) =>
  d
    ? new Date(d).toLocaleDateString("th-TH", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "-";

// ===========================================================
// GET ALL
// ===========================================================
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

// ===========================================================
// SEARCH
// ===========================================================
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

// ===========================================================
// GET BY ID
// ===========================================================
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

// ===========================================================
// CREATE BOOKING
// ===========================================================
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
    if (!userId) throw new Error("Token LINE ไม่ถูกต้อง");

    // Upload slip
    let slipUrl = "";
    if (req.file) {
      const fileName = `slips/${Date.now()}_${req.file.originalname}`;
      const { error } = await supabase.storage
        .from(process.env.SUPABASE_BUCKET!)
        .upload(fileName, req.file.buffer, {
          contentType: req.file.mimetype,
        });

      if (error) throw new Error("อัปโหลดสลิปไม่สำเร็จ");

      const { data } = supabase.storage
        .from(process.env.SUPABASE_BUCKET!)
        .getPublicUrl(fileName);
      slipUrl = data.publicUrl;
    }

    const booking = await prisma.$transaction(async (tx) => {
      let customer = await tx.customer.findFirst({ where: { userId } });
      if (!customer) {
        customer = await tx.customer.create({
          data: { userId, userName: displayName },
        });
      }

      const newBooking = await tx.booking.create({
        data: {
          roomId,
          customerId: customer.customerId,
          ctitle,
          cname,
          csurname,
          fullName: `${ctitle ?? ""}${cname ?? ""} ${csurname ?? ""}`.trim(),
          cphone: cphone ?? "",
          cmumId: cmumId ?? "",
          slipUrl,
          checkin: new Date(checkin),
          checkout: checkout ? new Date(checkout) : null,
          approveStatus: 0,
          checkinStatus: 0,
          checkoutStatus: 0,
        },
        include: { room: true, customer: true },
      });

      await tx.room.update({
        where: { roomId },
        data: { status: 1 },
      });

      return newBooking;
    });

    // Notify LINE
    try {
      const bookingUrl = `https://smartdorm-detail.biwbong.shop/booking/${booking.bookingId}`;

      await sendFlexMessage(
        booking.customer?.userId ?? "",
        "📢 SmartDorm ยืนยันการจองห้อง",
        [
          { label: "รหัสการจอง", value: booking.bookingId },
          { label: "ชื่อ", value: booking.fullName },
          { label: "ห้อง", value: booking.room.number },
          { label: "วันที่เข้าพัก", value: formatThai(booking.checkin) },
          { label: "สถานะ", value: "รออนุมัติ", color: "#f39c12" },
        ],
        [{ label: "ดูรายละเอียด", url: bookingUrl, style: "primary" }]
      );
    } catch (err) {
      console.error("LINE Error CREATE:", err);
    }

    res.json({ message: "จองสำเร็จ", booking });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ===========================================================
// APPROVE
// ===========================================================
bookingRouter.put("/:bookingId/approve", async (req, res) => {
  try {
    const updated = await prisma.booking.update({
      where: { bookingId: req.params.bookingId },
      data: { approveStatus: 1 },
      include: { room: true, customer: true },
    });

    try {
      await sendFlexMessage(
        updated.customer?.userId ?? "",
        "✔️ SmartDorm อนุมัติการจองแล้ว",
        [
          { label: "รหัสการจอง", value: updated.bookingId },
          { label: "ชื่อ", value: updated.fullName },
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
    } catch (err) {
      console.error("LINE Error APPROVE:", err);
    }

    res.json({ message: "อนุมัติการจองสำเร็จ", booking: updated });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// ===========================================================
// REJECT
// ===========================================================
bookingRouter.put("/:bookingId/reject", async (req, res) => {
  try {
    const updated = await prisma.booking.update({
      where: { bookingId: req.params.bookingId },
      data: { approveStatus: 2 },
      include: { room: true, customer: true },
    });

    await prisma.room.update({
      where: { roomId: updated.roomId },
      data: { status: 0 },
    });

    try {
      await sendFlexMessage(
        updated.customer?.userId ?? "",
        "❌ SmartDorm แจ้งผลการจอง",
        [
          { label: "รหัสการจอง", value: updated.bookingId },
          { label: "ชื่อ", value: updated.fullName },
          { label: "ห้อง", value: updated.room.number },
          { label: "สถานะ", value: "ไม่อนุมัติ", color: "#e74c3c" },
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
      console.error("LINE Error REJECT:", err);
    }

    res.json({ message: "ปฏิเสธการจองสำเร็จ" });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// ===========================================================
// CHECK-IN
// ===========================================================
bookingRouter.put("/:bookingId/checkin", async (req, res) => {
  try {
    const updated = await prisma.booking.update({
      where: { bookingId: req.params.bookingId },
      data: { checkinStatus: 1, actualCheckin: new Date() },
      include: { room: true, customer: true },
    });

    try {
      await sendFlexMessage(
        updated.customer?.userId ?? "",
        "🏠 SmartDorm เช็คอินสำเร็จ",
        [
          { label: "รหัสการจอง", value: updated.bookingId },
          { label: "ชื่อ", value: updated.fullName },
          { label: "ห้อง", value: updated.room.number },
          { label: "วันที่เช็คอิน", value: formatThai(updated.actualCheckin) },
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
      console.error("LINE Error CHECKIN:", err);
    }

    res.json({ message: "เช็คอินสำเร็จ", booking: updated });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// ===========================================================
// CHECK-OUT
// ===========================================================
bookingRouter.put("/:bookingId/checkout", async (req, res) => {
  try {
    const updated = await prisma.booking.update({
      where: { bookingId: req.params.bookingId },
      data: { checkoutStatus: 1, actualCheckout: new Date() },
      include: { room: true, customer: true },
    });

    await prisma.room.update({
      where: { roomId: updated.roomId },
      data: { status: 0 },
    });

    try {
      await sendFlexMessage(
        updated.customer?.userId ?? "",
        "🚪 SmartDorm เช็คเอาท์สำเร็จ",
        [
          { label: "รหัสการจอง", value: updated.bookingId },
          { label: "ชื่อ", value: updated.fullName },
          { label: "ห้อง", value: updated.room.number },
          { label: "วันที่เช็คเอาท์", value: formatThai(updated.actualCheckout) },
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
      console.error("LINE Error CHECKOUT:", err);
    }

    res.json({ message: "เช็คเอาท์สำเร็จ", booking: updated });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// ===========================================================
// DELETE BOOKING
// ===========================================================
bookingRouter.delete("/:bookingId", async (req, res) => {
  try {
    const booking = await prisma.booking.delete({
      where: { bookingId: req.params.bookingId },
    });

    await prisma.room.update({
      where: { roomId: booking.roomId },
      data: { status: 0 },
    });

    res.json({ message: "ลบสำเร็จ" });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default bookingRouter;