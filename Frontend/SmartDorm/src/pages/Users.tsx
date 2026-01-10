import { useEffect, useMemo, useState } from "react";
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
  checkinAt?: string;
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
        prev.filter((x) => x.customerId !== selectedUser.customerId)
      );
      setShowDialog(false);
      Swal.fire("สำเร็จ", "ลบลูกค้าเรียบร้อย", "success");
    } catch {
      Swal.fire("ผิดพลาด", "ลบลูกค้าไม่สำเร็จ", "error");
    }
  };

  /* ---------------- Build Cards (ใช้ทั้ง table + card) ---------------- */
  const userCards = useMemo<UserCard[]>(() => {
    const cards: UserCard[] = [];

    users.forEach((u) => {
      const grouped = (u.bookings || []).reduce(
        (acc: Record<string, BookingDetail[]>, b) => {
          const name = b.fullName?.trim() || "ไม่ระบุชื่อ";
          acc[name] = acc[name] ? [...acc[name], b] : [b];
          return acc;
        },
        {}
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

          {/* Search */}
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
            <button className="btn btn-outline-secondary" onClick={fetchUsers}>
              รีเฟรช
            </button>
          </div>

          {/* TABLE MODE */}
          {width >= 1400 ? (
            <div className="responsive-table" style={{ overflowX: "auto" }}>
              <table
                className="table table-sm table-striped align-middle text-center"
                style={{ tableLayout: "fixed", width: "100%" }}
              >
                <thead className="table-dark">
                  <tr>
                    <th>#</th>
                    <th>LINE</th>
                    <th>ชื่อผู้จอง</th>
                    <th>ประวัติ</th>
                    <th>ลบ</th>
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
                                (u) => u.customerId === card.customerId
                              )!,
                              bookings: card.bookings,
                            });
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
                              setSelectedUser({
                                ...users.find(
                                  (u) => u.customerId === card.customerId
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
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            /* CARD MODE */
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
                      <p className="fw-semibold">{card.userName}</p>
                      <hr />
                      <h6 className="fw-bold">ชื่อผู้จอง</h6>
                      <p>{card.fullName}</p>
                      <div className="d-flex justify-content-between gap-2 mt-2">
                        <button
                          className="btn btn-info btn-sm text-white flex-fill"
                          onClick={() => {
                            setSelectedUser({
                              ...users.find(
                                (u) => u.customerId === card.customerId
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
                                  (u) => u.customerId === card.customerId
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

      {/* Dialog */}
      <Dialog.Root open={showDialog} onOpenChange={setShowDialog}>
        <Dialog.Portal>
          <Dialog.Overlay
            className="position-fixed top-50 start-0 w-100 h-100"
            style={{
              background: "rgba(0,0,0,0.75)",
              zIndex: 1000,
            }}
          />

          <Dialog.Content
            className="position-fixed start-50 bg-white rounded-4 shadow-lg"
            style={{
              top: "5px",
              transform: "translateX(-50%)",
              width: "95%",
              maxWidth: "650px",
              maxHeight: "calc(100vh - 120px)",
              display: "flex",
              flexDirection: "column",
              zIndex: 1000,
            }}
          >
            <Dialog.Title className="p-3 border-bottom fw-bold text-center">
              ประวัติของ {selectedUser?.bookings?.[0]?.fullName}
            </Dialog.Title>

            <Dialog.Description className="visually-hidden">
              แสดงรายละเอียดประวัติการจองของลูกค้า
            </Dialog.Description>

            <div className="p-3" style={{ overflowY: "auto", flexGrow: 1 }}>
              {selectedUser?.bookings?.map((b) => (
                <div
                  key={b.bookingId}
                  className="border rounded-3 p-3 mb-3 bg-white shadow-sm"
                >
                  <p>
                    <b>ห้อง : </b> {b.room?.number}
                  </p>
                  <p>
                    <b>โทร : </b> {b.cphone}
                  </p>
                  <p>
                    <b>จอง : </b> {formatThaiDate(b.createdAt)}
                  </p>
                  <p>
                    <b>เช็คอิน : </b> {formatThaiDate(b.checkin)}
                  </p>
                  <p>
                    <b>เข้าพักจริง : </b> {formatThaiDate(b.checkinAt)}
                  </p>

                  {role === 0 && (
                    <button
                      className="btn btn-danger btn-sm w-100 mt-2"
                      onClick={() => handleDeleteBooking(b)}
                    >
                      ลบรายการนี้
                    </button>
                  )}
                </div>
              ))}
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
