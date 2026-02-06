// src/components/AllBills/AllBillsCard.tsx
import type { Bill } from "../../types/Bill";
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

const Divider = () => (
  <hr
    className=" my-3  mb-3 mt-3"
    style={{
      border: "none",
      borderTop: "2px solid #000000",
      opacity: 1,
      margin: "10px 0",
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
  const isPaid = bill.billStatus === 1;
  const isPending = bill.billStatus === 2;
  const isUnpaid = bill.billStatus === 0;
  const hasSlip = bill.payment?.slipUrl || bill.slipUrl;
  const overdueDays = bill.overdueDays ?? 0;
  const navigate = useNavigate();
  const getOverdueDays = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);

    // ตัดเวลาออก ให้เหลือแค่วัน ป้องกัน timezone เพี้ยน
    today.setHours(0, 0, 0, 0);
    due.setHours(0, 0, 0, 0);

    const diff = today.getTime() - due.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    return days > 0 ? days : 0;
  };

  const overdueDayss = getOverdueDays(bill.dueDate);

  return (
    <div
      className="p-3 shadow-sm rounded-4 bg-white"
      style={{
        border: "2px solid #000", // 👈 กรอบดำ
        borderLeft: isPaid
          ? "6px solid #2ecc71"
          : isPending
            ? "6px solid #f1c40f"
            : "6px solid #e74c3c",
      }}
    >
      <div className="mb-2 mt-1 text-center text-black justify-content-center">
        <div className="mb-2 mt-1">
          <div className="text-primary h5">
            <b>{bill.room?.number}</b>
          </div>
        </div>
        <div className="mb-3 mt-1">
          <div className="fw-bold text-black h6">รอบบิล</div>
          <div className="fw-bold h6 text-primary">
            {new Date(bill.month).toLocaleDateString("th-TH", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </div>
        </div>
      </div>

      <div className="mb-2 mt-1 text-black">
        <Divider />
        <div className="mb-2 mt-3">
          <div className="fw-bold h5 text-center"> รายละเอียดผู้เช่า</div>
        </div>

        <div className="mb-2 mt-3">
          <div className="fw-bold h6 ">ผู้เช่า : </div>
          <div className="fw-bold h6 text-primary text-center">
            {bill.fullName || " "}
          </div>
        </div>

        <div className="mb-2 mt-3">
          <div className="fw-bold h6 ">LINE : </div>
          <div className="fw-bold h6 text-primary text-center">
            {bill.customer?.userName || " "}
          </div>
        </div>
        <div className="mb-2 mt-3">
          <div className="fw-bold h6 ">เบอร์ : </div>
          <div className="fw-bold h6 text-primary text-center">
            {bill.cphone || " "}
          </div>
        </div>
      </div>

      <div className="mb-2 mt-1 text-black">
        <Divider />
        <div className="mb-2 mt-3">
          <div className="fw-bold h5 text-center"> รายละเอียดบิล</div>
        </div>

        <div className="mb-2 mt-3">
          <div className="fw-bold h6 ">วันที่ออกบิล :</div>
          <div className="fw-bold h6 text-primary text-center">
            {new Date(bill.createdAt).toLocaleDateString("th-TH", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </div>
        </div>

        {!isPaid && !isPending && (
          <div className="mb-2 mt-3">
            <div className="fw-bold h6 ">กำหนดชำระ : </div>
            <div className="fw-bold h6 text-primary text-center">
              {new Date(bill.dueDate).toLocaleDateString("th-TH", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </div>
          </div>
        )}

        <div className="mb-2 mt-3">
          <div className="fw-bold h5 text-center ">ยอดรวม : </div>
          <div className="fw-bold h5 text-primary text-center">
            {bill.total.toLocaleString()} บาท
          </div>
        </div>
      </div>

      <div className="mb-2 mt-1 text-black">
        <Divider />
        <div className="mb-2 mt-3">
          <div className="fw-bold h5 text-center ">สถานะการชำระเงิน</div>
          <div className="fw-bold h6 text-primary text-center"></div>
        </div>

        <div className="mb-2 mt-3">
          {/* <div className="fw-bold h6 ">สถานะ : </div> */}
          <div className="fw-bold h6 text-primary text-center">
            {isPending ? (
              <span className="badge bg-warning text-dark p-2">รอตรวจสอบ</span>
            ) : isPaid ? (
              <span className="badge bg-success p-2">ชำระแล้ว</span>
            ) : overdueDays > 0 ? (
              <span className="badge bg-danger p-2">เกินกำหนด</span>
            ) : (
              isUnpaid && <span className="badge bg-danger p-2">ค้างชำระ</span>
            )}
          </div>

          {overdueDays > 0 && (
            <div className="mb-2 mt-3">
              <div className="fw-bold h5 text-center text-black">เกินกำหนด</div>
              <div className="fw-bold h5 text-primary text-center">
                {overdueDayss} วัน
              </div>
            </div>
          )}
        </div>
        <Divider />
      </div>

      <div className="mb-2 mt-1">
        {hasSlip && (
          <>
            <button
              className="btn btn-primary btn-sm w-50 mt-2"
              onClick={() => onViewSlip(bill)}
            >
              ดูสลิป
            </button>
            <Divider />
          </>
        )}
      </div>

      <div className="mt-3 d-flex flex-column gap-2">
        {bill.billStatus === 2 && role === 0 && (
          <>
            <button
              className="btn btn-info btn-sm fw-semibold w-50 text-white"
              onClick={() => onManage(bill)}
            >
              จัดการ
            </button>
            <Divider />
          </>
        )}

        <div className="d-flex gap-2">
          <button
            className="btn btn-success btn-sm fw-semibold w-100 text-white"
            onClick={() => navigate(`/bills/${bill.billId}`)}
          >
            ดูรายละเอียดบิล
          </button>
          {isUnpaid && overdueDays > 0 && role === 0 && (
            <>
              {/* <Divider /> */}
              <button
                className="btn btn-info btn-sm fw-semibold w-50 text-white"
                onClick={() => onOverdue(bill.billId, bill.room?.number ?? "-")}
              >
                แจ้งเตือน
              </button>
              <Divider />
            </>
          )}
        </div>

        {role === 0 && (
          <div className="d-flex gap-2">
            {bill.billStatus !== 1 && (
              <button
                className="btn btn-warning btn-sm w-50 fw-semibold"
                onClick={() => onEdit(bill)}
              >
                ✏️
              </button>
            )}

            <button
              className="btn btn-danger btn-sm w-50 fw-semibold"
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
