// src/components/AllBills/AllBillsCard.tsx
import type { Bill } from "../../types/Bill";

interface Props {
  bill: Bill;
  role?: number | null;
  onViewSlip: (bill: Bill) => void;
  onDelete: (id: string, room: string) => void;
  onEdit: (bill: Bill) => void;
  onManage: (bill: Bill) => void;
  onOverdue: (billId: string, room: string) => void;
}

export default function AllBillsCard({
  bill,
  role,
  onViewSlip,
  onDelete,
  onEdit,
  onManage,
  onOverdue,
}: Props) {
  const isPaid = bill.billStatus === 1;
  const isPending = bill.billStatus === 2;
  const isUnpaid = bill.billStatus === 0;
  const hasSlip = bill.payment?.slipUrl || bill.slipUrl;
  const overdueDays = bill.overdueDays ?? 0;

  return (
    <div
      className="p-3 shadow-sm rounded-4 border bg-white"
      style={{
        borderLeft: isPaid
          ? "6px solid #2ecc71"
          : isPending
            ? "6px solid #f1c40f"
            : "6px solid #e74c3c",
      }}
    >
      <div>
        <h5 className="fw-bold mb-2 text-center justify-content-center">
          {" "}
          ห้อง {bill.room?.number}
        </h5>
        <h5 className="fw-bold mb-2 text-center justify-content-center">
          <b>เดือน : </b>{" "}
          {new Date(bill.month).toLocaleDateString("th-TH", {
            month: "long",
            year: "numeric",
          })}
        </h5>
      </div>
      <hr />
      <div>
        <h5 className="fw-semibold text-center">รายละเอียดผู้เช่า</h5>
        <div className="mb-1 h5">
          <b>ผู้เช่า : </b> {bill.fullName || " "}
        </div>
        <div className="mb-1 h5">
          <b>LINE : </b> {bill.customer?.userName || " "}
        </div>
        <div className="mb-1 h5">
          <b>เบอร์ : </b> {bill.cphone || " "}
        </div>
      </div>
      <hr />
      <div>
        <h5 className="fw-semibold text-center">รายละเอียดบิล</h5>
        <div className="mb-1 h5">
          <b>วันที่ออกบิล : </b>{" "}
          {new Date(bill.createdAt).toLocaleDateString("th-TH", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </div>
        {!isPaid && !isPending && (
          <div className="mb-1 h5">
            <b>กำหนดชำระ : </b>{" "}
            {new Date(bill.dueDate).toLocaleDateString("th-TH", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </div>
        )}
      </div>

      <hr />
      <div>

        <div className="mb-2 h5">
          <b>ยอดรวม : </b> {bill.total.toLocaleString()} บาท
        </div>
        {isUnpaid && overdueDays > 0 && (
          <div className="mb-2 h5">
            <b className="fw-semibold">เกินกำหนด : </b>
            {`${overdueDays} วัน`}
          </div>
        )}
      </div>

      <hr />
      <div>
        <h5 className="fw-semibold text-center">สถานะการชำระเงิน</h5>
        <div className="mb-2 h5">
          <b>สถานะ : </b>
          {isPending && (
            <span className="badge bg-warning text-dark p-2">รอตรวจสอบ</span>
          )}
          {isPaid && <span className="badge bg-success p-2">ชำระแล้ว</span>}
          {isUnpaid && <span className="badge bg-danger p-2">ค้างชำระ</span>}
        </div>
      </div>


      {hasSlip && (
        <button
          className="btn btn-primary btn-sm w-100 mt-2"
          onClick={() => onViewSlip(bill)}
        >
          ดูสลิป
        </button>
      )}

      <div className="mt-3 d-flex flex-column gap-2">
        {bill.billStatus === 2 && role === 0 && (
          <button
            className="btn btn-info btn-sm fw-semibold w-100 text-white"
            onClick={() => onManage(bill)}
          >
            จัดการ
          </button>
        )}

        {isUnpaid && overdueDays > 0 && role === 0 && (
          <button
            className="btn btn-info btn-sm fw-semibold w-100 text-white"
            onClick={() => onOverdue(bill.billId, bill.room?.number ?? "-")}
          >
            แจ้งเตือน
          </button>
        )}

        {role === 0 && (
          <div className="d-flex gap-2">
            {bill.billStatus !== 1 && (
              <button
                className="btn btn-warning btn-sm w-100 fw-semibold"
                onClick={() => onEdit(bill)}
              >
                ✏️ แก้ไข
              </button>
            )}

            <button
              className="btn btn-danger btn-sm w-100 fw-semibold"
              onClick={() => onDelete(bill.billId, bill.room?.number ?? "-")}
            >
              🗑️ ลบ
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
