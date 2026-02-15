import { useEffect, useState } from "react";
import Nav from "../components/Nav";
import Swal from "sweetalert2";
import { useAuth } from "../hooks/useAuth";
import { API_BASE } from "../config";
import { usePendingCheckouts } from "../hooks/ManageRooms/usePendingCheckouts";
import { usePendingBookings } from "../hooks/ManageRooms/usePendingBookings";

export default function DormProfile() {
  const { handleLogout, role, adminName, adminUsername } = useAuth();
  const pendingBookings = usePendingBookings();
  const pendingCheckouts = usePendingCheckouts();

  const [form, setForm] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/dorm-profile/`, { credentials: "include" })
      .then((r) => r.json())
      .then(setForm)
      .catch(() => Swal.fire("โหลดข้อมูลไม่สำเร็จ"));
  }, []);

  const update = (key: string, value: any) =>
    setForm({ ...form, [key]: value });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await fetch(`${API_BASE}/dorm-profile/`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setLoading(false);

    if (res.ok) Swal.fire("บันทึกสำเร็จ", "", "success");
    else Swal.fire("เกิดข้อผิดพลาด");
  };

  if (!form) return <div>Loading...</div>;

  return (
    <div className="d-flex min-vh-100 mx-2 mt-0 mb-4">
      <Nav
        onLogout={handleLogout}
        role={role}
        adminName={adminName}
        adminUsername={adminUsername}
        pendingBookings={pendingBookings}
        pendingCheckouts={pendingCheckouts}
      />

      <main className="flex-grow-1 px-3 py-4 mt-6 mt-lg-7">
        <div className="container-fluid d-flex justify-content-center">
          <div className="card shadow w-100" style={{ maxWidth: 900 }}>
            <div className="card-body">
              <h4 className="fw-bold text-center mb-4">
                🏢 ตั้งค่าหอพัก
              </h4>

              <form onSubmit={submit}>
                {Input("ชื่อหอพัก", form.dormName, v => update("dormName", v))}
                {Input("ที่อยู่", form.address, v => update("address", v))}
                {Input("โทรศัพท์", form.phone, v => update("phone", v))}
                {Input("อีเมล", form.email, v => update("email", v))}
                {Input("เลขภาษี", form.taxId, v => update("taxId", v))}

                <hr />

                <h6 className="fw-bold">💰 ค่าใช้จ่ายพื้นฐาน</h6>

                {Input("ค่าส่วนกลาง", form.service, v => update("service", v))}
                {Input("ค่าน้ำ/หน่วย", form.waterRate, v => update("waterRate", v))}
                {Input("ค่าไฟ/หน่วย", form.electricRate, v => update("electricRate", v))}
                {Input("ค่าปรับ/วัน", form.overdueFinePerDay, v => update("overdueFinePerDay", v))}

                <button
                  className="btn btn-warning w-100 mt-3 fw-bold"
                  disabled={loading}
                >
                  💾 บันทึกข้อมูล
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function Input(label: string, value: any, set: (v: any) => void) {
  return (
    <div className="mb-3">
      <label className="form-label fw-semibold">{label}</label>
      <input
        className="form-control border-warning border-2"
        value={value ?? ""}
        onChange={(e) => set(e.target.value)}
      />
    </div>
  );
}