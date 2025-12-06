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
  userName: string; // LINE display name
  userId: string;
  fullName?: string; // real name from booking
  bookings?: BookingDetail[];
  createdAt: string;
}

const formatThaiDate = (x?: string) => {
  if (!x) return "-";
  const d = new Date(x);
  return !isNaN(d.getTime())
    ? d.toLocaleDateString("th-TH", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "-";
};

export default function Users() {
  const { message, handleLogout, role, adminName, adminUsername } = useAuth();

  const [users, setUsers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [selectedUser, setSelectedUser] = useState<Customer | null>(null);
  const [showDialog, setShowDialog] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const start = (currentPage - 1) * rowsPerPage;

  // โหลดข้อมูลลูกค้า
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/user/getall`);
      const users: Customer[] = res.data.users || [];

      const merged: Record<string, Customer> = {};

      users.forEach((u) => {
        const realName =
          u.bookings?.find((b) => b.fullName)?.fullName || u.fullName || "-";

        if (!merged[u.userName]) {
          merged[u.userName] = { ...u, fullName: realName };
        } else {
          merged[u.userName].bookings?.push(...(u.bookings || []));
          merged[u.userName].fullName = realName;
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

  // ค้นหา
  const handleSearch = () => {
    if (!search.trim()) return fetchUsers();
    setUsers((prev) =>
      prev.filter(
        (u) =>
          u.userName.includes(search) ||
          (u.fullName && u.fullName.includes(search))
      )
    );
    setCurrentPage(1);
  };

  // ❌ ลบ Booking เดี่ยว
  const deleteBooking = async (b: BookingDetail) => {
    const ok = await Swal.fire({
      title: "ยืนยันการลบรายการจอง?",
      text: `ห้อง ${b.room?.number}`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "ลบ",
      confirmButtonColor: "#d9534f",
    });
    if (!ok.isConfirmed) return;

    try {
      await axios.delete(`${API_BASE}/booking/${b.bookingId}`);
      Swal.fire("สำเร็จ", "ลบรายการแล้ว", "success");
      fetchUsers();
      setSelectedUser((p) =>
        p ? { ...p, bookings: p.bookings?.filter((x) => x.bookingId !== b.bookingId) } : p
      );
    } catch {
      Swal.fire("ผิดพลาด", "ไม่สามารถลบได้", "error");
    }
  };

  // ❌ ลบ User ทั้งคน
  const deleteUser = async (u: Customer) => {
    const ok = await Swal.fire({
      title: "ลบลูกค้า?",
      html: `<b>${u.userName}</b><br/>ข้อมูลทั้งหมดจะถูกลบถาวร`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "ลบลูกค้า",
      confirmButtonColor: "#d9534f",
    });
    if (!ok.isConfirmed) return;

    try {
      await axios.delete(`${API_BASE}/user/${u.customerId}`);
      Swal.fire("สำเร็จ", "ลบลูกค้าแล้ว", "success");
      fetchUsers();
      setShowDialog(false);
    } catch {
      Swal.fire("ผิดพลาด", "ไม่สามารถลบลูกค้าได้", "error");
    }
  };

  if (loading)
    return (
      <div className="vh-100 d-flex justify-content-center align-items-center">
        <div className="spinner-border text-primary" />
      </div>
    );

  const pageUsers = users.slice(start, start + rowsPerPage);

  return (
    <>
      <Nav
        message={message}
        onLogout={handleLogout}
        role={role}
        adminName={adminName}
        adminUsername={adminUsername}
      />

      <main className="main-content px-2 mt-6">
        <div className="container-max mx-auto">
          <h2 className="fw-bold text-center mb-3">
            👥 รายชื่อลูกค้าทั้งหมด ({users.length} คน)
          </h2>

          {/* Search */}
          <div className="d-flex justify-content-center gap-2 mb-3">
            <input
              className="form-control w-50"
              placeholder="ค้นหา LINE / ชื่อจริง"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button className="btn btn-primary" onClick={handleSearch}>
              ค้นหา
            </button>
            <button className="btn btn-secondary" onClick={fetchUsers}>
              รีเฟรช
            </button>
          </div>

          {/* TABLE */}
          <table className="table table-hover shadow-sm text-center align-middle">
            <thead className="table-dark">
              <tr>
                <th>#</th>
                <th>LINE</th>
                <th>ชื่อ</th>
                <th>ดูประวัติ</th>
                <th>ลบ</th>
              </tr>
            </thead>

            <tbody>
              {pageUsers.map((u, idx) => (
                <tr key={u.customerId}>
                  <td>{start + idx + 1}</td>
                  <td className="fw-semibold">{u.userName}</td>
                  <td>{u.fullName || "-"}</td>
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
                  <td>
                    {role === 0 && (
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => deleteUser(u)}
                      >
                        🗑️
                      </button>
                    )}
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

      {/* DIALOG ประวัติ */}
      <Dialog.Root open={showDialog} onOpenChange={setShowDialog}>
        <Dialog.Portal>
          <Dialog.Overlay
            className="position-fixed top-0 start-0 w-100 h-100"
            style={{ background: "rgba(0,0,0,.4)" }}
          />
          <Dialog.Content
            className="position-fixed top-50 start-50 translate-middle bg-white rounded-4 p-4 shadow-lg"
            style={{ width: "90%", maxWidth: 750, maxHeight: "85vh", overflowY: "auto" }}
          >
            <h4 className="text-center fw-bold mb-3">
              📄 ประวัติของ {selectedUser?.userName}
            </h4>

            {selectedUser?.bookings?.length ? (
              selectedUser.bookings.map((b) => (
                <div key={b.bookingId} className="bg-light p-3 rounded shadow-sm mb-3">
                  <p><b>ห้อง:</b> {b.room?.number}</p>
                  <p><b>วันที่จอง:</b> {formatThaiDate(b.createdAt)}</p>
                  <p><b>เช็คอิน:</b> {formatThaiDate(b.checkin)}</p>
                  <p><b>เข้าพักจริง:</b> {formatThaiDate(b.actualCheckin)}</p>

                  <button
                    className="btn btn-danger btn-sm w-100 mt-2"
                    onClick={() => deleteBooking(b)}
                  >
                    ลบรายการนี้
                  </button>
                </div>
              ))
            ) : (
              <p className="text-center text-muted">ไม่มีประวัติการจอง</p>
            )}

            <Dialog.Close asChild>
              <button className="btn btn-secondary w-100 mt-3">ปิด</button>
            </Dialog.Close>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}