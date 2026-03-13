import { Router } from "express";
import prisma from "../prisma.js";

const overview = Router();

/* ดึงภาพรวมสถานะห้องและบิลตามปีหรือเดือน */
overview.get("/", async (req, res) => {
  try {
    const year = Number(req.query.year);
    const month = Number(req.query.month); // 0 = ทั้งปี

    if (!year || isNaN(year)) {
      return res.status(400).json({ error: "year is required" });
    }

    /* สร้างช่วงเวลา */
    let start;
    let end;

    if (month && month > 0) {
      start = new Date(Date.UTC(year, month - 1, 1));
      end = new Date(Date.UTC(year, month, 1));
    } else {
      start = new Date(Date.UTC(year, 0, 1));
      end = new Date(Date.UTC(year + 1, 0, 1));
    }

    /* ดึงข้อมูลห้อง */
    const rooms = await prisma.room.findMany({
      orderBy: { number: "asc" },
      select: {
        roomId: true,
        number: true,
      },
    });

    /* ดึงบิลในช่วงเวลา */
    const bills = await prisma.bill.findMany({
      where: {
        month: {
          gte: start,
          lt: end,
        },
      },
      select: {
        billId: true,
        roomId: true,
        month: true,
        total: true,
        dueDate: true,
        billStatus: true,
      },
    });

    /* map bill ตาม room */
    const billMap = new Map();
    for (const b of bills) {
      billMap.set(b.roomId, b);
    }

    /* ดึง booking ที่มีผู้เข้าพัก */
    const bookings = await prisma.booking.findMany({
      where: {
        approveStatus: 1,
        checkinAt: { not: null },
      },
      select: { roomId: true },
    });

    const bookingSet = new Set(bookings.map((b) => b.roomId));

    /* รวมข้อมูล */
    const data = rooms.map((r) => ({
      roomId: r.roomId,
      number: r.number,
      bill: billMap.get(r.roomId) || null,
      hasBooking: bookingSet.has(r.roomId),
    }));

    res.json({
      year,
      month: month || 0,
      totalRooms: rooms.length,
      data,
    });

  } catch (err) {
    console.error("overview error:", err);
    res.status(500).json({ error: "server error" });
  }
});

export default overview;