//a
import { sendFlexMessage } from "../../utils/lineFlex.js";
import { BASE_URL } from "../../utils/api.js";

const formatThaiDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("th-TH", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "-";

const formatThaiMonth = (d) =>
  d
    ? new Date(d).toLocaleDateString("th-TH", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "-";

const getBillStatusText = (status) => {
  switch (status) {
    case 0:
      return "รอการชำระเงิน";
    case 1:
      return "ชำระเงินแล้ว";
    case 2:
      return "รอตรวจสอบ";
    case 3:
      return "ปฏิเสธการชำระเงิน";
    default:
      return "ไม่ทราบสถานะ";
  }
};

const getBillStatusColour = (status) => {
  switch (status) {
    case 0:
      return "#9CA3AF";
    case 1:
      return "#16A34A";
    case 2:
      return "#FACC15";
    case 3:
      return "#DC2626";
    default:
      return "#6B7280";
  }
};

export const notifyBillCreated = async (booking, bill, billNumber, service) => {
  const detailedBill = `${BASE_URL}/bill/${bill.billId}`;

  if (!booking.customer?.userId) return;

  await sendFlexMessage(
    booking.customer.userId,
    `📄 แจ้งบิลค่าเช่าห้อง ประจำเดือน ${formatThaiMonth(bill.month)}`,
    [
      { label: "รหัสบิล", value: bill.billId },
      { label: "เลขที่บิล", value: billNumber },
      { label: "ห้อง", value: booking.room.number },
      { label: "ค่าเช่าห้อง", value: `${booking.room.rent} บาท` },
      {
        label: "ค่าน้ำ",
        value: `${bill.wUnits} หน่วย (${bill.waterCost} บาท)`,
      },
      {
        label: "ค่าไฟ",
        value: `${bill.eUnits} หน่วย (${bill.electricCost} บาท)`,
      },
      { label: "ค่าส่วนกลาง", value: `${service} บาท` },
      {
        label: "ยอดรวมทั้งหมด",
        value: `${bill.total.toLocaleString()} บาท`,
      },
      {
        label: "ครบกำหนดชำระ",
        value: formatThaiDate(bill.dueDate),
      },
      {
        label: "สถานะ",
        value: getBillStatusText(bill.billStatus),
        color: getBillStatusColour(bill.billStatus),
      },
    ],
    [{ label: "ดูรายละเอียดและชำระเงิน", url: detailedBill }]
  );
};

export const notifyBillApproved = async (billData, updated) => {
  const detailedBill = `${BASE_URL}/bill/${updated.billId}`;

  if (!billData.customer?.userId) return;

  await sendFlexMessage(
    billData.customer.userId,
    "🏫SmartDorm🎉 แจ้งผลการชำระเงิน",
    [
      { label: "รหัสบิล", value: updated.billId },
      { label: "เลขที่บิล", value: updated.billNumber },
      { label: "ห้อง", value: billData.room?.number ?? "-" },
      { label: "เดือนที่ชำระ", value: formatThaiMonth(updated.month) },
      {
        label: "ยอดชำระ",
        value: `${updated.total.toLocaleString()} บาท`,
      },
      {
        label: "สถานะ",
        value: getBillStatusText(updated.billStatus),
        color: getBillStatusColour(updated.billStatus),
      },
      { label: "วันที่ยืนยัน", value: formatThaiDate(updated.billDate) },
    ],
    [{ label: "ดูรายละเอียดและชำระเงิน", url: detailedBill }]
  );
};

export const notifyBillEdited = async (billData, updated) => {
  const detailedBill = `${BASE_URL}/bill/${updated.billId}`;

  if (!billData.customer?.userId) return;

  await sendFlexMessage(
    billData.customer.userId,
    "🏫SmartDorm🎉 แก้ไขบิลค่าเช่าห้อง",
    [
      { label: "รหัสบิล", value: updated.billId },
      { label: "เลขที่บิล", value: updated.billNumber },
      { label: "ห้อง", value: billData.room?.number ?? "-" },
      { label: "ประจำเดือน", value: formatThaiMonth(updated.month) },
      {
        label: "ค่าน้ำ",
        value: `${updated.wUnits} หน่วย (${updated.waterCost} บาท)`,
      },
      {
        label: "ค่าไฟ",
        value: `${updated.eUnits} หน่วย (${updated.electricCost} บาท)`,
      },
      {
        label: "ยอดรวมใหม่",
        value: `${updated.total.toLocaleString()} บาท`,
      },
      {
        label: "ครบกำหนดชำระ",
        value: formatThaiDate(updated.dueDate),
      },
      {
        label: "สถานะ",
        value: getBillStatusText(updated.billStatus),
        color: getBillStatusColour(updated.billStatus),
      },
    ],
    [{ label: "ดูรายละเอียดบิล", url: detailedBill }]
  );
};