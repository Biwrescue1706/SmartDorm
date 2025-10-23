import { bookingRepository } from "./bookingRepository";
import { notifyUser } from "../../utils/lineNotify";
import { BookingInput, BookingUpdateInput } from "./bookingModel";
import prisma from "../../prisma";

/* 🗓️ ฟังก์ชันแปลงวันที่แบบไทย */
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

    if (!userId || !roomId || !checkin) throw new Error("ข้อมูลไม่ครบ");

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
          fullName: `${ctitle}${cname} ${csurname}`,
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

      // เปลี่ยนสถานะห้องเป็น "ไม่ว่าง"
      await bookingRepository.updateRoomStatus(roomId, 1, tx);
      return newBooking;
    });

    // 🔔 แจ้งเตือน LINE
    const adminMsg = `📢 มีคำขอจองห้องใหม่
ของคุณ : ${booking.customer.userName} \n
-----------ข้อมูลลูกค้า-----------\n
ห้อง : ${booking.room.number}
ชื่อ : ${booking.customer.fullName}
เบอร์โทร : ${booking.customer.cphone}
วันที่จอง : ${formatThaiDate(booking.createdAt)}
วันที่ต้องการเช็คอิน : ${formatThaiDate(booking.checkin)}
สลิป : ${booking.slipUrl || "ไม่มี"}\n
-------------------\n
สามารถตรวจสอบได้ที่ : https://smartdorm-admin.biwbong.shop`;

    const userMsg = `📢 ได้ส่งคำขอจองห้อง ${booking.room.number}
ของคุณ ${booking.customer.userName} เรียบร้อยแล้ว\n
-----------ข้อมูลลูกค้า----------\n
รหัสการจอง : ${booking.bookingId}
ชื่อ : ${booking.customer.fullName}
วันที่เช็คอิน : ${formatThaiDate(booking.checkin)}
สถานะ : กรุณารอการอนุมัติจากผู้ดูแลระบบ\n
ดูข้อมูลการจองของคุณ : \nhttps://smartdorm-detail.biwbong.shop/booking/${booking.bookingId} \n
--------------------\n
ขอบคุณที่ใช้บริการ 🏫SmartDorm🎉 ครับ`;

    await notifyUser(booking.customer.userId, userMsg);
    if (process.env.ADMIN_LINE_ID)
      await notifyUser(process.env.ADMIN_LINE_ID, adminMsg);

    return booking;
  },

  /*  อนุมัติการจอง */
  async approveBooking(bookingId: string) {
    const booking = await bookingRepository.findById(bookingId);
    if (!booking) throw new Error("ไม่พบการจอง");
    if (booking.approveStatus === 1) throw new Error("การจองนี้อนุมัติแล้ว");

    const updated = await bookingRepository.updateBooking(bookingId, {
      approveStatus: 1,
    });

    const userMsg = `📢 ผลการจองห้อง
ของคุณ : ${booking.customer.userName}
-----------ข้อมูลลูกค้า----------\n
ห้อง : ${booking.room.number}
ชื่อ : ${booking.customer.fullName}
รหัสการจอง : ${booking.bookingId}
สถานะ : การจองของคุณได้รับการอนุมัติแล้ว
กรุณาเตรียมตัวเข้าพักตามวันที่ระบุ : ${formatThaiDate(booking.checkin)}\n
เปิดลิงค์ให้เจ้าหน้าที่ดูแลหอพัก เช็คด้วย ด้วยนะครับ : 
https://smartdorm-detail.biwbong.shop/booking/${booking.bookingId}\n
--------------------\n
ขอบคุณที่ใช้บริการ 🏫SmartDorm🎉 ครับ`;

    await notifyUser(booking.customer.userId, userMsg);
    return updated;
  },

  /*  ปฏิเสธการจอง */
  async rejectBooking(bookingId: string) {
    const booking = await bookingRepository.findById(bookingId);
    if (!booking) throw new Error("ไม่พบการจอง");

    const [updated] = await prisma.$transaction([
      prisma.booking.update({
        where: { bookingId },
        data: { approveStatus: 2 }, // 2 = ถูกปฏิเสธ
        include: { customer: true, room: true },
      }),
      prisma.room.update({
        where: { roomId: booking.roomId },
        data: { status: 0 },
      }),
    ]);

    const userMsg = `📢 ผลการจองห้อง
ของคุณ : ${booking.customer.userName} \n
-----------ข้อมูลลูกค้า----------\n
ห้อง : ${booking.room.number}
ชื่อ : ${booking.customer.fullName}
รหัสการจอง : ${booking.bookingId}
สถานะ : การจองของคุณไม่ได้รับการอนุมัติ\n
--------------------\n
กรุณาติดต่อ ผู้ดูแล ผ่านช่องทางนี้ นะครับ
ขอบคุณที่ใช้บริการ 🏫SmartDorm🎉 ครับ`;
    await notifyUser(booking.customer.userId, userMsg);

    return updated;
  },

  /* 🏠 เช็คอิน */
  async checkinBooking(bookingId: string) {
    const booking = await bookingRepository.findById(bookingId);
    if (!booking) throw new Error("ไม่พบการจอง");
    if (booking.checkinStatus === 1) throw new Error("ลูกค้าเช็คอินแล้ว");

    const actualCheckin = new Date();
    const updated = await bookingRepository.updateBooking(bookingId, {
      checkinStatus: 1,
      actualCheckin,
    });

    const userMsg = `🏠 เช็คอินสำเร็จ
-----------ข้อมูลลูกค้า----------
รหัสการจอง: ${booking.bookingId}
ห้อง : ${booking.room.number}
ชื่อ : ${booking.customer.fullName}
วันที่ : ${formatThaiDate(actualCheckin)}
สถานะ : เช็คอินเรียบร้อยแล้ว
ดูข้อมูลการจองของคุณ : \nhttps://smartdorm-detail.biwbong.shop/booking/${booking.bookingId} \n
--------------------
ขอบคุณที่ใช้บริการ 🏫SmartDorm🎉 ครับ`;

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

    const userMsg = `🏠 เช็คเอาท์สำเร็จ : \n
-----------ข้อมูลลูกค้า----------\n
รหัสการจอง: ${booking.bookingId}
ห้อง ${booking.room.number} \n
ชื่อ: ${booking.customer.fullName}\n
วันที่: ${formatThaiDate(actualCheckout)}\n
สถานะ: เช็คเอาท์สำเร็จครับ\n
--------------------\n
กรุณาติดต่อผู้ดูแลระบบเพื่อดำเนินการต่อ\n
ขอบคุณที่ใช้บริการ 🏫SmartDorm🎉 ครับ`;

    await notifyUser(booking.customer.userId, userMsg);

    return updated;
  },

  /* ✏️ แก้ไขข้อมูลการจอง (Admin ใช้) */
  async updateBooking(bookingId: string, data: BookingUpdateInput) {
    const booking = await bookingRepository.findById(bookingId);
    if (!booking) throw new Error("ไม่พบการจอง");

    const updated = await bookingRepository.updateBooking(bookingId, data);
    return updated;
  },

  /* 🗑️ ลบการจอง */
  async deleteBooking(bookingId: string) {
    const booking = await bookingRepository.findById(bookingId);
    if (!booking) throw new Error("ไม่พบการจอง");

    if (booking.slipUrl) await bookingRepository.deleteSlip(booking.slipUrl);
    await bookingRepository.updateRoomStatus(booking.roomId, 0);
    await bookingRepository.deleteBooking(bookingId);
  },
};
