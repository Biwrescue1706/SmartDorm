import { checkoutRepository } from "./checkoutRepository";
import { notifyUser } from "../../utils/lineNotify";
import { CheckoutRequest } from "./checkoutModel";
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

export const checkoutService = {
  /* 📋 ดึงข้อมูลการคืนทั้งหมด (Admin) */
  async getAllCheckouts() {
    return await checkoutRepository.findAllCheckouts();
  },

  /* 👤 ผู้เช่าดึง booking ของตัวเอง (ที่ยังไม่คืนห้อง) */
  async getMyBookings(accessToken: string) {
    const { userId } = await checkoutRepository.verifyLineToken(accessToken);
    const customer = await checkoutRepository.findCustomerByUserId(userId);
    if (!customer) throw new Error("ไม่พบข้อมูลผู้ใช้ในระบบ");

    return await checkoutRepository.findBookingsByCustomer(customer.customerId);
  },

  /* 🚪 ผู้เช่าขอคืนห้อง */
  async requestCheckout(bookingId: string, data: CheckoutRequest) {
    const { accessToken, checkout } = data;
    if (!accessToken) throw new Error("ไม่มี accessToken จาก LINE");
    if (!checkout) throw new Error("ต้องระบุวันที่ขอคืนห้อง");

    const { userId } = await checkoutRepository.verifyLineToken(accessToken);
    const customer = await checkoutRepository.findCustomerByUserId(userId);
    if (!customer) throw new Error("ไม่พบข้อมูลผู้ใช้ในระบบ");

    const booking = await checkoutRepository.findBookingById(bookingId);
    if (!booking) throw new Error("ไม่พบข้อมูลการจอง");
    if (booking.customerId !== customer.customerId)
      throw new Error("ไม่มีสิทธิ์คืนห้องนี้");

    const updated = await prisma.$transaction(async (tx) => {
      return await tx.booking.update({
        where: { bookingId },
        data: {
          checkout: new Date(checkout),
          checkoutStatus: 0,
          returnStatus: 0,
        },
        include: { customer: true, room: true },
      });
    });

    const adminMsg = `📢 มีคำขอคืนห้องใหม่
ชื่อผู้ใช้: ${booking.customer.userName}
ชื่อจริง: ${booking.customer.fullName}
ห้อง: ${booking.room.number}
วันที่ขอคืน: ${formatThaiDate(checkout)}
ตรวจสอบได้ที่: https://smartdorm-admin.biwbong.shop/checkouts`;

    const userMsg = `📢 ได้ส่งคำขอคืนห้อง ${booking.room.number}
รหัสการจอง: ${booking.bookingId}
วันที่เช็คเอาท์ที่ต้องการ: ${formatThaiDate(checkout)}
สถานะ: รอผู้ดูแลอนุมัติ`;

    await notifyUser(booking.customer.userId, userMsg);
    if (process.env.ADMIN_LINE_ID)
      await notifyUser(process.env.ADMIN_LINE_ID, adminMsg);

    return updated;
  },

  /* ✅ แอดมินอนุมัติคืนห้อง */
  async approveCheckout(bookingId: string) {
    const booking = await checkoutRepository.findBookingById(bookingId);
    if (!booking) throw new Error("ไม่พบข้อมูลการจอง");
    if (!booking.checkout) throw new Error("ยังไม่มีการขอคืนห้อง");

    const actualCheckout = new Date();

    const updated = await prisma.$transaction(async (tx) => {
      const updatedBooking = await tx.booking.update({
        where: { bookingId },
        data: {
          actualCheckout,
          checkoutStatus: 1,
          returnStatus: 1,
        },
        include: { customer: true, room: true },
      });

      await tx.room.update({
        where: { roomId: booking.roomId },
        data: { status: 0 },
      });

      return updatedBooking;
    });

    const userMsg = `✅ การคืนห้องได้รับการอนุมัติแล้ว
ห้อง: ${booking.room.number}
วันที่เช็คเอาท์จริง: ${formatThaiDate(actualCheckout)}
สถานะ: คืนห้องเรียบร้อย
ขอบคุณที่ใช้บริการ 🏫SmartDorm🎉`;

    await notifyUser(booking.customer.userId, userMsg);
    return updated;
  },

  /* ❌ แอดมินปฏิเสธการคืนห้อง */
  async rejectCheckout(bookingId: string) {
    const booking = await checkoutRepository.findBookingById(bookingId);
    if (!booking) throw new Error("ไม่พบข้อมูลการจอง");

    const updated = await checkoutRepository.updateBooking(bookingId, {
      returnStatus: 2,
    });

    const userMsg = `❌ คำขอคืนห้อง ${booking.room.number} ของคุณไม่ผ่านการอนุมัติ
กรุณาติดต่อผู้ดูแลระบบเพื่อสอบถามเพิ่มเติม`;

    await notifyUser(booking.customer.userId, userMsg);
    return updated;
  },

  /* ✏️ แก้ไขข้อมูลการคืน (Admin ใช้) */
  async updateCheckout(bookingId: string, body: any) {
    const { checkout, returnStatus } = body;
    const booking = await checkoutRepository.findBookingById(bookingId);
    if (!booking) throw new Error("ไม่พบข้อมูลการคืน");

    return await checkoutRepository.updateBooking(bookingId, {
      ...(checkout && { checkout: new Date(checkout) }),
      ...(returnStatus !== undefined && { returnStatus }),
    });
  },
  /* 🚪 แอดมินบันทึกการคืนห้องจริง (เหมือนเช็คอินจริง) */
  async confirmReturn(bookingId: string) {
    const booking = await checkoutRepository.findBookingById(bookingId);
    if (!booking) throw new Error("ไม่พบข้อมูลการจอง");
    if (booking.checkoutStatus === 1) throw new Error("ลูกค้าคืนห้องแล้ว");

    const actualCheckout = new Date();

    const updated = await prisma.$transaction(async (tx) => {
      const updatedBooking = await tx.booking.update({
        where: { bookingId },
        data: {
          actualCheckout,
          checkoutStatus: 1,
        },
        include: { customer: true, room: true },
      });

      // ✅ เปลี่ยนสถานะห้องกลับเป็น “ว่าง”
      await tx.room.update({
        where: { roomId: booking.roomId },
        data: { status: 0 },
      });

      return updatedBooking;
    });

    // ✅ แจ้งเตือนไปยังผู้เช่า
    const userMsg = `🚪 ระบบได้บันทึกการคืนห้องของคุณแล้ว
ห้อง: ${booking.room.number}
วันที่คืนจริง: ${formatThaiDate(actualCheckout)}
สถานะ: คืนห้องเรียบร้อย ✅`;

    await notifyUser(booking.customer.userId, userMsg);
    return updated;
  },

  /* 🗑️ ลบข้อมูลการคืน */
  async deleteCheckout(bookingId: string) {
    const booking = await checkoutRepository.findBookingById(bookingId);
    if (!booking) throw new Error("ไม่พบข้อมูลการคืน");

    return await checkoutRepository.updateBooking(bookingId, {
      checkout: null,
      actualCheckout: null,
      returnStatus: null,
      checkoutStatus: 0,
    });
  },
};
