// src/pages/AdminManagement.tsx
import { useEffect, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import "bootstrap/dist/css/bootstrap.min.css";
import { API_BASE } from "../config";
import { useAuth } from "../hooks/useAuth";
import Nav from "../components/Nav";

interface Admin {
  adminId: string;
  username: string;
  name: string;
  role: number;
  createdAt: string;
  updatedAt: string;
}

export default function AdminManagement() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const { message, handleLogout, role } = useAuth();
  const [pendingBookings] = useState(0);

  const [openAdd, setOpenAdd] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
  const [modalType, setModalType] = useState<"edit" | "delete" | null>(null);

  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [roleValue, setRoleValue] = useState("1");

  //  โหลดข้อมูลแอดมินทั้งหมด
  const fetchAdmins = async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/getall`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("โหลดข้อมูลผู้ดูแลล้มเหลว");
      const data = await res.json();
      setAdmins(data);
    } catch {
      alert("ไม่สามารถโหลดข้อมูลได้");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const roleLabel = (r: number) => (r === 0 ? "แอดมินหลัก" : "พนักงาน");

  //  เพิ่มสมาชิก
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          username,
          name,
          password,
          role: Number(roleValue),
        }),
      });
      if (!res.ok) throw new Error("เพิ่มไม่สำเร็จ");
      setOpenAdd(false);
      setUsername("");
      setName("");
      setPassword("");
      setRoleValue("1");
      fetchAdmins();
    } catch (err: any) {
      alert(err.message);
    }
  };

  //  แก้ไขข้อมูล
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAdmin) return;
    try {
      const res = await fetch(`${API_BASE}/admin/${selectedAdmin.adminId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name, password, role: Number(roleValue) }),
      });
      if (!res.ok) throw new Error("บันทึกไม่สำเร็จ");
      setSelectedAdmin(null);
      setModalType(null);
      fetchAdmins();
    } catch (err: any) {
      alert(err.message);
    }
  };

  //  ลบข้อมูล
  const handleDeleteSubmit = async () => {
    if (!selectedAdmin) return;
    try {
      const res = await fetch(`${API_BASE}/admin/${selectedAdmin.adminId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("ลบไม่สำเร็จ");
      setSelectedAdmin(null);
      setModalType(null);
      fetchAdmins();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // 🎨 ปุ่ม Gradient แยกสี
  const styles = {
    add: {
      background: "linear-gradient(135deg,#6a11cb,#2575fc)",
      color: "white",
      border: "none",
    },
    edit: {
      background: "linear-gradient(135deg,#f9d423,#ff4e50)",
      color: "white",
      border: "none",
    },
    delete: {
      background: "linear-gradient(135deg,#ff512f,#dd2476)",
      color: "white",
      border: "none",
    },
    save: {
      background: "linear-gradient(135deg,#00b09b,#96c93d)",
      color: "white",
      border: "none",
    },
    cancel: {
      background: "linear-gradient(135deg,#434343,#000000)",
      color: "white",
      border: "none",
    },
  } as const;

  return (
    <div
      className="d-flex flex-column"
      style={{ backgroundColor: "#f4f7fb", minHeight: "100vh" }}
    >
      <Nav
        message={message}
        onLogout={handleLogout}
        pendingBookings={pendingBookings}
        role={role}
      />
      <main className="main-content flex-grow-1 px-1 py-5 mt-2 mt-lg-3">
        <div className="mx-auto container-max">
          <h2
            className="mb-3 mt-2 py-2 text-center fw-bold text-white rounded shadow-sm"
            style={{
              background: "linear-gradient(100deg, #007bff, #00d4ff)",
              boxShadow: "0 2px 6px rgba(0, 0, 0, 0.1)",
              fontSize: "1.4rem",
            }}
          >จัดการผู้ดูแลระบบ</h2>

          {/* ➕ เพิ่มสมาชิก */}
          <Dialog.Root open={openAdd} onOpenChange={setOpenAdd}>
            <Dialog.Trigger asChild>
              <button
                className="btn fw-bold rounded-pill text-center shadow-sm text-white px-4 py-2"
                style={styles.add}
              >
                เพิ่มสมาชิก
              </button>
            </Dialog.Trigger>
            <Dialog.Portal>
              <Dialog.Overlay className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50" />
              <Dialog.Content
                className="position-fixed top-50 start-50 translate-middle card p-4 rounded-4 shadow-lg"
                style={{ width: "400px" }}
              >
                <Dialog.Title className="fw-bold text-center mb-3">
                  เพิ่มผู้ดูแลระบบใหม่
                </Dialog.Title>
                <Dialog.Description className="visually-hidden">
                  แบบฟอร์มเพิ่มผู้ดูแลระบบใหม่
                </Dialog.Description>

                <form onSubmit={handleAddSubmit}>
                  <div className="mb-2 text-start">
                    <label className="form-label">ชื่อผู้ใช้</label>
                    <input
                      className="form-control form-control-sm"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                    />
                  </div>
                  <div className="mb-2 text-start">
                    <label className="form-label">ชื่อจริง</label>
                    <input
                      className="form-control form-control-sm"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="mb-2 text-start">
                    <label className="form-label">รหัสผ่าน</label>
                    <input
                      type="password"
                      className="form-control form-control-sm"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div className="mb-3 text-start">
                    <label className="form-label">สิทธิ์</label>
                    <select
                      className="form-select form-select-sm"
                      value={roleValue}
                      onChange={(e) => setRoleValue(e.target.value)}
                    >
                      <option value="1">พนักงาน</option>
                      <option value="0">แอดมินหลัก</option>
                    </select>
                  </div>
                  <div className="d-flex justify-content-between">
                    <Dialog.Close asChild>
                      <button className="btn btn-sm px-3" style={styles.cancel}>
                        ยกเลิก
                      </button>
                    </Dialog.Close>
                    <button
                      type="submit"
                      className="btn btn-sm px-3"
                      style={styles.save}
                    >
                      บันทึก
                    </button>
                  </div>
                </form>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
        </div>

        {/* ตารางผู้ดูแลระบบ */}
        {loading ? (
          <p className="text-center mt-4">กำลังโหลดข้อมูล...</p>
        ) : (
          <div className="table-responsive mt-4">
            <table className="table table-striped text-center align-middle shadow-sm">
              <thead className="table-primary">
                <tr>
                  <th>#</th>
                  <th>ชื่อผู้ใช้</th>
                  <th>ชื่อจริง</th>
                  <th>สิทธิ์</th>
                  <th>จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {admins.map((admin, i) => (
                  <tr key={admin.adminId}>
                    <td>{i + 1}</td>
                    <td>{admin.username}</td>
                    <td>{admin.name}</td>
                    <td>{roleLabel(admin.role)}</td>
                    <td>
                      <button
                        className="btn btn-sm mx-1"
                        style={styles.edit}
                        onClick={() => {
                          setSelectedAdmin(admin);
                          setModalType("edit");
                          setName(admin.name);
                          setPassword("");
                          setRoleValue(String(admin.role));
                        }}
                      >
                        ✏️
                      </button>
                      <button
                        className="btn btn-sm mx-1"
                        style={styles.delete}
                        onClick={() => {
                          setSelectedAdmin(admin);
                          setModalType("delete");
                        }}
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ✏️ Modal แก้ไข */}
        {modalType === "edit" && selectedAdmin && (
          <Dialog.Root open onOpenChange={() => setModalType(null)}>
            <Dialog.Portal>
              <Dialog.Overlay className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50" />
              <Dialog.Content
                className="position-fixed top-50 start-50 translate-middle card p-4 rounded-4 shadow-lg"
                style={{ width: "400px" }}
              >
                <Dialog.Title className="fw-bold text-center mb-3">
                  แก้ไขข้อมูลสมาชิก
                </Dialog.Title>
                <Dialog.Description className="visually-hidden">
                  แบบฟอร์มแก้ไขข้อมูลผู้ดูแลระบบ
                </Dialog.Description>

                <form onSubmit={handleEditSubmit}>
                  <div className="mb-2 text-start">
                    <label className="form-label">ชื่อจริง</label>
                    <input
                      className="form-control form-control-sm"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  <div className="mb-2 text-start">
                    <label className="form-label">รหัสผ่านใหม่ (ถ้ามี)</label>
                    <input
                      type="password"
                      className="form-control form-control-sm"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  <div className="mb-3 text-start">
                    <label className="form-label">สิทธิ์</label>
                    <select
                      className="form-select form-select-sm"
                      value={roleValue}
                      onChange={(e) => setRoleValue(e.target.value)}
                    >
                      <option value="0">แอดมินหลัก</option>
                      <option value="1">พนักงาน</option>
                    </select>
                  </div>
                  <div className="d-flex justify-content-between">
                    <Dialog.Close asChild>
                      <button className="btn btn-sm px-3" style={styles.cancel}>
                        ยกเลิก
                      </button>
                    </Dialog.Close>
                    <button
                      type="submit"
                      className="btn btn-sm px-3"
                      style={styles.save}
                    >
                      บันทึก
                    </button>
                  </div>
                </form>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
        )}

        {/* ❌ Modal ลบ */}
        {modalType === "delete" && selectedAdmin && (
          <Dialog.Root open onOpenChange={() => setModalType(null)}>
            <Dialog.Portal>
              <Dialog.Overlay className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50" />
              <Dialog.Content
                className="position-fixed top-50 start-50 translate-middle card p-4 text-center rounded-4 shadow-lg"
                style={{ width: "360px" }}
              >
                <Dialog.Title className="fw-bold mb-3">
                  ยืนยันการลบ
                </Dialog.Title>
                <Dialog.Description className="visually-hidden">
                  กล่องยืนยันการลบผู้ดูแลระบบ
                </Dialog.Description>

                <p>
                  ต้องการลบ <b>{selectedAdmin.username}</b> หรือไม่?
                  <br />
                  การลบนี้ไม่สามารถยกเลิกได้
                </p>
                <div className="d-flex justify-content-between mt-3">
                  <Dialog.Close asChild>
                    <button className="btn btn-sm px-3" style={styles.cancel}>
                      ยกเลิก
                    </button>
                  </Dialog.Close>
                  <button
                    onClick={handleDeleteSubmit}
                    className="btn btn-sm px-3"
                    style={styles.delete}
                  >
                    ลบ
                  </button>
                </div>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
        )}
      </main>
    </div>
  );
}
