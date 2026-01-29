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
import { usePendingCheckouts } from "../../hooks/ManageRooms/usePendingCheckouts";
import { usePendingBookings } from "../../hooks/ManageRooms/usePendingBookings";

export default function Bills() {
  const { handleLogout, role, adminName, adminUsername } = useAuth();

  // 🔧 ตัด existingBills ออก
  const { rooms, bookings, loading, reloadAll } = useCreateBill();

  const [openDialog, setOpenDialog] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<any>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

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
  }, []);

  const handleOpenDialog = (room: any) => {
    setSelectedRoom(room);
    setOpenDialog(true);
  };

  // ห้องที่มี booking อนุมัติแล้วทั้งหมด
  const allBookedRooms = rooms.filter((room) => {
    const booking = bookings.find((b) => b.room.number === room.number);
    return booking && booking.approveStatus !== 0;
  });

  // Pagination
  const totalItems = allBookedRooms.length;
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedRooms = allBookedRooms.slice(
    startIndex,
    startIndex + rowsPerPage,
  );

  useEffect(() => {
    const totalPages = Math.ceil(totalItems / rowsPerPage);
    if (currentPage > totalPages && totalPages > 0) setCurrentPage(totalPages);
  }, [totalItems, rowsPerPage, currentPage]);

  const pendingBookings = usePendingBookings();
  const pendingCheckouts = usePendingCheckouts();

  return (
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
        <div
          className="mx-auto"
          style={{ borderRadius: 20, maxWidth: "1400px" }}
        >
          <h2 className="fw-bold text-center text-black mb-2">สร้างบิลห้องพัก</h2>
          <h5 className="text-center text-black mb-3">
            วันนี้: <b>{todayStr}</b>
          </h5>

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
                      (b) => b.room.number === room.number,
                    );

                    return (
                      <BillCard
                        key={room.roomId}
                        room={room}
                        booking={booking}
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

      {selectedRoom && (
        <BillDialog
          key={selectedRoom.roomId}
          open={openDialog}
          onClose={() => setOpenDialog(false)}
          room={selectedRoom}
          reloadExistingBills={reloadAll}
        />
      )}
    </div>
  );
}