import { bookingRepository } from "./bookingRepository";
import { BookingInput, BookingUpdateInput } from "./bookingModel";
import prisma from "../../prisma";
import { verifyLineToken } from "../../utils/verifyLineToken";
import { sendFlexMessage } from "../../utils/lineFlex";

/* 🗓️ ฟังก์ชันแปลงวันที่ไทย */
const formatThaiDate = (d: string | Date) =>
  new Date(d).toLocaleDateString("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

export const bookingService = {
  /* 📋 ดึงข้อมูลทั้งหมด */
  async getAllBookings() {
    return bookingRepository.findAll();
  },

  /* 🔍 ดึงข้อมูลตาม bookingId */
  async getBookingById(bookingId: string) {
    const booking = await bookingRepository.findById(bookingId);
    if (!booking) throw new Error("ไม่พบข้อมูลการจอง");
    return booking;
  },

  /* 🔍 ค้นหาการจอง */
  async searchBookings(keyword: string) {
    const results = await bookingRepository.searchBookings(keyword);
    if (!results.length) throw new Error("ไม่พบข้อมูลการจองที่ค้นหา");
    return results;
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

    // 🧱 Transaction
    const booking = await prisma.$transaction(async (tx) => {
      // ตรวจว่ามี customer แล้วหรือยัง
      let customer = await tx.customer.findFirst({ where: { userId } });
      if (!customer) {
        customer = await tx.customer.create({
          data: { userId, userName: displayName },
        });
      } else {
        await tx.customer.update({
          where: { customerId: customer.customerId },
          data: { userName: displayName },
        });
      }

      // ✅ สร้างการจอง พร้อม snapshot ข้อมูลลูกค้า
      const newBooking = await tx.booking.create({
        data: {
          roomId,
          customerId: customer.customerId,
          ctitle,
          cname,
          csurname,
          fullName: `${ctitle}${cname} ${csurname ?? ""}`.trim(),
          cphone,
          cmumId,
          slipUrl,
          checkin: new Date(checkin),
          checkout: checkout ? new Date(checkout) : null,
          approveStatus: 0,
          checkinStatus: 0,
          checkoutStatus: 0,
        },
        include: { room: true, customer: true },
      });

      await bookingRepository.updateRoomStatus(roomId, 1, tx);
      return newBooking;
    });

    /* ✅ ส่ง LINE แจ้งผู้จอง */
    const bookingUrl = `https://smartdorm-detail.biwbong.shop/booking/${booking.bookingId}`;
    await sendFlexMessage(
      booking.customer.userId,
      "📢 ยืนยันการจองห้อง SmartDorm",
      [
        { label: "รหัสการจอง", value: booking.bookingId },
        { label: "👤 ชื่อ:", value: booking.fullName },
        { label: "🏠 ห้อง:", value: booking.room.number },
        { label: "📅 วันที่เข้าพัก:", value: formatThaiDate(booking.checkin) },
        { label: "📞 เบอร์:", value: booking.cphone },
        {
          label: "สถานะ:",
          value: "⏳ รอการอนุมัติจากผู้ดูแล",
          color: "#f39c12",
        },
      ],
      "🔗 ดูรายละเอียดการจอง",
      bookingUrl
    );

    /* ✅ ส่ง LINE แจ้งแอดมิน */
    if (process.env.ADMIN_LINE_ID) {
      await sendFlexMessage(
        process.env.ADMIN_LINE_ID,
        "📢 มีคำขอจองห้องใหม่",
        [
          { label: "รหัสการจอง", value: booking.bookingId },
          { label: "🏠 ห้อง", value: booking.room.number },
          { label: "👤 ผู้จอง", value: booking.fullName },
          { label: "📞 เบอร์", value: booking.cphone },
          {
            label: "📅 วันที่เข้าพัก",
            value: formatThaiDate(booking.checkin),
          },
        ],
        "🔗 เปิดในระบบ Admin",
        "https://smartdorm-admin.biwbong.shop"
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
      "✅ การจองของคุณได้รับการอนุมัติแล้ว",
      [
        { label: "รหัสการจอง", value: booking.bookingId },
        { label: "🏠 ห้อง", value: booking.room.number },
        { label: "📅 วันที่เข้าพัก", value: formatThaiDate(booking.checkin) },
      ],
      "🔗 ดูรายละเอียด",
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
      "❌ การจองของคุณไม่ได้รับการอนุมัติ",
      [
        { label: "รหัสการจอง", value: booking.bookingId },
        { label: "🏠 ห้อง", value: booking.room.number },
        { label: "📞 เบอร์", value: booking.cphone },
      ],
      "🔗 ดูรายละเอียด",
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

    const bookingUrl = `https://smartdorm-detail.biwbong.shop/booking/${booking.bookingId}`;
    await sendFlexMessage(
      booking.customer.userId,
      "🏠 เช็คอินสำเร็จ",
      [
        { label: "รหัสการจอง", value: booking.bookingId },
        { label: "🏠 ห้อง", value: booking.room.number },
        {
          label: "📅 วันที่เช็คอิน",
          value: formatThaiDate(actualCheckin),
        },
      ],
      "🔗 ดูข้อมูลการเข้าพัก",
      bookingUrl
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

    const checkoutUrl = `https://smartdorm-detail.biwbong.shop/checkout/${booking.bookingId}`;
    await sendFlexMessage(
      booking.customer.userId,
      "🚪 เช็คเอาท์สำเร็จ",
      [
        { label: "รหัสการจอง", value: booking.bookingId },
        { label: "🏠 ห้อง", value: booking.room.number },
        {
          label: "📅 วันที่เช็คเอาท์",
          value: formatThaiDate(actualCheckout),
        },
      ],
      "🔗 ดูรายละเอียดการเช็คเอาท์",
      checkoutUrl
    );

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

  /* ✏️ แก้ไขข้อมูลการจอง (update booking + customer snapshot) */
  async updateBooking(bookingId: string, data: BookingUpdateInput) {
    const booking = await bookingRepository.findById(bookingId);
    if (!booking) throw new Error("ไม่พบข้อมูลการจอง");

    const updatableFields = [
      "approveStatus",
      "checkinStatus",
      "checkoutStatus",
      "returnStatus",
      "checkin",
      "checkout",
      "actualCheckin",
      "actualCheckout",
      "ctitle",
      "cname",
      "csurname",
      "cphone",
      "cmumId",
    ];

    const updates: any = {};
    for (const key of updatableFields) {
      if (data[key] !== undefined && data[key] !== "") {
        updates[key] = data[key];
      }
    }

    // สร้าง fullName ใหม่หากแก้ไขชื่อ
    if (updates.ctitle || updates.cname || updates.csurname) {
      updates.fullName =
        `${updates.ctitle || booking.ctitle}${updates.cname || booking.cname} ${updates.csurname || booking.csurname}`.trim();
    }

    const updated = await prisma.booking.update({
      where: { bookingId },
      data: updates,
      include: { room: true, customer: true },
    });

    return updated;
  },
};
