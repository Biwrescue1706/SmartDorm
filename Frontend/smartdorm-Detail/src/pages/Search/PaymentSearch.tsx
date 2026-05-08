import { useState } from "react";
import { useNavigate } from "react-router-dom";

import axios from "axios";
import Swal from "sweetalert2";

import { API_BASE } from "../../config";
import NavBar from "../../components/NavBar";

export default function PaymentSearch() {
  const [billId, setBillId] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const navigate = useNavigate();

  const handleSearch = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (!billId.trim()) {
      Swal.fire(
        "แจ้งเตือน",
        "กรุณากรอกรหัสบิล",
        "warning"
      );

      return;
    }

    setLoading(true);

    try {
      const res = await axios.get(
        `${API_BASE}/bill/${billId.trim()}`
      );

      if (res.data) {
        navigate(
          `/bill/${billId.trim()}`
        );
      } else {
        Swal.fire(
          "ไม่พบข้อมูลบิล",
          "กรุณาตรวจสอบรหัสอีกครั้ง",
          "error"
        );
      }
    } catch {
      Swal.fire(
        "ไม่พบข้อมูลบิล",
        "กรุณาตรวจสอบรหัสอีกครั้ง",
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
                      "linear-gradient(135deg,#F59E0B,#F97316)",
                    boxShadow:
                      "0 10px 25px rgba(245,158,11,.18)",
                    fontSize: "30px",
                  }}
                >
                  💰
                </div>

                {/* TITLE */}
                <h3
                  className="fw-bold mb-2"
                  style={{
                    color: "#2D1A47",
                  }}
                >
                  ชำระบิลค่าห้อง
                </h3>

                {/* DESC */}
                <p
                  className="mb-0"
                  style={{
                    color: "#8C84A3",
                    fontSize: "14px",
                  }}
                >
                  กรอกรหัสบิลเพื่อดูรายละเอียดและชำระเงิน
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
                    color: "#F59E0B",
                    fontSize: "14px",
                  }}
                >
                  รหัสบิล
                </label>

                {/* FORM */}
                <form
                  onSubmit={handleSearch}
                >
                  <input
                    type="text"
                    className="form-control form-control-lg rounded-4 border-0 shadow-sm mb-4"
                    placeholder="เช่น BL240001"
                    value={billId}
                    onChange={(e) =>
                      setBillId(
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
                    type="submit"
                    className="btn w-100 rounded-4 fw-bold text-white py-3"
                    disabled={loading}
                    style={{
                      background:
                        "linear-gradient(135deg,#F59E0B,#F97316)",
                      border: "none",
                      boxShadow:
                        "0 10px 20px rgba(245,158,11,.18)",
                    }}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" />
                        กำลังค้นหา...
                      </>
                    ) : (
                      "ค้นหาบิล"
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