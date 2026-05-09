// src/pages/CheckoutDetail.tsx
import { useParams } from "react-router-dom";
import CheckoutNav from "../../components/CheckoutNav";
import { useCheckoutDetail } from "../../hooks/Checkout/useCheckoutDetail";

/* ================= DATE ================= */
const formatThaiDate = (d?: string | null) =>
  d
    ? new Date(d).toLocaleDateString("th-TH", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "-";

/* ================= STATUS BADGE ================= */
const StatusBadge = ({ text, color }: { text: string; color: string }) => (
  <span
    className="px-3 py-2 fw-semibold rounded-pill"
    style={{
      background: color,
      color: "#fff",
      fontSize: "0.82rem",
      minWidth: "120px",
      display: "inline-block",
    }}
  >
    {text}
  </span>
);

/* ================= INFO BOX ================= */
function InfoBox({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div
      className="d-flex justify-content-between align-items-center"
      style={{
        background: "#FAF9FC",
        border: "1px solid rgba(123,44,191,0.08)",
        borderRadius: "18px",
        padding: "15px 16px",
        gap: "12px",
      }}
    >
      <div
        style={{
          color: "#000000",
          fontSize: "13px",
          fontWeight: 600,
        }}
      >
        {label}
      </div>

      <div
        className="fw-bold text-end"
        style={{
          color: "#000000",
          fontSize: "15px",
        }}
      >
        {value}
      </div>
    </div>
  );
}

export default function CheckoutDetail() {
  const { checkoutId } = useParams();

  const { checkout, loading } = useCheckoutDetail(checkoutId);

  /* ===== LOADING ===== */
  if (loading) {
    return (
      <>
        <CheckoutNav />

        <div
          className="d-flex justify-content-center align-items-center"
          style={{
            minHeight: "100vh",
            background: "linear-gradient(180deg,#F7F4FB 0%, #F4F7FF 100%)",
          }}
        >
          <div className="text-center">
            <div className="spinner-border text-success mb-3" />

            <div className="fw-semibold text-success">
              กำลังโหลดข้อมูลการคืนห้อง...
            </div>
          </div>
        </div>
      </>
    );
  }

  /* ===== NOT FOUND ===== */
  if (!checkout) {
    return (
      <>
        <CheckoutNav />

        <div
          className="min-vh-100 d-flex justify-content-center align-items-center"
          style={{
            background: "linear-gradient(180deg,#F7F4FB 0%, #F4F7FF 100%)",
          }}
        >
          <div className="card border-0 shadow-sm rounded-5 p-5 text-center">
            <div style={{ fontSize: 54 }}>❌</div>

            <h4 className="fw-bold mt-3 text-danger">ไม่พบข้อมูลการคืนห้อง</h4>

            <p className="text-muted mb-0">กรุณาตรวจสอบรหัสอีกครั้ง</p>
          </div>
        </div>
      </>
    );
  }

  /* ===== STATUS ===== */
  const approveText =
    checkout.ReturnApprovalStatus === 0
      ? "รออนุมัติ"
      : checkout.ReturnApprovalStatus === 1
        ? "อนุมัติแล้ว"
        : "ปฏิเสธ";

  const approveClass =
    checkout.ReturnApprovalStatus === 0
      ? "warning"
      : checkout.ReturnApprovalStatus === 1
        ? "success"
        : "danger";

  return (
    <>
      <CheckoutNav />

      {/* WATERMARK */}
      {checkout.checkoutStatus === 1 && (
        <div
          className="position-fixed top-50 start-50 fw-bold"
          style={{
            fontSize: "clamp(2.8rem, 7vw, 5rem)",
            opacity: 0.60,
            transform: "translate(-50%, -50%) rotate(-25deg)",
            pointerEvents: "none",
            userSelect: "none",
            zIndex: 999,
            whiteSpace: "nowrap",
            color: "#ff0000",
            fontWeight: 900,
          }}
        >
          CHECKED OUT
        </div>
      )}

      {/* PAGE */}
      <div
        className="min-vh-100 py-4"
        style={{
          background: "linear-gradient(180deg,#F7F4FB 0%, #F4F7FF 100%)",
          fontFamily: "Prompt, sans-serif",
          paddingTop: "90px",
        }}
      >
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-12 col-md-10 mt-5 col-lg-8 col-xl-6">
              {/* HERO */}
              <div
                className="card border-0 shadow-sm rounded-5 overflow-hidden mb-4"
                style={{
                  border: "1px solid rgba(123,44,191,0.08)",
                }}
              >
                {/* TOP BAR */}
                <div
                  style={{
                    height: "10px",
                    background: "linear-gradient(90deg,#0F9B8E,#38B2AC)",
                  }}
                />

                <div className="card-body text-center p-4">
                  {/* ICON */}
                  <div
                    className="mx-auto mb-3 d-flex align-items-center justify-content-center"
                    style={{
                      width: "54px",
                      height: "54px",
                      borderRadius: "22px",
                      background: "linear-gradient(135deg,#0F9B8E,#38B2AC)",
                      color: "#fff",
                      fontSize: "22px",
                      boxShadow: "0 10px 25px rgba(15,155,142,.18)",
                    }}
                  >
                    🔄
                  </div>

                  <div
                    className="fw-semibold mb-2"
                    style={{
                      color: "#000000",
                      fontSize: "14px",
                    }}
                  >
                    รายละเอียดการคืนห้อง
                  </div>

                  <h6
                    className="fw-bold mb-3"
                    style={{
                      color: "#000000",
                      fontSize: "18px",
                    }}
                  >
                    {checkout.checkoutId}
                  </h6>

                  <span
                    className={`badge rounded-pill text-bg-${approveClass} px-3 py-2`}
                    style={{
                      fontSize: "13px",
                    }}
                  >
                    {approveText}
                  </span>
                </div>
              </div>

              {/* CUSTOMER */}
              <div className="card border-0 shadow-sm rounded-5 mb-4">
                <div className="card-body p-4">
                  <h5
                    className="fw-bold mb-4 text-center"
                    style={{
                      color: "#000000",
                    }}
                  >
                    👤 ข้อมูลผู้เช่า
                  </h5>

                  <div className="d-flex flex-column gap-3">
                    <InfoBox
                      label="รหัสการจอง"
                      value={checkout.booking.bookingId}
                    />

                    <InfoBox label="หมายเลขห้อง" value={checkout.room.number} />

                    <InfoBox
                      label="ชื่อผู้เช่า"
                      value={checkout.booking.fullName || "-"}
                    />

                    <InfoBox
                      label="เบอร์โทรศัพท์"
                      value={checkout.booking.cphone || "-"}
                    />
                  </div>
                </div>
              </div>

              {/* DETAIL */}
              <div className="card border-0 shadow-sm rounded-5">
                <div className="card-body p-4">
                  <h5
                    className="fw-bold mb-4 text-center"
                    style={{
                      color: "#000000",
                    }}
                  >
                    📄 รายละเอียดการคืนห้อง
                  </h5>

                  <div className="d-flex flex-column gap-3">
                    <InfoBox
                      label="วันที่ขอคืนห้อง"
                      value={formatThaiDate(checkout.checkout)}
                    />

                    <InfoBox
                      label="สถานะคำขอ"
                      value={
                        checkout.ReturnApprovalStatus === 0 ? (
                          <StatusBadge text="รออนุมัติ" color="#F9A825" />
                        ) : checkout.ReturnApprovalStatus === 1 ? (
                          <StatusBadge text="อนุมัติแล้ว" color="#2E7D32" />
                        ) : (
                          <StatusBadge text="ปฏิเสธ" color="#C62828" />
                        )
                      }
                    />

                    <InfoBox
                      label="วันที่อนุมัติ"
                      value={
                        checkout.RefundApprovalDate
                          ? formatThaiDate(checkout.RefundApprovalDate)
                          : "-"
                      }
                    />

                    {checkout.checkoutAt && (
                      <InfoBox
                        label="วันที่เช็คเอาท์"
                        value={formatThaiDate(checkout.checkoutAt)}
                      />
                    )}

                    {checkout.checkoutStatus === 1 && (
                      <InfoBox
                        label="สถานะเช็คเอาท์"
                        value={
                          <StatusBadge text="เช็คเอาท์แล้ว" color="#2E7D32" />
                        }
                      />
                    )}
                  </div>

                  {/* FOOT NOTE */}
                  <div
                    className="text-center mt-4 p-3 rounded-4"
                    style={{
                      background: "#F8F6FC",
                      color: "#000000",
                      fontSize: "13px",
                    }}
                  >
                    📌 หากข้อมูลไม่ถูกต้อง กรุณาติดต่อเจ้าหน้าที่
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
