// src/modules/room.js
import { Router } from "express";
import prisma from "../prisma.js";
import { authMiddleware, roleMiddleware } from "../middleware/authMiddleware.js";
import { thailandTime, toThaiString } from "../utils/timezone.js";

const ROOMS = Router();

/* แปลงข้อมูลห้องและความสัมพันธ์ทั้งหมดเป็นเวลาไทย */
const formatRoom = (room) => ({
  ...room,

  createdAt: toThaiString(room.createdAt),
  updatedAt: toThaiString(room.updatedAt),

  bookings: room.bookings?.map(b => ({
    ...b,
    bookingDate: toThaiString(b.bookingDate),
    createdAt: toThaiString(b.createdAt),
  })),

  bills: room.bills?.map(bill => ({
    ...bill,
    month: toThaiString(bill.month),
    dueDate: toThaiString(bill.dueDate),
  })),
});

/* ดึงข้อมูลห้องทั้งหมดพร้อมการจองและบิล */
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
    console.error("❌ [room/getall]", err.message);
    res.status(500).json({ error: "ไม่สามารถโหลดข้อมูลห้องได้" });
  }
});

/* ดึงข้อมูลห้องรายตัวตาม roomId */
ROOMS.get("/:roomId", async (req, res) => {
  try {
    const room = await prisma.room.findUnique({
      where: { roomId: req.params.roomId },
      include: {
        bookings: {
          select: {
            bookingId: true,
            fullName: true,
            cphone: true,
            approveStatus: true,
            checkinStatus: true,
            bookingDate: true,
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

    if (!room) throw new Error("ไม่พบห้องนี้ในระบบ");

    res.json(formatRoom(room));

  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});

/* สร้างห้องใหม่โดยผู้ดูแลระบบ */
ROOMS.post("/create", authMiddleware, roleMiddleware(0), async (req, res) => {
  try {
    const { number, size, rent, deposit, bookingFee } = req.body;

    if (!number || !size || rent == null || deposit == null || bookingFee == null) {
      throw new Error("กรุณากรอกข้อมูลให้ครบทุกช่อง");
    }

    const exists = await prisma.room.findUnique({ where: { number } });
    if (exists) throw new Error(`มีห้องหมายเลข ${number} อยู่แล้ว`);

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

    res.json({ message: "เพิ่มห้องสำเร็จ", room: formatRoom(room) });

  } catch (err) {
    console.error("❌ [room/create]", err.message);
    res.status(400).json({ error: err.message });
  }
});

/* อัปเดตข้อมูลห้องโดยผู้ดูแลระบบ */
ROOMS.put("/:roomId", authMiddleware, roleMiddleware(0), async (req, res) => {
  try {
    const { number, size, rent, deposit, bookingFee, status } = req.body;

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

    res.json({ message: "อัปเดตข้อมูลห้องสำเร็จ", room: formatRoom(room) });

  } catch (err) {
    console.error("❌ [room/update]", err.message);
    res.status(400).json({ error: err.message });
  }
});

/* ลบห้องออกจากระบบ */
ROOMS.delete("/:roomId", authMiddleware, roleMiddleware(0), async (req, res) => {
  try {
    await prisma.room.delete({
      where: { roomId: req.params.roomId },
    });

    res.json({ message: "ลบห้องสำเร็จ" });

  } catch (err) {
    console.error("❌ [room/delete]", err.message);
    res.status(400).json({ error: err.message });
  }
});

export default ROOMS;