// src/modules/Rooms/roomService.ts
import { roomRepository } from "./roomRepository";
import { RoomInput, UpdateRoomInput } from "./roomModel";
import prisma from "../../prisma";

export const roomService = {
  async getAllRooms() {
    return await roomRepository.findAll();
  },

  async getRoomById(roomId: string) {
    const room = await roomRepository.findById(roomId);
    if (!room) throw new Error("ไม่พบห้อง");
    return room;
  },

  async createRoom(adminId: string, data: RoomInput) {
    const { number, size, rent, deposit, bookingFee } = data;

    if (
      !number?.trim() ||
      !size?.trim() ||
      rent == null ||
      deposit == null ||
      bookingFee == null
    )
      throw new Error("กรุณากรอกข้อมูลให้ครบ");

    // 🔍 ตรวจว่ามีห้องนี้อยู่แล้วหรือไม่
    const existing = await prisma.room.findUnique({ where: { number } });
    if (existing) throw new Error(`มีห้องหมายเลข ${number} อยู่ในระบบแล้ว`);

    const room = await roomRepository.create({
      number,
      size,
      rent: Number(rent),
      deposit: Number(deposit),
      bookingFee: Number(bookingFee),
      status: 0,
      createdBy: adminId,
    });

    return room;
  },

  async updateRoom(adminId: string, data: UpdateRoomInput) {
    const { roomId, number, size, rent, deposit, bookingFee, status } = data;

    const updated = await roomRepository.update(roomId, {
      number,
      size,
      rent: rent !== undefined ? Number(rent) : undefined,
      deposit: deposit !== undefined ? Number(deposit) : undefined,
      bookingFee: bookingFee !== undefined ? Number(bookingFee) : undefined,
      status,
      updatedBy: adminId,
    });

    return updated;
  },

  async deleteRoom(roomId: string) {
    return await roomRepository.delete(roomId);
  },
};
