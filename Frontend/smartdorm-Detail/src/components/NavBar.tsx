import { useNavigate } from "react-router-dom";

export default function NavBar() {
  const navigate = useNavigate();

  return (
    <>
      <nav
        className="navbar px-3"
        style={{
          background:
            "linear-gradient(135deg,#4A0080 0%, #7B2CBF 100%)",
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          zIndex: 999,
          height: "68px",
          boxShadow:
            "0 6px 18px rgba(74,0,128,0.18)",
        }}
      >
        <div className="container-fluid d-flex align-items-center justify-content-between">

          {/* LEFT */}
          <button
            className="btn border-0 d-flex align-items-center justify-content-center"
            onClick={() => navigate(-1)}
            style={{
              width: "42px",
              height: "42px",
              borderRadius: "14px",
              background:
                "rgba(255,255,255,0.15)",
              backdropFilter: "blur(8px)",
              color: "#fff",
              fontSize: "22px",
              fontWeight: 700,
              transition: "0.2s",
              boxShadow:
                "0 4px 10px rgba(0,0,0,0.12)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background =
                "rgba(255,255,255,0.22)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background =
                "rgba(255,255,255,0.15)";
            }}
          >
            ←
          </button>

          {/* CENTER */}
          <div
            className="d-flex align-items-center gap-2"
            style={{
              cursor: "pointer",
            }}
            onClick={() => navigate("/")}
          >
            {/* LOGO */}
            <div
              className="d-flex align-items-center justify-content-center"
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "14px",
                background: "#fff",
                boxShadow:
                  "0 4px 10px rgba(0,0,0,.15)",
              }}
            >
              <img
                src="https://manage.smartdorm-biwboong.shop/assets/SmartDorm.webp"
                alt="SmartDorm Logo"
                style={{
                  width: "30px",
                  height: "30px",
                  objectFit: "contain",
                }}
              />
            </div>

            {/* TITLE */}
            <div
              className="d-flex flex-column"
              style={{
                lineHeight: 1.05,
              }}
            >
              <span
                className="fw-bold text-white"
                style={{
                  fontSize: "1rem",
                  letterSpacing: "-0.3px",
                }}
              >
                SmartDorm
              </span>

              <span
                style={{
                  fontSize: "11px",
                  color:
                    "rgba(255,255,255,.82)",
                  fontWeight: 500,
                }}
              >
                Dormitory Management
              </span>
            </div>
          </div>

          {/* RIGHT BALANCE */}
          <div
            style={{
              width: "42px",
              height: "42px",
            }}
          />
        </div>
      </nav>

      {/* SPACER */}
      <div style={{ height: "68px" }} />
    </>
  );
}