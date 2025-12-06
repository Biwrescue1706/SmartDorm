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
  count?: number; // ⭐ เพิ่มจำนวนประวัติ
}

const formatThaiDate = (s?: string) =>
  s
    ? new Date(s).toLocaleDateString("th-TH", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "-";

export default function Users() {
  const { message, handleLogout, role, adminName, adminUsername } = useAuth();

  const [users, setUsers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [width, setWidth] = useState(window.innerWidth);
  const [selectedUser, setSelectedUser] = useState<Customer | null>(null);
  const [showDialog, setShowDialog] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const startIndex = (currentPage - 1) * rowsPerPage;

  useEffect(() => {
    window.addEventListener("resize", () => setWidth(window.innerWidth));
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/user/getall`);
      const merged: Record<string, Customer> = {};

      (res.data.users || []).forEach((u: Customer) => {
        if (!merged[u.userName]) {
          merged[u.userName] = {
            ...u,
            bookings: [...(u.bookings || [])],
            count: u.bookings?.length || 0,
          };
        } else {
          merged[u.userName].bookings?.push(...(u.bookings || []));
          merged[u.userName].count = merged[u.userName].bookings?.length || 0;
        }
      });

      setUsers(Object.values(merged).sort((a, b) => a.userName.localeCompare(b.userName, "th")));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSearch = async () => {
    if (!search.trim()) return;
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/user/search`, { params: { keyword: search } });
      setUsers(res.data.users || []);
    } finally {
      setLoading(false);
      setCurrentPage(1);
    }
  };

  /* ลบ booking */
  const handleDeleteBooking = async (b: BookingDetail) => {
    const ok = await Swal.fire({
      title: "ยืนยันการลบ?",
      text: `ห้อง ${b.room?.number}`,
      showCancelButton: true,
      confirmButtonText: "ลบ",
    });
    if (!ok.isConfirmed) return;

    await axios.delete(`${API_BASE}/booking/${b.bookingId}`);
    Swal.fire("สำเร็จ", "ลบรายการแล้ว", "success");

    setSelectedUser((p) =>
      p ? { ...p, bookings: p.bookings?.filter((x) => x.bookingId !== b.bookingId) } : p
    );

    fetchUsers();
  };

  /* ลบลูกค้า */
  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    const ok = await Swal.fire({
      title: "ลบลูกค้า?",
      html: `<b>${selectedUser.userName}</b>`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "ลบทั้งหมด",
    });
    if (!ok.isConfirmed) return;

    await axios.delete(`${API_BASE}/user/${selectedUser.customerId}`);
    Swal.fire("สำเร็จ", "ลบแล้ว", "success");
    setUsers((p) => p.filter((x) => x.customerId !== selectedUser.customerId));
    setShowDialog(false);
  };

  if (loading)
    return (
      <div className="vh-100 d-flex justify-content-center align-items-center">
        <div className="spinner-border text-primary"></div>
      </div>
    );

  const paginated = users.slice(startIndex, startIndex + rowsPerPage);

  return (
    <>
      <Nav message={message} onLogout={handleLogout} role={role} adminName={adminName} adminUsername={adminUsername} />

      <main className="main-content px-2 mt-6">
        <div className="container-max mx-auto">
          <h3 className="fw-bold text-center mb-3">📌 รายชื่อลูกค้า</h3>

          <div className="d-flex justify-content-center gap-2 mb-3">
            <input
              className="form-control w-50"
              placeholder="ค้นหาชื่อลูกค้า..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <button className="btn btn-primary" onClick={handleSearch}>
              ค้นหา
            </button>
            <button className="btn btn-secondary" onClick={fetchUsers}>
              รีเฟรช
            </button>
          </div>

          {/* ตารางชื่อ */}
          <table className="table table-hover shadow-sm text-center align-middle">
            <thead className="table-dark">
              <tr>
                <th>#</th>
                <th>LINE NAME</th>
                <th>จำนวนครั้งที่จอง</th>
                <th>ดูประวัติ</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((u, idx) => (
                <tr key={u.customerId}>
                  <td>{startIndex + idx + 1}</td>
                  <td className="fw-bold">{u.userName}</td>
                  <td>
                    <span className="badge bg-purple">{u.count}</span>
                  </td>
                  <td>
                    <button
                      className="btn btn-info btn-sm text-white"
                      onClick={() => {
                        setSelectedUser(u);
                        setShowDialog(true);
                      }}
                    >
                      ดูประวัติ
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <Pagination
            currentPage={currentPage}
            totalItems={users.length}
            rowsPerPage={rowsPerPage}
            onPageChange={setCurrentPage}
            onRowsPerPageChange={(r) => {
              setRowsPerPage(r);
              setCurrentPage(1);
            }}
          />
        </div>
      </main>

      {/* Dialog แสดงประวัติทั้งหมด */}
      <Dialog.Root open={showDialog} onOpenChange={setShowDialog}>
        <Dialog.Portal>
          <Dialog.Overlay className="position-fixed top-0 start-0 w-100 h-100" style={{ background: "rgba(0,0,0,.4)" }} />

          <Dialog.Content
            className="position-fixed top-50 start-50 translate-middle bg-white rounded-4 shadow-lg p-4"
            style={{ width: "90%", maxWidth: "650px", maxHeight: "85vh", overflowY: "auto" }}
          >
            <h5 className="fw-bold text-center mb-3">ประวัติของ {selectedUser?.userName}</h5>

            {selectedUser?.bookings?.length ? (
              selectedUser.bookings.map((b) => (
                <div key={b.bookingId} className="p-3 bg-light rounded shadow-sm mb-2">
                  <p><b>ห้อง:</b> {b.room?.number}</p>
                  <p><b>ชื่อ:</b> {b.fullName}</p>
                  <p><b>โทร:</b> {b.cphone}</p>
                  <p><b>จอง:</b> {formatThaiDate(b.createdAt)}</p>
                  <p><b>เช็คอิน:</b> {formatThaiDate(b.checkin)}</p>
                  <button className="btn btn-danger btn-sm w-100 mt-2" onClick={() => handleDeleteBooking(b)}>
                    ลบรายการนี้
                  </button>
                </div>
              ))
            ) : (
              <p className="text-center text-muted">ไม่มีประวัติการจอง</p>
            )}

            {role === 0 && (
              <button className="btn btn-outline-danger w-100 mt-2" onClick={handleDeleteUser}>
                ลบลูกค้าคนนี้ทั้งหมด
              </button>
            )}

            <Dialog.Close asChild>
              <button className="btn btn-secondary w-100 mt-2">ปิด</button>
            </Dialog.Close>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}