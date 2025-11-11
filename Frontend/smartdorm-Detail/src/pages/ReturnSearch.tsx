import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import { API_BASE } from "../config";
import NavBar from "../components/NavBar";

export default function ReturnSearch() {
  const [bookingId, setBookingId] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingId.trim()) {
      Swal.fire("แจ้งเตือน", "กรุณากรอกรหัสการจอง", "warning");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/booking/${bookingId.trim()}`);
      if (res.data) {
        // ✅ ถ้ามี booking จริง → ไปหน้า /checkout/:bookingId
        navigate(`/checkout/${bookingId.trim()}`);
      } else {
        Swal.fire("ไม่พบข้อมูล", "กรุณาตรวจสอบรหัสการจองอีกครั้ง", "error");
      }
    } catch {
      Swal.fire("ไม่พบข้อมูล", "กรุณาตรวจสอบรหัสการจองอีกครั้ง", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <NavBar />

      <div className="text-center mb-4 mt-5">
        <h3 className="fw-bold mb-3">คืนห้องพัก</h3>
        <p className="text-black mb-4">
          กรอกรหัสการจองเพื่อดำเนินการคืนห้อง
        </p>

        <form
          onSubmit={handleSearch}
          className="w-100"
          style={{ maxWidth: "380px" }}
        >
          <input
            type="text"
            className="form-control form-control-lg text-center mb-3 rounded-4 border-0"
            placeholder="กรอกรหัสการจอง เช่น BD24001"
            value={bookingId}
            onChange={(e) => setBookingId(e.target.value)}
          />
          <button
            type="submit"
            className="btn btn-primary w-100"
            disabled={loading}
          >
            {loading ? "กำลังค้นหา..." : "ค้นหาการจอง"}
          </button>
        </form>
      </div>
    </div>
  );
}
