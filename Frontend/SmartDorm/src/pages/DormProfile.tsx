//src/pages/DormProfile.tsx
import { useState, useEffect, useRef } from "react";
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
  const [signaturePreview, setSignaturePreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
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

    const formData = new FormData();

    Object.entries(form).forEach(([k, v]) => {
      if (v !== null && v !== undefined) {
        formData.append(k, String(v));
      }
    });

    if (file) formData.append("signature", file);

    const res = await fetch(`${API_BASE}/dorm-profile/`, {
      method: "PUT",
      credentials: "include",
      body: formData,
    });

    setLoading(false);

    if (res.ok) {
      Swal.fire({
        icon: "success",
        title: "บันทึกสำเร็จ",
        timer: 1500,
        showConfirmButton: false,
      });
    } else {
      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        timer: 1500,
        showConfirmButton: false,
      });
    }
  };

  if (!form) return <div>Loading...</div>;

  return (
    <div
      className="d-flex min-vh-100 mx-2 mt-0 mb-4"
      style={{ fontFamily: "Sarabun, sans-serif" }}
    >
      <Nav
        onLogout={handleLogout}
        role={role}
        adminName={adminName}
        adminUsername={adminUsername}
        pendingBookings={pendingBookings}
        pendingCheckouts={pendingCheckouts}
      />

      <main
        className="main-content flex-grow-1 px-2 py-3 mt-6 mt-lg-7"
        style={{
          paddingLeft: "20px",
          paddingRight: "20px",
        }}
      >
        <div className="container-fluid d-flex justify-content-center align-items-start text-dark">
          <div className="mx-auto" style={{ maxWidth: "1400px" }}>
            <div className="card-body">
              <h4 className="fw-bold text-center text-dark mb-4">
                🏢 ตั้งค่าหอพัก
              </h4>

              <form onSubmit={submit}>
                <fieldset disabled={role === 1}>
                  {Input("ชื่อหอพัก", form.dormName, (v) =>
                    update("dormName", v),
                  )}
                  {Input("ที่อยู่", form.address, (v) => update("address", v))}
                  {Input("โทรศัพท์", form.phone, (v) => update("phone", v))}
                  {Input("อีเมล", form.email, (v) => update("email", v))}
                  {Input("เลขภาษี", form.taxId, (v) => update("taxId", v))}

                  {/* ลายเซ็น */}
                  <div className="mb-4">
                    <label className="fw-bold mb-2">รูปภาพลายเซ็น</label>

                    <div
                      onClick={() => fileRef.current?.click()}
                      style={{
                        border: "2px dashed #ccc",
                        height: 160,
                        borderRadius: 8,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        overflow: "hidden",
                        background: "#fafafa",
                        cursor: "pointer",
                      }}
                    >
                      {signaturePreview || form.signatureUrl ? (
                        <img
                          src={signaturePreview || form.signatureUrl}
                          alt="signature"
                          style={{ maxHeight: "100%" }}
                        />
                      ) : (
                        <span className="text-muted">คลิกเพื่อเลือกรูป</span>
                      )}
                    </div>

                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (!f) return;

                        setFile(f);
                        const url = URL.createObjectURL(f);
                        setSignaturePreview(url);
                      }}
                    />
                  </div>

                  {/* ชื่อผู้รับเงิน */}
                  <hr />
                  <h6 className="fw-bold mt-3">ชื่อผู้รับเงิน</h6>

                  <div className="row g-2">
                    <div className="col-md-3">
                      <label className="form-label fw-semibold">คำนำหน้า</label>
                      <select
                        className="form-select border-warning border-2"
                        value={form.receiverTitle ?? ""}
                        onChange={(e) =>
                          update("receiverTitle", e.target.value)
                        }
                      >
                        <option value="">เลือก</option>
                        <option value="นาย">นาย</option>
                        <option value="นาง">นาง</option>
                        <option value="น.ส.">นางสาว</option>
                      </select>
                    </div>

                    <div className="col-md-4">
                      <label className="form-label fw-semibold">ชื่อ</label>
                      <input
                        className="form-control border-warning border-2"
                        value={form.receiverName ?? ""}
                        onChange={(e) => update("receiverName", e.target.value)}
                      />
                    </div>

                    <div className="col-md-5">
                      <label className="form-label fw-semibold">นามสกุล</label>
                      <input
                        className="form-control border-warning border-2"
                        value={form.receiverSurname ?? ""}
                        onChange={(e) =>
                          update("receiverSurname", e.target.value)
                        }
                      />
                    </div>
                  </div>

                  {/* ค่าใช้จ่าย */}
                  <hr />
                  <h6 className="fw-bold">💰 ค่าใช้จ่ายพื้นฐาน</h6>

                  {Input("ค่าส่วนกลาง", form.service, (v) =>
                    update("service", v),
                  )}
                  {Input("ค่าน้ำ/หน่วย", form.waterRate, (v) =>
                    update("waterRate", v),
                  )}
                  {Input("ค่าไฟ/หน่วย", form.electricRate, (v) =>
                    update("electricRate", v),
                  )}
                  {Input("ค่าปรับ/วัน", form.overdueFinePerDay, (v) =>
                    update("overdueFinePerDay", v),
                  )}
                </fieldset>

                {role === 1 ? (
                  <div className="alert alert-warning mt-3 mb-0">
                    คุณไม่มีสิทธิ์แก้ไขข้อมูลนี้
                  </div>
                ) : (
                  <button
                    className="btn btn-warning w-100 mt-3 fw-bold"
                    disabled={loading || role === 1}
                  >
                    💾 บันทึกข้อมูล
                  </button>
                )}
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
