import { Router } from "express";
import multer from "multer";
import prisma from "../prisma";
import { createClient } from "@supabase/supabase-js";
import { verifyLineToken } from "../utils/verifyLineToken";
import { sendFlexMessage } from "../utils/lineFlex";
import { authMiddleware } from "../middleware/authMiddleware";

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

// 📋 GET ALL
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

bookingRouter.get("/history", authMiddleware, async (_req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        room: { select: { number: true } },
        customer: {
          select: {
            userName: true,
          },
        },
      },
    });

    const checkouts = await prisma.checkout.findMany({
      select: {
        bookingId: true,
        requestedCheckout: true,
        actualCheckout: true,
      },
    });

    // map checkout by bookingId
    const checkoutMap = new Map(checkouts.map((c) => [c.bookingId, c]));

    const history = bookings.map((b: any) => {
      const c = checkoutMap.get(b.bookingId);

      return {
        bookingId: b.bookingId,
        room: b.room,
        customer: b.customer,
        createdAt: b.createdAt,
        checkin: b.checkin,
        actualCheckin: b.actualCheckin,
        requestedCheckout: c?.requestedCheckout || null,
        actualCheckout: c?.actualCheckout || null,
      };
    });

    res.json({ bookings: history });
  } catch (err) {
    console.error("❌ booking/history error:", err);
    res.status(500).json({ message: "server error" });
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

// ➕ CREATE
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
          checkin: new Date(checkin),
          approveStatus: 0,
          checkinStatus: 0,
        },
        include: { room: true, customer: true },
      });

      // PENDING => ห้องถูก lock
      await tx.room.update({
        where: { roomId },
        data: { status: 1 },
      });

      return created;
    });

    const detailUrl = `https://smartdorm-detail.biwbong.shop/booking/${booking.bookingId}`;

    // 📩 แจ้งลูกค้า
    try {
      await sendFlexMessage(
        booking.customer?.userId ?? "",
        "📢 SmartDorm ยืนยันการจองห้อง",
        [
          { label: "รหัสการจอง", value: booking.bookingId },
          { label: "ชื่อ", value: booking.fullName ?? "-" },
          { label: "ห้อง", value: booking.room.number },
          { label: "วันจอง", value: formatThai(booking.createdAt) },
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
            { label: "วันจอง", value: formatThai(booking.createdAt) },
            { label: "วันที่แจ้งเข้าพัก", value: formatThai(booking.checkin) },
            { label: "เบอร์โทร", value: booking.cphone ?? "-" },
          ],
          [
            {
              label: "เปิดดูรายการ",
              url: "https://smartdorm-admin.biwbong.shop",
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
bookingRouter.post(
  "/:bookingId/uploadSlip",
  upload.single("slip"),
  async (req, res) => {
    try {
      const { bookingId } = req.params;
      const booking = await prisma.booking.findUnique({ where: { bookingId } });
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

// ✅ APPROVE
bookingRouter.put("/:bookingId/approve", async (req, res) => {
  try {
    const updated = await prisma.$transaction(async (tx) => {
      const b = await tx.booking.update({
        where: { bookingId: req.params.bookingId },
        data: { approveStatus: 1 },
        include: { room: true, customer: true },
      });

      await tx.room.update({
        where: { roomId: b.roomId },
        data: { status: 1 },
      });

      return b;
    });

    try {
      await sendFlexMessage(
        updated.customer?.userId ?? "",
        "✔️ SmartDorm อนุมัติการจอง",
        [
          { label: "รหัส", value: updated.bookingId },
          { label: "ชื่อ", value: updated.fullName ?? "-" },
          { label: "ห้อง", value: updated.room.number },
          { label: "วันจอง", value: formatThai(updated.createdAt) },
          { label: "วันที่แจ้งเข้าพัก", value: formatThai(updated.checkin) },
          { label: "วันที่อนุมัติ", value: formatThai(new Date()) },
          { label: "สถานะ", value: "อนุมัติแล้ว", color: "#27ae60" },
          { label: "หมายเหตุ", value: "กรุณมาเช็คอินในวันที่แจ้งเข้าพัก" },
        ],
        [
          {
            label: "รายละเอียด",
            url: `https://smartdorm-detail.biwbong.shop/booking/${updated.bookingId}`,
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
bookingRouter.put("/:bookingId/reject", async (req, res) => {
  try {
    const updated = await prisma.$transaction(async (tx) => {
      const b = await tx.booking.update({
        where: { bookingId: req.params.bookingId },
        data: { approveStatus: 2 },
        include: { room: true, customer: true },
      });

      await tx.room.update({
        where: { roomId: b.roomId },
        data: { status: 0 },
      });

      return b;
    });

    try {
      await sendFlexMessage(
        updated.customer?.userId ?? "",
        "❌ SmartDorm ปฏิเสธการจอง",
        [
          { label: "รหัส", value: updated.bookingId },
          { label: "ชื่อ", value: updated.fullName ?? "-" },
          { label: "ห้อง", value: updated.room.number },
          { label: "วันที่แจ้งเข้าพัก", value: formatThai(updated.checkin) },
          { label: "วันที่ไม่อนุมัติ", value: formatThai(new Date()) },
          { label: "เหตุผล", value: "กรุณาติดต่อแอดมินเพื่อสอบถามเพิ่มเติม" },
        ],
        [
          {
            label: "รายละเอียด",
            url: `https://smartdorm-detail.biwbong.shop/booking/${updated.bookingId}`,
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
          { label: "รหัส", value: updated.bookingId },
          { label: "ชื่อ", value: updated.fullName ?? "-" },
          { label: "ห้อง", value: updated.room.number },
          {
            label: "เช็คอิน",
            value: formatThai(updated.actualCheckin),
          },
        ],
        [
          {
            label: "รายละเอียด",
            url: `https://smartdorm-detail.biwbong.shop/booking/${updated.bookingId}`,
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

// ✏️ ADMIN UPDATE (approveStatus เปลี่ยนได้ทุกทิศ)
bookingRouter.put("/:bookingId", async (req, res) => {
  try {
    const { bookingId } = req.params;
    const {
      ctitle,
      cname,
      csurname,
      cphone,
      cmumId,
      approveStatus,
      createdAt,
    } = req.body;

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
          createdAt: createdAt ? new Date(createdAt) : booking.createdAt,
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
bookingRouter.delete("/:bookingId", async (req, res) => {
  try {
    const existing = await prisma.booking.findUnique({
      where: { bookingId: req.params.bookingId },
    });
    if (!existing) throw new Error("ไม่พบข้อมูลการจอง");

    if (existing.slipUrl) await deleteSlip(existing.slipUrl);

    const deleted = await prisma.booking.delete({
      where: { bookingId: req.params.bookingId },
    });

    await prisma.room.update({
      where: { roomId: deleted.roomId },
      data: { status: 0 },
    });

    res.json({ message: "ลบการจองสำเร็จ" });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default bookingRouter;
