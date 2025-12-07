// src/pages/Users.tsx
import { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { API_BASE } from "../config";
import Nav from "../components/Nav";
import { useAuth } from "../hooks/useAuth";
import Pagination from "../components/Pagination";
import * as Dialog from "@radix-ui/react-dialog";

/* ---------------------- Types ---------------------- */
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

/* ---------------------- Utils ---------------------- */
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

/* ---------------------- Page ---------------------- */
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

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/user/getall`);
      const merged: Record<string, Customer & { bookings: BookingDetail[] }> =
        {};

      (res.data.users || []).forEach((u: Customer) => {
        const full = u.bookings?.[0]?.fullName?.trim();
        const key = full && full !== "" ? full : u.userName;
        if (!merged[key])
          merged[key] = { ...u, bookings: [...(u.bookings || [])] };
        else merged[key].bookings?.push(...(u.bookings || []));
      });

      setUsers(
        Object.values(merged).sort((a, b) =>
          (a.bookings?.[0]?.fullName || "").localeCompare(
            (b.bookings?.[0]?.fullName || "").toString(),
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
    if (!ok.isConfirmed) return;

    try {
      await axios.delete(`${API_BASE}/booking/${b.bookingId}`);
      setSelectedUser((prev) =>
        prev
          ? {
              ...prev,
              bookings: prev.bookings?.filter(
                (x) => x.bookingId !== b.bookingId
              ),
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
      html: `<b>${
        selectedUser.bookings?.[0]?.fullName || selectedUser.userName
      }</b><br/>ข้อมูลทั้งหมดจะถูกลบถาวร`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "ลบลูกค้า",
      cancelButtonText: "ยกเลิก",
      confirmButtonColor: "#d9534f",
    });
    if (!ok.isConfirmed) return;

    try {
      await axios.delete(`${API_BASE}/user/${selectedUser.customerId}`);
      setUsers((prev) =>
        prev.filter((x) => x.customerId !== selectedUser.customerId)
      );
      setShowDialog(false);
      Swal.fire("สำเร็จ", "ลบลูกค้าเรียบร้อย", "success");
    } catch {
      Swal.fire("ผิดพลาด", "ลบลูกค้าไม่สำเร็จ", "error");
    }
  };

  if (loading)
    return (
      <div className="vh-100 d-flex justify-content-center align-items-center bg-light">
        <div className="spinner-border text-primary"></div>
      </div>
    );

  const paginated = users.slice(startIndex, startIndex + rowsPerPage);

  return (
    <>
      <Nav
        onLogout={handleLogout}
        role={role}
        adminName={adminName}
        adminUsername={adminUsername}
      />

      <main className="main-content mt-5 pt-4 px-2">
        <div className="container-max mx-auto" style={{ maxWidth: "1450px" }}>
          <h2
            className="fw-bold text-center mt-3 mb-4"
            style={{ color: "#46007A" }}
          >
            👥 รายชื่อลูกค้าทั้งหมด
          </h2>

          {/* Search Bar */}
          <div
            className="input-group mb-4 shadow-sm"
            style={{ maxWidth: "600px", margin: "0 auto" }}
          >
            <input
              type="text"
              className="form-control"
              placeholder="ค้นหาชื่อ / เบอร์โทร / ห้อง..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
          </div>
          <div
            className="input-group mb-4 shadow-sm text-center alignItems-center"
            style={{ maxWidth: "600px", margin: "0 auto" }}
          >
            <button className="btn btn-primary text-center alignItems-center" onClick={handleSearch}>
              ค้นหา
            </button>
            <button className="btn btn-outline-secondary text-center alignItems-center" onClick={fetchUsers}>
              รีเฟรช
            </button>
          </div>

          {/* TABLE MODE */}
          {width >= 1400 ? (
            <div className="table-responsive shadow-sm rounded">
              <table className="table table-hover align-middle text-center mb-0">
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
                      <td className="fw-semibold">
                        {u.bookings?.[0]?.fullName || "-"}
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
            </div>
          ) : (
            /* CARD MODE */
            <div className="row g-3" style={{ marginBottom: "20px" }}>
              {paginated.map((u, idx) => (
                <div className="col-12 col-md-6 col-lg-4" key={u.customerId}>
                  <div className="card shadow-sm border-0 h-100">
                    <div className="card-body">
                      <h5 className="fw-bold text-center text-primary">
                        #{startIndex + idx + 1}
                      </h5>
                      <p className="text-muted text-center small mt-1 mb-1">
                        LINE
                      </p>
                      <p className="text-center fw-semibold">{u.userName}</p>
                      <hr />
                      <h6 className="fw-bold text-center mb-1">ชื่อผู้จอง</h6>
                      <p className="text-center">
                        {u.bookings?.[0]?.fullName || "-"}
                      </p>

                      {role === 0 && (
                        <button
                          className="btn btn-danger btn-sm w-100 mb-2"
                          onClick={() => {
                            setSelectedUser(u);
                            handleDeleteUser();
                          }}
                        >
                          ลบลูกค้า
                        </button>
                      )}

                      <button
                        className="btn btn-info btn-sm w-100 text-white"
                        onClick={() => {
                          setSelectedUser(u);
                          setShowDialog(true);
                        }}
                      >
                        ดูประวัติ
                      </button>
                    </div>
                  </div>
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

      {/* ---------------- Dialog ---------------- */}
      <Dialog.Root open={showDialog} onOpenChange={setShowDialog}>
        <Dialog.Portal>
          <Dialog.Overlay
            className="position-fixed top-0 start-0 w-100 h-100"
            style={{
              background: "rgba(0,0,0,.45)",
              zIndex: 9998,
              backdropFilter: "blur(3px)",
            }}
          />

          <Dialog.Content
            className="position-fixed start-50 bg-white rounded-4 shadow-lg"
            style={{
              top: "70px",
              transform: "translateX(-50%)",
              width: "95%",
              maxWidth: "650px",
              maxHeight: "calc(100vh - 120px)",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              zIndex: 9999,
            }}
          >
            <Dialog.Title
              className="p-3 border-bottom text-center fw-bold fs-5"
              style={{ color: "#4A0080" }}
            >
              ประวัติของ {selectedUser?.bookings?.[0]?.fullName}
            </Dialog.Title>

            <div className="p-3" style={{ overflowY: "auto", flexGrow: 1 }}>
              {selectedUser?.bookings?.length ? (
                Object.entries(
                  [...selectedUser.bookings]
                    .sort((a, b) => {
                      const da = new Date(
                        a.actualCheckin || a.checkin || a.createdAt || ""
                      );
                      const db = new Date(
                        b.actualCheckin || b.checkin || b.createdAt || ""
                      );
                      return db.getTime() - da.getTime();
                    })
                    .reduce((acc: Record<string, BookingDetail[]>, b) => {
                      const key = formatThaiDate(
                        b.actualCheckin || b.checkin || b.createdAt
                      );
                      acc[key] = acc[key] ? [...acc[key], b] : [b];
                      return acc;
                    }, {})
                ).map(([date, items]) => (
                  <div key={date} className="mb-4">
                    <h5 className="fw-bold text-primary mb-3">📅 {date}</h5>
                    {items.map((b) => (
                      <div
                        key={b.bookingId}
                        className="bg-light p-3 rounded border shadow-sm mb-3"
                      >
                        <p>
                          <b>ห้อง:</b> {b.room?.number}
                        </p>
                        <p>
                          <b>ชื่อ:</b> {b.fullName}
                        </p>
                        <p>
                          <b>โทร:</b> {b.cphone}
                        </p>
                        <p>
                          <b>จอง:</b> {formatThaiDate(b.createdAt)}
                        </p>
                        <p>
                          <b>เช็คอิน:</b> {formatThaiDate(b.checkin)}
                        </p>
                        <p>
                          <b>เข้าพักจริง:</b> {formatThaiDate(b.actualCheckin)}
                        </p>

                        <button
                          className="btn btn-danger btn-sm w-100 mt-2"
                          onClick={() => handleDeleteBooking(b)}
                        >
                          ลบรายการนี้
                        </button>
                      </div>
                    ))}
                  </div>
                ))
              ) : (
                <p className="text-center text-muted">ไม่มีประวัติการจอง</p>
              )}
            </div>

            <div className="p-3 border-top bg-light">
              <Dialog.Close asChild>
                <button className="btn btn-secondary w-100">ปิด</button>
              </Dialog.Close>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
