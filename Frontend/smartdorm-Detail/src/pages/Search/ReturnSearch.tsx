import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import NavBar from "../../components/NavBar";

export default function ReturnSearch() {
  const [checkoutId, setCheckoutId] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!checkoutId.trim()) {
      Swal.fire("แจ้งเตือน", "กรุณากรอกรหัสการคืนห้อง", "warning");
      return;
    }

    setLoading(true);

    try {
      navigate(`/checkout/${checkoutId.trim()}`);
    } catch {
      Swal.fire("ผิดพลาด", "ไม่สามารถค้นหาข้อมูลได้", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <NavBar />

      <div
        className="container-fluid d-flex justify-content-center align-items-center"
        style={{ minHeight: "calc(100vh - 70px)" }}
      >
        <div className="col-12 col-sm-10 col-md-6 col-lg-4 text-center">

          <h3 className="fw-bold mb-3">คืนห้องพัก</h3>

          <p className="text-muted mb-4">
            กรอกรหัสการคืนห้องเพื่อดูรายละเอียด
          </p>

          <form onSubmit={submit}>
            <input
              className="form-control form-control-lg text-center mb-3 rounded-4"
              placeholder="เช่น CO240001"
              value={checkoutId}
              onChange={(e) => setCheckoutId(e.target.value)}
            />

            <button
              className="btn btn-danger w-100 rounded-4 fw-bold"
              disabled={loading}
            >
              {loading ? "กำลังค้นหา..." : "ค้นหาการคืนห้อง"}
            </button>
          </form>

        </div>
      </div>
    </>
  );
}
