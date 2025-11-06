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

/* 🕒 Helper สำหรับ Log สวย ๆ พร้อมเวลา */
const logTime = () => new Date().toISOString().replace("T", " ").split(".")[0];

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

  /* ✅ สร้างการจองแบบป้องกัน error 100% */
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

    // ✅ ปลอดภัยจากการอัปโหลด Supabase
    let slipUrl = "";
    try {
      if (slip) slipUrl = await bookingRepository.uploadSlip(slip);
    } catch (err: any) {
      console.warn(`[${logTime()}] ⚠️ Upload slip failed:`, err.message);
    }

    // ✅ Transaction สำหรับสร้าง booking
    const booking = await prisma.$transaction(async (tx) => {
      let customer = await tx.customer.findFirst({ where: { userId } });
      if (!customer) {
        customer = await tx.customer.create({
          data: { userId, userName: displayName },
        });
        console.log(`[${logTime()}] 👤 Created new customer: ${displayName}`);
      } else {
        await tx.customer.update({
          where: { customerId: customer.customerId },
          data: { userName: displayName },
        });
        console.log(
          `[${logTime()}] 🔁 Updated existing customer: ${displayName}`
        );
      }

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

      await bookingRepository.updateRoomStatus(roomId, 1, tx);
      console.log(`[${logTime()}] ✅ Booking created: ${newBooking.bookingId}`);
      return newBooking;
    });

    // ✅ URL สำหรับดูรายละเอียด
    const bookingUrl = `https://smartdorm-detail.biwbong.shop/booking/${booking.bookingId}`;

    // ✅ ส่งข้อความแจ้งเตือนลูกค้า (ถ้ามี error จะไม่ throw)
    try {
      await sendFlexMessage(
        booking.customer?.userId,
        "📢 ยืนยันการจองห้อง SmartDorm",
        [
          { label: "รหัสการจอง", value: booking.bookingId },
          { label: "👤 ชื่อ:", value: booking.fullName ?? "-" },
          { label: "🏠 ห้อง:", value: booking.room.number },
          {
            label: "📅 วันที่เข้าพัก:",
            value: formatThaiDate(booking.checkin),
          },
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
      console.log(`[${logTime()}] 💬 Flex sent to user successfully`);
    } catch (err: any) {
      console.warn(`[${logTime()}] ⚠️ LINE notify user failed:`, err.message);
    }

    // ✅ ส่งข้อความแจ้งเตือนแอดมิน (ถ้ามี ADMIN_LINE_ID)
    if (process.env.ADMIN_LINE_ID) {
      try {
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
        console.log(`[${logTime()}] 💬 Flex sent to admin successfully`);
      } catch (err: any) {
        console.warn(
          `[${logTime()}] ⚠️ LINE notify admin failed:`,
          err.message
        );
      }
    }

    return booking;
  },

  /* 🧾 ฟังก์ชันอื่น ๆ ไม่ต้องเปลี่ยน */
  async approveBooking(bookingId: string) {
    const booking = await bookingRepository.findById(bookingId);
    if (!booking) throw new Error("ไม่พบการจอง");
    if (booking.approveStatus === 1) throw new Error("อนุมัติแล้ว");

    const updated = await bookingRepository.updateBooking(bookingId, {
      approveStatus: 1,
    });

    const bookingUrl = `https://smartdorm-detail.biwbong.shop/booking/${booking.bookingId}`;
    try {
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
    } catch (err: any) {
      console.warn(
        `[${logTime()}] ⚠️ LINE notify approve failed:`,
        err.message
      );
    }

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
    try {
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
    } catch (err: any) {
      console.warn(`[${logTime()}] ⚠️ LINE notify reject failed:`, err.message);
    }

    return updated;
  },
  /* 🚪 เช็คอินห้องพัก */
  async checkinBooking(bookingId: string) {
    const booking = await bookingRepository.findById(bookingId);
    if (!booking) throw new Error("ไม่พบข้อมูลการจอง");

    const updated = await bookingRepository.updateBooking(bookingId, {
      checkinStatus: 1,
      actualCheckin: new Date(),
    });

    console.log(
      `[${new Date().toISOString()}] ✅ Check-in booking ${bookingId}`
    );
    return updated;
  },

  /* 🏁 เช็คเอาท์ห้องพัก */
  async checkoutBooking(bookingId: string) {
    const booking = await bookingRepository.findById(bookingId);
    if (!booking) throw new Error("ไม่พบข้อมูลการจอง");

    const updated = await bookingRepository.updateBooking(bookingId, {
      checkoutStatus: 1,
      actualCheckout: new Date(),
    });

    // ✅ เมื่อเช็คเอาท์แล้ว เปลี่ยนสถานะห้องให้ว่าง
    await bookingRepository.updateRoomStatus(booking.roomId, 0);

    console.log(
      `[${new Date().toISOString()}] ✅ Checkout booking ${bookingId}`
    );
    return updated;
  },

  /* ✏️ แก้ไขข้อมูลการจอง (Admin) */
  async updateBooking(bookingId: string, data: BookingUpdateInput) {
    const booking = await bookingRepository.findById(bookingId);
    if (!booking) throw new Error("ไม่พบข้อมูลการจอง");

    const updated = await bookingRepository.updateBooking(bookingId, data);
    console.log(
      `[${new Date().toISOString()}] 📝 Updated booking ${bookingId}`
    );
    return updated;
  },

  /* 🗑️ ลบการจอง (Admin) */
  async deleteBooking(bookingId: string) {
    const booking = await bookingRepository.findById(bookingId);
    if (!booking) throw new Error("ไม่พบข้อมูลการจอง");

    await bookingRepository.deleteBooking(bookingId);
    await bookingRepository.updateRoomStatus(booking.roomId, 0);

    console.log(
      `[${new Date().toISOString()}] 🗑️ Deleted booking ${bookingId}`
    );
    return true;
  },
};
