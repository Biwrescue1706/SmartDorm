import { useParams } from "react-router-dom";
import BookingNav from "../../components/BookingNav";
import { useBill } from "../../hooks/Bill/useBill";

/* ===================== FORMAT DATE ===================== */
export const formatThai = (d: string) =>
  new Date(d).toLocaleDateString("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

export default function BillDetail() {
  const { billId } = useParams<{ billId: string }>();
  const { bill, loading, error } = useBill(billId);

  if (loading)
    return (
      <>
        <BookingNav />
        <div className="vh-100 d-flex justify-content-center align-items-center">
          กำลังโหลด...
        </div>
      </>
    );

  if (error || !bill)
    return (
      <>
        <BookingNav />
        <div className="vh-100 d-flex justify-content-center align-items-center text-danger fw-bold">
          {error || "ไม่พบบิลนี้"}
        </div>
      </>
    );

  const fullName = bill.booking?.fullName || bill.customer?.userName || "-";

  const statusText =
    bill.billStatus === 1
      ? "ชำระเงินแล้ว"
      : bill.billStatus === 2
      ? "รอการตรวจสอบ"
      : "รอการชำระ";

  const statusColor =
    bill.billStatus === 1
      ? "success"
      : bill.billStatus === 2
      ? "info"
      : "warning";

  const isInvoice = bill.billStatus === 0;
  const titleText = isInvoice ? "ใบแจ้งหนี้" : "ใบเสร็จรับเงิน";

  const rows = [
    {
      name: "ค่าไฟฟ้า",
      qty: bill.eUnits,
      unit: 7,
      price: bill.electricCost,
    },
    {
      name: "ค่าน้ำ",
      qty: bill.wUnits,
      unit: 19,
      price: bill.waterCost,
    },
    {
      name: "ค่าเช่า",
      qty: 1,
      unit: bill.rent,
      price: bill.rent,
    },
    {
      name: "ค่าส่วนกลาง",
      qty: 1,
      unit: bill.service,
      price: bill.service,
    },
    ...(bill.overdueDays > 0
      ? [
          {
            name: "ค่าปรับ",
            qty: bill.overdueDays,
            unit: 50,
            price: bill.fine,
          },
        ]
      : []),
  ];

  return (
    <>
      <BookingNav />

      <div
        style={{
          background: "#F2F8FA",
          minHeight: "100vh",
          fontFamily: "Prompt, sans-serif",
        }}
      >
        <div
          className="container shadow-lg rounded-4 p-4 mt-5"
          style={{
            maxWidth: "650px",
            background: "white",
            border: "1px solid #e2e8f0",
          }}
        >
          {/* HEADER */}
          <div className="text-center my-2">
            <h4 className="fw-bold mb-1">{titleText}</h4>
            <div className="text-muted">
              47/21 ม.1 ต.บ้านสวน อ.เมืองชลบุรี
            </div>
          </div>

          {/* BILL INFO */}
          <div className="bg-light p-3 rounded border mb-3 mt-2">
            <p className="mb-1">
              <strong>Line ผู้เช่า :</strong> {bill.customer?.userName ?? "-"}
            </p>
            <p className="mb-1">
              <strong>ผู้เช่า :</strong> {fullName}
            </p>
            <p className="mb-1">
              <strong>ห้อง :</strong> {bill.room.number}
            </p>
            <p className="mb-1">
              <strong>ประจำเดือน :</strong>{" "}
              {new Date(bill.month).toLocaleDateString("th-TH", {
                year: "numeric",
                month: "long",
              })}
            </p>

            {bill.billStatus === 0 && (
              <p className="text-danger fw-semibold mb-1">
                <strong>ครบกำหนดชำระ :</strong> {formatThai(bill.dueDate)}
              </p>
            )}

            <p className="mb-1">
              <strong>สถานะ :</strong>{" "}
              <span className={`badge bg-${statusColor}`}>{statusText}</span>
            </p>
          </div>

          {/* COST TABLE */}
          <table className="table table-sm table-bordered text-center align-middle">
            <thead className="table-light">
              <tr>
                <th>รายการ</th>
                <th>จำนวน</th>
                <th>หน่วยละ</th>
                <th>ราคา</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i}>
                  <td>{r.name}</td>
                  <td>{r.qty}</td>
                  <td>{r.unit.toLocaleString()}</td>
                  <td>{r.price.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="fw-bold">
              <tr className="table-success">
                <td colSpan={3} className="text-end">
                  รวมทั้งหมด
                </td>
                <td className="text-primary fs-5 text-end">
                  {bill.total.toLocaleString()}
                </td>
              </tr>
            </tfoot>
          </table>

          {/* SIGNATURE */}
          <div className="row mt-4 text-center">
            <div className="col">
              <div className="fw-bold">ผู้รับ</div>
              <div>ภูวณัฐ พาหะละ</div>
              <div>( นายภูวณัฐ พาหะละ )</div>
              <div className="text-muted">
                {bill.paidAt && formatThai(bill.paidAt)}
              </div>
            </div>
            <div className="col">
              <div className="fw-bold">ผู้จ่าย</div>
              <div>{`${bill.cname ?? ""} ${bill.csurname ?? ""}`}</div>
              <div>({bill.fullName})</div>
              <div className="text-muted">
                {bill.paidAt && formatThai(bill.paidAt)}
              </div>
            </div>
          </div>

          {/* PAY BUTTON */}
          {bill.billStatus === 0 && (
            <button
              className="btn fw-bold w-100 py-3 mt-3"
              style={{
                borderRadius: "14px",
                background: "linear-gradient(135deg,#27C96D,#0AA04F)",
                color: "white",
                fontSize: "1.15rem",
              }}
              onClick={() =>
                window.open(
                  `https://liff.line.me/2008099518-RGPO9wep?billId=${bill.billId}`,
                  "_blank"
                )
              }
            >
              ชำระเงินผ่าน LINE
            </button>
          )}
        </div>
      </div>
    </>
  );
}