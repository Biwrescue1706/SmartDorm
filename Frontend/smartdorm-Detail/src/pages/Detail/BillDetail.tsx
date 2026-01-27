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

/* ===================== NUMBER TO THAI BAHT ===================== */
const numberToThaiBaht = (num: number) => {
  const th = ["ศูนย์","หนึ่ง","สอง","สาม","สี่","ห้า","หก","เจ็ด","แปด","เก้า"];
  const unit = ["","สิบ","ร้อย","พัน","หมื่น","แสน","ล้าน"];

  const readInt = (n: number) => {
    let s = "";
    const str = n.toString();
    for (let i = 0; i < str.length; i++) {
      const d = parseInt(str[i]);
      const u = unit[str.length - i - 1];
      if (d === 0) continue;
      if (u === "สิบ" && d === 1) s += "สิบ";
      else if (u === "สิบ" && d === 2) s += "ยี่สิบ";
      else if (u === "" && d === 1 && str.length > 1) s += "เอ็ด";
      else s += th[d] + u;
    }
    return s;
  };

  const [i, f] = num.toFixed(2).split(".");
  let result = readInt(parseInt(i)) + "บาท";
  if (f === "00") result += "ถ้วน";
  else result += readInt(parseInt(f)) + "สตางค์";
  return result;
};

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

  const vat = bill.total * 0.07;
  const beforeVat = bill.total - vat;
  const thaiText = numberToThaiBaht(bill.total);

  return (
    <>
      <BookingNav />

      <div style={{ background: "#F2F8FA", minHeight: "100vh", fontFamily: "Prompt, sans-serif" }}>
        <div className="container shadow-lg rounded-4 p-4 mt-5" style={{ maxWidth: "650px", background: "white", border: "1px solid #e2e8f0" }}>

          {/* DOCUMENT HEADER */}
          <div className="text-center mb-2">
            <h4 className="fw-bold mb-1">
              {bill.billStatus === 0 ? "ใบแจ้งหนี้" : "ใบเสร็จรับเงิน"}
            </h4>
            <div className="small text-muted">
              47/21 ม.1 ต.บ้านสวน อ.เมืองชลบุรี จ.ชลบุรี 20000
            </div>
            {bill.billStatus === 1 && (
              <div className="small text-muted">
                โทร : 061-174-7731 | เลขประจำตัวผู้เสียภาษี : 1209000088280
              </div>
            )}
          </div>

          <hr />

          {/* META */}
          <div className="d-flex justify-content-between small mb-2">
            <div>เลขที่เอกสาร: {bill.billId}</div>
            <div>วันที่ออก: {formatThai(new Date().toISOString())}</div>
          </div>

          {/* BILL INFO */}
          <div className="bg-light p-3 rounded border mb-3">
            <p className="mb-1"><strong>Line ผู้เช่า :</strong> {bill.customer?.userName ?? "-"}</p>
            <p className="mb-1"><strong>ผู้เช่า :</strong> {fullName}</p>
            <p className="mb-1"><strong>ห้อง :</strong> {bill.room.number}</p>
            <p className="mb-1">
              <strong>ประจำเดือน :</strong>{" "}
              {new Date(bill.month).toLocaleDateString("th-TH", { year: "numeric", month: "long" })}
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
          <h6 className="fw-bold text-primary text-center">รายละเอียดค่าใช้จ่าย</h6>

          {bill.billStatus === 0 ? (
            <table className="table table-sm table-bordered text-center align-middle">
              <thead className="table-light">
                <tr>
                  <th>รายการ</th>
                  <th>มิเตอร์เดือนหลัง</th>
                  <th>มิเตอร์เดือนก่อน</th>
                  <th>จำนวนหน่วยที่ใช้</th>
                  <th>จำนวนเงิน</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>ค่าไฟฟ้า</td>
                  <td>{bill.eAfter}</td>
                  <td>{bill.eBefore}</td>
                  <td>{bill.eUnits}</td>
                  <td>{bill.electricCost.toLocaleString()}</td>
                </tr>
                <tr>
                  <td>ค่าน้ำ</td>
                  <td>{bill.wAfter}</td>
                  <td>{bill.wBefore}</td>
                  <td>{bill.wUnits}</td>
                  <td>{bill.waterCost.toLocaleString()}</td>
                </tr>
                <tr>
                  <td>ค่าเช่า</td>
                  <td colSpan={3}>-</td>
                  <td>{bill.rent.toLocaleString()}</td>
                </tr>
                <tr>
                  <td>ค่าส่วนกลาง</td>
                  <td colSpan={3}>-</td>
                  <td>{bill.service.toLocaleString()}</td>
                </tr>
                <tr>
                  <td>ค่าปรับ</td>
                  {bill.overdueDays > 0 ? (
                    <td colSpan={3}>ปรับ {bill.overdueDays} วัน</td>
                  ) : (
                    <td colSpan={3}>-</td>
                  )}
                  <td>{bill.fine.toLocaleString()}</td>
                </tr>
              </tbody>
              <tfoot className="fw-bold">
                <tr>
                  <td colSpan={4} className="text-end">ราคาก่อนรวมภาษี</td>
                  <td className="text-end">{beforeVat.toFixed(2)}</td>
                </tr>
                <tr>
                  <td colSpan={4} className="text-end">ภาษี 7%</td>
                  <td className="text-end">{vat.toFixed(2)}</td>
                </tr>
                <tr className="table-success">
                  <td colSpan={4} className="text-end">รวมทั้งหมด</td>
                  <td className="text-primary fs-5">{bill.total.toLocaleString()}</td>
                </tr>
                <tr>
                  <td colSpan={5} className="text-start ps-3">({thaiText})</td>
                </tr>
              </tfoot>
            </table>
          ) : (
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
                <tr>
                  <td>ค่าไฟฟ้า</td>
                  <td>{bill.eUnits}</td>
                  <td>7</td>
                  <td>{bill.electricCost.toLocaleString()}</td>
                </tr>
                <tr>
                  <td>ค่าน้ำ</td>
                  <td>{bill.wUnits}</td>
                  <td>19</td>
                  <td>{bill.waterCost.toLocaleString()}</td>
                </tr>
                <tr>
                  <td>ค่าเช่า</td>
                  <td>1</td>
                  <td>{bill.rent.toLocaleString()}</td>
                  <td>{bill.rent.toLocaleString()}</td>
                </tr>
                <tr>
                  <td>ค่าส่วนกลาง</td>
                  <td>1</td>
                  <td>{bill.service.toLocaleString()}</td>
                  <td>{bill.service.toLocaleString()}</td>
                </tr>
                {bill.overdueDays > 0 && (
                  <tr>
                    <td>ค่าปรับ</td>
                    <td>{bill.overdueDays}</td>
                    <td>50</td>
                    <td>{bill.fine.toLocaleString()}</td>
                  </tr>
                )}
              </tbody>
              <tfoot className="fw-bold">
                <tr>
                  <td colSpan={3} className="text-end">ราคาก่อนรวมภาษี</td>
                  <td className="text-end">{beforeVat.toFixed(2)}</td>
                </tr>
                <tr>
                  <td colSpan={3} className="text-end">ภาษี 7%</td>
                  <td className="text-end">{vat.toFixed(2)}</td>
                </tr>
                <tr className="table-success">
                  <td colSpan={3} className="text-end">รวมทั้งหมด</td>
                  <td className="text-primary fs-5 text-end">{bill.total.toLocaleString()}</td>
                </tr>
                <tr>
                  <td colSpan={4} className="text-start ps-3">({thaiText})</td>
                </tr>
              </tfoot>
            </table>
          )}

          {/* PAYMENT INFO (เพิ่มใหม่) */}
          {bill.billStatus === 1 && (
            <div className="border rounded-3 p-3 mt-3">
              <div className="fw-bold mb-2 text-center">
                ข้อมูลการชำระเงิน / Payment Information
              </div>
              <div className="d-flex justify-content-between">
                <div>วิธีการชำระ :</div>
                <div>โอนเงิน / Transfer</div>
              </div>
              <div className="d-flex justify-content-between">
                <div>ยอดที่ชำระ :</div>
                <div>{bill.total.toLocaleString()} บาท</div>
              </div>
              <div className="d-flex justify-content-between">
                <div>วันที่ชำระ :</div>
                <div>{bill.paidAt && formatThai(bill.paidAt)}</div>
              </div>
            </div>
          )}

          {/* SIGNATURE เดิม (ไม่ตัดออก) */}
          {bill.billStatus === 1 && (
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
          )}

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