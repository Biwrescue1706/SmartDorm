import "bootstrap/dist/css/bootstrap.min.css";

export default function NotFound() {
  const SCB_PURPLE = "#4A0080";
  const SCB_GOLD = "#FFC800";

  return (
    <div
      className="d-flex flex-column justify-content-center align-items-center vh-100 text-center"
      style={{
        background: "#F8F5FC",
        color: SCB_PURPLE,
      }}
    >
      {/* เลข 404 แบบ SCB */}
      <h1
        className="fw-bold"
        style={{
          fontSize: "8rem",
          color: SCB_PURPLE,
          textShadow: "0 4px 8px rgba(0,0,0,.25)",
        }}
      >
        404
      </h1>

      {/* ข้อความอธิบาย */}
      <p className="fs-4 mt-3 fw-semibold" style={{ color: "#2D1A47" }}>
        ไม่พบหน้าที่คุณกำลังค้นหา
      </p>

      {/* ปุ่มกลับหน้าแรก */}
      <a
        href="/"
        className="btn mt-4 fw-semibold px-4 py-2"
        style={{
          background: SCB_GOLD,
          color: "#2D1A47",
          border: "none",
          fontSize: "1.1rem",
          boxShadow: "0 2px 6px rgba(0,0,0,.25)",
        }}
      >
        กลับไปหน้าแรก
      </a>

    </div>
  );
}
