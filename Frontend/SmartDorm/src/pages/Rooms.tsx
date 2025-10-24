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

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const indexOfLast = currentPage * rowsPerPage;
  const indexOfFirst = indexOfLast - rowsPerPage;
  const currentRooms = rooms.slice(indexOfFirst, indexOfLast);

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
      <main className="main-content flex-grow-1 px-3 py-4 mt-4 mt-lg-4">
        <div className="mx-auto container-max">
          <div className="d-flex justify-content-center align-items-center mb-2 mt-3">
            <h2 className="fw-bold text-dark">🏠 จัดการห้องพัก</h2>
          </div>
          <AddRoomDialog onSuccess={handleRefresh} />
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
                totalItems={rooms.length}
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
