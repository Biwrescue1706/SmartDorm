// ================= booking.ts =================
import { Router } from "express";
import multer from "multer";
import prisma from "../prisma";
import { createClient } from "@supabase/supabase-js";
import { verifyLineToken } from "../utils/verifyLineToken";
import { sendFlexMessage } from "../utils/lineFlex";
import { authMiddleware } from "../middleware/authMiddleware";

const upload = multer({ storage: multer.memoryStorage() });
const booking = Router();
const BASE_URL = "https://smartdorm-detail.biwbong.shop";
const ADMIN_URL = "https://smartdorm-admin.biwbong.shop";

// ---------------- Supabase ----------------
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_KEY!
);

// ---------------- Utils ----------------
export const deleteSlip = async (url?: string | null) => {
  try {
    if (!url) return;
    const publicMarker = "/object/public/";
    const idx = url.indexOf(publicMarker);
    if (idx === -1) return;
    const fullPath = url.substring(idx + publicMarker.length);
    const bucket = fullPath.split("/")[0];
    const filePath = fullPath.split("/").slice(1).join("/");
    await supabase.storage.from(bucket).remove([filePath]);
  } catch (err) {
    console.warn("⚠️ ลบสลิปไม่สำเร็จ", err);
  }
};

const formatThai = (d?: Date | string | null) =>
  d
    ? new Date(d).toLocaleDateString("th-TH", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "-";

// ================== ROUTES ==================

// 📋 GET ALL BOOKINGS
booking.get("/getall", async (_req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      orderBy: { bookingDate: "desc" },
      include: { room: true, customer: true },
    });
    res.json(bookings);
  } catch {
    res.status(500).json({ error: "ไม่สามารถดึงข้อมูลการจองได้" });
  }
});

// 🔍 SEARCH BOOKINGS
booking.get("/search", async (req, res) => {
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
      orderBy: { bookingDate: "desc" },
    });
    res.json(results);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// 📋 GET HISTORY
booking.get("/history", authMiddleware, async (_req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      orderBy: { bookingDate: "desc" },
      include: {
        room: { select: { number: true } },
        customer: { select: { userName: true } },
      },
    });

    const checkouts = await prisma.checkout.findMany({
      select: { bookingId: true, checkout: true, checkoutAt: true },
    });
    const checkoutMap = new Map(checkouts.map((c) => [c.bookingId, c]));

    const history = bookings.map((b: any) => {
      const c = checkoutMap.get(b.bookingId);
      return {
        bookingId: b.bookingId,
        fullName: b.fullName,
        cphone: b.cphone,
        bookingDate: b.bookingDate,
        checkin: b.checkin,
        checkinAt: b.checkinAt,
        room: b.room,
        customer: { userName: b.customer?.userName },
        checkout: c?.checkout || null,
        checkoutAt: c?.checkoutAt || null,
      };
    });

    res.json({ bookings: history });
  } catch (err) {
    console.error("❌ booking/history error:", err);
    res.status(500).json({ message: "server error" });
  }
});

// 🔎 GET BOOKING BY ID
booking.get("/:bookingId", async (req, res) => {
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
booking.post("/create", async (req, res) => {
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
          data: { userId, userName: displayName ?? "-" },
        }));

      const created = await tx.booking.create({
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
          bookingDate: new Date(),
          checkin: checkin ? new Date(checkin) : new Date(),
          approveStatus: 0,
          checkinStatus: 0,
        },
        include: { room: true, customer: true },
      });

      await tx.room.update({ where: { roomId }, data: { status: 1 } });
      return created;
    });

    const detailUrl = `${BASE_URL}/booking/${booking.bookingId}`;
    try {
      await sendFlexMessage(
        booking.customer?.userId ?? "",
        "🏫SmartDorm🎉 ยืนยันการจองห้อง",
        [
          { label: "รหัสการจอง", value: booking.bookingId },
          { label: "ชื่อ", value: booking.fullName ?? "-" },
          { label: "ห้อง", value: booking.room.number },
          { label: "วันจอง", value: formatThai(booking.bookingDate) },
          { label: "วันที่แจ้งเข้าพัก", value: formatThai(booking.checkin) },
          { label: "เบอร์โทร", value: booking.cphone ?? "-" },
          { label: "สถานะ", value: "รออนุมัติ", color: "#f39c12" },
        ],
        [{ label: "ดูรายละเอียด", url: detailUrl, style: "primary" }]
      );
    } catch (err) {
      console.error("❌ LINE Error (customer):", err);
    }

    // 📩 แจ้งแอดมิน
    const adminId = process.env.ADMIN_LINE_ID;
    if (adminId) {
      try {
        await sendFlexMessage(
          adminId,
          "📢 มีการจองห้องใหม่เข้ามา",
          [
            { label: "รหัสการจอง", value: booking.bookingId },
            { label: "ชื่อผู้จอง", value: booking.fullName ?? "-" },
            { label: "ห้อง", value: booking.room.number },
            { label: "วันจอง", value: formatThai(booking.bookingDate) },
            { label: "วันที่แจ้งเข้าพัก", value: formatThai(booking.checkin) },
            { label: "เบอร์โทร", value: booking.cphone ?? "-" },
          ],
          [
            {
              label: "เปิดดูรายการ",
              url: `${ADMIN_URL}`,
              style: "primary",
            },
          ]
        );
      } catch (err) {
        console.error("❌ LINE Error (admin):", err);
      }
    }

    res.json({ message: "สร้างการจองสำเร็จ", booking });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 📤 UPLOAD SLIP
booking.post(
  "/:bookingId/uploadSlip",
  upload.single("slip"),
  async (req, res) => {
    try {
      const { bookingId } = req.params;
      const booking = await prisma.booking.findUnique({ where: { bookingId } });
      if (!booking || !req.file) throw new Error("ข้อมูลไม่ครบ");

      const created = booking.bookingDate.toISOString().replace(/[:.]/g, "-");
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

// ✅ APPROVE
booking.put("/:bookingId/approve", async (req, res) => {
  try {
    const updated = await prisma.$transaction(async (tx) => {
      const b = await tx.booking.update({
        where: { bookingId: req.params.bookingId },
        data: { approveStatus: 1, approvedAt: new Date() },
        include: { room: true, customer: true },
      });
      await tx.room.update({
        where: { roomId: b.roomId },
        data: { status: 1 },
      });
      return b;
    });

    const detailUrl = `${BASE_URL}/booking/${updated.bookingId}`;

    try {
      await sendFlexMessage(
        updated.customer?.userId ?? "",
        "🏫SmartDorm🎉 แจ้งผลคำขอการจองห้อง",
        [
          { label: "รหัส", value: updated.bookingId },
          { label: "ชื่อ", value: updated.fullName ?? "-" },
          { label: "ห้อง", value: updated.room.number },
          { label: "วันจอง", value: formatThai(updated.bookingDate) },
          { label: "วันที่แจ้งเข้าพัก", value: formatThai(updated.checkin) },
          { label: "วันที่อนุมัติ", value: formatThai(updated.approvedAt) },
          { label: "สถานะ", value: "อนุมัติแล้ว", color: "#27ae60" },
          {
            label: "หมายเหตุ",
            value:
              "กรุณมาเช็คอินในวันที่แจ้งเข้าพัก\n กรุณากดปุ่มด้านล่างเพื่อดูรายละเอียดและแสดงให้เจ้าหน้าที่",
          },
        ],
        [
          {
            label: "รายละเอียด",
            url: detailUrl,
            style: "primary",
          },
        ]
      );
    } catch (err) {
      console.error("❌ LINE Error (approve):", err);
    }

    res.json({ message: "อนุมัติสำเร็จ", booking: updated });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// ❌ REJECT
booking.put("/:bookingId/reject", async (req, res) => {
  try {
    const updated = await prisma.$transaction(async (tx) => {
      const b = await tx.booking.update({
        where: { bookingId: req.params.bookingId },
        data: { approveStatus: 2, checkinAt: new Date() },
        include: { room: true, customer: true },
      });
      await tx.room.update({
        where: { roomId: b.roomId },
        data: { status: 0 },
      });
      return b;
    });

    const detailUrl = `${BASE_URL}/booking/${updated.bookingId}`;
    try {
      await sendFlexMessage(
        updated.customer?.userId ?? "",
        "🏫SmartDorm🎉 แจ้งผลคำขอการจองห้อง",
        [
          { label: "รหัส", value: updated.bookingId },
          { label: "ชื่อ", value: updated.fullName ?? "-" },
          { label: "ห้อง", value: updated.room.number },
          { label: "วันจอง", value: formatThai(updated.bookingDate) },
          { label: "วันที่แจ้งเข้าพัก", value: formatThai(updated.checkin) },
          { label: "วันที่ไม่อนุมัติ", value: formatThai(updated.approvedAt) },
          { label: "สถานะ", value: "ปฏิเสธการจอง", color: "#e74c3c" },
          {
            label: "แจ้งโอนเงิน",
            value: "กรุณาพิมพ์หมายเลขบัญชี\nธนาคาร\nxxx-xxx-xxxx\nชื่อ-นามสกุล",
          },
          { label: "เหตุผล", value: "กรุณาติดต่อแอดมินเพื่อสอบถามเพิ่มเติม" },
        ],
        [
          {
            label: "รายละเอียด",
            url: detailUrl,
            style: "primary",
          },
        ]
      );
    } catch (err) {
      console.error("❌ LINE Error (reject):", err);
    }

    res.json({ message: "ปฏิเสธสำเร็จ" });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// 🏠 CHECKIN
booking.put("/:bookingId/checkin", async (req, res) => {
  try {
    const updated = await prisma.booking.update({
      where: { bookingId: req.params.bookingId },
      data: { checkinStatus: 1, checkinAt: new Date() },
      include: { room: true, customer: true },
    });

    const detailUrl = `${BASE_URL}/booking/${updated.bookingId}`;

    try {
      await sendFlexMessage(
        updated.customer?.userId ?? "",
        "🏫SmartDorm🎉 เช็คอินสำเร็จ",
        [
          { label: "รหัส", value: updated.bookingId },
          { label: "ชื่อ", value: updated.fullName ?? "-" },
          { label: "ห้อง", value: updated.room.number },
          { label: "วันจอง", value: formatThai(updated.bookingDate) },
          { label: "วันที่แจ้งเข้าพัก", value: formatThai(updated.checkin) },
          {
            label: "เช็คอิน",
            value: formatThai(updated.checkinAt),
          },
          { label: "สถานะ", value: "เช็คอินเรียบร้อย", color: "#27ae60" },
        ],
        [
          {
            label: "รายละเอียด",
            url: detailUrl,
            style: "primary",
          },
        ]
      );
    } catch (err) {
      console.error("❌ LINE Error (checkin):", err);
    }

    res.json({ message: "เช็คอินสำเร็จ", booking: updated });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// ✏️ ADMIN UPDATE
booking.put("/:bookingId", async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { ctitle, cname, csurname, cphone, cmumId, approveStatus, checkin } =
      req.body;

    const booking = await prisma.booking.findUnique({ where: { bookingId } });
    if (!booking) throw new Error("ไม่พบข้อมูลการจอง");

    let fullName = booking.fullName;
    if (ctitle || cname || csurname) {
      fullName =
        `${ctitle ?? booking.ctitle ?? ""}${cname ?? booking.cname ?? ""} ${
          csurname ?? booking.csurname ?? ""
        }`.trim();
    }

    const nextApproveStatus =
      approveStatus !== undefined
        ? Number(approveStatus)
        : booking.approveStatus;

    const updated = await prisma.$transaction(async (tx) => {
      const b = await tx.booking.update({
        where: { bookingId },
        data: {
          ctitle: ctitle ?? booking.ctitle,
          cname: cname ?? booking.cname,
          csurname: csurname ?? booking.csurname,
          fullName,
          cphone: cphone ?? booking.cphone,
          cmumId: cmumId ?? booking.cmumId,
          approveStatus: nextApproveStatus,
          checkin: checkin ? new Date(checkin) : booking.checkin,
        },
      });
      await tx.room.update({
        where: { roomId: booking.roomId },
        data: { status: nextApproveStatus === 2 ? 0 : 1 },
      });
      return b;
    });

    res.json({ message: "แก้ไขข้อมูลสำเร็จ", booking: updated });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// 🗑️ DELETE
booking.delete("/:bookingId", async (req, res) => {
  try {
    const { bookingId } = req.params;
    const existing = await prisma.booking.findUnique({ where: { bookingId } });
    if (!existing) throw new Error("ไม่พบข้อมูลการจอง");

    await prisma.$transaction(async (tx) => {
      await tx.checkout.deleteMany({ where: { bookingId } });
      if (existing.slipUrl) await deleteSlip(existing.slipUrl);
      const deleted = await tx.booking.delete({ where: { bookingId } });
      await tx.room.update({
        where: { roomId: deleted.roomId },
        data: { status: 0 },
      });
    });

    res.json({ message: "ลบการจองและข้อมูล checkout สำเร็จ" });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default booking;
