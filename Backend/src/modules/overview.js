// src/modules/overview.js
import { Router } from "express";
import prisma from "../prisma.js";

const overview = Router();

/* ดึงภาพรวมสถานะห้องและบิลตามปีหรือเดือน */
overview.get("/", async (req, res) => {
  try {
    const year = Number(req.query.year);
    const month = Number(req.query.month); // 0 = ทุกเดือน

    /* ตรวจสอบว่ามีการส่งปีเข้ามาหรือไม่ */
    if (!year || isNaN(year)) {
      return res.status(400).json({ error: "year is required" });
    }

    /* ดึงรายการห้องทั้งหมดในระบบ */
    const rooms = await prisma.room.findMany({
      orderBy: { number: "asc" },
      select: {
        roomId: true,
        number: true,
      },
    });

    /* สร้างช่วงเวลา Bangkok timezone และแปลงเป็น UTC */
    let start;
    let end;

    if (month && month > 0) {
      // ช่วงเวลาเฉพาะเดือน
      start = new Date(Date.UTC(year, month - 1, 1, -7));
      end = new Date(Date.UTC(year, month, 1, -7));
    } else {
      // ช่วงเวลาทั้งปี
      start = new Date(Date.UTC(year, 0, 1, -7));
      end = new Date(Date.UTC(year + 1, 0, 1, -7));
    }

    /* กำหนดเงื่อนไขค้นหาบิลตามช่วงเวลา */
    const whereBill = {
      month: {
        gte: start,
        lt: end,
      },
    };

    /* ดึงข้อมูลบิลภายในช่วงเวลาที่กำหนด */
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

    /* สร้าง map สำหรับเข้าถึง bill ตาม roomId อย่างรวดเร็ว */
    const billMap = new Map();
    bills.forEach((b) => billMap.set(b.roomId, b));

    /* ดึง booking ที่อนุมัติและมีการเช็คอินแล้ว */
    const bookings = await prisma.booking.findMany({
      where: {
        approveStatus: 1,
        checkinAt: { not: null },
      },
      select: {
        roomId: true,
      },
    });

    /* สร้าง set ของห้องที่มีผู้พักอยู่ */
    const bookingSet = new Set(
      bookings.map((b) => b.roomId)
    );

    /* รวมข้อมูลห้อง บิล และสถานะการเข้าพัก */
    const data = rooms.map((r) => ({
      roomId: r.roomId,
      number: r.number,
      bill: billMap.get(r.roomId) || null,
      hasBooking: bookingSet.has(r.roomId),
    }));

    /* ส่งข้อมูลภาพรวมกลับไปยัง client */
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