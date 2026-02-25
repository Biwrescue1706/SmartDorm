import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import NavBar from "../../components/NavBar";

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
      <NavBar />

      {/* spacer กัน navbar ทับ */}
      <div style={{ height: "70px" }} />

      <div
        className="container-fluid d-flex justify-content-center align-items-center"
        style={{ minHeight: "calc(100vh - 70px)" }}
      >

        <div className="col-12 col-sm-8 col-md-5 col-lg-4 text-center">
          <h3 className="fw-bold mb-3">ค้นหาการจอง</h3>

          <p className="text-muted mb-4">กรอกรหัสการจองเพื่อดูรายละเอียด</p>

          <form onSubmit={submit}>
            <input
              className="form-control form-control-lg text-center mb-3 rounded-4"
              placeholder="เช่น BK240001"
              value={bookingId}
              onChange={(e) => setBookingId(e.target.value)}
            />

            <button
              className="btn btn-primary w-100 rounded-4 fw-bold"
              disabled={loading}
            >
              {loading ? "กำลังค้นหา..." : "ค้นหาการจอง"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
