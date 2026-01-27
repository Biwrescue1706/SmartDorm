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

      <div className="bg-light min-vh-100 py-3 pt-5 mt-5" style={{ fontFamily: "Prompt, sans-serif" }}>
        <div className="container">
          <div className="card shadow-lg border-0 rounded-4 mx-auto mt-5" style={{ maxWidth: 820 }}>
            <div className="card-body p-3 p-md-4">

              {/* DOCUMENT HEADER */}
              <div className="text-center mb-2">
                <h4 className="fw-bold mb-1">
                  {bill.billStatus === 0 ? "ใบแจ้งหนี้" : "ใบเสร็จรับเงิน"}
                </h4>
                <div className="small text-secondary">
                  47/21 ม.1 ต.บ้านสวน อ.เมืองชลบุรี จ.ชลบุรี 20000
                </div>
                {bill.billStatus === 1 && (
                  <div className="small text-secondary">
                    โทร : 061-174-7731 | เลขประจำตัวผู้เสียภาษี : 1209000088280
                  </div>
                )}
              </div>

              <hr className="my-2" />

              {/* META */}
              <div className="d-flex justify-content-between small mb-2">
                <div>เลขที่เอกสาร: {bill.billId}</div>
                <div>วันที่ออก: {formatThai(new Date().toISOString())}</div>
              </div>

              {/* BILL INFO */}
              <div className="row g-2 small border rounded-3 p-3 mb-3 bg-light">
                <div className="col-12 col-md-6">
                  <strong>Line ผู้เช่า :</strong> {bill.customer?.userName ?? "-"}
                </div>
                <div className="col-12 col-md-6">
                  <strong>ผู้เช่า :</strong> {fullName}
                </div>
                <div className="col-6">
                  <strong>ห้อง :</strong> {bill.room.number}
                </div>
                <div className="col-6">
                  <strong>ประจำเดือน :</strong>{" "}
                  {new Date(bill.month).toLocaleDateString("th-TH", {
                    year: "numeric",
                    month: "long",
                  })}
                </div>

                {bill.billStatus === 0 && (
                  <div className="col-12 text-danger fw-semibold">
                    ครบกำหนดชำระ : {formatThai(bill.dueDate)}
                  </div>
                )}

                <div className="col-12">
                  <strong>สถานะ :</strong>{" "}
                  <span className={`badge bg-${statusColor}`}>{statusText}</span>
                </div>
              </div>

              {/* COST TABLE */}
              <h6 className="fw-bold text-primary text-center mb-2">
                รายละเอียดค่าใช้จ่าย
              </h6>

              {bill.billStatus === 0 ? (
                <table className="table table-sm table-bordered align-middle mb-2">
                  <thead className="table-light text-center">
                    <tr>
                      <th>รายการ</th>
                      <th>มิเตอร์เดือนหลัง</th>
                      <th>มิเตอร์เดือนก่อน</th>
                      <th>จำนวนหน่วยที่ใช้</th>
                      <th>จำนวนเงิน</th>
                    </tr>
                  </thead>
                  <tbody className="text-center">
                    <tr>
                      <td>ค่าไฟฟ้า</td>
                      <td>{bill.eAfter}</td>
                      <td>{bill.eBefore}</td>
                      <td>{bill.eUnits}</td>
                      <td className="text-end">{bill.electricCost.toLocaleString()}</td>
                    </tr>
                    <tr>
                      <td>ค่าน้ำ</td>
                      <td>{bill.wAfter}</td>
                      <td>{bill.wBefore}</td>
                      <td>{bill.wUnits}</td>
                      <td className="text-end">{bill.waterCost.toLocaleString()}</td>
                    </tr>
                    <tr>
                      <td>ค่าเช่า</td>
                      <td colSpan={3}>-</td>
                      <td className="text-end">{bill.rent.toLocaleString()}</td>
                    </tr>
                    <tr>
                      <td>ค่าส่วนกลาง</td>
                      <td colSpan={3}>-</td>
                      <td className="text-end">{bill.service.toLocaleString()}</td>
                    </tr>
                    <tr>
                      <td>ค่าปรับ</td>
                      {bill.overdueDays > 0 ? (
                        <td colSpan={3}>ปรับ {bill.overdueDays} วัน</td>
                      ) : (
                        <td colSpan={3}>-</td>
                      )}
                      <td className="text-end">{bill.fine.toLocaleString()}</td>
                    </tr>
                  </tbody>
                  <tfoot className="fw-semibold bg-light">
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
                      <td className="text-end fs-6">{bill.total.toLocaleString()}</td>
                    </tr>
                    <tr>
                      <td colSpan={5} className="text-start ps-2">
                        ({thaiText})
                      </td>
                    </tr>
                  </tfoot>
                </table>
              ) : (
                <table className="table table-sm table-bordered align-middle mb-2">
                  <thead className="table-light text-center">
                    <tr>
                      <th>รายการ</th>
                      <th>จำนวน</th>
                      <th>หน่วยละ</th>
                      <th>ราคา</th>
                    </tr>
                  </thead>
                  <tbody className="text-center">
                    <tr>
                      <td>ค่าไฟฟ้า</td>
                      <td>{bill.eUnits}</td>
                      <td>7</td>
                      <td className="text-end">{bill.electricCost.toLocaleString()}</td>
                    </tr>
                    <tr>
                      <td>ค่าน้ำ</td>
                      <td>{bill.wUnits}</td>
                      <td>19</td>
                      <td className="text-end">{bill.waterCost.toLocaleString()}</td>
                    </tr>
                    <tr>
                      <td>ค่าเช่า</td>
                      <td>1</td>
                      <td>{bill.rent.toLocaleString()}</td>
                      <td className="text-end">{bill.rent.toLocaleString()}</td>
                    </tr>
                    <tr>
                      <td>ค่าส่วนกลาง</td>
                      <td>1</td>
                      <td>{bill.service.toLocaleString()}</td>
                      <td className="text-end">{bill.service.toLocaleString()}</td>
                    </tr>
                    {bill.overdueDays > 0 && (
                      <tr>
                        <td>ค่าปรับ</td>
                        <td>{bill.overdueDays}</td>
                        <td>50</td>
                        <td className="text-end">{bill.fine.toLocaleString()}</td>
                      </tr>
                    )}
                  </tbody>
                  <tfoot className="fw-semibold bg-light">
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
                      <td className="text-end fs-6">{bill.total.toLocaleString()}</td>
                    </tr>
                    <tr>
                      <td colSpan={4} className="text-start ps-2">
                        ({thaiText})
                      </td>
                    </tr>
                  </tfoot>
                </table>
              )}

              {/* PAYMENT INFO */}
              {bill.billStatus === 1 && (
                <div className="card border mt-3">
                  <div className="card-header text-center fw-bold py-2">
                    ข้อมูลการชำระเงิน / Payment Information
                  </div>
                  <div className="card-body small">
                    <div className="d-flex justify-content-between">
                      <span>วิธีการชำระ :</span>
                      <span>โอนเงิน / Transfer</span>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span>ยอดที่ชำระ :</span>
                      <span>{bill.total.toLocaleString()} บาท</span>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span>วันที่ชำระ :</span>
                      <span>{bill.paidAt && formatThai(bill.paidAt)}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* SIGNATURE (เดิม) */}
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
                  className="btn btn-success fw-bold w-100 py-3 mt-3"
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
        </div>
      </div>
    </>
  );
}