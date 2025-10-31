import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import RoomTable from "../components/Room/RoomTable";
import AddRoomDialog from "../components/Room/AddRoomDialog";
import Pagination from "../components/Pagination";
import Nav from "../components/Nav";
import { useAuth } from "../hooks/useAuth";
import { useRooms } from "../hooks/useRooms";

export default function Rooms() {
  const { rooms, loading, fetchRooms } = useRooms();
  const { message, handleLogout, role } = useAuth();
  const [pendingBookings] = useState(0);

  // โหลดห้องเมื่อเปิดหน้า
  useEffect(() => {
    fetchRooms();
  }, []);

  // ✅ state สำหรับกรองชั้น
  const [selectedFloor, setSelectedFloor] = useState("ทั้งหมด");

  // ✅ ฟิลเตอร์ห้องตามชั้น (แบบหาร 100 ลงตัว)
  const filteredRooms =
    selectedFloor === "ทั้งหมด"
      ? rooms
      : rooms.filter((r) => {
          const num = parseInt(r.number, 10);
          const floorNum = parseInt(selectedFloor, 10);
          // ห้องจะอยู่ในชั้นนั้น ถ้าหมายเลขอยู่ระหว่าง floor*100 ถึง floor*100 + 99
          return num >= floorNum * 100 && num < (floorNum + 1) * 100;
        });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const indexOfLast = currentPage * rowsPerPage;
  const indexOfFirst = indexOfLast - rowsPerPage;
  const currentRooms = filteredRooms.slice(indexOfFirst, indexOfLast);

  // รีเฟรชข้อมูล
  const handleRefresh = async () => {
    try {
      await fetchRooms();
    } catch (err) {
      Swal.fire("รีเฟรชข้อมูลล้มเหลว", (err as Error).message, "error");
    }
  };

  return (
    <div className="d-flex min-vh-100 bg-white">
      {/* Sidebar */}
      <Nav
        message={message}
        onLogout={handleLogout}
        pendingBookings={pendingBookings}
        role={role}
      />

      {/* Main Content */}
      <main className="main-content flex-grow-1 px-1 py-2 mt-6 mt-lg-7">
        <div className="mx-auto container-max">
          {/* หัวข้อ */}
          <div className="d-flex justify-content-center align-items-center mb-3 mt-3">
            <h2 className="fw-bold text-dark">🏠 จัดการห้องพัก</h2>
          </div>

          {/* ปุ่มเพิ่มห้อง */}
          <div className="text-center mb-4">
            <AddRoomDialog onSuccess={handleRefresh} />
          </div>

          {/* 🔽 ดรอปดาวน์เลือกชั้น (อยู่ใต้ปุ่ม) */}
          <div className="text-center mb-4">
            <label className="fw-semibold me-2 fs-5 text-dark">
              เลือกชั้น : 
            </label>
            <select
              className="form-select d-inline-block text-center fw-semibold shadow-sm"
              style={{
                width: "220px",
                fontSize: "1.05rem",
                borderRadius: "10px",
                border: "2px solid #0d6efd",
              }}
              value={selectedFloor}
              onChange={(e) => {
                setSelectedFloor(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="ทั้งหมด">ทั้งหมด</option>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((floor) => (
                <option key={floor} value={floor.toString()}>
                  ชั้น {floor}
                </option>
              ))}
            </select>
          </div>

          {/* ตารางข้อมูลห้อง */}
          {loading ? (
            <div className="text-center my-5">
              <div className="spinner-border text-success" role="status"></div>
              <p className="mt-3 text-muted">กำลังโหลดข้อมูลห้อง...</p>
            </div>
          ) : (
            <>
              <RoomTable
                rooms={currentRooms}
                startIndex={indexOfFirst}
                onUpdated={handleRefresh}
              />

              <Pagination
                currentPage={currentPage}
                totalItems={filteredRooms.length}
                rowsPerPage={rowsPerPage}
                onPageChange={(page) => setCurrentPage(page)}
                onRowsPerPageChange={(rows) => {
                  setRowsPerPage(rows);
                  setCurrentPage(1);
                }}
              />
            </>
          )}
        </div>
      </main>
    </div>
  );
}
