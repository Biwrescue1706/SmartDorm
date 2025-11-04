// src/modules/Rooms/roomRepository.ts
import prisma from "../../prisma";

export const roomRepository = {
  async findAll() {
    try {
      return await prisma.room.findMany({
        orderBy: { number: "asc" },
        include: {
          // ✅ ดึงข้อมูลการจอง พร้อมชื่อ-เบอร์ลูกค้า (snapshot)
          bookings: {
            select: {
              bookingId: true,
              fullName: true,
              cphone: true,
              approveStatus: true,
              checkinStatus: true,
              checkoutStatus: true,
              createdAt: true,
            },
          },
          // ✅ ดึงข้อมูลบิล พร้อมชื่อ-เบอร์ของ booking และสถานะ
          bills: {
            select: {
              billId: true,
              month: true,
              total: true,
              status: true,
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
    } catch (err: any) {
      console.error("❌ roomRepository.findAll error:", err);
      throw new Error("โหลดข้อมูลห้องล้มเหลว: " + err.message);
    }
  },

  async findById(roomId: string) {
    try {
      return await prisma.room.findUnique({
        where: { roomId },
        include: {
          bookings: {
            select: {
              bookingId: true,
              fullName: true,
              cphone: true,
              approveStatus: true,
              checkinStatus: true,
              checkoutStatus: true,
              createdAt: true,
            },
          },
          bills: {
            select: {
              billId: true,
              month: true,
              total: true,
              status: true,
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
    } catch (err: any) {
      console.error("❌ roomRepository.findById error:", err);
      throw new Error("ไม่สามารถดึงข้อมูลห้องได้: " + err.message);
    }
  },
  async create(data: any) {
    return prisma.room.create({
      data,
      include: {
        adminCreated: { select: { adminId: true, username: true, name: true } },
      },
    });
  },

  async update(roomId: string, data: any) {
    return prisma.room.update({
      where: { roomId },
      data,
      include: {
        adminCreated: { select: { adminId: true, username: true, name: true } },
        adminUpdated: { select: { adminId: true, username: true, name: true } },
      },
    });
  },

  async delete(roomId: string) {
    return prisma.room.delete({ where: { roomId } });
  },
};
