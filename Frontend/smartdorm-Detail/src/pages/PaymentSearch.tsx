import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import { API_BASE } from "../config";
import NavBar from "../components/NavBar";

export default function PaymentSearch() {
  const [billId, setBillId] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!billId.trim()) {
      Swal.fire("แจ้งเตือน", "กรุณากรอกรหัสบิล", "warning");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/bill/${billId.trim()}`);
      if (res.data) {
        navigate(`/bill/${billId.trim()}`);
      } else {
        Swal.fire("ไม่พบข้อมูลบิล", "กรุณาตรวจสอบรหัสอีกครั้ง", "error");
      }
    } catch {
      Swal.fire("ไม่พบข้อมูลบิล", "กรุณาตรวจสอบรหัสอีกครั้ง", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <NavBar />
      <div className="text-center mb-4 mt-5">
        <h3 className="fw-bold mb-3">ชำระบิลค่าห้อง</h3>
        <p className="text-white-50 mb-4">
          กรอกรหัสบิลเพื่อดูรายละเอียดและชำระเงิน
        </p>

        <form
          onSubmit={handleSearch}
          className="w-100"
          style={{ maxWidth: "380px" }}
        >
          <input
            type="text"
            className="form-control form-control-lg text-center mb-3 rounded-4 border-0"
            placeholder="กรอกรหัสบิล เช่น BL24001"
            value={billId}
            onChange={(e) => setBillId(e.target.value)}
          />
          <button
            type="submit"
            className="btn btn-primary w-100"
            disabled={loading}
          >
            {loading ? "กำลังค้นหา..." : "ค้นหาบิล"}
          </button>
        </form>
      </div>
    </div>
  );
}
