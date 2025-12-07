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
  const { handleLogout, role, adminName, adminUsername } = useAuth();

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
    const resize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  /* โหลดข้อมูล merges by fullName */
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/user/getall`);
      const merged: Record<string, Customer & { bookings: BookingDetail[] }> = {};

      (res.data.users || []).forEach((u: Customer) => {
        const full = u.bookings?.[0]?.fullName?.trim();
        const key = full && full !== "" ? full : u.userName; // <-- ปลอดภัยแล้ว

        if (!merged[key]) merged[key] = { ...u, bookings: [...(u.bookings || [])] };
        else merged[key].bookings?.push(...(u.bookings || []));
      });

      setUsers(
        Object.values(merged).sort((a, b) =>
          (a.bookings?.[0]?.fullName || "").localeCompare(
            b.bookings?.[0]?.fullName || "",
            "th"
          )
        )
      );
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
      const res = await axios.get(`${API_BASE}/user/search`, {
        params: { keyword: search },
      });
      setUsers(res.data.users || []);
      setCurrentPage(1);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBooking = async (b: BookingDetail) => {
    const ok = await Swal.fire({
      title: "ยืนยันลบรายการจอง?",
      text: `ห้อง ${b.room?.number}`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "ลบ",
      cancelButtonText: "ยกเลิก",
    });

    if (!ok.isConfirmed || !b.bookingId) return;
    try {
      await axios.delete(`${API_BASE}/booking/${b.bookingId}`);

      setSelectedUser((prev) =>
        prev
          ? {
              ...prev,
              bookings: prev.bookings?.filter((x) => x.bookingId !== b.bookingId),
            }
          : prev
      );

      Swal.fire("สำเร็จ", "ลบรายการจองแล้ว", "success");
      fetchUsers();
    } catch {
      Swal.fire("ผิดพลาด", "ไม่สามารถลบได้", "error");
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    const ok = await Swal.fire({
      title: "ยืนยันลบลูกค้า?",
      html: `<b>${selectedUser.bookings?.[0]?.fullName || selectedUser.userName}</b><br/>ข้อมูลทั้งหมดจะถูกลบถาวร`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "ลบลูกค้า",
      cancelButtonText: "ยกเลิก",
      confirmButtonColor: "#d9534f",
    });

    if (!ok.isConfirmed) return;
    try {
      await axios.delete(`${API_BASE}/user/${selectedUser.customerId}`);

      setUsers((prev) => prev.filter((x) => x.customerId !== selectedUser.customerId));
      setShowDialog(false);

      Swal.fire("สำเร็จ", "ลบลูกค้าเรียบร้อย", "success");
    } catch {
      Swal.fire("ผิดพลาด", "ลบลูกค้าไม่สำเร็จ", "error");
    }
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
      <Nav onLogout={handleLogout} role={role} adminName={adminName} adminUsername={adminUsername} />

      <main className="main-content mt-6 px-2">
        <div className="container-max mx-auto">
          <h2 className="fw-bold text-center mt-2 mb-3 text-dark">
            👥 รายชื่อลูกค้าทั้งหมด ({users.length} คน)
          </h2>

          <div className="d-flex justify-content-center gap-2 mb-3">
            <input
              className="form-control w-50 shadow-sm"
              placeholder="ค้นหาชื่อ / เบอร์โทร / ห้อง"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <button className="btn btn-primary" onClick={handleSearch}>ค้นหา</button>
            <button className="btn btn-secondary" onClick={fetchUsers}>รีเฟรช</button>
          </div>

          {width >= 1400 ? (
            <table className="table table-hover text-center shadow-sm">
              <thead className="table-dark">
                <tr>
                  <th>#</th>
                  <th>LINE</th>
                  <th>ชื่อจริง</th>
                  <th>ประวัติ</th>
                  <th>ลบ</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((u, idx) => (
                  <tr key={u.customerId}>
                    <td>{startIndex + idx + 1}</td>
                    <td>{u.userName}</td>
                    <td>{u.bookings?.[0]?.fullName || "-"}</td>
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
                          onClick={() => {
                            setSelectedUser(u);
                            handleDeleteUser();
                          }}
                        >
                          🗑️
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            /* CARD MODE */
            <div
              className="d-grid"
              style={{
                gridTemplateColumns: width < 600 ? "1fr" : "repeat(3,1fr)",
                gap: "12px",
              }}
            >
              {paginated.map((u) => (
                <div key={u.customerId} className="shadow-sm bg-white p-3 rounded border-start border-4" style={{ borderColor: "#4A0080" }}>
                  <h5 className="fw-bold">{u.bookings?.[0]?.fullName || "-"}</h5>
                  <p className="small text-muted">{u.userName}</p>

                  <button
                    className="btn btn-info btn-sm w-100 mt-2 text-white"
                    onClick={() => {
                      setSelectedUser(u);
                      setShowDialog(true);
                    }}
                  >
                    ดูประวัติ
                  </button>

                  {role === 0 && (
                    <button
                      className="btn btn-danger btn-sm w-100 mt-2"
                      onClick={() => {
                        setSelectedUser(u);
                        handleDeleteUser();
                      }}
                    >
                      ลบลูกค้า
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

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

      {/* DIALOG */}
      <Dialog.Root open={showDialog} onOpenChange={setShowDialog}>
        <Dialog.Portal>
          <Dialog.Overlay className="position-fixed top-0 start-0 w-100 h-100" style={{ background: "rgba(0,0,0,.45)" }} />
          <Dialog.Content
            className="position-fixed top-50 start-50 translate-middle bg-white rounded-4 shadow-lg p-4"
            style={{ width: "90%", maxWidth: "650px", maxHeight: "85vh", overflowY: "auto" }}
          >
            <Dialog.Title className="fw-bold text-center fs-5 mb-3">
              ประวัติของ {selectedUser?.bookings?.[0]?.fullName}
            </Dialog.Title>

            {selectedUser?.bookings?.length ? (
              selectedUser.bookings.map((b) => (
                <div key={b.bookingId} className="bg-light p-3 rounded shadow-sm mb-2">
                  <p><b>ห้อง:</b> {b.room?.number}</p>
                  <p><b>ชื่อ:</b> {b.fullName}</p>
                  <p><b>โทร:</b> {b.cphone}</p>
                  <p><b>จอง:</b> {formatThaiDate(b.createdAt)}</p>
                  <p><b>เช็คอิน:</b> {formatThaiDate(b.checkin)}</p>
                  <p><b>เข้าพักจริง:</b> {formatThaiDate(b.actualCheckin)}</p>

                  <button className="btn btn-danger btn-sm w-100 mt-2" onClick={() => handleDeleteBooking(b)}>
                    ลบรายการนี้
                  </button>
                </div>
              ))
            ) : (
              <p className="text-center text-muted">ไม่มีประวัติการจอง</p>
            )}

            {role === 0 && (
              <button className="btn btn-outline-danger w-100 mt-3 fw-bold" onClick={handleDeleteUser}>
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