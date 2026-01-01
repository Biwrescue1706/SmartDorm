import { Router } from "express";
import multer from "multer";
import prisma from "../prisma";
import { createClient } from "@supabase/supabase-js";
import { verifyLineToken } from "../utils/verifyLineToken";
import { sendFlexMessage } from "../utils/lineFlex";
import { authMiddleware } from "../middleware/authMiddleware";

/* ================= Supabase ================= */
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_KEY!
);

/* ================= Utils ================= */
export const deleteSlip = async (url?: string | null) => {
  try {
    if (!url) return;
    const marker = "/object/public/";
    const idx = url.indexOf(marker);
    if (idx === -1) return;

    const fullPath = url.substring(idx + marker.length);
    const bucket = fullPath.split("/")[0];
    const filePath = fullPath.split("/").slice(1).join("/");

    await supabase.storage.from(bucket).remove([filePath]);
  } catch (err) {
    console.warn("⚠️ ลบสลิปไม่สำเร็จ", err);
  }
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

/* ================= GET ALL ================= */
bookingRouter.get("/getall", async (_req, res) => {
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

/* ================= SEARCH ================= */
bookingRouter.get("/search", async (req, res) => {
  try {
    const keyword = (req.query.keyword as string)?.trim();

    const results = await prisma.booking.findMany({
      where: keyword
        ? {
            OR: [
              { bookingId: { contains: keyword } },
              { fullName: { contains: keyword } },
              { cphone: { contains: keyword } },
              { room: { number: { contains: keyword } } },
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

/* ================= HISTORY ================= */
bookingRouter.get("/history", authMiddleware, async (_req, res) => {
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
        checkoutAt: true,
      },
    });

    const checkoutMap = new Map(checkouts.map(c => [c.bookingId, c]));

    const history = bookings.map(b => {
      const c = checkoutMap.get(b.bookingId);
      return {
        bookingId: b.bookingId,
        fullName: b.fullName,
        cphone: b.cphone,
        bookingDate: b.bookingDate,
        checkin: b.checkin,
        checkinAt: b.checkinAt,
        approvedAt: b.approvedAt,
        room: b.room,
        customer: { userName: b.customer?.userName },
        requestedCheckout: c?.checkout ?? null,
        actualCheckout: c?.checkoutAt ?? null,
      };
    });

    res.json({ bookings: history });
  } catch (err) {
    console.error("❌ booking/history error:", err);
    res.status(500).json({ message: "server error" });
  }
});

/* ================= GET BY ID ================= */
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

/* ================= CREATE ================= */
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

    const booking = await prisma.$transaction(async tx => {
      const customer =
        (await tx.customer.findFirst({ where: { userId } })) ??
        (await tx.customer.create({
          data: { userId, userName: displayName ?? "-" },
        }));

      const created = await tx.booking.create({
        data: {
          roomId,
          customerId: customer.customerId,
          ctitle,
          cname,
          csurname,
          fullName: `${ctitle ?? ""}${cname ?? ""} ${csurname ?? ""}`.trim(),
          cphone,
          cmumId,
          checkin: new Date(checkin),
          bookingDate: new Date(),
          approveStatus: 0,
          checkinStatus: 0,
        },
        include: { room: true, customer: true },
      });

      await tx.room.update({
        where: { roomId },
        data: { status: 1 },
      });

      return created;
    });

    res.json({ message: "สร้างการจองสำเร็จ", booking });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/* ================= UPLOAD SLIP ================= */
bookingRouter.post(
  "/:bookingId/uploadSlip",
  upload.single("slip"),
  async (req, res) => {
    try {
      const booking = await prisma.booking.findUnique({
        where: { bookingId: req.params.bookingId },
      });
      if (!booking || !req.file) throw new Error("ข้อมูลไม่ครบ");

      const fileName = `Booking-slips/booking_${booking.bookingId}_${Date.now()}`;
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
        where: { bookingId: booking.bookingId },
        data: { slipUrl: data.publicUrl },
      });

      res.json({ message: "อัปโหลดสลิปสำเร็จ", slipUrl: data.publicUrl });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }
);

/* ================= APPROVE ================= */
bookingRouter.put("/:bookingId/approve", async (req, res) => {
  try {
    const booking = await prisma.$transaction(async tx => {
      const b = await tx.booking.update({
        where: { bookingId: req.params.bookingId },
        data: {
          approveStatus: 1,
          approvedAt: new Date(),
        },
        include: { room: true, customer: true },
      });

      await tx.room.update({
        where: { roomId: b.roomId },
        data: { status: 1 },
      });

      return b;
    });

    res.json({ message: "อนุมัติสำเร็จ", booking });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

/* ================= REJECT ================= */
bookingRouter.put("/:bookingId/reject", async (req, res) => {
  try {
    const booking = await prisma.$transaction(async tx => {
      const b = await tx.booking.update({
        where: { bookingId: req.params.bookingId },
        data: {
          approveStatus: 2,
          approvedAt: null,
        },
        include: { room: true, customer: true },
      });

      await tx.room.update({
        where: { roomId: b.roomId },
        data: { status: 0 },
      });

      return b;
    });

    res.json({ message: "ปฏิเสธการจองสำเร็จ", booking });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

/* ================= CHECKIN ================= */
bookingRouter.put("/:bookingId/checkin", async (req, res) => {
  try {
    const booking = await prisma.booking.update({
      where: { bookingId: req.params.bookingId },
      data: {
        checkinStatus: 1,
        checkinAt: new Date(),
      },
      include: { room: true, customer: true },
    });

    res.json({ message: "เช็คอินสำเร็จ", booking });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

/* ================= DELETE ================= */
bookingRouter.delete("/:bookingId", async (req, res) => {
  try {
    const booking = await prisma.booking.findUnique({
      where: { bookingId: req.params.bookingId },
    });
    if (!booking) throw new Error("ไม่พบข้อมูลการจอง");

    await prisma.$transaction(async tx => {
      await tx.checkout.deleteMany({ where: { bookingId: booking.bookingId } });

      if (booking.slipUrl) await deleteSlip(booking.slipUrl);

      await tx.booking.delete({ where: { bookingId: booking.bookingId } });

      await tx.room.update({
        where: { roomId: booking.roomId },
        data: { status: 0 },
      });
    });

    res.json({ message: "ลบการจองสำเร็จ" });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default bookingRouter;