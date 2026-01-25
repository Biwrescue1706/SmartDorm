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

    // ดึงห้องทั้งหมด (ไม่มี limit)
    const rooms = await prisma.room.findMany({
      orderBy: { number: "asc" },
      select: {
        roomId: true,
        number: true,
      },
    });

    // สร้างช่วงเวลา
    let whereBill;

    if (month && month > 0) {
      // เฉพาะเดือนที่เลือก
      whereBill = {
        month: {
          gte: new Date(year, month - 1, 1),
          lt: new Date(year, month, 1),
        },
      };
    } else {
      // ทั้งปี
      whereBill = {
        month: {
          gte: new Date(year, 0, 1),
          lt: new Date(year + 1, 0, 1),
        },
      };
    }

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

    // map bill ตาม roomId
    const billMap = new Map();
    bills.forEach((b) => billMap.set(b.roomId, b));

    const data = rooms.map((r) => ({
      roomId: r.roomId,
      number: r.number,
      bill: billMap.get(r.roomId) || null,
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