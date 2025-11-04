import { checkoutRepository } from "./checkoutRepository";
import { CheckoutRequest } from "./checkoutModel";
import prisma from "../../prisma";
import { verifyLineToken } from "../../utils/verifyLineToken";
import { sendFlexMessage } from "../../utils/lineFlex";

/* 🗓️ แปลงวันที่ไทย */
const formatThaiDate = (dateInput: string | Date) => {
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  return date.toLocaleDateString("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export const checkoutService = {
  /* 📋 ดึงข้อมูลทั้งหมด (Admin) */
  async getAllCheckouts() {
    return checkoutRepository.findAllCheckouts();
  },

  /* 🔍 ค้นหาการคืนห้อง (Admin) */
  async searchCheckouts(keyword: string) {
    const results = await checkoutRepository.searchCheckouts(keyword);
    if (!results.length) throw new Error("ไม่พบข้อมูลการคืนห้อง");
    return results;
  },

  /* 👤 ผู้เช่าดึง booking ของตัวเอง */
  async getMyBookings(accessToken: string) {
    const { userId } = await verifyLineToken(accessToken);
    const customer = await checkoutRepository.findCustomerByUserId(userId);
    if (!customer) throw new Error("ไม่พบข้อมูลลูกค้า");

    return checkoutRepository.findBookingsByCustomer(customer.customerId);
  },

  /* 🚪 ผู้เช่าขอคืนห้อง */
  async requestCheckout(bookingId: string, data: CheckoutRequest) {
    const { accessToken, checkout } = data;
    if (!accessToken) throw new Error("accessToken หายไป");
    if (!checkout) throw new Error("ต้องระบุวันที่ขอคืนห้อง");

    const { userId } = await verifyLineToken(accessToken);
    const customer = await checkoutRepository.findCustomerByUserId(userId);
    if (!customer) throw new Error("ไม่พบข้อมูลลูกค้า");

    const booking = await checkoutRepository.findBookingById(bookingId);
    if (!booking) throw new Error("ไม่พบข้อมูลการจอง");
    if (booking.customerId !== customer.customerId)
      throw new Error("ไม่มีสิทธิ์คืนห้องนี้");

    const updated = await prisma.booking.update({
      where: { bookingId },
      data: {
        checkout: new Date(checkout),
        checkoutStatus: 0,
        returnStatus: 0,
      },
      include: { room: true, customer: true },
    });

    // ✅ แจ้ง LINE แอดมิน
    const adminUrl = "https://smartdorm-admin.biwbong.shop";
    if (process.env.ADMIN_LINE_ID) {
      await sendFlexMessage(
        process.env.ADMIN_LINE_ID,
        "📢 มีคำขอคืนห้องใหม่",
        [
          { label: "รหัสการจอง", value: booking.bookingId },
          { label: "🏠 ห้อง", value: booking.room.number ?? "-" },
          { label: "👤 ผู้ขอคืน", value: booking.fullName ?? "-" },
          { label: "📞 เบอร์", value: booking.cphone ?? "-" },
          { label: "📅 วันที่ขอคืน", value: formatThaiDate(checkout) },
        ],
        "🔗 เปิดในระบบ Admin",
        adminUrl
      );
    }

    // ✅ แจ้ง LINE ลูกค้า
    const detailUrl = `https://smartdorm-detail.biwbong.shop/checkout/${booking.bookingId}`;
    await sendFlexMessage(
      booking.customer.userId,
      "✅ ส่งคำขอคืนห้องเรียบร้อยแล้ว",
      [
        { label: "รหัสการจอง", value: booking.bookingId },
        { label: "🏠 ห้อง", value: booking.room.number ?? "-" },
        { label: "📅 วันที่คืน", value: formatThaiDate(checkout) },
        { label: "สถานะ", value: "⏳ รออนุมัติ", color: "#f39c12" },
      ],
      "🔗 ดูรายละเอียดการคืนห้อง",
      detailUrl
    );

    return updated;
  },

  /* ✅ อนุมัติคืนห้อง (Admin) */
  async approveCheckout(bookingId: string) {
    const booking = await checkoutRepository.findBookingById(bookingId);
    if (!booking) throw new Error("ไม่พบข้อมูลการจอง");

    const updated = await prisma.$transaction(async (tx) => {
      const result = await tx.booking.update({
        where: { bookingId },
        data: {
          actualCheckout: new Date(),
          checkoutStatus: 1,
          returnStatus: 1,
        },
        include: { room: true, customer: true },
      });
      await tx.room.update({
        where: { roomId: booking.roomId },
        data: { status: 0 },
      });
      return result;
    });

    const detailUrl = `https://smartdorm-detail.biwbong.shop/checkout/${booking.bookingId}`;
    await sendFlexMessage(
      booking.customer.userId,
      "✅ การคืนห้องของคุณได้รับการอนุมัติแล้ว",
      [
        { label: "รหัสการจอง", value: booking.bookingId },
        { label: "🏠 ห้อง", value: booking.room.number ?? "-" },
        { label: "📅 วันที่อนุมัติ", value: formatThaiDate(new Date()) },
        { label: "สถานะ", value: "✅ คืนห้องสำเร็จ", color: "#27ae60" },
      ],
      "🔗 ดูรายละเอียดการคืนห้อง",
      detailUrl
    );

    return updated;
  },

  /* ❌ ปฏิเสธคืนห้อง (Admin) */
  async rejectCheckout(bookingId: string) {
    const booking = await checkoutRepository.findBookingById(bookingId);
    if (!booking) throw new Error("ไม่พบข้อมูลการจอง");

    const updated = await checkoutRepository.updateBooking(bookingId, {
      returnStatus: 2,
    });

    const detailUrl = `https://smartdorm-detail.biwbong.shop/checkout/${booking.bookingId}`;
    await sendFlexMessage(
      booking.customer.userId,
      "❌ การคืนห้องของคุณไม่ได้รับการอนุมัติ",
      [
        { label: "รหัสการจอง", value: booking.bookingId },
        { label: "🏠 ห้อง", value: booking.room.number ?? "-" },
        { label: "สถานะ", value: "❌ ปฏิเสธ", color: "#e74c3c" },
      ],
      "ติดต่อผู้ดูแลระบบ",
      detailUrl
    );

    return updated;
  },

  /* ✏️ แก้ไขข้อมูลการคืน */
  async updateCheckout(bookingId: string, body: any) {
    const { checkout, returnStatus } = body;
    const booking = await checkoutRepository.findBookingById(bookingId);
    if (!booking) throw new Error("ไม่พบข้อมูลการคืน");

    return checkoutRepository.updateBooking(bookingId, {
      ...(checkout && { checkout: new Date(checkout) }),
      ...(returnStatus !== undefined && { returnStatus }),
    });
  },

  /* 🗑️ ลบข้อมูลการคืน */
  async deleteCheckout(bookingId: string) {
    const booking = await checkoutRepository.findBookingById(bookingId);
    if (!booking) throw new Error("ไม่พบข้อมูลการคืน");

    return checkoutRepository.updateBooking(bookingId, {
      checkout: null,
      actualCheckout: null,
      returnStatus: null,
      checkoutStatus: 0,
    });
  },
};
