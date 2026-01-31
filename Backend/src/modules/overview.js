// src/modules/overview.js
import { Router } from "express";
import prisma from "../prisma.js";

const overview = Router();

/*
  GET /overview?year=2026&month=1
  - month = 0  => ทุกเดือนของปีนั้น
  - month = 1-12 => เดือนที่เลือก
*/
overview.get("/", async (req, res) => {
  try {
    const year = Number(req.query.year);
    const month = Number(req.query.month); // 0 = ทุกเดือน

    if (!year || isNaN(year)) {
      return res.status(400).json({ error: "year is required" });
    }

    // 1️⃣ ดึงห้องทั้งหมด
    const rooms = await prisma.room.findMany({
      orderBy: { number: "asc" },
      select: {
        roomId: true,
        number: true,
      },
    });

    // 2️⃣ สร้างช่วงเวลา bill
    let whereBill;
    if (month && month > 0) {
      whereBill = {
        month: {
          gte: new Date(year, month - 1, 1),
          lt: new Date(year, month, 1),
        },
      };
    } else {
      whereBill = {
        month: {
          gte: new Date(year, 0, 1),
          lt: new Date(year + 1, 0, 1),
        },
      };
    }

    // 3️⃣ ดึง bill
    const bills = await prisma.bill.findMany({
      where: whereBill,
      select: {
        billId: true,
        roomId: true,
        month: true,
        total: true,
        dueDate: true,
        billStatus: true,
      },
    });

    const billMap = new Map();
    bills.forEach((b) => billMap.set(b.roomId, b));

    // 4️⃣ ดึง booking ที่ "ยังมีคนพักอยู่"
    const bookings = await prisma.booking.findMany({
      where: {
        approveStatus: 1,
        checkinAt: {
          not: null, // 🔥 สำคัญมาก ไม่งั้น hasBooking จะ false หมด
        },
      },
      select: {
        roomId: true,
      },
    });

    const bookingSet = new Set(bookings.map((b) => b.roomId));

    // 5️⃣ รวมข้อมูล
    const data = rooms.map((r) => ({
      roomId: r.roomId,
      number: r.number,
      bill: billMap.get(r.roomId) || null,
      hasBooking: bookingSet.has(r.roomId), // ✅ key หลัก
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
