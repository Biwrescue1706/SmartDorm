import { checkoutRepository } from "./checkoutRepository";
import { CheckoutRequest } from "./checkoutModel";
import prisma from "../../prisma";
import { verifyLineToken } from "../../utils/verifyLineToken";
import { sendFlexMessage } from "../../utils/lineFlex";

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
    const { userId } = await verifyLineToken(accessToken);
    const customer = await checkoutRepository.findCustomerByUserId(userId);
    if (!customer) throw new Error("ไม่พบข้อมูลผู้ใช้ในระบบ");

    return await checkoutRepository.findBookingsByCustomer(customer.customerId);
  },

  /* 🚪 ผู้เช่าขอคืนห้อง */
  async requestCheckout(bookingId: string, data: CheckoutRequest) {
    const { accessToken, checkout } = data;
    if (!accessToken) throw new Error("ไม่มี accessToken จาก LINE");
    if (!checkout) throw new Error("ต้องระบุวันที่ขอคืนห้อง");

    const { userId, displayName } = await verifyLineToken(accessToken);
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

    const admindetail = `https://smartdorm-admin.biwbong.shop`;

    // ✅ แจ้งแอดมิน
    if (process.env.ADMIN_LINE_ID) {
      await sendFlexMessage(
        process.env.ADMIN_LINE_ID,
        "📢 มีคำขอคืนห้องใหม่",
        [
          { label: "รหัสการจอง", value: booking.bookingId },
          { label: "🏠 ห้อง", value: booking.room.number },
          { label: "👤 ผู้ขอคืน", value: booking.customer.fullName },
          { label: "📞 เบอร์", value: booking.customer.cphone },
          { label: "📅 วันที่ขอคืน", value: formatThaiDate(checkout) },
        ],
        "🔗 เปิดในระบบ Admin",
        admindetail
      );
    }

    const detailUrl = `https://smartdorm-detail.biwbong.shop/checkout/${booking.bookingId}`;

    // ✅ ส่ง Flex Message ให้ลูกค้า
    await sendFlexMessage(
      booking.customer.userId,
      "คำขอคืนห้องของคุณถูกส่งเรียบร้อยแล้ว",
      [
        { label: "รหัสการจอง", value: booking.bookingId },
        { label: "🏠 ห้อง", value: booking.room.number },
        { label: "👤 ชื่อ", value: booking.customer.fullName },
        { label: "📞 เบอร์", value: booking.customer.cphone },
        { label: "📅 วันที่ต้องการคืน", value: formatThaiDate(checkout) },
        {
          label: "สถานะ",
          value: "⏳ รอผู้ดูแลอนุมัติ",
          color: "#f39c12",
        },
      ],
      "🔗 ดูรายละเอียดการคืนห้อง",
      detailUrl
    );

    return updated;
  },

  /*  แอดมินอนุมัติคืนห้อง */
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

    const detailUrl = `https://smartdorm-detail.biwbong.shop/checkout/${booking.bookingId}`;

    await sendFlexMessage(
      booking.customer.userId,
      "การคืนห้องของคุณได้รับการอนุมัติแล้ว",
      [
        { label: "รหัสการจอง", value: booking.bookingId },
        { label: "🏠 ห้อง", value: booking.room.number },
        { label: "👤 ชื่อ", value: booking.customer.fullName },
        {
          label: "📅 กรุณาเตรียมตัวเช็คเอาท์วันที่ระบุ",
          value: formatThaiDate(booking.checkout),
        },
        {
          label: "สถานะ",
          value: "✅ อนุมัติคืนห้องเรียบร้อย",
          color: "#27ae60",
        },
        {
          label: "📋 กรุณากรอกหมายเลขบัญชีเพื่อรับเงินประกันคืน",
          value: `ธนาคาร : ___________\nหมายเลขบัญชี : ___________\nชื่อ : ___________`,
          color: "#000000ff",
        },
      ],
      "🔗 เปิดลิงค์ให้เจ้าหน้าที่ดูแลหอพัก เช็คด้วย ด้วยนะครับ ",
      detailUrl
    );

    return updated;
  },

  /* ❌ แอดมินปฏิเสธการคืนห้อง */
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
        { label: "🏠 ห้อง", value: booking.room.number },
        { label: "👤 ชื่อ", value: booking.customer.fullName },
        {
          label: "สถานะ",
          value: "❌ ปฏิเสธการคืนห้อง",
          color: "#e74c3c",
        },
        {
          label: "ติดต่อผู้ดูแลระบบ",
          value: "ติดต่อผู้ดูแลระบบครับ พิมพ์ส่งมาได้เลยครับ",
        },
      ],
      "ติดต่อผู้ดูแล",
      detailUrl
    );

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

      await tx.room.update({
        where: { roomId: booking.roomId },
        data: { status: 0 },
      });

      return updatedBooking;
    });

    const detailUrl = `https://smartdorm-detail.biwbong.shop/checkout/${booking.bookingId}`;

    await sendFlexMessage(
      booking.customer.userId,
      "🏠 เช็คเอาท์สำเร็จเรียบร้อยแล้ว",
      [
        { label: "รหัสการจอง", value: booking.bookingId },
        { label: "🏠 ห้อง", value: booking.room.number },
        { label: "👤 ชื่อ", value: booking.customer.fullName },
        {
          label: "📅 วันที่เช็คเอาท์สำเร็จ",
          value: formatThaiDate(actualCheckout),
        },
        {
          label: "สถานะ",
          value: "✅ เช็คเอาท์สำเร็จแล้ว",
          color: "#27ae60",
        },
      ],
      "🔗 ดูรายละเอียดการคืนห้อง",
      detailUrl
    );

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
