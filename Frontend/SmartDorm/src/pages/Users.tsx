// src/pages/Users.tsx
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { API_BASE } from "../config";
import Nav from "../components/Nav";
import { useAuth } from "../hooks/useAuth";
import Pagination from "../components/Pagination";
import * as Dialog from "@radix-ui/react-dialog";
import { usePendingBookings } from "../hooks/ManageRooms/usePendingBookings";
import { usePendingCheckouts } from "../hooks/ManageRooms/usePendingCheckouts";

/* ---------------------- Types ---------------------- */
interface BookingDetail {
  bookingId: string;
  room?: { number: string };
  checkin?: string;
  checkinAt?: string;
  bookingDate?: string;
  fullName?: string;
  cphone?: string;
  checkout?: {
    checkout: string;
    ReturnApprovalStatus: number;
    RefundApprovalDate: string;
    checkoutStatus: number;
    checkoutAt: string;
  }[];
}

interface Customer {
  customerId: string;
  userName: string;
  userId: string;
  bookings?: BookingDetail[];
  createdAt: string;
}

interface UserCard {
  customerId: string;
  userName: string;
  fullName: string;
  bookings: BookingDetail[];
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

  const pendingBookings = usePendingBookings();
  const pendingCheckouts = usePendingCheckouts();

  const [users, setUsers] = useState<Customer[]>([]);

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [width, setWidth] = useState(window.innerWidth);

  const [selectedUser, setSelectedUser] = useState<Customer | null>(null);
  const [showDialog, setShowDialog] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const startIndex = (currentPage - 1) * rowsPerPage;

  /* ---------------- Lock body scroll when dialog open ---------------- */
  useEffect(() => {
    document.body.style.overflow = showDialog ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [showDialog]);

  /* ---------------- Resize ---------------- */
  useEffect(() => {
    const resize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  /* ---------------- Fetch Users ---------------- */
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/user/getall`);

      const merged: Record<string, Customer & { bookings: BookingDetail[] }> =
        {};

      (res.data.users || []).forEach((u: Customer) => {
        const key = u.customerId;
        if (!merged[key]) {
          merged[key] = { ...u, bookings: [...(u.bookings || [])] };
        } else {
          merged[key].bookings.push(...(u.bookings || []));
        }
      });

      setUsers(Object.values(merged));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  /* ---------------- Search ---------------- */
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

  /* ---------------- Delete Booking ---------------- */
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
      Swal.fire("สำเร็จ", "ลบรายการจองแล้ว", "success");
      fetchUsers();
      setShowDialog(false);
    } catch {
      Swal.fire("ผิดพลาด", "ไม่สามารถลบได้", "error");
    }
  };

  /* ---------------- Delete User ---------------- */
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
        prev.filter((x) => x.customerId !== selectedUser.customerId),
      );
      setShowDialog(false);
      Swal.fire("สำเร็จ", "ลบลูกค้าเรียบร้อย", "success");
    } catch {
      Swal.fire("ผิดพลาด", "ลบลูกค้าไม่สำเร็จ", "error");
    }
  };

  /* ---------------- Build Cards ---------------- */
  const userCards = useMemo<UserCard[]>(() => {
    const cards: UserCard[] = [];

    users.forEach((u) => {
      const grouped = (u.bookings || []).reduce(
        (acc: Record<string, BookingDetail[]>, b) => {
          const name = b.fullName?.trim() || "ไม่ระบุชื่อ";
          acc[name] = acc[name] ? [...acc[name], b] : [b];
          return acc;
        },
        {},
      );

      Object.entries(grouped).forEach(([name, bookings]) => {
        cards.push({
          customerId: u.customerId,
          userName: u.userName,
          fullName: name,
          bookings,
        });
      });
    });

    return cards;
  }, [users]);

  const paginated = userCards.slice(startIndex, startIndex + rowsPerPage);

  if (loading)
    return (
      <div className="vh-100 d-flex justify-content-center align-items-center bg-light">
        <div className="spinner-border text-primary" />
      </div>
    );

  /* ---------------- Render ---------------- */
  return (
    <>
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
          style={{ paddingLeft: "20px", paddingRight: "20px" }}
        >
          <div className="mx-auto" style={{ maxWidth: "1400px" }}>
            <h2
              className="fw-bold text-center mt-3 mb-4"
              style={{
                color: "#4A0080",
                borderBottom: "3px solid #CE93D8",
                width: "fit-content",
                margin: "0 auto",
              }}
            >
              รายชื่อลูกค้าทั้งหมด
            </h2>

            <div
              className="input-group mb-3"
              style={{ maxWidth: 600, margin: "0 auto" }}
            >
              <input
                className="form-control"
                placeholder="ค้นหาชื่อ / เบอร์ / ห้อง"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
              <button className="btn btn-primary" onClick={handleSearch}>
                ค้นหา
              </button>
              <button
                className="btn btn-outline-secondary"
                onClick={fetchUsers}
              >
                รีเฟรช
              </button>
            </div>

            {width >= 1400 ? (
              <div className="responsive-table" style={{ overflowX: "auto" }}>
                <table className="table table-sm table-striped align-middle text-center">
                  <thead className="table-dark">
                    <tr>
                      <th>#</th>
                      <th>LINE</th>
                      <th>ชื่อผู้จอง</th>
                      <th>ประวัติ</th>
                      {role === 0 && <th>ลบ</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {paginated.map((card, idx) => (
                      <tr key={`${card.customerId}-${card.fullName}`}>
                        <td>{startIndex + idx + 1}</td>
                        <td>{card.userName}</td>
                        <td>{card.fullName}</td>
                        <td>
                          <button
                            className="btn btn-info btn-sm text-white"
                            onClick={() => {
                              setSelectedUser({
                                ...users.find(
                                  (u) => u.customerId === card.customerId,
                                )!,
                                bookings: card.bookings,
                              });
                              setShowDialog(true);
                            }}
                          >
                            ดูประวัติ
                          </button>
                        </td>
                        {role === 0 && (
                          <td>
                            {role === 0 && (
                              <button
                                className="btn btn-danger btn-sm"
                                onClick={() => {
                                  setSelectedUser({
                                    ...users.find(
                                      (u) => u.customerId === card.customerId,
                                    )!,
                                    bookings: card.bookings,
                                  });
                                  handleDeleteUser();
                                }}
                              >
                                🗑️
                              </button>
                            )}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="row g-3">
                {paginated.map((card, idx) => (
                  <div
                    className="col-12 col-md-6 col-lg-4"
                    key={`${card.customerId}-${card.fullName}`}
                  >
                    <div className="card shadow-sm border-0 h-100">
                      <div className="card-body text-center">
                        <h5 className="fw-bold text-primary">
                          #{startIndex + idx + 1}
                        </h5>
                        <p className="text-muted small mb-1">LINE</p>
                        <p className="fw-semibold text-black">
                          {card.userName}
                        </p>
                        <hr />
                        <h6 className="fw-bold text-black">ชื่อผู้จอง</h6>
                        <p>{card.fullName}</p>
                        <div className="d-flex justify-content-between gap-2 mt-2">
                          <button
                            className="btn btn-info btn-sm text-white flex-fill"
                            onClick={() => {
                              setSelectedUser({
                                ...users.find(
                                  (u) => u.customerId === card.customerId,
                                )!,
                                bookings: card.bookings,
                              });
                              setShowDialog(true);
                            }}
                          >
                            ดูประวัติ
                          </button>

                          {role === 0 && (
                            <button
                              className="btn btn-danger btn-sm flex-fill"
                              onClick={() => {
                                setSelectedUser({
                                  ...users.find(
                                    (u) => u.customerId === card.customerId,
                                  )!,
                                  bookings: card.bookings,
                                });
                                handleDeleteUser();
                              }}
                            >
                              🗑️
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <Pagination
              currentPage={currentPage}
              totalItems={userCards.length}
              rowsPerPage={rowsPerPage}
              onPageChange={setCurrentPage}
              onRowsPerPageChange={(r) => {
                setRowsPerPage(r);
                setCurrentPage(1);
              }}
            />
          </div>
        </main>

        <Dialog.Root open={showDialog} onOpenChange={setShowDialog}>
          <Dialog.Portal>
            <Dialog.Overlay
              className="position-fixed top-0 start-0 w-100 h-100"
              style={{ background: "rgba(0,0,0,0.85)", zIndex: 99 }}
            />

            <Dialog.Content
              className="position-fixed bg-white rounded-4 shadow-lg"
              style={{
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: "90%",
                maxWidth: "650px",
                maxHeight: "85vh",
                display: "flex",
                flexDirection: "column",
                zIndex: 1600,
              }}
            >
              <Dialog.Title
                className="p-3 border-bottom fw-bold text-center text-black"
                style={{
                  color : "#000000",
                  borderBottom: "3px solid #000000",
                  width: "fit-content",
                  margin: "0 auto",
                }}
              >
                ประวัติของ <br />
                {selectedUser?.bookings?.[0]?.fullName}
              </Dialog.Title>

              <Dialog.Description className="visually-hidden">
                แสดงรายละเอียดประวัติการจองของลูกค้า
              </Dialog.Description>

              <div className="p-3" style={{ overflowY: "auto", flexGrow: 1 }}>
                {selectedUser?.bookings?.map((b, i) => (
                  <div
                    key={b.bookingId}
                    className="mb-3 rounded-4 shadow-sm border"
                    style={{ overflow: "hidden" }}
                  >
                    <div
                      className="px-3 py-2 fw-bold text-white"
                      style={{ background: "#5a2d82" }}
                    >
                      รายการที่ {i + 1} • ห้อง {b.room?.number || "-"}
                    </div>

                    <div className="p-3 bg-white text-black">
                      <div className="d-flex justify-content-between mb-1">
                        <span className="fw-semibold">ชื่อผู้เช่า</span>
                        <span className="fw-semibold">{b.fullName || "-"}</span>
                      </div>
                      <div className="d-flex justify-content-between mb-1">
                        <span className="fw-semibold">Line ผู้เช่า</span>
                        <span className="fw-semibold">
                          {selectedUser?.userName || "-"}
                        </span>
                      </div>
                      <div className="d-flex justify-content-between mb-1">
                        <span className="fw-semibold">เบอร์โทร</span>
                        <span className="fw-semibold">{b.cphone || "-"}</span>
                      </div>

                      <div className="d-flex justify-content-between mb-1">
                        <span className="fw-semibold">วันที่จอง</span>
                        <span className="fw-semibold">
                          {formatThaiDate(b.bookingDate)}
                        </span>
                      </div>

                      <div className="d-flex justify-content-between mb-1">
                        <span className="fw-semibold">วันที่ขอเข้าพัก</span>
                        <span className="fw-semibold">
                          {formatThaiDate(b.checkin)}
                        </span>
                      </div>

                      <div className="d-flex justify-content-between">
                        <span className="fw-semibold">เข้าพักจริง</span>
                        <span className="fw-semibold">
                          {formatThaiDate(b.checkinAt)}
                        </span>
                      </div>

                      {role === 0 && (
                        <button
                          className="btn btn-danger btn-sm w-100 mt-3"
                          onClick={() => handleDeleteBooking(b)}
                        >
                          ลบรายการนี้
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-3 border-top bg-light">
                <Dialog.Close asChild>
                  <button className="btn btn-dark w-100">ปิด</button>
                </Dialog.Close>
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </div>
    </>
  );
}
