// src/pages/Bills.tsx
import { useState, useEffect } from "react";
import Nav from "../../components/Nav";
import { useAuth } from "../../hooks/useAuth";
import { useCreateBill } from "../../hooks/Bill/useCreateBill";
import BillTable from "../../components/Bills/BillTable";
import BillCard from "../../components/Bills/BillCard";
import BillDialog from "../../components/Bills/BillDialog";
import Pagination from "../../components/Pagination";
import "bootstrap/dist/css/bootstrap.min.css";

export default function Bills() {
  const { handleLogout, role, adminName, adminUsername } = useAuth();

  const { rooms, bookings, existingBills, loading, reloadAll } =
    useCreateBill();

  const [openDialog, setOpenDialog] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<any>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [statusFilter, setStatusFilter] = useState<"billed" | "notBilled">(
    "notBilled"
  );

  const [canCreateBill, setCanCreateBill] = useState(false);
  const [todayStr, setTodayStr] = useState("");

  // Responsive
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  const isDesktop = windowWidth >= 1400;
  const isThreeCols = windowWidth >= 600 && windowWidth < 1400;

  // Thai date
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

  useEffect(() => {
    const now = new Date();
    setTodayStr(formatThaiDate(now.toISOString()));
    setCanCreateBill(now.getDate() >= 1 && now.getDate() <= 31);
  }, []);

  // เปิด dialog
  const handleOpenDialog = (room: any) => {
    setSelectedRoom(room);
    setOpenDialog(true);
  };

  // ห้องที่มี booking อนุมัติแล้วทั้งหมด
  const allBookedRooms = rooms.filter((room) => {
    const booking = bookings.find((b) => b.room.number === room.number);
    return booking && booking.approveStatus !== 0;
  });

  // จำนวนห้อง (รวมทั้งหมด ไม่ขึ้นอยู่กับการฟิลเตอร์)
  const billedCount = allBookedRooms.filter((r) =>
    existingBills.includes(r.roomId)
  ).length;
  const notBilledCount = allBookedRooms.length - billedCount;

  // ห้องตามฟิลเตอร์บนปุ่ม
  const filteredRooms = allBookedRooms.filter((room) => {
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

  useEffect(() => {
    const totalPages = Math.ceil(totalItems / rowsPerPage);
    if (currentPage > totalPages && totalPages > 0) setCurrentPage(totalPages);
  }, [totalItems, rowsPerPage, currentPage]);

  return (
    <div
      className="d-flex flex-column"
      style={{ backgroundColor: "#f4f7fb", minHeight: "100vh" }}
    >
      <Nav
        onLogout={handleLogout}
        role={role}
        adminName={adminName}
        adminUsername={adminUsername}
      />

      <main className="main-content flex-grow-1 px-1 py-2 mt-6 mt-lg-7">
        <div className="mx-auto container-max">
          <h2 className="fw-bold text-center mb-2">สร้างบิลห้องพัก</h2>
          <h5 className="text-center text-black mb-3">
            วันนี้: <b>{todayStr}</b>
          </h5>

          {/* ⭐ จำนวนห้องรวม แสดงทันที ไม่ต้องกดอะไร */}
          <div className="container mb-3">
            <div className="row g-3 justify-content-center text-center">
              {/* ยังไม่ได้ออกบิล */}
              <div className="col-6 col-md-3">
                <div
                  className="p-3 rounded-4 shadow-sm fw-bold"
                  onClick={() => {
                    setStatusFilter("notBilled");
                    setCurrentPage(1);
                  }}
                  style={{
                    cursor: "pointer",
                    background:
                      statusFilter === "notBilled"
                        ? "linear-gradient(135deg, #ef233c, #d90429)"
                        : "#e9ecef",
                    color: statusFilter === "notBilled" ? "white" : "#333",
                    fontSize: "1.1rem",
                    transform:
                      statusFilter === "notBilled" ? "scale(1.05)" : "scale(1)",
                    transition: "0.2s",
                  }}
                >
                  ยังไม่ได้ออกบิล
                  <div style={{ fontSize: "1.5rem" }}>{notBilledCount}</div>
                </div>
              </div>

              {/* ออกบิลแล้ว */}
              <div className="col-6 col-md-3">
                <div
                  className="p-3 rounded-4 shadow-sm fw-bold"
                  onClick={() => {
                    setStatusFilter("billed");
                    setCurrentPage(1);
                  }}
                  style={{
                    cursor: "pointer",
                    background:
                      statusFilter === "billed"
                        ? "linear-gradient(135deg, #38b000, #008000)"
                        : "#e9ecef",
                    color: statusFilter === "billed" ? "white" : "#333",
                    fontSize: "1.1rem",
                    transform:
                      statusFilter === "billed" ? "scale(1.05)" : "scale(1)",
                    transition: "0.2s",
                  }}
                >
                  ออกบิลแล้ว
                  <div style={{ fontSize: "1.5rem" }}>{billedCount}</div>
                </div>
              </div>
            </div>
          </div>
          {/* ============================== */}

          {loading ? (
            <p className="text-center text-secondary mt-3">
              กำลังโหลดข้อมูล...
            </p>
          ) : (
            <>
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

      <BillDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        room={selectedRoom}
        reloadExistingBills={reloadAll}
      />
    </div>
  );
}
