import { Router } from "express";
import prisma from "../prisma.js";
import { authMiddleware, roleMiddleware } from "../middleware/authMiddleware.js";
import { thailandTime } from "../utils/timezone.js";

const ROOMS = Router();

/* แปลงข้อมูลห้อง */
const formatRoom = (room) => ({
  ...room,
  bookings: room.bookings?.map((b) => ({
    ...b,
  })),
  bills: room.bills?.map((b) => ({
    ...b,
  })),
});

/* ================= GET ALL ================= */
ROOMS.get("/getall", async (_req, res) => {
  try {
    const rooms = await prisma.room.findMany({
      orderBy: { number: "asc" },
      include: {
        bookings: {
          select: {
            bookingId: true,
            fullName: true,
            cphone: true,
            approveStatus: true,
            checkinStatus: true,
            bookingDate: true,
            checkinAt: true,
            createdAt: true,
          },
        },
        bills: {
          select: {
            billId: true,
            month: true,
            total: true,
            billStatus: true,
            dueDate: true,
            booking: {
              select: {
                fullName: true,
                cphone: true,
              },
            },
          },
        },
        adminCreated: {
          select: { adminId: true, username: true, name: true },
        },
        adminUpdated: {
          select: { adminId: true, username: true, name: true },
        },
      },
    });

    res.json(rooms.map(formatRoom));
  } catch (err) {
    console.error("room/getall:", err);
    res.status(500).json({ error: "ไม่สามารถโหลดข้อมูลห้องได้" });
  }
});

/* ================= GET BY ID ================= */
ROOMS.get("/:roomId", async (req, res) => {
  try {
    const room = await prisma.room.findUnique({
      where: { roomId: req.params.roomId },
      include: {
        bookings: true,
        bills: true,
        adminCreated: {
          select: { adminId: true, username: true, name: true },
        },
        adminUpdated: {
          select: { adminId: true, username: true, name: true },
        },
      },
    });

    if (!room) {
      return res.status(404).json({ error: "ไม่พบห้องนี้" });
    }

    res.json(formatRoom(room));
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/* ================= CREATE ================= */
ROOMS.post("/create", authMiddleware, roleMiddleware(0), async (req, res) => {
  try {
    const { number, size, rent, deposit, bookingFee } = req.body;

    if (!number || !size || rent == null || deposit == null || bookingFee == null) {
      throw new Error("กรุณากรอกข้อมูลให้ครบ");
    }

    const exists = await prisma.room.findUnique({
      where: { number },
    });

    if (exists) {
      throw new Error(`มีห้องหมายเลข ${number} อยู่แล้ว`);
    }

    const room = await prisma.room.create({
      data: {
        number,
        size,
        rent: Number(rent),
        deposit: Number(deposit),
        bookingFee: Number(bookingFee),
        status: 0,
        createdAt: thailandTime(),
        adminCreated: {
          connect: { adminId: req.admin.adminId },
        },
      },
      include: {
        adminCreated: {
          select: { adminId: true, username: true, name: true },
        },
      },
    });

    res.json({
      message: "เพิ่มห้องสำเร็จ",
      room: formatRoom(room),
    });

  } catch (err) {
    console.error("room/create:", err);
    res.status(400).json({ error: err.message });
  }
});

/* ================= UPDATE ================= */
ROOMS.put("/:roomId", authMiddleware, roleMiddleware(0), async (req, res) => {
  try {
    const { number, size, rent, deposit, bookingFee, status } = req.body;

    if (number) {
      const exists = await prisma.room.findFirst({
        where: {
          number,
          NOT: { roomId: req.params.roomId },
        },
      });

      if (exists) {
        throw new Error(`มีห้องหมายเลข ${number} อยู่แล้ว`);
      }
    }

    const room = await prisma.room.update({
      where: { roomId: req.params.roomId },
      data: {
        ...(number !== undefined && { number }),
        ...(size !== undefined && { size }),
        ...(rent !== undefined && { rent: Number(rent) }),
        ...(deposit !== undefined && { deposit: Number(deposit) }),
        ...(bookingFee !== undefined && { bookingFee: Number(bookingFee) }),
        ...(status !== undefined && { status: Number(status) }),
        updatedAt: thailandTime(),
        adminUpdated: {
          connect: { adminId: req.admin.adminId },
        },
      },
      include: {
        adminCreated: {
          select: { adminId: true, username: true, name: true },
        },
        adminUpdated: {
          select: { adminId: true, username: true, name: true },
        },
      },
    });

    res.json({
      message: "อัปเดตข้อมูลห้องสำเร็จ",
      room: formatRoom(room),
    });

  } catch (err) {
    console.error("room/update:", err);
    res.status(400).json({ error: err.message });
  }
});

/* ================= DELETE ================= */
ROOMS.delete("/:roomId", authMiddleware, roleMiddleware(0), async (req, res) => {
  try {
    const roomId = req.params.roomId;

    const hasBooking = await prisma.booking.findFirst({
      where: { roomId },
    });

    if (hasBooking) {
      throw new Error("ไม่สามารถลบห้องที่มีประวัติการจองได้");
    }

    const hasBill = await prisma.bill.findFirst({
      where: { roomId },
    });

    if (hasBill) {
      throw new Error("ไม่สามารถลบห้องที่มีประวัติบิลได้");
    }

    await prisma.room.delete({
      where: { roomId },
    });

    res.json({ message: "ลบห้องสำเร็จ" });

  } catch (err) {
    console.error("room/delete:", err);
    res.status(400).json({ error: err.message });
  }
});

export default ROOMS;