import "bootstrap/dist/css/bootstrap.min.css";

export default function NotFound() {
  const SCB_GOLD = "#FFC800";

  return (
    <div
      className="d-flex flex-column justify-content-center align-items-center vh-100 text-center"
      style={{
        background:
          "linear-gradient(135deg, #2D006B 0%, #4B2E83 45%, #200046 100%)",
        color: "white",
      }}
    >
      {/* LOGO & BRAND */}
      <div
        className="d-flex align-items-center justify-content-center gap-3 mb-3"
        style={{ animation: "fadeInDown .7s" }}
      >
        <img
          src="/assets/SmartDorm.webp"
          alt="logo"
          width="65"
          height="65"
          className="img-fluid"
          style={{ filter: "drop-shadow(0 3px 6px rgba(0,0,0,.45))" }}
        />
        <h3
          className="fw-bold mb-0"
          style={{
            color: SCB_GOLD,
            textShadow: "0 2px 4px rgba(0,0,0,.35)",
          }}
        >
          SmartDorm
        </h3>
      </div>

      {/* 404 */}
      <h1
        className="fw-bold"
        style={{
          fontSize: "7rem",
          color: SCB_GOLD,
          textShadow: "0 6px 14px rgba(0,0,0,.55)",
          animation: "zoomIn .6s",
        }}
      >
        404
      </h1>

      {/* Description */}
      <p
        className="fs-4 mt-3 fw-semibold"
        style={{
          color: "#F5E9FF",
          opacity: 0.9,
          animation: "fadeInUp .8s",
        }}
      >
        ไม่พบหน้าที่คุณกำลังค้นหา
      </p>

      {/* Back Button */}
      <a
        href="/"
        className="btn mt-4 fw-semibold px-5 py-2"
        style={{
          background: SCB_GOLD,
          color: "#2D1A47",
          borderRadius: "12px",
          fontSize: "1.15rem",
          boxShadow: "0 4px 12px rgba(0,0,0,.45)",
          transition: ".2s",
        }}
        onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.06)")}
        onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
      >
        กลับไปหน้าแรก
      </a>

      {/* Keyframes */}
      <style>
        {`
          @keyframes fadeInDown {
            from { opacity: 0; transform: translateY(-20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes zoomIn {
            from { transform: scale(0.6); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
          }
        `}
      </style>
    </div>
  );
}
