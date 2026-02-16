import { useParams, useNavigate } from "react-router-dom";
import { useRef, useState, useEffect } from "react";
import { API_BASE } from "../config";
import type { DormProfile } from "../types/All";

import Nav from "../components/Nav";
import BillTables from "../components/BillTables";
import BillPayment from "../components/BillPayment";

import { useAuth } from "../hooks/useAuth";
import { usePendingBookings } from "../hooks/ManageRooms/usePendingBookings";
import { usePendingCheckouts } from "../hooks/ManageRooms/usePendingCheckouts";
import { useBillDetail } from "../hooks/useBillDetail";
import { useExportBillPDF } from "../hooks/useExportBillPDF";

import {
  formatThai,
  formatThaiDate,
  numberToThaiBaht,
} from "../utils/billUtils";

const SCB_PURPLE = "#4A0080";
const BG_SOFT = "#F8F5FC";

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

  const { bill, loading } = useBillDetail(billId);

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
          service: d.service ?? 0,
          waterRate: d.waterRate ?? 0,
          electricRate: d.electricRate ?? 0,
          overdueFinePerDay: d.overdueFinePerDay ?? 0,
          dormName: d.dormName,
          address: d.address,
          phone: d.phone,
          email: d.email,
          taxId: d.taxId,
        })
      )
      .catch(() => console.warn("โหลด dorm profile ไม่สำเร็จ"));
  }, []);

  const pdfRef = useRef<HTMLDivElement>(null);
  const exportPDF = useExportBillPDF();

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

  const vat = bill.total * 0.07;
  const beforeVat = bill.total - vat;
  const thaiText = numberToThaiBaht(bill.total);

  const overdueDays = bill.overdueDays ?? 0;
  const isOverdue = overdueDays > 0;

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

            <button
              className="btn btn-primary"
              onClick={() => exportPDF(bill, pdfRef)}
            >
              📄 ออก PDF
            </button>
          </div>

          <div className="d-flex justify-content-center mb-3">
            <h3 className="fw-bold m-0" style={{ color: SCB_PURPLE }}>
              รายละเอียดบิล
            </h3>
          </div>

          <div ref={pdfRef}>
            <div className="card shadow-sm border-0">
              <div className="card-body">

                {/* HEADER */}
                <div className="row mb-2 align-items-start">
                  <div className="col-6 text-start small text-secondary">
                    <div className="d-flex align-items-center gap-2 mb-1">
                      <img
                        src="https://manage.smartdorm-biwboong.shop/assets/SmartDorm.webp"
                        alt="logo"
                        width={42}
                        height={42}
                      />
                      <div className="fw-semibold">{profile.dormName}</div>
                    </div>

                    <div>{profile.address}</div>
                    <div>
                      โทร : {profile.phone} | อีเมล : {profile.email}
                    </div>
                    <div>เลขประจำตัวเสียภาษี : {profile.taxId}</div>
                  </div>

                  <div className="col-6 text-end">
                    <h3 className="fw-bold mb-1">
                      {bill.billStatus === 0
                        ? "ใบแจ้งหนี้ ( Invoice )"
                        : "ใบเสร็จรับเงิน ( Receipt )"}
                    </h3>

                    <div className="small">
                      <div>เดือน : {formatThaiDate(bill.month)}</div>
                      <div>เลขที่ : {bill.billNumber}</div>
                      <div>วันที่ : {formatThai(bill.createdAt)}</div>
                      <div>ห้อง : {bill.room?.number ?? "-"}</div>
                      <div>พนักงาน : {bill.adminCreated?.name ?? "-"}</div>
                    </div>
                  </div>
                </div>

                <Divider />

                <div className="row g-2 mb-3">
                  <div className="col-md-6">
                    <b>ชื่อ - นามสกุล :</b> {bill.fullName || "-"}
                  </div>

                  <div className="col-md-6">
                    <b>รอบบิล:</b> {formatThaiDate(bill.month)}
                  </div>

                  {bill.billStatus === 0 && (
                    <div
                      className={`col-12 fw-semibold ${
                        isOverdue ? "text-danger" : ""
                      }`}
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
                  )}
                </div>

                <Divider />

                <BillTables
                  bill={bill}
                  dormProfile={profile}
                  vat={vat}
                  beforeVat={beforeVat}
                  thaiText={thaiText}
                />

                <BillPayment bill={bill} formatThai={formatThai} />

              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}