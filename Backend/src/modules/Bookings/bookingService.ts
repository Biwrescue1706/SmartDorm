import { bookingRepository } from "./bookingRepository";
import { notifyUser } from "../../utils/lineNotify";
import { BookingInput, BookingUpdateInput } from "./bookingModel";
import prisma from "../../prisma";

/* 🗓️ แปลงวันที่แบบไทย */
const formatThaiDate = (dateInput: string | Date) => {
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  return date.toLocaleDateString("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export const bookingService = {
  /* 📋 ดึงข้อมูลทั้งหมด */
  async getAllBookings() {
    return await bookingRepository.findAll();
  },

  /* 🔍 ดึงข้อมูลตาม bookingId */
  async getBookingById(bookingId: string) {
    const booking = await bookingRepository.findById(bookingId);
    if (!booking) throw new Error("ไม่พบข้อมูลการจอง");
    return booking;
  },

  /* 🧾 ลูกค้าสร้างคำขอจองห้อง */
  async createBooking(input: BookingInput) {
    const {
      userId,
      userName,
      ctitle,
      cname,
      csurname,
      cphone,
      cmumId,
      roomId,
      checkin,
      checkout,
      slip,
    } = input;

    if (!userId || !roomId || !checkin)
      throw new Error("ข้อมูลไม่ครบ กรุณากรอกให้ครบถ้วน");

    let slipUrl = "";
    if (slip) slipUrl = await bookingRepository.uploadSlip(slip);

    const booking = await prisma.$transaction(async (tx) => {
      const customer = await bookingRepository.createCustomer(
        {
          userId,
          userName,
          ctitle,
          cname,
          csurname,
          fullName: `${ctitle}${cname} ${csurname || ""}`.trim(),
          cphone,
          cmumId,
        },
        tx
      );

      const newBooking = await bookingRepository.createBooking(
        {
          roomId,
          customerId: customer.customerId,
          checkin: new Date(checkin),
          checkout: checkout ? new Date(checkout) : null,
          slipUrl,
          approveStatus: 0,
          checkinStatus: 0,
          checkoutStatus: 0,
        },
        tx
      );

      await bookingRepository.updateRoomStatus(roomId, 1, tx);
      return newBooking;
    });

    // 🔔 แจ้งเตือน LINE
    const adminMsg = `📢 มีคำขอจองห้องใหม่
ของคุณ : ${booking.customer.userName}

-----------ข้อมูลลูกค้า-----------
ห้อง : ${booking.room.number}
ชื่อ : ${booking.customer.fullName}
เบอร์โทร : ${booking.customer.cphone}
วันที่จอง : ${formatThaiDate(booking.createdAt)}
วันที่ต้องการเช็คอิน : ${formatThaiDate(booking.checkin)}
สลิป : ${booking.slipUrl || "ไม่มี"}
-------------------
ดูเพิ่มเติมที่: https://smartdorm-admin.biwbong.shop`;

    const userMsg = `📢 ได้ส่งคำขอจองห้อง ${booking.room.number}
ของคุณ ${booking.customer.userName} เรียบร้อยแล้ว

-----------ข้อมูลลูกค้า----------
รหัสการจอง : ${booking.bookingId}
ชื่อ : ${booking.customer.fullName}
วันที่เช็คอิน : ${formatThaiDate(booking.checkin)}
สถานะ : กรุณารอการอนุมัติจากผู้ดูแลระบบ

ดูข้อมูลการจองของคุณ:
https://smartdorm-detail.biwbong.shop/booking/${booking.bookingId}

ขอบคุณที่ใช้บริการ 🏫 SmartDorm 🎉`;

    await notifyUser(booking.customer.userId, userMsg);
    if (process.env.ADMIN_LINE_ID)
      await notifyUser(process.env.ADMIN_LINE_ID, adminMsg);

    return booking;
  },

  /* ✅ อนุมัติการจอง */
  async approveBooking(bookingId: string) {
    const booking = await bookingRepository.findById(bookingId);
    if (!booking) throw new Error("ไม่พบการจอง");
    if (booking.approveStatus === 1)
      throw new Error("การจองนี้ได้รับการอนุมัติแล้ว");

    const updated = await bookingRepository.updateBooking(bookingId, {
      approveStatus: 1,
    });

    const userMsg = `✅ การจองของคุณได้รับการอนุมัติแล้ว
-----------ข้อมูลลูกค้า----------
ห้อง : ${booking.room.number}
ชื่อ : ${booking.customer.fullName}
วันที่เข้าพัก : ${formatThaiDate(booking.checkin)}

ดูข้อมูลการจองของคุณ:
https://smartdorm-detail.biwbong.shop/booking/${booking.bookingId}`;

    await notifyUser(booking.customer.userId, userMsg);
    return updated;
  },

  /* ❌ ปฏิเสธการจอง */
  async rejectBooking(bookingId: string) {
    const booking = await bookingRepository.findById(bookingId);
    if (!booking) throw new Error("ไม่พบการจอง");

    const [updated] = await prisma.$transaction([
      prisma.booking.update({
        where: { bookingId },
        data: { approveStatus: 2 },
        include: { customer: true, room: true },
      }),
      prisma.room.update({
        where: { roomId: booking.roomId },
        data: { status: 0 },
      }),
    ]);

    const userMsg = `❌ การจองของคุณไม่ได้รับการอนุมัติ
ห้อง : ${booking.room.number}
ชื่อ : ${booking.customer.fullName}
รหัสการจอง : ${booking.bookingId}

กรุณาติดต่อผู้ดูแลระบบเพื่อสอบถามเพิ่มเติม
ขอบคุณที่ใช้บริการ SmartDorm`;

    await notifyUser(booking.customer.userId, userMsg);
    return updated;
  },

  /* 🏠 เช็คอิน */
  async checkinBooking(bookingId: string) {
    const booking = await bookingRepository.findById(bookingId);
    if (!booking) throw new Error("ไม่พบการจอง");
    if (booking.checkinStatus === 1) throw new Error("ลูกค้ารายนี้เช็คอินแล้ว");

    const actualCheckin = new Date();
    const updated = await bookingRepository.updateBooking(bookingId, {
      checkinStatus: 1,
      actualCheckin,
    });

    const userMsg = `🏠 เช็คอินสำเร็จ
ห้อง : ${booking.room.number}
ชื่อ : ${booking.customer.fullName}
วันที่ : ${formatThaiDate(actualCheckin)}

ดูข้อมูลของคุณ:
https://smartdorm-detail.biwbong.shop/booking/${booking.bookingId}`;

    await notifyUser(booking.customer.userId, userMsg);
    return updated;
  },

  /* 🚪 เช็คเอาท์ */
  async checkoutBooking(bookingId: string) {
    const booking = await bookingRepository.findById(bookingId);
    if (!booking) throw new Error("ไม่พบการจอง");
    if (booking.checkoutStatus === 1) throw new Error("ลูกค้าเช็คเอาท์แล้ว");

    const actualCheckout = new Date();
    const updated = await bookingRepository.updateBooking(bookingId, {
      checkoutStatus: 1,
      actualCheckout,
    });

    await bookingRepository.updateRoomStatus(booking.roomId, 0);

    const userMsg = `🚪 เช็คเอาท์สำเร็จ
ห้อง : ${booking.room.number}
ชื่อ : ${booking.customer.fullName}
วันที่ : ${formatThaiDate(actualCheckout)}

ขอบคุณที่ใช้บริการ 🏫 SmartDorm 🎉`;

    await notifyUser(booking.customer.userId, userMsg);
    return updated;
  },

  /* ✏️ แก้ไขข้อมูลการจอง */
  async updateBooking(bookingId: string, data: BookingUpdateInput) {
    const booking = await bookingRepository.findById(bookingId);
    if (!booking) throw new Error("ไม่พบข้อมูลการจอง");
    return await bookingRepository.updateBooking(bookingId, data);
  },

  /* 🗑️ ลบการจอง */
  async deleteBooking(bookingId: string) {
    const booking = await bookingRepository.findById(bookingId);
    if (!booking) throw new Error("ไม่พบข้อมูลการจอง");

    if (booking.slipUrl) await bookingRepository.deleteSlip(booking.slipUrl);
    await bookingRepository.updateRoomStatus(booking.roomId, 0);
    await bookingRepository.deleteBooking(bookingId);
  },
};
