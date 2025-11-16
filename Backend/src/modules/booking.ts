// src/modules/booking.ts

// 🚚 Imports
import { Router } from "express";
import multer from "multer";
import QRCode from "qrcode";
import prisma from "../prisma";
import { createClient } from "@supabase/supabase-js";
import { verifyLineToken } from "../utils/verifyLineToken";
import { sendFlexMessage } from "../utils/lineFlex";

// ⚙️ Supabase
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
    if (error) {
      console.error(`⚠️ Failed to delete slip: ${url}`, error);
    }
  }
};

const upload = multer({ storage: multer.memoryStorage() });
const bookingRouter = Router();

// 🕒 Helper
const logTime = () => new Date().toISOString().replace("T", " ").split(".")[0];
const formatThaiDate = (d?: string | Date | null) =>
  d
    ? new Date(d).toLocaleDateString("th-TH", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "-";

// 🌐 ROUTES
// 1) ดึงข้อมูลทั้งหมด
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

// 2) Search Booking
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
              {
                room: {
                  number: { contains: keyword, mode: "insensitive" },
                },
              },
            ],
          }
        : undefined,
      orderBy: { createdAt: "desc" },
      include: { room: true, customer: true },
    });

    res.json(results);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// 3) Get booking by ID
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

// 4) Create Booking
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

    // ตรวจสอบสิทธิ์ LINE
    const { userId, displayName } = await verifyLineToken(accessToken);
    if (!userId || !roomId || !checkin) throw new Error("ข้อมูลไม่ครบ");

    // สลิป Supabase
    let slipUrl = "";

    if (req.file) {
      const random = Math.random().toString(36).substring(2, 8);
      const fileName = `slips/${Date.now()}_${random}_${req.file.originalname}`;

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

    // บันทึกจอง + เปลี่ยนสถานะห้อง → 1
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

      // ⭐ ห้องถูกจองแล้ว
      await tx.room.update({
        where: { roomId },
        data: { status: 1 },
      });

      return newBooking;
    });

    // ส่งแจ้งเตือน LINE
    try {
      const bookingUrl = `https://smartdorm-detail.biwbong.shop/booking/${booking.bookingId}`;

      await sendFlexMessage(
        booking.customer?.userId!,
        "📢 SmartDorm ยืนยันการจองห้อง",
        [
          { label: "รหัสการจอง : ", value: booking.bookingId },
          { label: "ชื่อ : ", value: booking.fullName },
          { label: "ห้อง : ", value: booking.room.number },
          { label: "วันที่เข้าพัก : ", value: formatThaiDate(booking.checkin) },
          { label: "เบอร์โทร : ", value: booking.cphone },
          { label: "สถานะ", value: "รออนุมัติ", color: "#f39c12" },
        ],
        [{ label: "ดูรายละเอียด", url: bookingUrl, style: "primary" }]
      );
    } catch {}

    res.status(200).json({ message: "จองสำเร็จ", booking });
  } catch (err: any) {
    console.error("⚠️ [booking/create] Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// 5) อนุมัติ
bookingRouter.put("/:bookingId/approve", async (req, res) => {
  try {
    const updated = await prisma.booking.update({
      where: { bookingId: req.params.bookingId },
      data: { approveStatus: 1 },
      include: { room: true, customer: true },
    });

    // ⭐⭐ FIX: ต้องอัปเดตสถานะห้อง → 1
    await prisma.room.update({
      where: { roomId: updated.roomId },
      data: { status: 1 },
    });

    const bookingUrl = `https://smartdorm-detail.biwbong.shop/booking/${updated.bookingId}`;
    await sendFlexMessage(
      updated.customer?.userId!,
      "📢 SmartDorm ผลการอนุมัติการจอง",
      [
        { label: "รหัส", value: updated.bookingId },
        { label: "ชื่อ", value: updated.fullName },
        { label: "ห้อง", value: updated.room.number },
        { label: "วันที่เข้าพัก", value: formatThaiDate(updated.checkin) },
        { label: "สถานะ", value: "อนุมัติแล้ว", color: "#27ae60" },
      ],
      [{ label: "ดูรายละเอียด", url: bookingUrl, style: "primary" }]
    );

    res.json({ message: "อนุมัติสำเร็จ", booking: updated });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// 6) ปฏิเสธ → ห้องกลับมา 0
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

    res.json({ message: "ปฏิเสธสำเร็จ" });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// 7) เช็คอิน (ไม่แตะห้อง)
bookingRouter.put("/:bookingId/checkin", async (req, res) => {
  try {
    const updated = await prisma.booking.update({
      where: { bookingId: req.params.bookingId },
      data: { checkinStatus: 1, actualCheckin: new Date() },
      include: { room: true, customer: true },
    });

    res.json({ message: "เช็คอินสำเร็จ", booking: updated });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// 8) เช็คเอาท์ → ห้องว่าง
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

    res.json({ message: "เช็คเอาท์สำเร็จ", booking: updated });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// 9) แก้ไขข้อมูลการจอง
bookingRouter.put("/:bookingId", async (req, res) => {
  try {
    const { bookingId } = req.params;
    const data = req.body;

    const booking = await prisma.booking.findUnique({
      where: { bookingId },
      include: { room: true, customer: true },
    });

    if (!booking) throw new Error("ไม่พบข้อมูลการจอง");

    // ถ้าแก้ชื่อ → สร้าง fullName ใหม่
    if (data.ctitle || data.cname || data.csurname) {
      const title = data.ctitle ?? booking.ctitle ?? "";
      const name = data.cname ?? booking.cname ?? "";
      const surname = data.csurname ?? booking.csurname ?? "";
      data.fullName = `${title}${name} ${surname}`.trim();
    }

    const updated = await prisma.booking.update({
      where: { bookingId },
      data,
      include: { room: true, customer: true },
    });

    res.json({ message: "แก้ไขสำเร็จ", booking: updated });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// 10) ลบการจอง → ห้องกลับมา 0
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

// 11) QR Code
bookingRouter.get("/:bookingId/qrcode", async (req, res) => {
  try {
    const booking = await prisma.booking.findUnique({
      where: { bookingId: req.params.bookingId },
    });

    if (!booking) throw new Error("ไม่พบข้อมูล");

    const adminUrl = `https://smartdorm-admin.biwbong.shop/booking/${booking.bookingId}`;
    const qr = await QRCode.toDataURL(adminUrl);

    res.json({ adminUrl, qr });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default bookingRouter;