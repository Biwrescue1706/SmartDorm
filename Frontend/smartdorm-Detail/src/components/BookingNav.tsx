// Booking/src/components/BookingNav.tsx

export default function BookingNav() {
  return (
    <nav
      className="navbar navbar-expand-lg shadow-sm px-3 py-2"
      style={{
        background: "linear-gradient(90deg, #11998e 0%, #38ef7d 100%)",
        position: "fixed",
        top: 0,
        width: "100%",
        zIndex: 999,
      }}
    >
      <div className="container-fluid d-flex align-items-center justify-content-between">

        {/* ฝั่งซ้าย เว้นไว้ให้บาลานซ์กับโลโก้ด้านขวา */}
        <div style={{ width: "40px" }} />

        {/* ชื่อระบบ อยู่กลางจริง */}
        <div
          className="d-flex flex-column align-items-center flex-grow-1 text-center"
          style={{ transform: "translateX(-20px)" }} // ดันซ้ายเล็กน้อยเพื่อบาลานซ์สายตา
        >
          <span
            className="fw-bold text-white"
            style={{ fontSize: "1rem", lineHeight: "1" }}
          >
            🏫 SmartDorm
          </span>
          <span
            className="fw-bold text-white"
            style={{ fontSize: "1rem", marginTop: "-3px" }}
          >
            ระบบจัดการหอพัก
          </span>
        </div>

        {/* โลโก้ขวา */}
        <img
          src="https://manage.smartdorm-biwboong.shop/assets/SmartDorm.webp"
          alt="SmartDorm Logo"
          style={{
            width: "35px",
            height: "35px",
            borderRadius: "8px",
            background: "white",
            padding: "2px",
            boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
          }}
        />
      </div>
    </nav>
  );
}