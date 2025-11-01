import { useState, useEffect } from "react";
import Nav from "../components/Nav";
import { useAuth } from "../hooks/useAuth";
import { useCreateBill } from "../hooks/useCreateBill";
import BillTable from "../components/Bills/BillTable";
import BillDialog from "../components/Bills/BillDialog";
import Pagination from "../components/Pagination";
import "bootstrap/dist/css/bootstrap.min.css";

export default function Bills() {
  const { message, handleLogout, role } = useAuth();

  // ✅ Hook โหลดข้อมูลทั้งหมด
  const {
    rooms,
    bookings,
    existingBills,
    loading,
    pendingBookings,
    reloadAll,
  } = useCreateBill();

  const [openDialog, setOpenDialog] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<any>(null);

  // ✅ Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [canCreateBill, setCanCreateBill] = useState(false);
  const [todayStr, setTodayStr] = useState("");

  // 🗓️ แปลงวันที่ไทย
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

  // ✅ ตรวจว่าสามารถออกบิลได้ (วันที่ 15–31 เท่านั้น)
  useEffect(() => {
    const now = new Date();
    setTodayStr(formatThaiDate(now.toISOString()));
    setCanCreateBill(now.getDate() >= 15 && now.getDate() <= 31);
  }, []);

  // ✅ ฟังก์ชันเปิด Dialog
  const handleOpenDialog = (room: any) => {
    setSelectedRoom(room);
    setOpenDialog(true);
  };

  // ✅ Pagination Logic
  const totalItems = rooms.length;
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedRooms = rooms.slice(startIndex, startIndex + rowsPerPage);

  // ถ้าห้องเหลือน้อยกว่าหน้าปัจจุบัน (เช่นหลัง reload)
  useEffect(() => {
    const totalPages = Math.ceil(totalItems / rowsPerPage);
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [totalItems, rowsPerPage, currentPage]);

  return (
    <div
      className="d-flex flex-column"
      style={{ backgroundColor: "#f4f7fb", minHeight: "100vh" }}
    >
      {/* 🔹 Navbar */}
      <Nav
        message={message}
        onLogout={handleLogout}
        pendingBookings={pendingBookings}
        role={role}
      />

      {/* 🔹 เนื้อหา */}
      <main className="main-content flex-grow-1 px-2 py-4 mt-4">
        <div className="container">
          <h2 className="fw-bold text-center mb-3">สร้างบิลห้องพัก</h2>
          <p className="text-center text-muted">
            วันนี้: <b>{todayStr}</b>
          </p>

          {!canCreateBill && (
            <div className="alert alert-warning text-center fw-semibold">
              ออกบิลได้เฉพาะวันที่ <b>15–31 ของเดือน</b> เท่านั้น
            </div>
          )}

          {loading ? (
            <p className="text-center text-secondary mt-3">
              กำลังโหลดข้อมูล...
            </p>
          ) : (
            <>
              {/* ตารางห้องพัก */}
              <BillTable
                rooms={paginatedRooms}
                bookings={bookings}
                existingBills={existingBills}
                canCreateBill={canCreateBill}
                formatThaiDate={formatThaiDate}
                onCreateBill={handleOpenDialog}
              />

              {/* ✅ Pagination ด้านล่าง */}
              <Pagination
                currentPage={currentPage}
                totalItems={totalItems}
                rowsPerPage={rowsPerPage}
                onPageChange={setCurrentPage}
                onRowsPerPageChange={(rows) => {
                  setRowsPerPage(rows);
                  setCurrentPage(1); // กลับไปหน้าแรกเมื่อเปลี่ยนจำนวนแถว
                }}
              />
            </>
          )}
        </div>
      </main>

      {/* 🔹 Dialog ออกบิล */}
      <BillDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        room={selectedRoom}
        reloadExistingBills={reloadAll}
      />
    </div>
  );
}
