// src/pages/Detail/BillDetail.tsx
import { useParams } from "react-router-dom";
import BookingNav from "../../components/BookingNav";
import { useBill } from "../../hooks/Bill/useBill";
import html2pdf from "html2pdf.js";
import { useEffect, useRef } from "react";
import { useState } from "react";
import type { DormProfile } from "../../types/bill";
import { API_BASE } from "../../config";
import logo from "../../assets/SmartDorm.webp";

/* ===================== FORMAT DATE ===================== */
export const formatThai = (d: string) =>
  new Date(d).toLocaleDateString("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

/* ===================== NUMBER TO THAI BAHT ===================== */
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

const Divider = () => (
  <hr
    className="mt-3 mb-3 pt-0"
    style={{ border: "none", borderTop: "2px solid #000", opacity: 1 }}
  />
);

export default function BillDetail() {
  const { billId } = useParams<{ billId: string }>();
  const { bill, loading, error } = useBill(billId);

  const [profile, setProfile] = useState<DormProfile>({
    key: "MAIN",
    service: 0,
    waterRate: 0,
    electricRate: 0,
    overdueFinePerDay: 0,
  });

  useEffect(() => {
    fetch(`${API_BASE}/dorm-profile`)
      .then((r) => r.json())
      .then((d) =>
        setProfile({
          key: d.key ?? "MAIN",

          dormName: d.dormName ?? "",
          address: d.address ?? "",
          phone: d.phone ?? "",
          email: d.email ?? "",
          taxId: d.taxId ?? "",

          signatureUrl: d.signatureUrl ?? null,

          receiverFullName: d.receiverFullName ?? "",

          service: d.service ?? 0,
          waterRate: d.waterRate ?? 0,
          electricRate: d.electricRate ?? 0,
          overdueFinePerDay: d.overdueFinePerDay ?? 0,
        }),
      )
      .catch(() => console.warn("โหลด dorm profile ไม่สำเร็จ"));
  }, []);

  const pdfRef = useRef<HTMLDivElement>(null);

  /* ===== ตรวจว่าเปิดใน LINE ===== */
  const isLine = /Line/.test(navigator.userAgent);

  /* ===== เปิด Chrome ===== */
  const openInChrome = () => {
    window.location.href =
      "intent://" +
      window.location.href.replace(/^https?:\/\//, "") +
      "#Intent;scheme=https;package=com.android.chrome;end";
  };

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

  /* ===== PDF NAME ===== */
  const docName = bill.billStatus === 0 ? "ใบแจ้งหนี้" : "ใบเสร็จรับเงิน";
  const d = new Date(bill.month);
  const day = d.getDate();
  const month = d.toLocaleDateString("th-TH", { month: "long" });
  const year = d.getFullYear() + 543;
  const thaiDate = `${day}-${month}-${year}`;
  const room = bill.room?.number ?? "-";
  const filename = `${docName}-ห้อง${room}-${thaiDate}.pdf`;

  /* ===== EXPORT PDF ===== */
  const exportPdf = () => {
    if (!pdfRef.current) return;

    html2pdf()
      .set({
        margin: 10,
        filename: filename,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          ignoreElements: (el: {
            classList: { contains: (arg0: string) => any };
          }) => el.classList.contains("no-pdf"),
        },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      })
      .from(pdfRef.current)
      .save();
  };

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

  const today = new Date();
  const due = new Date(bill.dueDate);
  let isOverdue = false;
  let overdueDays = 0;

  if (bill.billStatus === 0 && today > due) {
    isOverdue = true;
    const diff = today.getTime() - due.getTime();
    overdueDays = Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  return (
    <>
      <BookingNav />

      <div
        className="bg-light min-vh-100 py-3 pt-3 mt-5"
        style={{ fontFamily: "Prompt, sans-serif" }}
      >
        <div className="d-flex justify-content-center no-pdf">
          <button
            className="btn btn-primary fw-bold px-5 py-2 mt-3"
            onClick={() => {
              if (isLine) {
                alert("LINE ไม่รองรับการดาวน์โหลด PDF กรุณาเปิดใน Chrome");
                openInChrome();
              } else {
                exportPdf();
              }
            }}
          >
            ดาวน์โหลด PDF
          </button>
        </div>
        <div className="container-fluid" ref={pdfRef}>
          <div className="row justify-content-center">
            <div className="col-12 col-sm-11 col-md-9 col-xl-7 col-xxl-6">
              <div
                className="card shadow-lg border-0 rounded-4 mx-auto mt-4"
                style={{
                  maxWidth: "100%",
                  width: "100%",
                }}
              >
                <div className="card-body p-3 p-md-4">
                  {/* HEADER */}
                  <div className="text-center mb-2">
                    <h3 className="fw-bold mb-1">
                      {bill.billStatus === 0
                        ? "ใบแจ้งหนี้ ( Invoice )"
                        : "ใบเสร็จรับเงิน ( Receipt )"}
                    </h3>
                    <div className="row mb-2 align-items-start">
                      <div className="col-6 text-start small text-secondary">
                        <div className="d-flex align-items-center gap-2 mb-1">
                          <img src={logo} alt="logo" width={42} height={42} />
                          <div className="fw-semibold">{profile.dormName}</div>
                        </div>

                        <div>{profile.address}</div>
                        <div>
                          โทร : {profile.phone} | อีเมล : {profile.email}
                        </div>
                        <div>เลขประจำตัวเสียภาษี : {profile.taxId}</div>
                      </div>

                      <div className="col-6 text-end">
                        <div>ประจำเดือน : {formatThai(bill.month)}</div>
                        <div>เลขที่บิล : {bill.billNumber}</div>
                        <div>วันที่ออกบิล : {formatThai(bill.billDate)}</div>
                        <div>ห้อง : {bill.room?.number ?? "-"}</div>
                        <div>พนักงาน : {bill.adminCreated?.name ?? "-"}</div>
                      </div>
                    </div>
                  </div>

                  <Divider />

                  {/* INFO */}
                  <div className="row g-2 small border rounded-3 p-3 mb-3 bg-light">
                    <div className="col-12 col-md-6">
                      <strong>Line ผู้เช่า :</strong>{" "}
                      {bill.customer?.userName ?? "-"}
                    </div>
                    <div className="col-12 col-md-6">
                      <strong>ผู้เช่า :</strong> {fullName}
                    </div>
                    {bill.billStatus === 0 && (
                      <>
                        <div className="col-6">
                          <strong>ประจำเดือน :</strong>{" "}
                          {new Date(bill.month).toLocaleDateString("th-TH", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </div>

                        <div
                          className={`col-12 fw-semibold ${isOverdue ? "text-danger" : ""}`}
                        >
                          {isOverdue ? (
                            <>
                              เกินกำหนด {overdueDays} วัน (ครบกำหนด{" "}
                              {formatThai(bill.dueDate)})
                            </>
                          ) : (
                            <>ครบกำหนดชำระ : {formatThai(bill.dueDate)}</>
                          )}
                        </div>
                        <div className="col-12">
                          <strong>สถานะ :</strong>{" "}
                          {isOverdue ? (
                            <span className="badge bg-danger">
                              เกินกำหนด {overdueDays} วัน
                            </span>
                          ) : (
                            <span className={`badge bg-${statusColor}`}>
                              {statusText}
                            </span>
                          )}
                        </div>
                      </>
                    )}
                  </div>

                  <h3 className="fw-bold text-primary text-center mb-2">
                    รายละเอียดค่าใช้จ่าย
                  </h3>

                  {bill.billStatus === 0 ? (
                    <table className="table table-sm table-bordered align-middle mb-2">
                      <thead className="table-light text-center">
                        <tr>
                          <th>#</th>
                          <th>รายการ</th>
                          <th>เลขครั้งหลัง</th>
                          <th>เลขครั้งก่อน</th>
                          <th>หน่วยที่ใช้</th>
                          <th>ราคา</th>
                        </tr>
                      </thead>
                      <tbody className="text-center">
                        <tr>
                          <td>1.</td>
                          <td>ค่าไฟฟ้า</td>
                          <td>{bill.eAfter}</td>
                          <td>{bill.eBefore}</td>
                          <td>{bill.eUnits}</td>
                          <td className="text-center">
                            {bill.electricCost.toLocaleString()}
                          </td>
                        </tr>
                        <tr>
                          <td>2.</td>
                          <td>ค่าน้ำ</td>
                          <td>{bill.wAfter}</td>
                          <td>{bill.wBefore}</td>
                          <td>{bill.wUnits}</td>
                          <td className="text-center">
                            {bill.waterCost.toLocaleString()}
                          </td>
                        </tr>
                        <tr>
                          <td>3.</td>
                          <td>ค่าเช่า</td>
                          <td colSpan={3}>-</td>
                          <td className="text-center">
                            {bill.rent.toLocaleString()}
                          </td>
                        </tr>
                        <tr>
                          <td>4.</td>
                          <td>ค่าส่วนกลาง</td>
                          <td colSpan={3}>-</td>
                          <td className="text-center">
                            {bill.service.toLocaleString()}
                          </td>
                        </tr>
                        {bill.overdueDays > 0 && (
                          <tr>
                            <td>5.</td>
                            <td>ค่าปรับ</td>
                            {bill.overdueDays > 0 ? (
                              <td colSpan={3}> {bill.overdueDays} วัน</td>
                            ) : (
                              <td colSpan={3}>-</td>
                            )}
                            <td className="text-center">
                              {bill.fine.toLocaleString()}
                            </td>
                          </tr>
                        )}
                      </tbody>
                      <tfoot className="fw-semibold bg-light">
                        <tr>
                          <td colSpan={5} className="text-end">
                            ราคาก่อนรวมภาษี VAT 7%
                          </td>
                          <td className="text-center">
                            {beforeVat.toFixed(2)}
                          </td>
                        </tr>
                        <tr>
                          <td colSpan={5} className="text-end">
                            ภาษี VAT 7%
                          </td>
                          <td className="text-center">{vat.toFixed(2)}</td>
                        </tr>
                        <tr className="table-success">
                          <td colSpan={5} className="text-end">
                            รวมทั้งหมด
                          </td>
                          <td className="text-center">
                            {bill.total.toLocaleString()}
                          </td>
                        </tr>
                        <tr>
                          <td colSpan={6} className="text-start ps-2">
                            ( {thaiText} )
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  ) : (
                    <table className="table table-sm table-bordered align-middle mb-2">
                      <thead className="table-light text-center">
                        <tr>
                          <th>#</th>
                          <th>รายการ</th>
                          <th>จำนวน</th>
                          <th>หน่วยละ</th>
                          <th>ราคา</th>
                        </tr>
                      </thead>
                      <tbody className="text-center">
                        <tr>
                          <td>1.</td>
                          <td>ค่าไฟฟ้า</td>
                          <td>{bill.eUnits}</td>
                          <td>7</td>
                          <td className="text-center">
                            {bill.electricCost.toLocaleString()}
                          </td>
                        </tr>
                        <tr>
                          <td>2.</td>
                          <td>ค่าน้ำ</td>
                          <td>{bill.wUnits}</td>
                          <td>19</td>
                          <td className="text-center">
                            {bill.waterCost.toLocaleString()}
                          </td>
                        </tr>
                        <tr>
                          <td>3.</td>
                          <td>ค่าเช่า</td>
                          <td>1</td>
                          <td>{bill.rent.toLocaleString()}</td>
                          <td className="text-center">
                            {bill.rent.toLocaleString()}
                          </td>
                        </tr>
                        <tr>
                          <td>4.</td>
                          <td>ค่าส่วนกลาง</td>
                          <td>1</td>
                          <td>{bill.service.toLocaleString()}</td>
                          <td className="text-center">
                            {bill.service.toLocaleString()}
                          </td>
                        </tr>
                        {bill.overdueDays > 0 && (
                          <tr>
                            <td>5.</td>
                            <td>ค่าปรับ</td>
                            <td>{bill.overdueDays}</td>
                            <td>50</td>
                            <td className="text-center">
                              {bill.fine.toLocaleString()}
                            </td>
                          </tr>
                        )}
                      </tbody>
                      <tfoot className="fw-semibold bg-light">
                        <tr>
                          <td colSpan={4} className="text-end">
                            ราคาก่อนรวมภาษี
                          </td>
                          <td className="text-center">
                            {beforeVat.toFixed(2)}
                          </td>
                        </tr>
                        <tr>
                          <td colSpan={4} className="text-end">
                            ภาษี 7%
                          </td>
                          <td className="text-center">{vat.toFixed(2)}</td>
                        </tr>
                        <tr className="table-success">
                          <td colSpan={4} className="text-end">
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
                  )}

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

                          {profile?.signatureUrl && (
                            <img
                              src={profile.signatureUrl}
                              alt="Signature"
                              crossOrigin="anonymous"
                              style={{ maxHeight: 100 }}
                            />
                          )}

                          <div>( {profile?.receiverFullName} )</div>

                          <div className="text-muted">
                            {bill.paidAt && formatThai(bill.paidAt)}
                          </div>
                        </div>

                        <div className="col">
                          <div className="fw-bold">ผู้จ่าย</div>

                          {bill.fullName === profile?.receiverFullName ? (
                            profile?.signatureUrl && (
                              <img
                                src={profile.signatureUrl}
                                alt="Signature"
                                crossOrigin="anonymous"
                                style={{ maxHeight: 100 }}
                              />
                            )
                          ) : (
                            <>
                              <br />
                              <div>{`${bill.cname ?? ""} ${bill.csurname ?? ""}`}</div>
                              <br />
                              <br />
                            </>
                          )}
                          <div>( {bill.fullName} )</div>

                          <div className="text-muted">
                            {bill.paidAt && formatThai(bill.paidAt)}
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
                {/* ===== DOWNLOAD PDF ===== */}
                <div className="d-flex justify-content-center no-pdf">
                  {bill.billStatus === 0 && (
                    <button
                      className="btn btn-success fw-bold w-50 py-3 mt-1 mb-5 no-pdf"
                      onClick={() =>
                        window.open(
                          `https://liff.line.me/2008099518-RGPO9wep?billId=${bill.billId}`,
                          "_blank",
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
        </div>
      </div>
    </>
  );
}
