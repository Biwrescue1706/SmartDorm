// src/modules/booking.ts

// 🚚 Imports
import { Router } from "express";
import multer from "multer";
import QRCode from "qrcode";
import prisma from "../prisma";
import { createClient } from "@supabase/supabase-js";
import { verifyLineToken } from "../utils/verifyLineToken";
import { sendFlexMessage } from "../utils/lineFlex";

// ⚙️ ตั้งค่า Supabase
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
      console.error(`⚠️ Failed to delete slip from Supabase: ${url}`, error);
    } else {
      console.log(`🧹 Deleted slip from Supabase: ${url}`);
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

// 🌐 Routes
// 📋 ดึงข้อมูลทั้งหมด
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

// 🔍 ค้นหาการจอง
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
      orderBy: { createdAt: "desc" },
      include: { room: true, customer: true },
    });
    res.json(results);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// 🔎 ดึงข้อมูลการจองตาม bookingId
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

// 🧾 ผู้ใช้ส่งคำขอจองห้อง
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

    //ตรวจสอบสิทธิ์ผู้จองผ่าน LINE
    const { userId, displayName } = await verifyLineToken(accessToken);
    if (!userId || !roomId || !checkin) throw new Error("ข้อมูลไม่ครบ");

    // 📸 อัปโหลดสลิปไปยัง Supabase Storage (ถ้ามี)
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

    // 🧾 บันทึกข้อมูลการจองลงฐานข้อมูล
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

    // 📩 ส่ง LINE Notify
    try {
      const bookingUrl = `https://smartdorm-detail.biwbong.shop/booking/${booking.bookingId}`;
      await sendFlexMessage(
        booking.customer?.userId!,
        "📢 SmartDorm ยืนยันการจองห้อง",
        [
          { label: "รหัสการจอง : ", value: booking.bookingId },
          { label: "ชื่อ : ", value: booking.fullName ?? "-" },
          { label: "ห้อง : ", value: booking.room.number },
          { label: "วันที่เข้าพัก : ", value: formatThaiDate(booking.checkin) },
          { label: "เบอร์โทร : ", value: booking.cphone ?? "-" },
          { label: "สถานะ", value: "รออนุมัติจากผู้ดูแล", color: "#f39c12" },
        ],
        [{ label: "ดูรายละเอียด", url: bookingUrl, style: "primary" }]
      );

      if (process.env.ADMIN_LINE_ID) {
        await sendFlexMessage(
          process.env.ADMIN_LINE_ID,
          "📢 มีการจองห้องใหม่",
          [
            { label: "รหัสการจอง", value: booking.bookingId },
            { label: "ชื่อผู้จอง", value: booking.fullName ?? "-" },
            { label: "ห้อง", value: booking.room.number },
            { label: "วันที่เข้าพัก", value: formatThaiDate(booking.checkin) },
            { label: "เบอร์โทร : ", value: booking.cphone ?? "-" },
          ],
          [
            { label: "ดูสลิป", url: `${booking.slipUrl}`, style: "primary" },
            {
              label: "เปิดในระบบ Admin",
              url: `https://smartdorm-admin.biwbong.shop`,
              style: "secondary",
            },
          ]
        );
      }
      console.log(
        `[${logTime()}] ส่งแจ้งเตือนไลน์ สำเร็จแล้ว รหัสการจอง ${booking.customer?.userName} : `
      );
    } catch (err: any) {
      console.warn(
        `[${logTime()}] ⚠️ ส่งแจ้งเตือนไลน์ ไม่สำเร็จ :`,
        err.message
      );
    }

    res.status(200).json({ message: "จองสำเร็จ", booking });
  } catch (err: any) {
    console.error("⚠️ [booking/create] Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

//  อนุมัติการจอง
bookingRouter.put("/:bookingId/approve", async (req, res) => {
  try {
    const updated = await prisma.booking.update({
      where: { bookingId: req.params.bookingId },
      data: { approveStatus: 1 },
      include: { room: true, customer: true },
    });

    const bookingUrl = `https://smartdorm-detail.biwbong.shop/booking/${updated.bookingId}`;
    await sendFlexMessage(
      updated.customer?.userId!,
      "📢 SmartDorm ผลการอนุมัติการจอง",
      [
        { label: "รหัสการจอง : ", value: updated.bookingId },
        { label: "ชื่อ : ", value: updated.fullName ?? "-" },
        { label: "ห้อง : ", value: updated.room.number },
        { label: "วันที่อนุมัติ : ", value: formatThaiDate(new Date()) },
        { label: "วันที่เข้าพัก : ", value: formatThaiDate(updated.checkin) },
        { label: "สถานะ", value: "อนุมัติแล้ว", color: "#27ae60" },
      ],
      [{ label: "ดูรายละเอียด", url: bookingUrl, style: "primary" }]
    );
    console.log(
      `[${logTime()}] ส่งแจ้งเตือนไลน์ ผลอนุมัติการจอง ของ ${updated.customer?.userName} สำเร็จแล้ว `
    );
    res.json({ message: "อนุมัติการจองสำเร็จ", booking: updated });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// 🚫 ปฏิเสธการจอง
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

    const bookingUrl = `https://smartdorm-detail.biwbong.shop/booking/${updated.bookingId}`;
    await sendFlexMessage(
      updated.customer?.userId!,
      "📢 SmartDorm แจ้งผลการจอง",
      [
        { label: "รหัสการจอง : ", value: updated.bookingId },
        { label: "ชื่อ : ", value: updated.fullName ?? "-" },
        { label: "ห้อง : ", value: updated.room.number },
        { label: "วันที่เข้าพัก : ", value: formatThaiDate(updated.checkin) },
        { label: "สถานะ", value: " ไม่อนุมัติการจอง", color: "#e74c3c" },
      ],
      [{ label: "ดูรายละเอียด", url: bookingUrl, style: "primary" }]
    );

    res.json({ message: "ปฏิเสธการจองสำเร็จ" });
    console.log(
      `[${logTime()}] ส่งแจ้งเตือนไลน์ ผลปฏิเสธการจอง ของ ${updated.customer?.userName} สำเร็จแล้ว `
    );
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// 🏠 เช็คอิน
bookingRouter.put("/:bookingId/checkin", async (req, res) => {
  try {
    const updated = await prisma.booking.update({
      where: { bookingId: req.params.bookingId },
      data: { checkinStatus: 1, actualCheckin: new Date() },
      include: { room: true, customer: true },
    });

    const bookingUrl = `https://smartdorm-detail.biwbong.shop/booking/${updated.bookingId}`;
    await sendFlexMessage(
      updated.customer?.userId!,
      "📢 SmartDorm เช็คอินสำเร็จ",
      [
        { label: "รหัสการจอง : ", value: updated.bookingId },
        { label: "ชื่อ : ", value: updated.fullName ?? "-" },
        { label: "ห้อง : ", value: updated.room.number },
        {
          label: "วันที่เช็คอิน : ",
          value: formatThaiDate(updated.actualCheckin),
        },
      ],
      [{ label: "ดูรายละเอียด", url: bookingUrl, style: "primary" }]
    );

    res.json({ message: "เช็คอินสำเร็จ", booking: updated });
    console.log(
      `[${logTime()}] ส่งแจ้งเตือนไลน์ ผลเช็คอิน ของ ${updated.customer?.userName} สำเร็จแล้ว `
    );
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// 🚪 เช็คเอาท์
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

    const bookingUrl = `https://smartdorm-detail.biwbong.shop/booking/${updated.bookingId}`;
    await sendFlexMessage(
      updated.customer?.userId!,
      "📢 SmartDorm เช็คเอาท์สำเร็จ",
      [
        { label: "รหัสการจอง : ", value: updated.bookingId },
        { label: "ชื่อ : ", value: updated.fullName ?? "-" },
        { label: "ห้อง : ", value: updated.room.number },
        {
          label: "วันที่เช็คเอาท์ : ",
          value: formatThaiDate(updated.actualCheckout),
        },
      ],
      [{ label: "ดูรายละเอียด", url: bookingUrl, style: "primary" }]
    );

    console.log(
      `[${logTime()}] ส่งแจ้งเตือนไลน์ ผลเช็คเอาท์ ของ ${updated.customer?.userName} สำเร็จแล้ว`
    );
    res.json({ message: "เช็คเอาท์สำเร็จ", booking: updated });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// ✏️ Admin แก้ไขข้อมูลการจอง
bookingRouter.put("/:bookingId", async (req, res) => {
  try {
    const { bookingId } = req.params;
    const data = req.body;

    const booking = await prisma.booking.findUnique({
      where: { bookingId },
      include: { room: true, customer: true },
    });
    if (!booking) throw new Error("ไม่พบข้อมูลการจอง");

    //  ถ้ามีการเปลี่ยนชื่อ ให้สร้าง fullName ใหม่อัตโนมัติ
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

    console.log(` Updated booking ${bookingId}`, data);
    res.json({ message: "แก้ไขข้อมูลสำเร็จ", booking: updated });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// 🗑️ ลบการจอง
bookingRouter.delete("/:bookingId", async (req, res) => {
  try {
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

// 🎟️ QR Code
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
