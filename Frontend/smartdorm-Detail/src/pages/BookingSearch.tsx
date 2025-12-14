import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import { API_BASE } from "../config";
import NavBar from "../components/NavBar";

export default function BookingViewSearch() {
  const [bookingId, setBookingId] = useState("");
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingId.trim())
      return Swal.fire("แจ้งเตือน", "กรุณากรอกรหัสการจอง", "warning");

    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/booking/${bookingId.trim()}`);
      if (res.data) {
        // ✅ ถ้าพบ booking ให้เปลี่ยนหน้าไป /booking/:bookingId
        nav(`/booking/${bookingId.trim()}`);
      } else {
        Swal.fire("ไม่พบข้อมูล", "กรุณาตรวจสอบรหัสการจองอีกครั้ง", "error");
      }
    } catch (err) {
      Swal.fire("ไม่พบข้อมูล", "กรุณาตรวจสอบรหัสการจองอีกครั้ง", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <NavBar />
      <div className="text-center mb-4 mt-5">
        <h3 className="fw-bold text-success">ค้นหาข้อมูลการจอง</h3>
        <p className="text-muted">กรอกรหัสการจองเพื่อตรวจสอบสถานะ</p>
      </div>

      <form
        onSubmit={handleSearch}
        className="mx-auto"
        style={{ maxWidth: "400px" }}
      >
        <input
          type="text"
          className="form-control form-control-lg mb-3 text-center"
          placeholder="กรอกรหัสการจอง เช่น BD123456"
          value={bookingId}
          onChange={(e) => setBookingId(e.target.value)}
        />
        <button
          type="submit"
          className="btn btn-primary w-100"
          disabled={loading}
        >
          {loading ? "กำลังค้นหา..." : "ค้นหาข้อมูล"}
        </button>
      </form>
    </div>
  );
}
