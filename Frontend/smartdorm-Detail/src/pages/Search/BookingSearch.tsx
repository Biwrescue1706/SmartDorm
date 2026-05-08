import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

import NavBar from "../../components/NavBar";

export default function BookingSearch() {
  const [bookingId, setBookingId] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const navigate = useNavigate();

  const submit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (!bookingId.trim()) {
      Swal.fire(
        "แจ้งเตือน",
        "กรุณากรอกรหัสการจอง",
        "warning"
      );

      return;
    }

    setLoading(true);

    try {
      navigate(
        `/booking/${bookingId.trim()}`
      );
    } catch {
      Swal.fire(
        "ผิดพลาด",
        "ไม่สามารถค้นหาข้อมูลได้",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <NavBar />

      {/* PAGE */}
      <div
        className="min-vh-100"
        style={{
          background:
            "linear-gradient(180deg,#F7F4FB 0%, #F4F7FF 100%)",
          fontFamily:
            "Prompt, sans-serif",
          paddingTop: "80px",
        }}
      >
        <div className="container">

          <div
            className="mx-auto"
            style={{
              maxWidth: "430px",
            }}
          >
            {/* HERO CARD */}
            <div
              className="bg-white rounded-5 shadow-sm mb-4"
              style={{
                border:
                  "1px solid rgba(123,44,191,0.08)",
              }}
            >
              <div className="p-4 text-center">

                {/* ICON */}
                <div
                  className="mx-auto mb-3 d-flex align-items-center justify-content-center"
                  style={{
                    width: "64px",
                    height: "64px",
                    borderRadius: "22px",
                    background:
                      "linear-gradient(135deg,#4A0080,#7B2CBF)",
                    boxShadow:
                      "0 10px 25px rgba(74,0,128,.18)",
                    fontSize: "30px",
                  }}
                >
                  🔍
                </div>

                {/* TITLE */}
                <h3
                  className="fw-bold mb-2"
                  style={{
                    color: "#2D1A47",
                  }}
                >
                  ค้นหาการจอง
                </h3>

                {/* DESC */}
                <p
                  className="mb-0"
                  style={{
                    color: "#8C84A3",
                    fontSize: "14px",
                  }}
                >
                  กรอกรหัสการจองเพื่อดูรายละเอียด
                </p>
              </div>
            </div>

            {/* FORM CARD */}
            <div
              className="bg-white rounded-5 shadow-sm"
              style={{
                border:
                  "1px solid rgba(123,44,191,0.08)",
              }}
            >
              <div className="p-4">

                {/* LABEL */}
                <label
                  className="fw-semibold mb-2"
                  style={{
                    color: "#4A0080",
                    fontSize: "14px",
                  }}
                >
                  รหัสการจอง
                </label>

                {/* INPUT */}
                <form onSubmit={submit}>
                  <input
                    className="form-control form-control-lg rounded-4 border-0 shadow-sm mb-4"
                    placeholder="เช่น BK240001"
                    value={bookingId}
                    onChange={(e) =>
                      setBookingId(
                        e.target.value
                      )
                    }
                    style={{
                      background:
                        "#F7F4FB",
                      padding:
                        "14px 18px",
                      fontWeight: 600,
                    }}
                  />

                  {/* BUTTON */}
                  <button
                    className="btn w-100 rounded-4 fw-bold text-white py-3"
                    disabled={loading}
                    style={{
                      background:
                        "linear-gradient(135deg,#4A0080,#7B2CBF)",
                      border: "none",
                      boxShadow:
                        "0 10px 20px rgba(74,0,128,.18)",
                    }}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" />
                        กำลังค้นหา...
                      </>
                    ) : (
                      "ค้นหาการจอง"
                    )}
                  </button>
                </form>

              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}