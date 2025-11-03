// src/modules/Bookings/bookingService.ts
import { bookingRepository } from "./bookingRepository";
import { BookingInput, BookingUpdateInput } from "./bookingModel";
import prisma from "../../prisma";
import { verifyLineToken } from "../../utils/verifyLineToken";
import { sendFlexMessage } from "../../utils/lineFlex";

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

    const bookingUrl = `https://smartdorm-detail.biwbong.shop/booking/${booking.bookingId}`;

    await sendFlexMessage(
      booking.customer.userId,
      "📢 ยืนยันการจองห้อง SmartDorm",
      [
        { label: "รหัสการจอง", value: booking.bookingId },
        { label: "👤 ชื่อ:", value: booking.customer.fullName },
        { label: "🏠 ห้อง:", value: booking.room.number },
        { label: "📅 วันที่เข้าพัก:", value: formatThaiDate(booking.checkin) },
        { label: "📞 เบอร์:", value: booking.customer.cphone },
        { label: "📄 รหัสการจอง:", value: booking.bookingId },
        {
          label: "สถานะ:",
          value: "⏳ รอการอนุมัติจากผู้ดูแล",
          color: "#f39c12",
        },
      ],
      "🔗 ดูรายละเอียดการจอง",
      bookingUrl
    );

    const adminUrl = `https://smartdorm-admin.biwbong.shop`;

    if (process.env.ADMIN_LINE_ID) {
      await sendFlexMessage(
        process.env.ADMIN_LINE_ID,
        "📢 มีคำขอจองห้องใหม่",
        [
          { label: "รหัสการจอง", value: booking.bookingId },
          { label: "🏠 ห้อง ", value: booking.room.number },

          { label: "👤 ผู้จอง ", value: booking.customer.fullName },
          { label: "📞 เบอร์ ", value: booking.customer.cphone },
          { label: "📅 วันที่จอง ", value: formatThaiDate(booking.createdAt) },
          {
            label: "📅 วันที่ต้องการเช็คอิน ",
            value: formatThaiDate(booking.checkin),
          },
          { label: "🧾 สลิป ", value: booking.slipUrl || "ไม่มี" },
        ],
        "🔗 ดูในระบบ Admin",
        adminUrl
      );
    }

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

    const bookingUrl = `https://smartdorm-detail.biwbong.shop/booking/${booking.bookingId}`;

    await sendFlexMessage(
      booking.customer.userId,
      "การจองของคุณได้รับการอนุมัติแล้ว",
      [
        { label: "รหัสการจอง", value: booking.bookingId },
        { label: "🏠 ห้อง ", value: booking.room.number },
        { label: "👤 ชื่อ ", value: booking.customer.fullName },
        { label: "📅 วันที่เข้าพัก ", value: formatThaiDate(booking.checkin) },
        { label: "สถานะ ", value: "✅ อนุมัติแล้ว", color: "#27ae60" },
      ],
      "🔗 เปิดลิงค์ให้เจ้าหน้าที่ดูแลหอพัก เช็คด้วย ด้วยนะครับ",
      bookingUrl
    );

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

    const bookingUrl = `https://smartdorm-detail.biwbong.shop/booking/${booking.bookingId}`;

    await sendFlexMessage(
      booking.customer.userId,
      "การจองของคุณไม่ได้รับการอนุมัติ",
      [
        { label: "รหัสการจอง", value: booking.bookingId },
        { label: "👤 ชื่อ ", value: booking.customer.fullName },
        { label: "🏠 ห้อง ", value: booking.room.number },
        { label: "สถานะ ", value: "❌ ไม่อนุมัติ", color: "#e74c3c" },
        {
          label: "ติดต่อผู้ดูแลระบบ",
          value: "ติดต่อผู้ดูแลระบบครับ พิมพ์ส่งมาได้เลยครับ",
        },
      ],
      "รายละเอียดการจอง",
      bookingUrl
    );

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

    const bookingdetail = `https://smartdorm-detail.biwbong.shop/booking/${booking.bookingId}`;

    await sendFlexMessage(
      booking.customer.userId,
      "🏠 เช็คอินสำเร็จ",
      [
        { label: "รหัสการจอง ", value: booking.bookingId },
        { label: "🏠 ห้อง ", value: booking.room.number },
        { label: "👤 ชื่อ ", value: booking.customer.fullName },
        { label: "📅 วันที่เช็คอิน ", value: formatThaiDate(actualCheckin) },
      ],
      "🔗 ดูข้อมูลการเข้าพัก",
      bookingdetail
    );

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
    const checkoutdetail = `https://smartdorm-detail.biwbong.shop/checkout/${booking.bookingId}`;

    await sendFlexMessage(
      booking.customer.userId,
      "🚪 เช็คเอาท์สำเร็จ",
      [
        { label: "รหัสการจอง", value: booking.bookingId },
        { label: "🏠 ห้อง ", value: booking.room.number },
        { label: "👤 ชื่อ ", value: booking.customer.fullName },
        { label: "📅 วันที่เช็คเอาท์ ", value: formatThaiDate(actualCheckout) },
      ],
      "🔗 ดูรายละเอียดการเช็คเอาท์",
      checkoutdetail
    );
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
