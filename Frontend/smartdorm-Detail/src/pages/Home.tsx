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
            className="bg-white rounded-5 shadow-sm mb-4"
            style={{
              border:
                "1px solid rgba(123,44,191,0.08)",
            }}
          >
            <div className="p-4 text-center">

              {/* LOGO */}
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
                }}
              >
                <img
                  src="https://manage.smartdorm-biwboong.shop/assets/SmartDorm.webp"
                  alt="SmartDorm"
                  style={{
                    width: "52px",
                    height: "52px",
                    borderRadius: "16px",
                    background: "#fff",
                    padding: "5px",
                  }}
                />
              </div>

              {/* SUB TITLE */}
              <div
                className="fw-semibold mb-2"
                style={{
                  color: "#7A7391",
                  fontSize: "14px",
                }}
              >
                ดูรายละเอียดบริการ
              </div>

              {/* TITLE */}
              <h3
                className="fw-bold mb-2"
                style={{
                  color: "#2D1A47",
                  lineHeight: 1.1,
                }}
              >
                SmartDorm
              </h3>

              {/* DESCRIPTION */}
              <p
                className="mb-0"
                style={{
                  color: "#8C84A3",
                  fontSize: "14px",
                }}
              >
                ระบบจัดการหอพักออนไลน์
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
              onClick={() =>
                navigate("/booking")
              }
            >
              <div className="d-flex align-items-center">

                {/* ICON */}
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

                {/* TEXT */}
                <div>
                  <div className="fw-bold fs-5">
                    จองห้องพัก
                  </div>

                  <div
                    style={{
                      opacity: 0.9,
                      fontSize: "13px",
                    }}
                  >
                    ดูรายละเอียดห้องว่างและทำรายการจอง
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
              onClick={() =>
                navigate("/checkout")
              }
            >
              <div className="d-flex align-items-center">

                {/* ICON */}
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

                {/* TEXT */}
                <div>
                  <div className="fw-bold fs-5">
                    คืนห้องพัก
                  </div>

                  <div
                    style={{
                      opacity: 0.9,
                      fontSize: "13px",
                    }}
                  >
                    ดูรายละเอียดและดำเนินการคืนห้องพัก
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
              onClick={() =>
                navigate("/bill")
              }
            >
              <div className="d-flex align-items-center">

                {/* ICON */}
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

                {/* TEXT */}
                <div>
                  <div className="fw-bold fs-5">
                    ชำระบิล
                  </div>

                  <div
                    style={{
                      opacity: 0.9,
                      fontSize: "13px",
                    }}
                  >
                    ดูรายละเอียดบิลและชำระค่าใช้จ่าย
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