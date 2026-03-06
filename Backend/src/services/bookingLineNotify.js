import { sendFlexMessage } from "../utils/lineFlex.js";
import { BASE_URL } from "../utils/api.js";

const formatThai = (d) =>
  d
    ? new Date(d).toLocaleDateString("th-TH", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "-";

const adminId = process.env.ADMIN_LINE_ID;

// แจ้งลูกค้าเมื่อสร้างการจอง
export const notifyBookingCreated = async (booking) => {
  const detailUrl = `${BASE_URL}/booking/${booking.bookingId}`;

  return sendFlexMessage(
    booking.customer?.userId ?? "",
    "🏫SmartDorm🎉 ยืนยันการจองห้อง",
    [
      { label: "รหัสการจอง", value: booking.bookingId },
      { label: "ชื่อ", value: booking.fullName ?? "-" },
      { label: "ห้อง", value: booking.room.number },
      { label: "วันจอง", value: formatThai(booking.bookingDate) },
      { label: "วันที่แจ้งเข้าพัก", value: formatThai(booking.checkin) },
      { label: "เบอร์โทร", value: booking.cphone ?? "-" },
      { label: "สถานะ", value: "รออนุมัติ", color: "#f39c12" },
    ],
    [{ label: "ดูรายละเอียด", url: detailUrl, style: "primary" }]
  );
};

// แจ้ง admin
export const notifyAdminBookingCreated = async (booking) => {
  if (!adminId) return;

  return sendFlexMessage(
    adminId,
    "📢 มีการจองห้องใหม่เข้ามา",
    [
      { label: "รหัสการจอง", value: booking.bookingId },
      { label: "ชื่อผู้จอง", value: booking.fullName ?? "-" },
      { label: "ห้อง", value: booking.room.number },
      { label: "วันจอง", value: formatThai(booking.bookingDate) },
      { label: "วันที่แจ้งเข้าพัก", value: formatThai(booking.checkin) },
      { label: "เบอร์โทร", value: booking.cphone ?? "-" },
    ],
    [{ label: "เปิดดูรายการ", url: ADMIN_URL, style: "primary" }]
  );
};

// แจ้งอนุมัติ
export const notifyBookingApproved = async (booking) => {
  const detailUrl = `${BASE_URL}/booking/${booking.bookingId}`;

  return sendFlexMessage(
    booking.customer?.userId ?? "",
    "🏫SmartDorm🎉 แจ้งผลคำขอการจองห้อง",
    [
      { label: "รหัส", value: booking.bookingId },
      { label: "ชื่อ", value: booking.fullName ?? "-" },
      { label: "ห้อง", value: booking.room.number },
      { label: "วันที่อนุมัติ", value: formatThai(booking.approvedAt) },
      { label: "สถานะ", value: "อนุมัติแล้ว", color: "#27ae60" },
    ],
    [{ label: "รายละเอียด", url: detailUrl, style: "primary" }]
  );
};

// แจ้งปฏิเสธ
export const notifyBookingRejected = async (booking) => {
  const detailUrl = `${BASE_URL}/booking/${booking.bookingId}`;

  return sendFlexMessage(
    booking.customer?.userId ?? "",
    "🏫SmartDorm🎉 แจ้งผลคำขอการจองห้อง",
    [
      { label: "รหัส", value: booking.bookingId },
      { label: "ชื่อ", value: booking.fullName ?? "-" },
      { label: "ห้อง", value: booking.room.number },
      { label: "สถานะ", value: "ปฏิเสธการจอง", color: "#e74c3c" },
    ],
    [{ label: "รายละเอียด", url: detailUrl, style: "primary" }]
  );
};

// แจ้งเช็คอิน
export const notifyBookingCheckin = async (booking) => {
  const detailUrl = `${BASE_URL}/booking/${booking.bookingId}`;

  return sendFlexMessage(
    booking.customer?.userId ?? "",
    "🏫SmartDorm🎉 เช็คอินสำเร็จ",
    [
      { label: "รหัส", value: booking.bookingId },
      { label: "ชื่อ", value: booking.fullName ?? "-" },
      { label: "ห้อง", value: booking.room.number },
      { label: "เช็คอิน", value: formatThai(booking.checkinAt) },
    ],
    [{ label: "รายละเอียด", url: detailUrl, style: "primary" }]
  );
};

export const notifyBookingUpdatedByAdmin = async (booking) => {
  if (!adminId) return;

  return sendFlexMessage(
    adminId,
    "📢 มีการแก้ไขการจอง",
    [
      { label: "รหัสการจอง", value: booking.bookingId },
      { label: "ชื่อ", value: booking.fullName ?? "-" },
      { label: "ห้อง", value: booking.room?.number ?? "-" },
      { label: "สถานะ", value: booking.status ?? "-" },
    ],
    [{ label: "เปิดดูรายการ", url: ADMIN_URL, style: "primary" }]
  );
};