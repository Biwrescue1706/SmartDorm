// src/modules/booking.js
import { Router } from "express";
import multer from "multer";
import prisma from "../prisma.js";
import { createClient } from "@supabase/supabase-js";
import { verifyLineToken } from "../utils/verifyLineToken.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { thailandTime } from "../utils/timezone.js";
import {
  notifyBookingCreated,
  notifyAdminBookingCreated,
  notifyBookingApproved,
  notifyBookingRejected,
  notifyBookingCheckin,
  notifyBookingUpdatedByAdmin,
} from "../services/bookingLineNotify.js";

const upload = multer({ storage: multer.memoryStorage() });
const booking = Router();

//Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// ---------------- Utils ----------------
export const deleteSlip = async (url) => {
  try {
    if (!url) return;
    const bucket = process.env.SUPABASE_BUCKET;
    const path = url.split(`/${bucket}/`)[1];
    if (!path) return;
    await supabase.storage.from(bucket).remove([path]);
  } catch (err) {
    console.warn("ลบสลิปไม่สำเร็จ:", err);
  }
};

const formatThai = (d) =>
  d
    ? new Date(d).toLocaleDateString("th-TH", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
    : "-";

// ================= GET ALL =================
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

// ================= SEARCH =================
booking.get("/search", async (req, res) => {
  try {
    const keyword = req.query.keyword?.trim();
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
  } catch (err) {
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
      select: {
        bookingId: true,
        checkout: true,
        ReturnApprovalStatus: true,
        RefundApprovalDate: true,
        checkoutStatus: true,
        checkoutAt: true,
      },
    });

    const checkoutMap = new Map(checkouts.map((c) => [c.bookingId, c]));

    const history = bookings.map((b) => {
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

        checkout: c?.checkout,
        ReturnApprovalStatus: c?.ReturnApprovalStatus ?? 0,
        RefundApprovalDate: c?.RefundApprovalDate,
        checkoutStatus: c?.checkoutStatus ?? 0,
        checkoutAt: c?.checkoutAt,
      };
    });

    res.json({ bookings: history });
  } catch (err) {
    console.error("❌ booking/history error:", err);
    res.status(500).json({ message: "server error" });
  }
});

// ================= GET BY ID =================
booking.get("/:bookingId", async (req, res) => {
  try {
    const data = await prisma.booking.findUnique({
      where: { bookingId: req.params.bookingId },
      include: { room: true, customer: true },
    });
    if (!data) throw new Error("ไม่พบข้อมูลการจอง");
    res.json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ================= CREATE =================
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

    const created = await prisma.$transaction(async (tx) => {
      const customer =
        (await tx.customer.findFirst({ where: { userId } })) ??
        (await tx.customer.create({
          data: { userId, userName: displayName ?? "-" },
        }));

      const booking = await tx.booking.create({
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
          bookingDate: thailandTime(),
          checkin: checkin ? new Date(checkin) : thailandTime(),
          approveStatus: 0,
          checkinStatus: 0,
        },
        include: { room: true, customer: true },
      });

      await tx.room.update({
        where: { roomId },
        data: { status: 1, updatedAt: thailandTime() },
      });

      return booking;
    });

    try {
      await notifyBookingCreated(created);
      await notifyAdminBookingCreated(created);
    } catch (err) {
      console.error("❌ LINE Notify Error (create):", err);
    }
    res.json({ message: "สร้างการจองสำเร็จ", booking: created });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 📤 UPLOAD SLIP
booking.post("/:bookingId/uploadSlip", upload.single("slip"), async (req, res) => {
  try {
    const { bookingId } = req.params;
    const data = await prisma.booking.findUnique({ where: { bookingId } });
    if (!data || !req.file) throw new Error("ข้อมูลไม่ครบ");

    const created = data.bookingDate.toISOString().replace(/[:.]/g, "-");
    const fileName = `Booking-slips/Booking-slip_${bookingId}_${created}`;

    await supabase.storage
      .from(process.env.SUPABASE_BUCKET)
      .upload(fileName, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: true,
      });

    const { data: pub } = supabase.storage
      .from(process.env.SUPABASE_BUCKET)
      .getPublicUrl(fileName);

    await prisma.booking.update({
      where: { bookingId },
      data: {
        slipUrl: pub.publicUrl,
        updatedAt: thailandTime(),
      },
    });

    res.json({ message: "อัปโหลดสลิปสำเร็จ", slipUrl: pub.publicUrl });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


// ✅ APPROVE
booking.put("/:bookingId/approve", async (req, res) => {
  try {
    const updated = await prisma.$transaction(async (tx) => {
      const b = await tx.booking.update({
        where: { bookingId: req.params.bookingId },
        data: {
          approveStatus: 1,
          approvedAt: thailandTime(),
          updatedAt: thailandTime(),
        },
        include: { room: true, customer: true },
      });
      await tx.room.update({
        where: { roomId: b.roomId },
        data: {
          status: 1,
          updatedAt: thailandTime(),
        },
      });
      return b;
    });

    try {
      await notifyBookingApproved(updated);
    } catch (err) {
      console.error("❌ LINE Error (approve):", err);
    }
    res.json({ message: "อนุมัติสำเร็จ", booking: updated });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ❌ REJECT
booking.put("/:bookingId/reject", async (req, res) => {
  try {
    const updated = await prisma.$transaction(async (tx) => {
      const b = await tx.booking.update({
        where: { bookingId: req.params.bookingId },
        data: {
          approveStatus: 2,
          approvedAt: thailandTime(),
          updatedAt: thailandTime(),
        },
        include: { room: true, customer: true },
      });
      await tx.room.update({
        where: { roomId: b.roomId },
        data: {
          status: 0,
          updatedAt: thailandTime()
        },
      });
      return b;
    });

    try {
      await notifyBookingRejected(updated);
    } catch (err) {
      console.error("❌ LINE Error (reject):", err);
    }

    res.json({ message: "ปฏิเสธสำเร็จ" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 🏠 CHECKIN
booking.put("/:bookingId/checkin", async (req, res) => {
  try {
    const updated = await prisma.booking.update({
      where: { bookingId: req.params.bookingId },
      data: {
        checkinStatus: 1,
        checkinAt: thailandTime(),
        updatedAt: thailandTime()
      },
      include: { room: true, customer: true },
    });

    try {
      await notifyBookingCheckin(updated);
    } catch (err) {
      console.error("❌ LINE Error (checkin):", err);
    }

    res.json({ message: "เช็คอินสำเร็จ", booking: updated });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ✏️ ADMIN UPDATE
booking.put("/:bookingId", async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { ctitle, cname, csurname, cphone, cmumId, approveStatus, checkin } =
      req.body;

    const data = await prisma.booking.findUnique({
      where: { bookingId },
      include: { room: true },
    });
    if (!data) throw new Error("ไม่พบข้อมูลการจอง");

    let fullName = data.fullName;
    if (ctitle || cname || csurname) {
      fullName = `${ctitle ?? data.ctitle ?? ""}${cname ?? data.cname ?? ""} ${csurname ?? data.csurname ?? ""
        }`.trim();
    }

    const nextApproveStatus =
      approveStatus !== undefined
        ? Number(approveStatus)
        : data.approveStatus;

    const updated = await prisma.$transaction(async (tx) => {
      const b = await tx.booking.update({
        where: { bookingId },
        data: {
          ctitle: ctitle ?? data.ctitle,
          cname: cname ?? data.cname,
          csurname: csurname ?? data.csurname,
          fullName,
          cphone: cphone ?? data.cphone,
          cmumId: cmumId ?? data.cmumId,
          approveStatus: nextApproveStatus,
          checkinStatus: 0,
          checkinAt: null,
          updatedAt: thailandTime(),

          checkin: checkin ? thailandTime(checkin) : data.checkin,
        },
      });

      // คุมสถานะห้องจากค่าปลายทาง
      const roomStatus = nextApproveStatus === 2 ? 0 : 1;

      await tx.room.update({
        where: { roomId: data.roomId },
        data: {
          status: roomStatus,
          updatedAt: thailandTime()
        },
      });

      return b;
    });

    res.json({ message: "แก้ไขข้อมูลสำเร็จ", booking: updated });
  } catch (err) {
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
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default booking;
