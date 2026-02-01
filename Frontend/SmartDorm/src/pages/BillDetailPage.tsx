// src/pages/Bills/BillDetailPage.tsx
import { useParams, useNavigate } from "react-router-dom";
import Nav from "../components/Nav";
import { useAuth } from "../hooks/useAuth";
import { usePendingBookings } from "../hooks/ManageRooms/usePendingBookings";
import { usePendingCheckouts } from "../hooks/ManageRooms/usePendingCheckouts";
import { useBillDetail } from "../hooks/useBillDetail";
import html2pdf from "html2pdf.js";
import { useRef } from "react";

// SCB THEME
const SCB_PURPLE = "#4A0080";
const BG_SOFT = "#F8F5FC";

export const formatThai = (d: string) =>
  new Date(d).toLocaleDateString("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

const formatThaiDate = (d?: string | null) => {
  if (!d) return "-";
  const date = new Date(d);
  return isNaN(date.getTime())
    ? "-"
    : date.toLocaleDateString("th-TH", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
};

const numberToThaiBaht = (num: number) => {
  const th = [
    "ศูนย์",
    "หนึ่ง",
    "สอง",
    "สาม",
    "สี่",
    "ห้า",
    "หก",
    "เจ็ด",
    "แปด",
    "เก้า",
  ];
  const unit = ["", "สิบ", "ร้อย", "พัน", "หมื่น", "แสน", "ล้าน"];

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

const statusText = (s: number) => {
  if (s === 0) return "ยังไม่ชำระ";
  if (s === 1) return "ชำระแล้ว";
  if (s === 2) return "กำลังตรวจสอบ";
  return "-";
};

const Divider = () => (
  <hr
    className="mt-3 mb-3 pt-0"
    style={{ border: "none", borderTop: "2px solid #000", opacity: 1 }}
  />
);

export default function BillDetailPage() {
  const { billId } = useParams();
  const navigate = useNavigate();
  const { handleLogout, role, adminName, adminUsername } = useAuth();
  const pendingBookings = usePendingBookings();
  const pendingCheckouts = usePendingCheckouts();
  const pdfRef = useRef<HTMLDivElement>(null);

  // ✅ เรียก hook ก่อน
  const { bill, loading } = useBillDetail(billId);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border" style={{ color: SCB_PURPLE }} />
      </div>
    );
  }

  if (!bill) {
    return (
      <div className="text-center mt-5">
        <h5>ไม่พบข้อมูลบิล</h5>
        <button className="btn btn-secondary mt-3" onClick={() => navigate(-1)}>
          กลับ
        </button>
      </div>
    );
  }

  // ✅ คำนวณหลังจากมี bill แน่นอน
  const vat = bill.total * 0.07;
  const beforeVat = bill.total - vat;
  const thaiText = numberToThaiBaht(bill.total);

  const handleExportPDF = () => {
    if (!pdfRef.current) return;

    const docName = bill.billStatus === 0 ? "ใบแจ้งหนี้" : "ใบเสร็จรับเงิน";

    const d = new Date(bill.month);

    const day = d.getDate();
    const month = d.toLocaleDateString("th-TH", { month: "long" });
    const year = d.getFullYear() + 543;

    const thaiDate = `${day}-${month}-${year}`;

    const room = bill.room?.number ?? "-";

    const filename = `${docName}-ห้อง${room}-${thaiDate}.pdf`;

    const opt = {
      margin: 5,
      filename,
      image: { type: "jpeg" as const, quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: {
        unit: "mm" as const,
        format: "a4" as const,
        orientation: "portrait" as const,
      },
    };

    html2pdf().set(opt).from(pdfRef.current).save();
  };

  return (
    <div
      className="d-flex min-vh-100 mx-2 mt-0 mb-4"
      style={{ fontFamily: "Sarabun, sans-serif" }}
    >
      <Nav
        onLogout={handleLogout}
        role={role}
        adminName={adminName}
        adminUsername={adminUsername}
        pendingBookings={pendingBookings}
        pendingCheckouts={pendingCheckouts}
      />

      <main
        className="main-content flex-grow-1 px-2 py-3 mt-6 mt-lg-7"
        style={{ paddingLeft: "20px", paddingRight: "20px" }}
      >
        <div
          className="mx-auto"
          style={{ background: BG_SOFT, borderRadius: 20, maxWidth: "1400px" }}
        >
          <div className="d-flex justify-content-center align-items-center mb-3 gap-3">
            <button className="btn btn-secondary" onClick={() => navigate(-1)}>
              ← กลับ
            </button>

            <button className="btn btn-primary" onClick={handleExportPDF}>
              📄 ออก PDF
            </button>

            <h3 className="fw-bold m-0" style={{ color: SCB_PURPLE }}>
              รายละเอียดบิล
            </h3>
          </div>

          <div ref={pdfRef}>
            <div className="card shadow-sm border-0">
              <div className="card-body">
                <div className="text-center mb-2">
                  <h3 className="fw-bold mb-1">
                    {bill.billStatus === 0 ? "ใบแจ้งหนี้" : "ใบเสร็จรับเงิน"}
                  </h3>
                  <div className="small text-secondary">
                    47/21 ม.1 ต.บ้านสวน อ.เมืองชลบุรี จ.ชลบุรี 20000
                  </div>
                  <div className="small text-secondary">
                    โทร : 061-174-7731 | เลขผู้เสียภาษี : 1-2090-00088-28-0
                  </div>
                </div>

                <div className="d-flex justify-content-between small mb-2">
                  <div>เลขที่เอกสาร: {bill.billId}</div>
                  <div>วันที่ออก: {formatThai(bill.createdAt)}</div>
                </div>

                <Divider />

                <div className="row g-2 mb-3">
                  <div className="col-md-4">
                    <b>ชื่อ - นามสกุล :</b> {bill.fullName || "-"}
                  </div>

                  <div className="col-md-4">
                    <b>รอบบิล:</b> {formatThaiDate(bill.month)}
                  </div>

                  <div className="col-md-4">
                    <b>ห้อง {bill.room?.number ?? "-"}</b>
                  </div>

                  {bill.billStatus === 0 && (
                    <div className="col-md-4">
                      <b>ครบกำหนด:</b> {formatThaiDate(bill.dueDate)}
                    </div>
                  )}

                  {bill.billStatus !== 1 && (
                    <div className="col-md-4">
                      <b>สถานะ:</b> {statusText(bill.billStatus)}
                    </div>
                  )}
                </div>

                <Divider />
                <div>
                  {bill.billStatus === 0 ? (
                    <table
                      className="table table-sm table-striped align-middle text-center"
                      style={{
                        width: "100%",
                        backgroundColor: "#ffffff",
                        borderRadius: "10px",
                      }}
                    >
                      <thead className="table-dark">
                        <tr>
                          <th style={{ width: "35%" }}>รายการ</th>
                          <th style={{ width: "15%" }}>เลขมาตราครั้งหลัง</th>
                          <th style={{ width: "15%" }}>เลขมาตราครั้งก่อน</th>
                          <th style={{ width: "15%" }}>จำนวนที่ใช้</th>
                          <th style={{ width: "20%" }}>เป็นเงิน</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>ค่าไฟฟ้า</td>
                          <td>{bill.eAfter}</td>
                          <td>{bill.eBefore}</td>
                          <td>{bill.eUnits}</td>
                          <td className="text-center">
                            {bill.electricCost.toLocaleString()}
                          </td>
                        </tr>

                        <tr>
                          <td>ค่าน้ำประปา</td>
                          <td>{bill.wAfter}</td>
                          <td>{bill.wBefore}</td>
                          <td>{bill.wUnits}</td>
                          <td className="text-center">
                            {bill.waterCost.toLocaleString()}
                          </td>
                        </tr>

                        <tr>
                          <td>ค่าส่วนกลาง</td>
                          <td colSpan={3}>-</td>
                          <td className="text-center">
                            {bill.service.toLocaleString()}
                          </td>
                        </tr>

                        <tr>
                          <td>ค่าเช่าห้อง</td>
                          <td colSpan={3}>-</td>
                          <td className="text-center">
                            {bill.rent.toLocaleString()}
                          </td>
                        </tr>

                        {bill.overdueDays !== 0 && (
                          <tr>
                            <td>ค่าปรับ</td>
                            {bill.overdueDays && bill.overdueDays !== 0 ? (
                              <td colSpan={3}>ปรับ {bill.overdueDays} วัน</td>
                            ) : (
                              <td colSpan={3}>-</td>
                            )}
                          </tr>
                        )}
                      </tbody>
                      <tfoot className="fw-semibold bg-light">
                        <tr>
                          <td colSpan={4} className="text-center">
                            ราคาก่อนรวมภาษี
                          </td>
                          <td className="text-center">
                            {beforeVat.toLocaleString()}
                          </td>
                        </tr>
                        <tr>
                          <td colSpan={4} className="text-center">
                            ภาษี 7%
                          </td>
                          <td className="text-center">
                            {vat.toLocaleString()}
                          </td>
                        </tr>
                        <tr className="table-success">
                          <td colSpan={4} className="text-center">
                            รวมทั้งหมด
                          </td>
                          <td className="text-center">
                            {bill.total.toLocaleString()}
                          </td>
                        </tr>
                        <tr>
                          <td colSpan={5} className="text-start ps-2">
                            ( {thaiText} )
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  ) : (
                    <table
                      className="table table-sm table-striped align-middle text-center"
                      style={{
                        width: "100%",
                        backgroundColor: "#ffffff",
                        borderRadius: "10px",
                      }}
                    >
                      <thead className="table-dark">
                        <tr>
                          <th scope="col" style={{ width: "5%" }}>
                            รายการ
                          </th>
                          <th scope="col" style={{ width: "5%" }}>
                            จำนวน
                          </th>
                          <th scope="col" style={{ width: "5%" }}>
                            หน่วยละ
                          </th>
                          <th scope="col" style={{ width: "5%" }}>
                            ราคา
                          </th>
                        </tr>
                      </thead>
                      <tbody className="text-center">
                        <tr>
                          <td>ค่าไฟฟ้า</td>
                          <td>{bill.eUnits}</td>
                          <td>7</td>
                          <td className="text-center">
                            {bill.electricCost.toLocaleString()}
                          </td>
                        </tr>
                        <tr>
                          <td>ค่าน้ำ</td>
                          <td>{bill.wUnits}</td>
                          <td>19</td>
                          <td className="text-center">
                            {bill.waterCost.toLocaleString()}
                          </td>
                        </tr>
                        <tr>
                          <td>ค่าเช่า</td>
                          <td>1</td>
                          <td>{bill.rent.toLocaleString()}</td>
                          <td className="text-center">
                            {bill.rent.toLocaleString()}
                          </td>
                        </tr>
                        <tr>
                          <td>ค่าส่วนกลาง</td>
                          <td>1</td>
                          <td>{bill.service.toLocaleString()}</td>
                          <td className="text-center">
                            {bill.service.toLocaleString()}
                          </td>
                        </tr>
                        {(bill.overdueDays ?? 0) > 0 && (
                          <tr>
                            <td>ค่าปรับ</td>
                            <td>{bill.overdueDays}</td>
                            <td>50</td>
                            <td className="text-center">
                              {(bill.fine ?? 0).toLocaleString()}
                            </td>
                          </tr>
                        )}
                      </tbody>
                      <tfoot className="fw-semibold bg-light">
                        <tr>
                          <td colSpan={3} className="text-center">
                            ราคาก่อนรวมภาษี
                          </td>
                          <td className="text-center">
                            {beforeVat.toLocaleString()}
                          </td>
                        </tr>
                        <tr>
                          <td colSpan={3} className="text-center">
                            ภาษี 7%
                          </td>
                          <td className="text-center">
                            {vat.toLocaleString()}
                          </td>
                        </tr>
                        <tr className="table-success">
                          <td colSpan={3} className="text-center">
                            รวมทั้งหมด
                          </td>
                          <td className="text-center">
                            {bill.total.toLocaleString()}
                          </td>
                        </tr>
                        <tr>
                          <td colSpan={4} className="text-center ps-2">
                            ( {thaiText} )
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  )}

                  {bill.billStatus === 1 && bill.paidAt && (
                    <>
                      <hr />

                      {bill.billStatus === 1 && (
                        <>
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
                                <span>
                                  {bill.paidAt && formatThai(bill.paidAt)}
                                </span>
                              </div>
                            </div>
                          </div>

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
                        </>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
