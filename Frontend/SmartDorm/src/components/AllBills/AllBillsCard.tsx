import type { Bill } from "../../types/All";
import { useNavigate } from "react-router-dom";

interface Props {
  bill: Bill;
  role?: number | null;
  onViewSlip: (bill: Bill) => void;
  onDelete: (id: string, room: string) => void;
  onEdit: (bill: Bill) => void;
  onManage: (bill: Bill) => void;
  onOverdue: (billId: string, room: string) => void;
}

/* ---------------- THAI TIME ---------------- */

const thaiNow = () => {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  return new Date(utc + 7 * 60 * 60 * 1000);
};

const Divider = () => (
  <hr
    className="my-3"
    style={{
      border: "none",
      borderTop: "2px solid #000",
      opacity: 1,
    }}
  />
);

export default function AllBillsCard({
  bill,
  role,
  onViewSlip,
  onDelete,
  onEdit,
  onManage,
  onOverdue,
}: Props) {
  const navigate = useNavigate();

  const isPaid = bill.billStatus === 1;
  const isPending = bill.billStatus === 2;
  const isUnpaid = bill.billStatus === 0;

  const hasSlip = bill.payment?.slipUrl || bill.slipUrl;

  const overdueDays = bill.overdueDays ?? 0;

  /* ---------- เช็คเกินกำหนด ---------- */

  const today = thaiNow();
  const dueDate = new Date(bill.dueDate);

  const isPastDue = today > dueDate;

  return (
    <div
      className="p-3 shadow-sm rounded-4 bg-white"
      style={{
        border: "2px solid #000",
        borderLeft: isPaid
          ? "6px solid #2ecc71"
          : isPending
            ? "6px solid #f1c40f"
            : "6px solid #e74c3c",
      }}
    >
      <div className="text-center">
        <div className="h5 text-primary">
          <b>{bill.room?.number}</b>
        </div>

        <div className="mt-2 text-black">
          <div className="fw-bold">รอบบิล</div>

          <div className="fw-bold text-primary">
            {new Date(bill.month).toLocaleDateString("th-TH", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </div>
        </div>
      </div>

      <Divider />

      <div className="text-center">
        <div className="fw-bold h5 text-black">รายละเอียดผู้เช่า</div>

        <div className="mt-3">
          <div className="fw-bold text-black">ผู้เช่า</div>
          <div className="text-primary fw-bold">{bill.fullName || "-"}</div>
        </div>

        <div className="mt-2">
          <div className="fw-bold text-black">LINE</div>
          <div className="text-primary fw-bold">
            {bill.customer?.userName || "-"}
          </div>
        </div>

        <div className="mt-2">
          <div className="fw-bold text-black">เบอร์</div>
          <div className="text-primary fw-bold">{bill.cphone || "-"}</div>
        </div>
      </div>

      <Divider />

      <div className="text-center">
        <div className="fw-bold h5 text-black">รายละเอียดบิล</div>

        <div className="mt-3">
          <div className="fw-bold text-black">วันที่ออกบิล</div>

          <div className="text-primary fw-bold">
            {new Date(bill.createdAt).toLocaleDateString("th-TH", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </div>
        </div>

        {!isPaid && !isPending && (
          <div className="mt-3">
            <div className="fw-bold text-black">กำหนดชำระ</div>

            <div className="text-primary fw-bold">
              {new Date(bill.dueDate).toLocaleDateString("th-TH", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </div>
          </div>
        )}

        <div className="mt-3">
          <div className="fw-bold h5 text-black">ยอดรวม</div>

          <div className="fw-bold text-primary h5">
            {bill.total.toLocaleString()} บาท
          </div>
        </div>
      </div>

      <Divider />

      <div className="text-center">
        <div className="fw-bold h5 text-black">สถานะการชำระเงิน</div>

        <div className="mt-2">
          {isPending ? (
            <span className="badge bg-warning text-dark p-2">รอตรวจสอบ</span>
          ) : isPaid ? (
            <span className="badge bg-success p-2">ชำระแล้ว</span>
          ) : isPastDue ? (
            <span className="badge bg-dark p-2">เกินกำหนด</span>
          ) : (
            <span className="badge bg-danger p-2">ค้างชำระ</span>
          )}
        </div>

        {overdueDays > 0 && (
          <div className="mt-3">
            <div className="fw-bold text-black">เกินกำหนด</div>

            <div className="fw-bold text-primary">{overdueDays} วัน</div>
          </div>
        )}
      </div>

      <Divider />

      {hasSlip && (
        <>
          <button
            className="btn btn-primary btn-sm w-100"
            onClick={() => onViewSlip(bill)}
          >
            ดูสลิป
          </button>

          <Divider />
        </>
      )}

      <div className="d-flex flex-column gap-2">
        {bill.billStatus === 2 && role === 0 && (
          <button
            className="btn btn-info btn-sm text-black"
            onClick={() => onManage(bill)}
          >
            จัดการ
          </button>
        )}

        <button
          className="btn btn-success btn-sm text-black"
          onClick={() => navigate(`/bills/${bill.billId}`)}
        >
          ดูรายละเอียดบิล
        </button>

        {isUnpaid && isPastDue && role === 0 && (
          <button
            className="btn btn-warning btn-sm text-black"
            onClick={() => onOverdue(bill.billId, bill.room?.number ?? "-")}
          >
            แจ้งเตือน
          </button>
        )}

        {role === 0 && (
          <div className="d-flex gap-2">
            {bill.billStatus !== 1 && (
              <button
                className="btn btn-warning btn-sm w-50"
                onClick={() => onEdit(bill)}
              >
                ✏️
              </button>
            )}

            <button
              className="btn btn-danger btn-sm w-50"
              onClick={() => onDelete(bill.billId, bill.room?.number ?? "-")}
            >
              🗑️
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
