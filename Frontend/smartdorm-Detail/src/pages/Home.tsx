import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-vh-100 d-flex flex-column justify-content-center align-items-center text-center">
      <h2 className="fw-bold mb-4">ระบบหอพัก</h2>
      <h2 className="fw-bold mb-4">🏫 SmartDorm 🎉</h2>

      <div
        className="d-grid gap-3"
        style={{ width: "100%", maxWidth: "340px" }}
      >
        {/* ปุ่มจองห้อง */}
        <button
          className="btn btn-success fw-bold py-3 rounded-4 shadow-sm"
          onClick={() => navigate("/booking")}
        >
          🏠 มีการจองห้อง
        </button>

        {/* ปุ่มคืนห้อง */}
        <button
          className="btn btn-success fw-bold py-3 rounded-4 shadow-sm"
          onClick={() => navigate("/checkout")}
        >
          🔄 คืนห้อง
        </button>

        {/* ปุ่มชำระบิล */}
        <button
          className="btn btn-success fw-bold py-3 rounded-4 shadow-sm"
          onClick={() => navigate("/bill")}
        >
          💰 ชำระบิล
        </button>
      </div>

      <p className="mt-4 text-black small">Powered by 🏫 SmartDorm 🎉</p>
    </div>
  );
}
