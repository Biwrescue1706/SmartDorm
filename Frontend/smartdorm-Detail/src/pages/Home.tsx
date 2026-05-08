import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div
      className="min-vh-100"
      style={{
        background:
          "linear-gradient(180deg,#F7F4FB 0%, #F4F7FF 100%)",
        fontFamily: "Prompt, sans-serif",
      }}
    >
      {/* CONTENT */}
      <div className="container py-5">

        <div
          className="mx-auto"
          style={{
            maxWidth: "430px",
          }}
        >
          {/* HERO */}
          <div
            className="bg-white rounded-5 shadow-sm overflow-hidden mb-4"
            style={{
              border: "1px solid rgba(123,44,191,0.08)",
            }}
          >
            {/* TOP BAR */}
            <div
              style={{
                height: "7px",
                background:
                  "linear-gradient(90deg,#4A0080,#7B2CBF)",
              }}
            />

            <div className="p-4 text-center">

              {/* LOGO */}
              <div
                className="mx-auto mb-3 d-flex align-items-center justify-content-center"
                style={{
                  width: "50px",
                  height: "50px",
                  borderRadius: "28px",
                  background:
                    "linear-gradient(135deg,#4A0080,#7B2CBF)",
                  boxShadow:
                    "0 10px 25px rgba(74,0,128,.25)",
                }}
              >
                <img
                  src="https://manage.smartdorm-biwboong.shop/assets/SmartDorm.webp"
                  alt="SmartDorm"
                  style={{
                    width: "50px",
                    height: "50px",
                    borderRadius: "18px",
                    background: "#fff",
                    padding: "6px",
                  }}
                />
              </div>

              <h5
                className="fw-semibold mb-2"
                style={{
                  color: "#7A7391",
                }}
              >
                ระบบจัดการหอพัก
              </h5>

              <h4
                className="fw-bold mb-2"
                style={{
                  color: "#2D1A47",
                  fontSize: "2.3rem",
                  lineHeight: 1.1,
                }}
              >
                SmartDorm
              </h4>

              <p
                className="mb-0"
                style={{
                  color: "#8C84A3",
                  fontSize: "14px",
                }}
              >
                Dormitory Management System
              </p>
            </div>
          </div>

          {/* MENU */}
          <div className="d-grid gap-3">

            {/* BOOKING */}
            <button
              className="btn border-0 rounded-5 text-start p-4 shadow-sm"
              style={{
                background:
                  "linear-gradient(135deg,#4A0080,#7B2CBF)",
                color: "#fff",
              }}
              onClick={() => navigate("/booking")}
            >
              <div className="d-flex align-items-center">

                <div
                  className="d-flex align-items-center justify-content-center me-3"
                  style={{
                    width: "58px",
                    height: "58px",
                    borderRadius: "18px",
                    background:
                      "rgba(255,255,255,.15)",
                    fontSize: "28px",
                  }}
                >
                  🏠
                </div>

                <div>
                  <div className="fw-bold fs-5">
                    จองห้องพัก
                  </div>

                  <div
                    style={{
                      opacity: 0.85,
                      fontSize: "13px",
                    }}
                  >
                    ดูห้องว่างและทำรายการจอง
                  </div>
                </div>

              </div>
            </button>

            {/* RETURN */}
            <button
              className="btn border-0 rounded-5 text-start p-4 shadow-sm"
              style={{
                background:
                  "linear-gradient(135deg,#0F9B8E,#38B2AC)",
                color: "#fff",
              }}
              onClick={() => navigate("/checkout")}
            >
              <div className="d-flex align-items-center">

                <div
                  className="d-flex align-items-center justify-content-center me-3"
                  style={{
                    width: "58px",
                    height: "58px",
                    borderRadius: "18px",
                    background:
                      "rgba(255,255,255,.15)",
                    fontSize: "28px",
                  }}
                >
                  🔄
                </div>

                <div>
                  <div className="fw-bold fs-5">
                    คืนห้องพัก
                  </div>

                  <div
                    style={{
                      opacity: 0.85,
                      fontSize: "13px",
                    }}
                  >
                    ดำเนินการคืนห้องพัก
                  </div>
                </div>

              </div>
            </button>

            {/* BILL */}
            <button
              className="btn border-0 rounded-5 text-start p-4 shadow-sm"
              style={{
                background:
                  "linear-gradient(135deg,#F59E0B,#F97316)",
                color: "#fff",
              }}
              onClick={() => navigate("/bill")}
            >
              <div className="d-flex align-items-center">

                <div
                  className="d-flex align-items-center justify-content-center me-3"
                  style={{
                    width: "58px",
                    height: "58px",
                    borderRadius: "18px",
                    background:
                      "rgba(255,255,255,.15)",
                    fontSize: "28px",
                  }}
                >
                  💰
                </div>

                <div>
                  <div className="fw-bold fs-5">
                    ชำระบิล
                  </div>

                  <div
                    style={{
                      opacity: 0.85,
                      fontSize: "13px",
                    }}
                  >
                    ตรวจสอบและชำระค่าใช้จ่าย
                  </div>
                </div>

              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}