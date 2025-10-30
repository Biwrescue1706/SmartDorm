import { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { API_BASE } from "../config";
import Nav from "../components/Nav";
import { useAuth } from "../hooks/useAuth";
import Pagination from "../components/Pagination";
import { Modal, Button } from "react-bootstrap";

interface Customer {
  customerId: string;
  userName: string;
  fullName: string;
  cphone: string;
  cmumId?: string;
  bookings?: { bookingId: string; room?: { number: string }; createdAt?: string }[];
  bills?: { billId: string; total: number; status: number }[];
  createdAt: string;
}

export default function Users() {
  const { message, handleLogout, role } = useAuth();
  const [users, setUsers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedUser, setSelectedUser] = useState<Customer | null>(null);
  const [showDialog, setShowDialog] = useState(false);

  const startIndex = (currentPage - 1) * rowsPerPage;

  // 📋 ดึงข้อมูลลูกค้าทั้งหมด
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/user/getall`);
      let allUsers: Customer[] = res.data.users || [];

      // 🔹 รวม LINE ซ้ำ
      const merged: Record<string, Customer> = {};
      allUsers.forEach((u) => {
        if (!merged[u.userName]) {
          merged[u.userName] = { ...u, bookings: [...(u.bookings || [])] };
        } else {
          merged[u.userName].bookings?.push(...(u.bookings || []));
        }
      });

      // 🔹 แปลงกลับเป็น array และเรียงชื่อจาก ก → ฮ
      const sorted = Object.values(merged).sort((a, b) =>
        a.fullName.localeCompare(b.fullName, "th")
      );

      setUsers(sorted);
    } catch (err) {
      console.error("❌ โหลดข้อมูลลูกค้าไม่สำเร็จ:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/user/search`, {
        params: { keyword: search },
      });
      setUsers(res.data.users);
    } catch (err) {
      console.error("❌ ค้นหาลูกค้าไม่สำเร็จ:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (customerId: string, fullName: string) => {
    const confirm = await Swal.fire({
      title: "ยืนยันการลบ?",
      text: `คุณต้องการลบลูกค้า "${fullName}" หรือไม่?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "ลบ",
      cancelButtonText: "ยกเลิก",
      confirmButtonColor: "#dc3545",
    });

    if (!confirm.isConfirmed) return;

    try {
      await axios.delete(`${API_BASE}/user/${customerId}`);
      Swal.fire("สำเร็จ!", "ลบลูกค้าสำเร็จ", "success");
      fetchUsers();
    } catch {
      Swal.fire("เกิดข้อผิดพลาด", "ไม่สามารถลบลูกค้าได้", "error");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const paginatedUsers = users.slice(startIndex, startIndex + rowsPerPage);

  return (
    <>
      <Nav message={message} onLogout={handleLogout} role={role} />

      <main className="main-content flex-grow-1 px-3 py-4 mt-6 mt-lg-5">
        <div className="mx-auto container-max">
          <h2 className="fw-bold mb-4 text-center">📋 รายชื่อลูกค้าทั้งหมด</h2>

          <div className="d-flex justify-content-center mb-3">
            <input
              type="text"
              className="form-control w-50 me-2"
              placeholder="🔍 ค้นหาชื่อ เบอร์โทร หรือหมายเลขห้อง..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <button className="btn btn-primary me-2" onClick={handleSearch}>
              ค้นหา
            </button>
            <button className="btn btn-secondary" onClick={fetchUsers}>
              โหลดใหม่
            </button>
          </div>

          <div
            className="table-scroll border rounded responsive-table"
            style={{
              maxHeight: "70vh",
              overflowY: "auto",
              overflowX: "auto",
              borderRadius: "8px",
            }}
          >
            <table
              className="table table-sm table-striped align-middle text-center"
              style={{ tableLayout: "fixed", width: "100%" }}
            >
              <thead className="table-dark sticky-top">
                <tr>
                  <th>#</th>
                  <th>LINE</th>
                  <th>ชื่อเต็มผู้จอง</th>
                  <th>เบอร์โทร</th>
                  <th>ห้องที่เช่าอยู่</th>
                  <th>จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-4">
                      <div className="spinner-border text-primary"></div>
                    </td>
                  </tr>
                ) : paginatedUsers.length > 0 ? (
                  paginatedUsers.map((u, idx) => (
                    <tr key={u.customerId}>
                      <td>{startIndex + idx + 1}</td>
                      <td>{u.userName || "-"}</td>
                      <td>{u.fullName || "-"}</td>
                      <td>{u.cphone || "-"}</td>
                      <td>
                        {u.bookings && u.bookings.length > 0
                          ? u.bookings
                              .filter((b) => b.room && b.room.number)
                              .map((b) => b.room?.number)
                              .join(", ")
                          : "-"}
                      </td>
                      <td>
                        <button
                          className="btn btn-sm btn-info text-white me-2"
                          onClick={() => {
                            setSelectedUser(u);
                            setShowDialog(true);
                          }}
                        >
                          รายละเอียด
                        </button>
                        <button
                          className="btn btn-sm text-white"
                          style={{
                            background:
                              "linear-gradient(100deg, #ff0505, #f645c4)",
                          }}
                          onClick={() => handleDelete(u.customerId, u.fullName)}
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center text-muted py-4">
                      ไม่พบข้อมูลลูกค้า
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={currentPage}
            totalItems={users.length}
            rowsPerPage={rowsPerPage}
            onPageChange={setCurrentPage}
            onRowsPerPageChange={(rows) => {
              setRowsPerPage(rows);
              setCurrentPage(1);
            }}
          />
        </div>
      </main>

      {/* 🔍 Dialog แสดงรายละเอียด */}
      <Modal show={showDialog} onHide={() => setShowDialog(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            ประวัติการจองของ {selectedUser?.fullName}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedUser?.bookings && selectedUser.bookings.length > 0 ? (
            <ul className="list-group">
              {selectedUser.bookings
                .sort(
                  (a, b) =>
                    new Date(b.createdAt || "").getTime() -
                    new Date(a.createdAt || "").getTime()
                )
                .map((b) => (
                  <li key={b.bookingId} className="list-group-item">
                    ห้อง {b.room?.number || "-"} — วันที่{" "}
                    {b.createdAt
                      ? new Date(b.createdAt).toLocaleDateString("th-TH")
                      : "-"}
                  </li>
                ))}
            </ul>
          ) : (
            <p className="text-muted">ไม่มีประวัติการจอง</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDialog(false)}>
            ปิด
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}