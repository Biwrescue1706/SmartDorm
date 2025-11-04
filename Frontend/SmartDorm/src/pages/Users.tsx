// src/pages/Users.tsx
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
  fullName?: string;
  cphone?: string;
}

interface Customer {
  customerId: string;
  userName: string;
  userId: string;
  bookings?: BookingDetail[];
  createdAt: string;
}

const formatThaiDate = (d?: string) => {
  if (!d) return "-";
  const date = new Date(d);
  return isNaN(date.getTime())
    ? "-"
    : date.toLocaleDateString("th-TH", {
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

  const fetchUsers = async () => {
    try {
      setLoading(false);
      setSearch("");
      const res = await axios.get(`${API_BASE}/user/getall`);
      let allUsers: Customer[] = res.data.users || [];

      const merged: Record<string, Customer & { bookings: BookingDetail[] }> =
        {};
      allUsers.forEach((u) => {
        if (!merged[u.userName]) {
          merged[u.userName] = { ...u, bookings: [...(u.bookings || [])] };
        } else {
          merged[u.userName].bookings?.push(...(u.bookings || []));
        }
      });

      const sorted = Object.values(merged).sort((a, b) =>
        a.userName.localeCompare(b.userName, "th")
      );

      setUsers(sorted);
    } catch (err) {
      console.error("❌ โหลดข้อมูลลูกค้าไม่สำเร็จ:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSearch = async () => {
    if (!search.trim()) return;
    try {
      const res = await axios.get(`${API_BASE}/user/search`, {
        params: { keyword: search },
      });
      setUsers(res.data.users || []);
      setCurrentPage(1);
    } catch (err) {
      console.error("❌ ค้นหาลูกค้าไม่สำเร็จ:", err);
    }
  };

  const handleDelete = async (customerId: string, userName: string) => {
    const result = await Swal.fire({
      title: `ยืนยันการลบ`,
      text: `คุณต้องการลบลูกค้า ${userName} ใช่หรือไม่?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "ใช่, ลบเลย",
      cancelButtonText: "ยกเลิก",
      confirmButtonColor: "#e74c3c",
    });

    if (!result.isConfirmed) return;

    try {
      await axios.delete(`${API_BASE}/user/${customerId}`);
      Swal.fire("สำเร็จ", "ลบลูกค้าเรียบร้อยแล้ว", "success");
      setShowDialog(false);
      fetchUsers();
    } catch (err) {
      Swal.fire("เกิดข้อผิดพลาด", "ไม่สามารถลบลูกค้าได้", "error");
    }
  };

  if (loading)
    return (
      <div className="vh-100 d-flex justify-content-center align-items-center">
        <div className="spinner-border text-teal" role="status"></div>
      </div>
    );

  const paginatedUsers = users.slice(startIndex, startIndex + rowsPerPage);

  return (
    <>
      <Nav message={message} role={role} onLogout={handleLogout} />

      <main className="main-content flex-grow-1 px-3 py-4 mt-6 mt-lg-5">
        <div className="mx-auto container-max">
          <h3 className="fw-bold mb-4 text-center">
            📋 รายชื่อลูกค้าทั้งหมด ({users.length} คน)
          </h3>

          <div className="d-flex justify-content-center mb-3">
            <input
              type="text"
              className="form-control w-50 me-3"
              placeholder="🔍 ค้นหาชื่อ เบอร์โทร หรือหมายเลขห้อง..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" && search.trim() && handleSearch()
              }
            />
          </div>
          <div className="d-flex justify-content-center mb-3">
            <button className="btn btn-primary me-2" onClick={handleSearch}>
              ค้นหา
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => {
                setSearch("");
                setCurrentPage(1);
                fetchUsers();
              }}
            >
              โหลดใหม่
            </button>
          </div>

          {/* 📊 ตาราง */}
          <div className="responsive-table" style={{ overflowX: "auto" }}>
            <table
              className="table table-sm table-striped align-middle text-center"
              style={{ tableLayout: "fixed", width: "100%" }}
            >
              <thead className="table-dark">
                <tr>
                  <th scope="col" style={{ width: "5%" }}>
                    #
                  </th>
                  <th scope="col" style={{ width: "5%" }}>
                    LINE
                  </th>
                  <th scope="col" style={{ width: "5%" }}>
                    ดูประวัติ
                  </th>
                  <th scope="col" style={{ width: "5%" }}>
                    ลบ
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedUsers.length > 0 ? (
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
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDelete(u.customerId, u.userName)}
                        >
                          ลบ
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

      {/* ✅ Dialog ประวัติ */}
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

            <Dialog.Description className="text-muted text-center mb-3">
              ดูข้อมูลลูกค้าและประวัติการจองห้องพัก
            </Dialog.Description>

            {selectedUser?.bookings?.length ? (
              <div className="d-flex flex-column gap-3">
                {[...selectedUser.bookings]
                  .sort(
                    (a, b) =>
                      new Date(a.createdAt || "").getTime() -
                      new Date(b.createdAt || "").getTime()
                  )
                  .map((b) => (
                    <div
                      key={b.bookingId}
                      className="border rounded-3 p-3 shadow-sm bg-light mb-2"
                    >
                      <p>
                        <strong>ห้อง:</strong> {b.room?.number || "-"}
                      </p>
                      <p>
                        <strong>ชื่อผู้จอง:</strong> {b.fullName || "-"}
                      </p>
                      <p>
                        <strong>เบอร์โทร:</strong> {b.cphone || "-"}
                      </p>
                      <p>
                        <strong>วันที่จอง:</strong>{" "}
                        {formatThaiDate(b.createdAt)}
                      </p>
                      <p>
                        <strong>วันที่เข้าพัก:</strong>{" "}
                        {formatThaiDate(b.checkin)}
                      </p>
                      <p>
                        <strong>เข้าพักจริง:</strong>{" "}
                        {formatThaiDate(b.actualCheckin)}
                      </p>
                    </div>
                  ))}
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
