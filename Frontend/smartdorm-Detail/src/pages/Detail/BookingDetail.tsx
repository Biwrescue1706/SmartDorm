// src/pages/BookingDetail.tsx
import { useParams } from "react-router-dom";
import BookingNav from "../../components/BookingNav";
import { useBookingDetail } from "../../hooks/Booking/useBookingDetail";

/* utils */
const formatThaiDate = (d?: string | null) =>
  d
    ? new Date(d).toLocaleDateString("th-TH", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "-";

export default function BookingDetail() {
  const { bookingId } = useParams();

  const { booking, loading } =
    useBookingDetail(bookingId);

  /* ---------- STATUS ---------- */
  const approveText =
    booking?.approveStatus === 0
      ? "รออนุมัติ"
      : booking?.approveStatus === 1
      ? "อนุมัติแล้ว"
      : "ไม่อนุมัติ";

  const approveClass =
    booking?.approveStatus === 0
      ? "warning"
      : booking?.approveStatus === 1
      ? "success"
      : "danger";

  return (
    <>
      <BookingNav />

      {/* WATERMARK */}
      {booking?.checkinStatus === 1 && (
        <div
          className="position-fixed top-50 start-50 fw-bold"
          style={{
            fontSize:
              "clamp(2.8rem, 7vw, 5rem)",
            opacity: 0.08,
            transform:
              "translate(-50%, -50%) rotate(-25deg)",
            pointerEvents: "none",
            userSelect: "none",
            zIndex: 0,
            whiteSpace: "nowrap",
            color: "#198754",
            fontWeight: 999,
          }}
        >
          CHECKED IN
        </div>
      )}

      {/* PAGE */}
      <div
        className="min-vh-100 py-4 mt-2"
        style={{
          background:
            "linear-gradient(180deg,#F7F4FB 0%, #F4F7FF 100%)",
          fontFamily: "Prompt, sans-serif",
        }}
      >
        <div className="container">

          {/* LOADING */}
          {loading ? (
            <div className="d-flex justify-content-center align-items-center py-5 mt-5">
              <div className="text-center">
                <div className="spinner-border text-primary mb-3" />
                <div className="fw-semibold text-primary">
                  กำลังโหลดข้อมูลการจอง...
                </div>
              </div>
            </div>
          ) : !booking ? (
            /* NOT FOUND */
            <div className="row justify-content-center">
              <div className="col-12 col-md-7 col-lg-5">

                <div className="card border-0 shadow-sm rounded-5 text-center p-5 mt-5">
                  <div style={{ fontSize: "54px" }}>
                    ❌
                  </div>

                  <h4 className="fw-bold mt-3 text-danger">
                    ไม่พบข้อมูลการจอง
                  </h4>

                  <p className="text-muted mb-0">
                    กรุณาตรวจสอบรหัสการจองอีกครั้ง
                  </p>
                </div>

              </div>
            </div>
          ) : (
            /* CONTENT */
            <div className="row justify-content-center">
              <div className="col-12 col-md-10 col-lg-8 col-xl-6">

                {/* HERO */}
                <div
                  className="card border-0 shadow-sm rounded-5 overflow-hidden mb-4"
                  style={{
                    border:
                      "1px solid rgba(123,44,191,0.08)",
                  }}
                >
                  {/* TOP BAR */}
                  <div
                    style={{
                      height: "6px",
                      background:
                        "linear-gradient(90deg,#4A0080,#7B2CBF)",
                    }}
                  />

                  <div className="card-body text-center p-4">

                    <div
                      className="mx-auto mb-3 d-flex align-items-center justify-content-center"
                      style={{
                        width: "68px",
                        height: "68px",
                        borderRadius: "22px",
                        background:
                          "linear-gradient(135deg,#4A0080,#7B2CBF)",
                        color: "#fff",
                        fontSize: "30px",
                        boxShadow:
                          "0 10px 25px rgba(74,0,128,.18)",
                      }}
                    >
                      🧾
                    </div>

                    <div
                      className="fw-semibold mb-2"
                      style={{
                        color: "#7A7391",
                        fontSize: "14px",
                      }}
                    >
                      รายละเอียดการจอง
                    </div>

                    <h3
                      className="fw-bold mb-2"
                      style={{
                        color: "#2D1A47",
                      }}
                    >
                      {booking.bookingId}
                    </h3>

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
                      className="fw-bold mb-4"
                      style={{
                        color: "#4A0080",
                      }}
                    >
                      👤 ข้อมูลผู้จอง
                    </h5>

                    <div className="d-flex flex-column gap-3">

                      <InfoBox
                        label="หมายเลขห้อง"
                        value={booking.room.number}
                      />

                      <InfoBox
                        label="ชื่อ - นามสกุล"
                        value={
                          booking.fullName ??
                          "-"
                        }
                      />

                      <InfoBox
                        label="เบอร์โทรศัพท์"
                        value={
                          booking.cphone ??
                          "-"
                        }
                      />

                      <InfoBox
                        label="LINE ผู้ใช้"
                        value={
                          booking.customer
                            ?.userName ??
                          "-"
                        }
                      />

                    </div>

                  </div>
                </div>

                {/* BOOKING DETAIL */}
                <div className="card border-0 shadow-sm rounded-5">
                  <div className="card-body p-4">

                    <h5
                      className="fw-bold mb-4"
                      style={{
                        color: "#4A0080",
                      }}
                    >
                      📄 รายละเอียดการจอง
                    </h5>

                    <div className="d-flex flex-column gap-3">

                      <InfoBox
                        label="วันที่จอง"
                        value={formatThaiDate(
                          booking.createdAt
                        )}
                      />

                      <InfoBox
                        label="วันที่แจ้งเข้าพัก"
                        value={formatThaiDate(
                          booking.checkin
                        )}
                      />

                      <InfoBox
                        label="สถานะการจอง"
                        value={approveText}
                      />

                      {booking.approveStatus ===
                        1 && (
                        <InfoBox
                          label="สถานะเช็คอิน"
                          value={
                            booking.checkinStatus ===
                            1
                              ? "เช็คอินแล้ว"
                              : "ยังไม่เช็คอิน"
                          }
                        />
                      )}

                      {booking.checkinAt && (
                        <InfoBox
                          label="วันเข้าเช็คอิน"
                          value={formatThaiDate(
                            booking.checkinAt
                          )}
                        />
                      )}

                    </div>

                    {/* FOOT NOTE */}
                    <div
                      className="text-center mt-4 p-3 rounded-4"
                      style={{
                        background:
                          "#F8F6FC",
                        color: "#7A7391",
                        fontSize: "13px",
                      }}
                    >
                      📌 หากข้อมูลไม่ถูกต้อง
                      กรุณาติดต่อเจ้าหน้าที่
                    </div>

                  </div>
                </div>

              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
}

/* ---------- INFO BOX ---------- */

function InfoBox({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div
      className="d-flex justify-content-between align-items-center"
      style={{
        background: "#FAF9FC",
        border:
          "1px solid rgba(123,44,191,0.08)",
        borderRadius: "18px",
        padding: "15px 16px",
        gap: "12px",
      }}
    >
      <div
        style={{
          color: "#7A7391",
          fontSize: "13px",
          fontWeight: 600,
        }}
      >
        {label}
      </div>

      <div
        className="fw-bold text-end"
        style={{
          color: "#2D1A47",
          fontSize: "15px",
        }}
      >
        {value}
      </div>
    </div>
  );
}