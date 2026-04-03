// src/pages/Rooms.tsx
import { useState, useEffect } from "react";
import RoomTable from "../../components/Room/RoomTable";
import RoomCard from "../../components/Room/RoomCard";
import AddRoomDialog from "../../components/Room/AddRoomDialog";
import Pagination from "../../components/Pagination";
import Nav from "../../components/Nav";
import RoomFilter from "../../components/Room/RoomFilter";
import { useAuth } from "../../hooks/useAuth";
import { useRooms } from "../../hooks/ManageRooms/useRooms";
import { usePendingBookings } from "../../hooks/ManageRooms/usePendingBookings";
import { usePendingCheckouts } from "../../hooks/ManageRooms/usePendingCheckouts";

//   🎨 SCB THEME สำหรับหน้า Rooms
const THEME = {
  purple: "#4A0080",
  purpleLight: "#6A11CB",
  purpleDark: "#2E0055",
  gold: "#D4AF37",
  bg: "#f5f3fa",
  text: "#333",
  cardBg: "#ffffff",
};

export default function Rooms() {
  const { rooms, loading, fetchRooms } = useRooms();
  const { handleLogout, role, adminName, adminUsername } = useAuth();

  // โหลดข้อมูลห้อง
  useEffect(() => {
    fetchRooms();
  }, []);

  // เก็บขนาดหน้าจอเพื่อใช้ทั้ง breakpoint table/card และ grid
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const isLargeScreen = windowWidth >= 1400;

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  //     🔢 ฟังก์ชัน floor จากเลขห้อง
  const getFloor = (roomNumber: string | number): number | null => {
    const num = Number(roomNumber);
    if (isNaN(num)) return null;
    return Math.floor(num / 100);
  };

  const allFloors: number[] = Array.from(
    new Set(
      rooms
        .map((r) => getFloor(r.number))
        .filter((f): f is number => f !== null && f > 0),
    ),
  ).sort((a, b) => a - b);

  //     🎯 ฟิลเตอร์สถานะห้อง + ชั้น
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
      const num = Number(r.number);
      return num >= floor * 100 && num < (floor + 1) * 100;
    }
    return true;
  });

  //     📄 Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const indexOfLast = currentPage * rowsPerPage;
  const indexOfFirst = indexOfLast - rowsPerPage;
  const currentRooms = filteredRooms.slice(indexOfFirst, indexOfLast);

  const handleRefresh = async () => {
    await fetchRooms();
  };

  const FloorSelector = () => (
    <div className="text-center mb-4">
      <label
        className="fw-semibold me-2 fs-5"
        style={{ color: THEME.purpleDark }}
      >
        เลือกชั้น :
      </label>
      <select
        className="form-select d-inline-block text-center fw-semibold shadow-sm"
        style={{
          width: "170px",
          borderRadius: "12px",
          padding: "6px 10px",
          borderColor: THEME.purpleLight,
        }}
        value={selectedFloor}
        onChange={(e) => {
          setSelectedFloor(e.target.value);
          setCurrentPage(1);
        }}
      >
        <option value="ทั้งหมด">ทุกชั้น</option>
        {allFloors.map((f) => (
          <option key={f} value={f.toString()}>
            ชั้น {f}
          </option>
        ))}
      </select>
    </div>
  );

  const PageHeader = () => (
    <div className="mb-3 mt-3 text-center">
      <h2
        className="fw-bold mb-1"
        style={{ color: THEME.purple, letterSpacing: "0.5px" }}
      >
        🏠 จัดการห้องพัก SmartDorm
      </h2>
      <p className="text-muted mb-0">
        ตรวจสอบสถานะห้องพัก, เพิ่มห้องใหม่ และจัดการได้ในหน้าจอเดียว
      </p>
    </div>
  );

  const StatsBar = () => (
    <div
      className="row g-3 mb-3 justify-content-center"
      style={{ marginTop: "10px" }}
    ></div>
  );

  //     🧠 Render หลัก
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
        style={{
          paddingLeft: "20px",
          paddingRight: "20px",
        }}
      >
        <div
          className="mx-auto container-max"
          style={{
            borderRadius: 20,
            maxWidth: "1400px",
            padding: "20px",
          }}
        >
          {/* Header */}
          <PageHeader />

          {/* ปุ่มเพิ่มห้อง + Stat bar */}
          {role === 0 && (
            <div className="text-center mb-3">
              <AddRoomDialog onSuccess={handleRefresh} />
            </div>
          )}

          <StatsBar />

          {/* Filter Bar (มือถือ/แท็บเล็ต = แถวเดียว) */}
          <div className="d-flex d-xxl-none flex-column align-items-center mb-3">
            <h5 className="text-center mb-2 w-100 text-black">กรองสถานะห้อง</h5>

            <div className="d-flex justify-content-center align-items-center gap-2 flex-wrap">
              <RoomFilter
                activeFilter={filter}
                counts={counts}
                onFilterChange={(f) => {
                  setFilter(f as "all" | "available" | "booked");
                  setCurrentPage(1);
                }}
              />

              <select
                className="form-select fw-semibold shadow-sm"
                style={{ width: "150px", borderRadius: "12px" }}
                value={selectedFloor}
                onChange={(e) => {
                  setSelectedFloor(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="ทั้งหมด">ทุกชั้น</option>
                {allFloors.map((f) => (
                  <option key={f} value={f.toString()}>
                    ชั้น {f}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* >= 1400 ใช้แบบเดิม */}
          <div className="d-none d-xxl-block">
            <FloorSelector />
            <RoomFilter
              activeFilter={filter}
              counts={counts}
              onFilterChange={(f) => {
                setFilter(f as "all" | "available" | "booked");
                setCurrentPage(1);
              }}
            />
          </div>

          {/* Content: Loading / Table / Cards */}
          {loading ? (
            <div className="text-center my-5">
              <div
                className="spinner-border"
                role="status"
                style={{ color: THEME.purple }}
              ></div>
              <p className="mt-3 text-muted">กำลังโหลดข้อมูลห้องพัก...</p>
            </div>
          ) : (
            <>
              {isLargeScreen ? (
                <>
                  {/* DESKTOP: TABLE MODE */}
                  <div
                    className="card shadow-sm mb-3"
                    style={{
                      borderRadius: "14px",
                      background: THEME.cardBg,
                      border: "1px solid #eee",
                    }}
                  >
                    <div className="card-body p-2 p-md-3">
                      <RoomTable
                        rooms={currentRooms}
                        startIndex={indexOfFirst}
                        onUpdated={handleRefresh}
                        role={role}
                        filter={filter}
                      />
                    </div>
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
              ) : (
                <>
                  {/* MOBILE / TABLET: CARD GRID */}
                  <div
                    className="d-grid mb-2"
                    style={{
                      gridTemplateColumns:
                        "repeat(auto-fill, minmax(130px, 1fr))",
                      gap: "18px",
                      paddingLeft: "4px",
                      paddingRight: "4px",
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
