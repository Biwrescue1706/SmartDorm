// src/modules/Bookings/bookingService.ts
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
  async getAllBookings() {
    return bookingRepository.findAll();
  },

  async getBookingById(bookingId: string) {
    const booking = await bookingRepository.findById(bookingId);
    if (!booking) throw new Error("ไม่พบข้อมูลการจอง");
    return booking;
  },

  async searchBookings(keyword: string) {
    const results = await bookingRepository.searchBookings(keyword);
    if (!results.length) throw new Error("ไม่พบข้อมูลการจองที่ค้นหา");
    return results;
  },

  /* ✅ เพิ่ม log debug สำหรับตรวจสอบปัญหา 400 */
  async createBooking(input: BookingInput) {
    console.log("📩 [createBooking] Raw input:", input);

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

    // ✅ ตรวจสอบ token
    const verify = await verifyLineToken(accessToken).catch((e) => {
      console.error("❌ verifyLineToken error:", e.message);
      return {};
    });

    const { userId, displayName } = verify as {
      userId?: string;
      displayName?: string;
    };

    console.log("🧩 [createBooking] userId:", userId);
    console.log("🏠 [createBooking] roomId:", roomId);
    console.log("📅 [createBooking] checkin:", checkin);

    if (!userId || !roomId || !checkin) {
      console.error("❌ ข้อมูลไม่ครบ", { userId, roomId, checkin });
      throw new Error("ข้อมูลไม่ครบ");
    }

    let slipUrl = "";
    if (slip) {
      console.log("🖼️ [createBooking] Uploading slip...");
      slipUrl = await bookingRepository.uploadSlip(slip);
      console.log("✅ [createBooking] slip uploaded:", slipUrl);
    }

    const booking = await prisma.$transaction(async (tx) => {
      let customer = await tx.customer.findFirst({ where: { userId } });
      if (!customer) {
        console.log("👤 [createBooking] Creating new customer:", displayName);
        customer = await tx.customer.create({
          data: { userId, userName: displayName ?? "Unknown User" },
        });

        await tx.customer.update({
          where: { customerId: customer.customerId },
          data: { userName: displayName ?? "Unknown User" },
        });
      } else {
        console.log(
          "🔁 [createBooking] Updating existing customer:",
          displayName
        );
        await tx.customer.update({
          where: { customerId: customer.customerId },
          data: { userName: displayName },
        });
      }

      console.log("🆕 [createBooking] Creating booking record...");
      const newBooking = await tx.booking.create({
        data: {
          roomId,
          customerId: customer.customerId,
          ctitle,
          cname,
          csurname,
          fullName: `${ctitle ?? ""}${cname ?? ""} ${csurname ?? ""}`.trim(),
          cphone: cphone ?? "",
          cmumId: cmumId ?? "",
          slipUrl,
          checkin: new Date(checkin),
          checkout: checkout ? new Date(checkout) : null,
          approveStatus: 0,
          checkinStatus: 0,
          checkoutStatus: 0,
        },
        include: { room: true, customer: true },
      });

      console.log("✅ [createBooking] Booking created:", newBooking.bookingId);
      await bookingRepository.updateRoomStatus(roomId, 1, tx);
      return newBooking;
    });

    const bookingUrl = `https://smartdorm-detail.biwbong.shop/booking/${booking.bookingId}`;
    await sendFlexMessage(
      booking.customer?.userId,
      "📢 ยืนยันการจองห้อง SmartDorm",
      [
        { label: "รหัสการจอง", value: booking.bookingId },
        { label: "👤 ชื่อ:", value: booking.fullName ?? "-" },
        { label: "🏠 ห้อง:", value: booking.room.number },
        { label: "📅 วันที่เข้าพัก:", value: formatThaiDate(booking.checkin) },
        { label: "📞 เบอร์:", value: booking.cphone ?? "-" },
        {
          label: "สถานะ:",
          value: "⏳ รอการอนุมัติจากผู้ดูแล",
          color: "#f39c12",
        },
      ],
      "🔗 ดูรายละเอียดการจอง",
      bookingUrl
    );

    if (process.env.ADMIN_LINE_ID) {
      await sendFlexMessage(
        process.env.ADMIN_LINE_ID,
        "📢 มีคำขอจองห้องใหม่",
        [
          { label: "รหัสการจอง", value: booking.bookingId },
          { label: "🏠 ห้อง", value: booking.room.number },
          { label: "👤 ผู้จอง", value: booking.fullName ?? "-" },
          { label: "📞 เบอร์", value: booking.cphone ?? "-" },
          {
            label: "📅 วันที่เข้าพัก",
            value: formatThaiDate(booking.checkin),
          },
        ],
        "🔗 เปิดในระบบ Admin",
        "https://smartdorm-admin.biwbong.shop"
      );
    }

    console.log("✅ [createBooking] Completed successfully");
    return booking;
  },

  // ✅ ส่วนอื่นๆ เหมือนเดิม ไม่ต้องแก้
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
        { label: "📞 เบอร์", value: booking.cphone ?? "-" },
      ],
      "🔗 ดูรายละเอียด",
      bookingUrl
    );

    return updated;
  },

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

  async deleteBooking(bookingId: string) {
    const booking = await bookingRepository.findById(bookingId);
    if (!booking) throw new Error("ไม่พบข้อมูลการจอง");

    if (booking.slipUrl) await bookingRepository.deleteSlip(booking.slipUrl);
    await bookingRepository.updateRoomStatus(booking.roomId, 0);
    await bookingRepository.deleteBooking(bookingId);
  },

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
