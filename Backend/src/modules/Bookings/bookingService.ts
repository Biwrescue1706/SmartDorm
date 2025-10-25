// src/modules/Bookings/bookingService.ts
import { bookingRepository } from "./bookingRepository";
import { notifyUser } from "../../utils/lineNotify";
import { BookingInput, BookingUpdateInput } from "./bookingModel";
import prisma from "../../prisma";
import { verifyLineToken } from "../../utils/verifyLineToken";

/* 🗓️ ฟังก์ชันแปลงวันที่ไทย */
const formatThaiDate = (d: string | Date) => {
  const date = typeof d === "string" ? new Date(d) : d;
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
      accessToken,
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

    const { userId, displayName } = await verifyLineToken(accessToken);

    if (!userId || !roomId || !checkin) throw new Error("ข้อมูลไม่ครบ");

    let slipUrl = "";
    if (slip) slipUrl = await bookingRepository.uploadSlip(slip);

    const booking = await prisma.$transaction(async (tx) => {
      const customer = await bookingRepository.createCustomer(
        {
          userId,
          userName: displayName,
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
ของคุณ : ${booking.customer.userName}\n
-----------ข้อมูลลูกค้า-----------\n
ห้อง : ${booking.room.number}
ชื่อ : ${booking.customer.fullName}
เบอร์โทร : ${booking.customer.cphone}
วันที่จอง : ${formatThaiDate(booking.createdAt)}
วันที่ต้องการเช็คอิน : ${formatThaiDate(booking.checkin)}\n
สลิป : ${booking.slipUrl || "ไม่มี"}\n
-------------------\n
ดูเพิ่มเติมที่: https://smartdorm-admin.biwbong.shop`;

    const userMsg = `📢 ได้ส่งคำขอจองห้อง ${booking.room.number}
ของคุณ ${booking.customer.userName} เรียบร้อยแล้ว\n
-----------ข้อมูลลูกค้า----------\n
รหัสการจอง : ${booking.bookingId}
ชื่อ : ${booking.customer.fullName}
วันที่เช็คอิน : ${formatThaiDate(booking.checkin)}
สถานะ : กรุณารอการอนุมัติจากผู้ดูแลระบบ\n
-------------------\n
ดูข้อมูลการจองของคุณ:
https://smartdorm-detail.biwbong.shop/booking/${booking.bookingId}\n
-------------------\n
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
    if (booking.approveStatus === 1) throw new Error("อนุมัติแล้ว");

    const updated = await bookingRepository.updateBooking(bookingId, {
      approveStatus: 1,
    });

    const userMsg = `📢 การจองห้องของคุณ ${booking.customer.userName}
รหัสการจอง : ${booking.bookingId}
ห้อง : ${booking.room.number}
ชื่อ : ${booking.customer.fullName}
วันที่เข้าพัก : ${formatThaiDate(booking.checkin)}
สถานะ : การจองห้องอนุมัติแล้ว
-------------------
เปิดหลักฐานการจองได้ที่:
https://smartdorm-detail.biwbong.shop/booking/${booking.bookingId}`;

    await notifyUser(booking.customer.userId, userMsg);
    return updated;
  },

  /* 🚫 ปฏิเสธการจอง */
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
รหัสการจอง : ${booking.bookingId}
ห้อง : ${booking.room.number}
ชื่อ : ${booking.customer.fullName}
สถานะ : ไม่อนุมัติ
-------------------
กรุณาติดต่อผู้ดูแลระบบ`;

    await notifyUser(booking.customer.userId, userMsg);
    return updated;
  },

  /* 🏠 เช็คอิน */
  async checkinBooking(bookingId: string) {
    const booking = await bookingRepository.findById(bookingId);
    if (!booking) throw new Error("ไม่พบการจอง");
    if (booking.checkinStatus === 1) throw new Error("เช็คอินแล้ว");

    const actualCheckin = new Date();
    const updated = await bookingRepository.updateBooking(bookingId, {
      checkinStatus: 1,
      actualCheckin,
    });

    const userMsg = `🏠 เช็คอินสำเร็จ
ห้อง : ${booking.room.number}
ชื่อ : ${booking.customer.fullName}
วันที่เช็คอิน : ${formatThaiDate(actualCheckin)}
ดูข้อมูลของคุณ:
https://smartdorm-detail.biwbong.shop/booking/${booking.bookingId}`;

    await notifyUser(booking.customer.userId, userMsg);
    return updated;
  },

  /* 🚪 เช็คเอาท์ */
  async checkoutBooking(bookingId: string) {
    const booking = await bookingRepository.findById(bookingId);
    if (!booking) throw new Error("ไม่พบการจอง");
    if (booking.checkoutStatus === 1) throw new Error("เช็คเอาท์แล้ว");

    const actualCheckout = new Date();
    const updated = await bookingRepository.updateBooking(bookingId, {
      checkoutStatus: 1,
      actualCheckout,
    });

    await bookingRepository.updateRoomStatus(booking.roomId, 0);

    const userMsg = `🚪 เช็คเอาท์สำเร็จ
ห้อง : ${booking.room.number}
ชื่อ : ${booking.customer.fullName}
วันที่เช็คเอาท์ : ${formatThaiDate(actualCheckout)}
ดูข้อมูลของคุณ:
https://smartdorm-detail.biwbong.shop/checkout/${booking.bookingId}`;

    await notifyUser(booking.customer.userId, userMsg);
    return updated;
  },

  /* ✏️ แก้ไขข้อมูลการจอง (update booking + customer) */
  async updateBooking(bookingId: string, data: BookingUpdateInput) {
    const booking = await bookingRepository.findById(bookingId);
    if (!booking) throw new Error("ไม่พบข้อมูลการจอง");

    const customerFields = ["ctitle", "cname", "csurname", "cphone", "cmumId"];
    const bookingFields = [
      "approveStatus",
      "checkinStatus",
      "checkoutStatus",
      "checkin",
      "checkout",
      "actualCheckin",
      "actualCheckout",
    ];

    const customerData: any = {};
    const bookingData: any = {};

    for (const key of customerFields)
      if (data[key] !== undefined && data[key] !== "")
        customerData[key] = data[key];

    for (const key of bookingFields)
      if (data[key] !== undefined && data[key] !== "")
        bookingData[key] = data[key];

    if (
      Object.keys(customerData).length === 0 &&
      Object.keys(bookingData).length === 0
    )
      throw new Error("ไม่มีข้อมูลสำหรับอัปเดต");

    console.log("✅ [DEBUG] updateBooking payload:", {
      bookingId,
      customerData,
      bookingData,
    });

    const updated = await prisma.$transaction(async (tx) => {
      if (Object.keys(customerData).length > 0) {
        await tx.customer.update({
          where: { customerId: booking.customerId },
          data: {
            ...customerData,
            fullName: `${customerData.ctitle || booking.customer.ctitle}${
              customerData.cname || booking.customer.cname
            } ${customerData.csurname || booking.customer.csurname}`,
          },
        });
      }

      if (Object.keys(bookingData).length > 0) {
        await tx.booking.update({
          where: { bookingId },
          data: bookingData,
        });
      }

      return tx.booking.findUnique({
        where: { bookingId },
        include: { customer: true, room: true },
      });
    });

    return updated;
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
