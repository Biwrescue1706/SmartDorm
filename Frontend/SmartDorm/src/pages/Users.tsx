import { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { API_BASE } from "../config";
import Nav from "../components/Nav";
import { useAuth } from "../hooks/useAuth";
import Pagination from "../components/Pagination";
import * as Dialog from "@radix-ui/react-dialog";

interface BookingDetail {
  bookingId: string;
  room?: { number: string };
  createdAt?: string;
  checkin?: string;
  actualCheckin?: string;
}

interface Customer {
  customerId: string;
  userName: string;
  fullName: string;
  cphone: string;
  cmumId?: string;
  bookings?: BookingDetail[];
  createdAt: string;
}

// 🗓️ ฟังก์ชันแปลงวันที่ไทย
const formatThaiDate = (d?: string) => {
  if (!d) return "-";
  const date = new Date(d);
  return date.toLocaleDateString("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

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
      setSearch(""); // ✅ เคลียร์ช่องค้นหาเมื่อกดโหลดใหม่
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

      // 🔹 เรียงชื่อจาก ก → ฮ
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

  // 🔍 ค้นหาลูกค้า
  const handleSearch = async () => {
    if (!search.trim()) return; // ✅ ถ้าไม่มีข้อความในช่องค้นหา จะไม่ค้นหา
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

  // ❌ ลบลูกค้า
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

          {/* 🔍 กล่องค้นหา */}
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

          {/* 📊 ตารางข้อมูล */}
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
              <thead className="table-dark">
                <tr>
                  <th style={{ width: "5%" }}>#</th>
                  <th style={{ width: "5%" }}>LINE</th>
                  <th style={{ width: "5%" }}>ดูประวัติ</th>
                  <th style={{ width: "5%" }}>ลบ</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={4} className="text-center py-4">
                      <div className="spinner-border text-primary"></div>
                    </td>
                  </tr>
                ) : paginatedUsers.length > 0 ? (
                  paginatedUsers.map((u, idx) => (
                    <tr key={u.customerId}>
                      <td>{startIndex + idx + 1}</td>
                      <td>{u.userName || "-"}</td>
                      <td>
                        <button
                          className="btn btn-sm btn-info text-white"
                          onClick={() => {
                            setSelectedUser(u);
                            setShowDialog(true);
                          }}
                        >
                          ดูประวัติ
                        </button>
                      </td>
                      <td>
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
                    <td colSpan={4} className="text-center text-muted py-4">
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

      {/* ✅ Dialog แสดงประวัติ */}
      <Dialog.Root open={showDialog} onOpenChange={setShowDialog}>
        <Dialog.Portal>
          <Dialog.Overlay
            className="position-fixed top-0 start-0 w-100 h-100"
            style={{ backgroundColor: "rgba(0,0,0,0.4)", zIndex: 1040 }}
          />
          <Dialog.Content
            className="position-fixed top-50 start-50 translate-middle bg-white rounded-4 shadow-lg p-4"
            style={{
              width: "90%",
              maxWidth: "650px",
              maxHeight: "85vh",
              overflowY: "auto",
              zIndex: 1050,
            }}
          >
            <Dialog.Title className="fw-bold fs-5 mb-3 text-center">
              รายละเอียดของ {selectedUser?.userName}
            </Dialog.Title>

            {selectedUser?.bookings && selectedUser.bookings.length > 0 ? (
              <div className="d-flex flex-column gap-3">
                {(() => {
                  // ✅ เรียงจากเก่ามาหาใหม่
                  const sorted = [...selectedUser.bookings].sort((a, b) => {
                    const dateA = new Date(a.createdAt || "").getTime();
                    const dateB = new Date(b.createdAt || "").getTime();
                    if (dateA !== dateB) return dateA - dateB;
                    const roomA = parseInt(a.room?.number || "0", 10);
                    const roomB = parseInt(b.room?.number || "0", 10);
                    return roomA - roomB;
                  });

                  // ✅ จัดกลุ่มตามวันที่
                  const grouped: Record<string, BookingDetail[]> = {};
                  sorted.forEach((b) => {
                    const day = formatThaiDate(b.createdAt);
                    if (!grouped[day]) grouped[day] = [];
                    grouped[day].push(b);
                  });

                  return Object.entries(grouped).map(([day, bookings]) => (
                    <div key={day}>
                      <h6 className="fw-bold text-primary border-bottom pb-1 mb-2">
                        📅 วันที่ {day}
                      </h6>
                      {bookings.map((b) => (
                        <div
                          key={b.bookingId}
                          className="border rounded-3 p-3 shadow-sm bg-light mb-2"
                        >
                          <p className="mb-1">
                            <strong>ห้องที่เช่าอยู่ : </strong>{" "}
                            {b.room?.number || "-"}
                          </p>
                          <p className="mb-1">
                            <strong>ชื่อเต็มผู้จอง : </strong>{" "}
                            {selectedUser.fullName || "-"}
                          </p>
                          <p className="mb-1">
                            <strong>เบอร์โทร : </strong>{" "}
                            {selectedUser.cphone || "-"}
                          </p>
                          <p className="mb-1">
                            <strong>วันที่จอง : </strong>{" "}
                            {formatThaiDate(b.createdAt)}
                          </p>
                          <p className="mb-1">
                            <strong>วันที่ขอเข้าพัก : </strong>{" "}
                            {formatThaiDate(b.checkin)}
                          </p>
                          <p className="mb-1">
                            <strong>วันที่เข้าพักจริง : </strong>{" "}
                            {formatThaiDate(b.actualCheckin)}
                          </p>
                        </div>
                      ))}
                    </div>
                  ));
                })()}
              </div>
            ) : (
              <p className="text-muted text-center">ไม่มีประวัติการจอง</p>
            )}

            <div className="text-center mt-4">
              <Dialog.Close asChild>
                <button className="btn btn-secondary px-4">ปิด</button>
              </Dialog.Close>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}