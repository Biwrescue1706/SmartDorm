//src/services/checkout.notify.js

import { sendFlexMessage } from "../../utils/lineFlex.js";
import { BASE_URL, ADMIN_URL } from "../../utils/api.js";

const adminId = process.env.ADMIN_LINE_ID;

const formatThaiDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("th-TH", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "-";

/* ================== แจ้ง Admin ================== */

export const notifyCheckoutRequestAdmin = async (checkout) => {
  if (!adminId) return;

  await sendFlexMessage(
    adminId,
    "📥 มีคำขอคืนห้องใหม่",
    [
      { label: "รหัสการคืน", value: checkout.checkoutId },
      { label: "ห้อง", value: checkout.room.number },
      { label: "วันที่ขอคืน", value: formatThaiDate(checkout.checkout) },
      { label: "ผู้เช่า", value: checkout.customer.userName || "-" },
    ],
    [{ label: "เปิดดูรายการ", url: ADMIN_URL, style: "primary" }]
  );
};

/* ================== ลูกค้าขอคืนห้อง ================== */

export const notifyCheckoutRequestCustomer = async (checkout, userId) => {
  const detailUrl = `${BASE_URL}/checkout/${checkout.checkoutId}`;

  await sendFlexMessage(
    userId,
    "🏫SmartDorm🎉 ส่งคำขอคืนห้องแล้ว",
    [
      { label: "รหัสการคืน", value: checkout.checkoutId },
      { label: "ห้อง", value: checkout.room.number },
      { label: "วันที่ขอคืน", value: formatThaiDate(checkout.checkout) },
      { label: "สถานะ", value: "รอการตรวจสอบจากแอดมิน", color: "#f39c12" },
    ],
    [{ label: "ดูสถานะคำขอ", url: detailUrl, style: "primary" }]
  );
};

/* ================== อนุมัติ ================== */

export const notifyCheckoutApproved = async (checkout, updated) => {
  const detailUrl = `${BASE_URL}/checkout/${checkout.checkoutId}`;

  await sendFlexMessage(
    checkout.customer.userId,
    "🏫SmartDorm🎉 แจ้งผลคำขอการคืนห้อง",
    [
      { label: "รหัสการคืน", value: checkout.checkoutId },
      { label: "ห้อง", value: checkout.room.number },
      { label: "วันที่ขอคืน", value: formatThaiDate(checkout.checkout) },
      {
        label: "วันที่อนุมัติ",
        value: formatThaiDate(updated.RefundApprovalDate),
      },
      { label: "สถานะ", value: "รอวันเช็คเอาท์", color: "#f39c12" },
    ],
    [{ label: "เปิดดูรายการ", url: detailUrl, style: "primary" }]
  );
};

/* ================== ปฏิเสธ ================== */

export const notifyCheckoutRejected = async (checkout) => {
  await sendFlexMessage(
    checkout.customer.userId,
    "🏫SmartDorm🎉 แจ้งผลคำขอการคืนห้อง",
    [
      { label: "ห้อง", value: checkout.room.number },
      { label: "สถานะ", value: "ถูกปฏิเสธ" },
      { label: "หมายเหตุ", value: "สามารถยื่นคำขอใหม่ได้อีกครั้ง" },
    ],
    []
  );
};

/* ================== เช็คเอาท์สำเร็จ ================== */

export const notifyCheckoutSuccess = async (checkout) => {
  const detailUrl = `${BASE_URL}/checkout/${checkout.checkoutId}`;
  const deposit = checkout.room.deposit || 0;

  await sendFlexMessage(
    checkout.customer.userId,
    "🏫SmartDorm🎉 เช็คเอาท์เรียบร้อยแล้ว",
    [
      { label: "รหัสการคืน", value: checkout.checkoutId },
      { label: "ห้อง", value: checkout.room.number },
      { label: "วันที่เช็คเอาท์", value: formatThaiDate(new Date()) },
      { label: "เงินมัดจำ", value: `${deposit.toLocaleString()} บาท` },
      { label: "ยอดคืน", value: `${deposit.toLocaleString()} บาท` },
      {
        label: "แจ้งโอนเงิน",
        value: "กรุณาพิมพ์หมายเลขบัญชี\nธนาคาร\nxxx-xxx-xxxx\nชื่อ-นามสกุล",
      },
    ],
    [{ label: "ดูรายละเอียด", url: detailUrl, style: "primary" }]
  );
};