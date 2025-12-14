import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import BookingNav from "../components/BookingNav";

export default function BookingSearch() {
  const [bookingId, setBookingId] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!bookingId.trim()) {
      Swal.fire("แจ้งเตือน", "กรุณากรอกรหัสการจอง", "warning");
      return;
    }

    setLoading(true);

    try {
      // ไม่ต้องยิง API ตรงนี้ก็ได้
      // ให้หน้า BookingDetail จัดการ fetch เอง
      navigate(`/booking/${bookingId.trim()}`);
    } catch {
      Swal.fire("ผิดพลาด", "ไม่สามารถค้นหาข้อมูลได้", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <BookingNav />

      <div className="container text-center py-5 mt-5">
        <h3 className="fw-bold mb-3">ค้นหาการจอง</h3>
        <p className="text-muted mb-4">
          กรอกรหัสการจองเพื่อดูรายละเอียด
        </p>

        <form
          onSubmit={submit}
          className="mx-auto"
          style={{ maxWidth: "380px" }}
        >
          <input
            className="form-control form-control-lg text-center mb-3 rounded-4"
            placeholder="เช่น BK240001"
            value={bookingId}
            onChange={(e) => setBookingId(e.target.value)}
          />

          <button
            className="btn btn-primary w-100 rounded-4"
            disabled={loading}
          >
            {loading ? "กำลังค้นหา..." : "ค้นหาการจอง"}
          </button>
        </form>
      </div>
    </>
  );
}
