// src/pages/Bills.tsx
import { useState, useEffect } from "react";
import Nav from "../components/Nav";
import { useAuth } from "../hooks/useAuth";
import { useCreateBill } from "../hooks/useCreateBill";
import BillTable from "../components/Bills/BillTable";
import BillCard from "../components/Bills/BillCard";
import BillDialog from "../components/Bills/BillDialog";
import Pagination from "../components/Pagination";
import "bootstrap/dist/css/bootstrap.min.css";

export default function Bills() {
  const { message, handleLogout, role, adminName, adminUsername } = useAuth();

  // Hook โหลดข้อมูลทั้งหมด
  const { rooms, bookings, existingBills, loading, reloadAll } =
    useCreateBill();

  const [openDialog, setOpenDialog] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<any>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // ฟิลเตอร์สถานะบิล
  const [statusFilter, setStatusFilter] = useState<
    "billed" | "notBilled"
  >("notBilled"); // default = notBilled

  const [canCreateBill, setCanCreateBill] = useState(false);
  const [todayStr, setTodayStr] = useState("");

  // ตรวจขนาดหน้าจอ
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isDesktop = windowWidth >= 1400;
  const isThreeCols = windowWidth >= 600 && windowWidth < 1400;

  // แปลงวันที่ไทย
  const formatThaiDate = (dateString: string) => {
    const date = new Date(dateString);
    const monthsThai = [
      "ม.ค.",
      "ก.พ.",
      "มี.ค.",
      "เม.ย.",
      "พ.ค.",
      "มิ.ย.",
      "ก.ค.",
      "ส.ค.",
      "ก.ย.",
      "ต.ค.",
      "พ.ย.",
      "ธ.ค.",
    ];
    return `${date.getDate()} ${monthsThai[date.getMonth()]} ${
      date.getFullYear() + 543
    }`;
  };

  // ตรวจว่าสามารถออกบิลได้
  useEffect(() => {
    const now = new Date();
    setTodayStr(formatThaiDate(now.toISOString()));
    setCanCreateBill(now.getDate() >= 1 && now.getDate() <= 31);
  }, []);

  // ฟังก์ชันเปิด Dialog
  const handleOpenDialog = (room: any) => {
    setSelectedRoom(room);
    setOpenDialog(true);
  };

  // ⭐ กรองห้อง: ต้องมี booking และ approveStatus !== 0
  const filteredRooms = rooms.filter((room) => {
    const booking = bookings.find((b) => b.room.number === room.number);

    // ❌ ไม่มี booking หรือยัง approveStatus === 0 → ไม่แสดง
    if (!booking || booking.approveStatus === 0) return false;

    const hasBill = existingBills.includes(room.roomId);

    if (statusFilter === "billed") return hasBill;
    if (statusFilter === "notBilled") return !hasBill;

    return true;
  });

  // Pagination
  const totalItems = filteredRooms.length;
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedRooms = filteredRooms.slice(
    startIndex,
    startIndex + rowsPerPage
  );

  // ถ้าหน้าเกิน max page หลัง reload/filter
  useEffect(() => {
    const totalPages = Math.ceil(totalItems / rowsPerPage);
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [totalItems, rowsPerPage, currentPage]);

  // จำนวนห้องที่ออกบิลแล้ว / ยัง
  const billedCount = filteredRooms.filter((r) =>
    existingBills.includes(r.roomId)
  ).length;
  const notBilledCount = filteredRooms.length - billedCount;

  return (
    <div
      className="d-flex flex-column"
      style={{ backgroundColor: "#f4f7fb", minHeight: "100vh" }}
    >
      {/* Navbar */}
      <Nav
        message={message}
        onLogout={handleLogout}
        role={role}
        adminName={adminName}
        adminUsername={adminUsername}
      />

      {/* เนื้อหา */}
      <main className="main-content flex-grow-1 px-1 py-2 mt-6 mt-lg-7">
        <div className="mx-auto container-max">
          <h2 className="fw-bold text-center mb-2">สร้างบิลห้องพัก</h2>
          <h5 className="text-center text-black mb-3">
            วันนี้: <b>{todayStr}</b>
          </h5>

          {/* ฟิลเตอร์การ์ด */}
          <div className="container mb-3">
            <div className="row g-2 justify-content-center">

              {/* ยังไม่ได้ออกบิล */}
              <div className="col-6 col-sm-4 col-md-3">
                <div
                  className="card text-center border-0 shadow-sm"
                  style={{
                    background:
                      statusFilter === "notBilled"
                        ? "linear-gradient(135deg, #ef233c, #d90429)"
                        : "#e9ecef",
                    color: statusFilter === "notBilled" ? "white" : "#333",
                    borderRadius: "10px",
                    height: "70px",
                    cursor: "pointer",
                    transform:
                      statusFilter === "notBilled" ? "scale(1.05)" : "scale(1)",
                    transition: "0.15s",
                  }}
                  onClick={() => {
                    setStatusFilter("notBilled");
                    setCurrentPage(1);
                  }}
                >
                  <div className="d-flex flex-column justify-content-center align-items-center h-100">
                    <div className="fw-bold" style={{ fontSize: "1rem" }}>
                      ยังไม่ได้ออกบิล
                    </div>
                    <div className="fw-semibold" style={{ fontSize: "1rem" }}>
                      {notBilledCount}
                    </div>
                  </div>
                </div>
              </div>

              {/* ออกบิลแล้ว */}
              <div className="col-6 col-sm-4 col-md-3">
                <div
                  className="card text-center border-0 shadow-sm"
                  style={{
                    background:
                      statusFilter === "billed"
                        ? "linear-gradient(135deg, #38b000, #008000)"
                        : "#e9ecef",
                    color: statusFilter === "billed" ? "white" : "#333",
                    borderRadius: "10px",
                    height: "70px",
                    cursor: "pointer",
                    transform:
                      statusFilter === "billed" ? "scale(1.05)" : "scale(1)",
                    transition: "0.15s",
                  }}
                  onClick={() => {
                    setStatusFilter("billed");
                    setCurrentPage(1);
                  }}
                >
                  <div className="d-flex flex-column justify-content-center align-items-center h-100">
                    <div className="fw-bold" style={{ fontSize: "1rem" }}>
                      ออกบิลแล้ว
                    </div>
                    <div className="fw-semibold" style={{ fontSize: "1rem" }}>
                      {billedCount}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {loading ? (
            <p className="text-center text-secondary mt-3">
              กำลังโหลดข้อมูล...
            </p>
          ) : (
            <>
              {/* Desktop = Table / Mobile = Card */}
              {isDesktop ? (
                <BillTable
                  rooms={paginatedRooms}
                  bookings={bookings}
                  existingBills={existingBills}
                  canCreateBill={canCreateBill}
                  formatThaiDate={formatThaiDate}
                  onCreateBill={handleOpenDialog}
                />
              ) : (
                <div
                  className="d-grid"
                  style={{
                    gridTemplateColumns: isThreeCols ? "repeat(3, 1fr)" : "1fr",
                    gap: "16px",
                    paddingLeft: "8px",
                    paddingRight: "8px",
                  }}
                >
                  {paginatedRooms.map((room) => {
                    const booking = bookings.find(
                      (b) => b.room.number === room.number
                    );
                    const hasBill = existingBills.includes(room.roomId);

                    return (
                      <BillCard
                        key={room.roomId}
                        room={room}
                        booking={booking}
                        hasBill={hasBill}
                        canCreateBill={canCreateBill}
                        formatThaiDate={formatThaiDate}
                        onCreateBill={handleOpenDialog}
                      />
                    );
                  })}
                </div>
              )}

              {/* Pagination */}
              {!openDialog && (
                <Pagination
                  currentPage={currentPage}
                  totalItems={totalItems}
                  rowsPerPage={rowsPerPage}
                  onPageChange={setCurrentPage}
                  onRowsPerPageChange={(rows) => {
                    setRowsPerPage(rows);
                    setCurrentPage(1);
                  }}
                />
              )}
            </>
          )}
        </div>
      </main>

      {/* Dialog ออกบิล */}
      <BillDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        room={selectedRoom}
        reloadExistingBills={reloadAll}
      />
    </div>
  );
}
