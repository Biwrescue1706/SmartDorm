import { useParams, useNavigate } from "react-router-dom";
import { useRef } from "react";

import Nav from "../components/Nav";
import { useAuth } from "../hooks/useAuth";
import { usePendingBookings } from "../hooks/ManageRooms/usePendingBookings";
import { usePendingCheckouts } from "../hooks/ManageRooms/usePendingCheckouts";
import { useBillDetail } from "../hooks/useBillDetail";

import { useBillMath } from "../hooks/useBillMath";
import { useBillPDF } from "../hooks/useBillPDF";

import { BillTables } from "../components/BillTables";
import BillPayment from "../components/BillPayment";

import { formatThai, formatThaiDate } from "../utils/billFormat";

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

  const pdfRef = useRef<HTMLDivElement>(null);

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

  const { vat, beforeVat, overdueDays, isOverdue } = useBillMath(bill);
  const exportPDF = useBillPDF();

  const handleExportPDF = () => exportPDF(bill, pdfRef);

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
          </div>

          <div className="text-center mb-3">
            <h3 className="fw-bold" style={{ color: SCB_PURPLE }}>
              รายละเอียดบิล
            </h3>
          </div>

          <div ref={pdfRef}>
            <div className="card shadow-sm border-0">
              <div className="card-body">

                <div className="text-center mb-2">
                  <h3 className="fw-bold mb-1">
                    {bill.billStatus === 0
                      ? "ใบแจ้งหนี้ ( Invoice )"
                      : "ใบเสร็จรับเงิน ( Receipt )"}
                  </h3>
                </div>

                <div className="d-flex justify-content-between small mb-2">
                  <div>เลขที่เอกสาร: {bill.billId}</div>
                  <div>วันที่ออก : {formatThai(bill.createdAt)}</div>
                  <div>พนักงาน : {bill.adminCreated?.name ?? "-"}</div>
                </div>

                <Divider />

                <div className="row g-2 mb-3">
                  <div className="col-md-4">
                    <b>ชื่อ:</b> {bill.fullName || "-"}
                  </div>

                  <div className="col-md-4">
                    <b>รอบบิล:</b> {formatThaiDate(bill.month)}
                  </div>

                  <div className="col-md-4">
                    ห้อง {bill.room?.number ?? "-"}
                  </div>

                  {bill.billStatus === 0 && (
                    <div className={`col-12 ${isOverdue ? "text-danger" : ""}`}>
                      {isOverdue
                        ? `เกินกำหนด ${overdueDays} วัน`
                        : `ครบกำหนด ${formatThai(bill.dueDate)}`}
                    </div>
                  )}
                </div>

                <Divider />

                <BillTables
                  bill={bill}
                  beforeVat={beforeVat}
                  vat={vat}
                  thaiText=""
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