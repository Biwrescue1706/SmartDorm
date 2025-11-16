import { useState, useEffect } from "react";
import RoomTable from "../components/Room/RoomTable";
import RoomCard from "../components/Room/RoomCard";
import AddRoomDialog from "../components/Room/AddRoomDialog";
import Pagination from "../components/Pagination";
import Nav from "../components/Nav";
import RoomFilter from "../components/Room/RoomFilter";
import { useAuth } from "../hooks/useAuth";
import { useRooms } from "../hooks/useRooms";

export default function Rooms() {
  const { rooms, loading, fetchRooms } = useRooms();
  const { message, handleLogout, role, adminName, adminUsername } = useAuth();

  useEffect(() => {
    fetchRooms();
  }, []);

  // ตรวจขนาดจอ
  const [isLargeScreen, setIsLargeScreen] = useState(window.innerWidth >= 1400);

  useEffect(() => {
    const handleResize = () => {
      setIsLargeScreen(window.innerWidth >= 1400);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ฟิลเตอร์
  const [filter, setFilter] = useState<"all" | "available" | "booked">("all");
  const [selectedFloor, setSelectedFloor] = useState("ทั้งหมด");

  const counts = {
    total: rooms.length,
    available: rooms.filter((r) => r.status === 0).length,
    booked: rooms.filter((r) => r.status === 1).length,
  };

  const filteredRooms = rooms.filter((r) => {
    if (filter === "available" && r.status !== 0) return false;
    if (filter === "booked" && r.status !== 1) return false;

    if (selectedFloor !== "ทั้งหมด") {
      const floor = parseInt(selectedFloor);
      const num = Number(r.number); // แก้ string -> number

      return num >= floor * 100 && num < (floor + 1) * 100;
    }
    return true;
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const indexOfLast = currentPage * rowsPerPage;
  const indexOfFirst = indexOfLast - rowsPerPage;
  const currentRooms = filteredRooms.slice(indexOfFirst, indexOfLast);

  const handleRefresh = async () => {
    await fetchRooms();
  };

  return (
    <div className="d-flex min-vh-100 bg-white">
      <Nav
        message={message}
        onLogout={handleLogout}
        role={role}
        adminName={adminName}
        adminUsername={adminUsername}
      />

      <main className="main-content flex-grow-1 px-1 py-2 mt-6 mt-lg-7">
        <div className="mx-auto container-max">
          <div className="d-flex justify-content-center mb-3 mt-3">
            <h2 className="fw-bold text-dark">🏠 จัดการห้องพัก</h2>
          </div>

          {role === 0 && (
            <div className="text-center mb-3">
              <AddRoomDialog onSuccess={handleRefresh} />
            </div>
          )}

          {/* เลือกชั้น */}
          <div className="text-center mb-4">
            <label className="fw-semibold me-2 fs-5 text-dark">เลือกชั้น :</label>
            <select
              className="form-select d-inline-block text-center fw-semibold shadow-sm"
              style={{ width: "120px", borderRadius: "10px" }}
              value={selectedFloor}
              onChange={(e) => {
                setSelectedFloor(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="ทั้งหมด">ทั้งหมด</option>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((f) => (
                <option key={f} value={f.toString()}>
                  ชั้น {f}
                </option>
              ))}
            </select>
          </div>

          {/* ฟิลเตอร์ห้อง */}
          <RoomFilter
            activeFilter={filter}
            counts={counts}
            onFilterChange={(f) => {
              setFilter(f);
              setCurrentPage(1);
            }}
          />

          {/* โหลด */}
          {loading ? (
            <div className="text-center my-5">
              <div className="spinner-border text-success" role="status"></div>
              <p className="mt-3 text-muted">กำลังโหลดข้อมูลห้อง...</p>
            </div>
          ) : (
            <>
              {isLargeScreen ? (
                <>
                  {/* Table Mode */}
                  <RoomTable
                    rooms={currentRooms}
                    startIndex={indexOfFirst}
                    onUpdated={handleRefresh}
                    role={role}
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
              ) : (
                <>
                  {/* Card Mode → 1 หรือ 2 คอลัมน์ */}
                  <div
                    className="d-grid"
                    style={{
                      gridTemplateColumns:
                        window.innerWidth >= 600 ? "1fr 1fr" : "1fr",
                      gap: "15px",
                    }}
                  >
                    {currentRooms.map((room) => (
                      <RoomCard
                        key={room.roomId}
                        room={room}
                        role={role}
                        onUpdated={handleRefresh}
                      />
                    ))}
                  </div>

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
            </>
          )}
        </div>
      </main>
    </div>
  );
}