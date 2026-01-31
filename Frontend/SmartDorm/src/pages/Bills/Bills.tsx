// src/pages/Bills/Bills.tsx
import { useState, useEffect, useMemo } from "react";
import Nav from "../../components/Nav";
import { useAuth } from "../../hooks/useAuth";
import { useCreateBill } from "../../hooks/Bill/useCreateBill";
import BillTable from "../../components/Bills/BillTable";
import BillCard from "../../components/Bills/BillCard";
import BillDialog from "../../components/Bills/BillDialog";
import Pagination from "../../components/Pagination";
import "bootstrap/dist/css/bootstrap.min.css";

const canBillThisCycle = (booking: any, billMonth: Date) => {
  if (!booking?.checkinAt) return false;

  const cutoff = new Date(
    billMonth.getFullYear(),
    billMonth.getMonth() - 1,
    25,
    23,
    59,
    59,
  );

  return new Date(booking.checkinAt) <= cutoff;
};

export default function Bills() {
  const { handleLogout, role, adminName, adminUsername } = useAuth();
  const { rooms, bookings, existingBills, loading, reloadAll } =
    useCreateBill();
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [statusFilter, setStatusFilter] = useState<"billed" | "notBilled">(
    "notBilled",
  );

  // today string
  const [todayStr, setTodayStr] = useState("");

  // ✅ grid column control (สำคัญมาก)
  const getGridColumns = () => {
    if (windowWidth >= 600) return "repeat(3, 1fr)";
    if (windowWidth >= 481) return "repeat(2, 1fr)";
    return "1fr";
  };

  // helper: format thai date
  const formatThaiDate = (date: Date) => {
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

  // วันนี้
  useEffect(() => {
    const now = new Date();
    setTodayStr(formatThaiDate(now));
  }, []);

  const currentBillMonth = useMemo(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth() + 1, 1);
  }, []);

  // rule 25 ต่อ booking
  const canCreateBillForBooking = (booking: any) => {
    if (!booking?.checkinAt) return false;
    if (!currentBillMonth) return false;

    const cutoff = new Date(
      currentBillMonth.getFullYear(),
      currentBillMonth.getMonth() - 1,
      25,
      23,
      59,
      59,
    );

    return new Date(booking.checkinAt) <= cutoff;
  };

  // bills ของรอบปัจจุบัน (object เต็ม)
  const billsOfCurrentCycle = useMemo(() => {
    if (!currentBillMonth) return [];

    return existingBills.filter((b: any) => {
      const bm = new Date(b.month);
      return (
        bm.getFullYear() === currentBillMonth.getFullYear() &&
        bm.getMonth() === currentBillMonth.getMonth()
      );
    });
  }, [existingBills, currentBillMonth]);

  // roomId ที่ออกบิลแล้วในรอบนี้
  const billedRoomIdsOfCurrentMonth = useMemo(() => {
    return billsOfCurrentCycle.map((b: any) => b.roomId);
  }, [billsOfCurrentCycle]);

  // ห้องที่มี booking และผ่าน rule รอบบิล
  const allBookedRooms = rooms.filter((room) => {
    const booking = bookings.find((b) => b.roomId === room.roomId);
    if (!booking || booking.approveStatus !== 1) return false;
    if (!currentBillMonth) return false;
    return canBillThisCycle(booking, currentBillMonth);
  });

  // count
  const billedCount = allBookedRooms.filter((r) =>
    billedRoomIdsOfCurrentMonth.includes(r.roomId),
  ).length;

  const notBilledCount = allBookedRooms.length - billedCount;

  // filter rooms
  const filteredRooms = allBookedRooms.filter((room) => {
    const hasBill = billedRoomIdsOfCurrentMonth.includes(room.roomId);
    if (statusFilter === "billed") return hasBill;
    if (statusFilter === "notBilled") return !hasBill;
    return true;
  });

  // pagination logic
  const totalItems = filteredRooms.length;
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedRooms = filteredRooms.slice(
    startIndex,
    startIndex + rowsPerPage,
  );

  useEffect(() => {
    const totalPages = Math.ceil(totalItems / rowsPerPage);
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [totalItems, rowsPerPage, currentPage]);

  // dialog handler
  const handleOpenDialog = (room: any) => {
    setSelectedRoom(room);
    setOpenDialog(true);
  };

  // responsive
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isDesktop = windowWidth >= 1400;
  // render
  return (
    <div className="d-flex min-vh-100 mx-4 my-3">
      <Nav
        onLogout={handleLogout}
        role={role}
        adminName={adminName}
        adminUsername={adminUsername}
      />

      <main className="main-content flex-grow-1 px-1 py-2 mt-6 mt-lg-7">
        <div className="mx-auto container-max">
          <h2 className="fw-bold text-center text-black mb-2">
            สร้างบิลห้องพัก
          </h2>
          <h5 className="text-center text-black mb-3">
            วันนี้: <b>{todayStr}</b>
          </h5>

          {/* summary */}
          <div className="container mb-3">
            <div className="row g-3 justify-content-center text-center">
              <div className="col-6 col-md-3">
                <div
                  className="p-3 rounded-4 shadow-sm fw-bold"
                  onClick={() => {
                    setStatusFilter("notBilled");
                    setCurrentPage(1);
                  }}
                  style={{
                    cursor: "pointer",
                    fontSize: "1.5rem",
                    background:
                      statusFilter === "notBilled"
                        ? "linear-gradient(135deg, #ef233c, #650011)"
                        : "linear-gradient(135deg, #6c0011, #ef233c)",
                    color: statusFilter === "notBilled" ? "white" : "white",
                  }}
                >
                  ยังไม่ได้ออกบิล
                  <div style={{ fontSize: "1.5rem" }}>{notBilledCount}</div>
                </div>
              </div>

              <div className="col-6 col-md-3">
                <div
                  className="p-3 rounded-4 shadow-sm fw-bold"
                  onClick={() => {
                    setStatusFilter("billed");
                    setCurrentPage(1);
                  }}
                  style={{
                    fontSize: "1.5rem",
                    cursor: "pointer",
                    background:
                      statusFilter === "billed"
                        ? "linear-gradient(135deg, #38b000, #008000)"
                        : "linear-gradient(135deg, #008000, #91ff5e)",
                    color: statusFilter === "billed" ? "white" : "white",
                  }}
                >
                  ออกบิลแล้ว
                  <div style={{ fontSize: "1.5rem" }}>{billedCount}</div>
                </div>
              </div>
            </div>
          </div>

          {loading ? (
            <p className="text-center">กำลังโหลดข้อมูล...</p>
          ) : (
            <>
              {isDesktop ? (
                <BillTable
                  rooms={paginatedRooms}
                  bookings={bookings}
                  existingBills={billsOfCurrentCycle}
                  canCreateBill={!!currentBillMonth}
                  showBillDateColumn={statusFilter === "billed"}
                  showActionColumn={statusFilter === "notBilled"}
                  canCreateBillForBooking={canCreateBillForBooking}
                  formatThaiDate={(d) => formatThaiDate(new Date(d))}
                  onCreateBill={handleOpenDialog}
                />
              ) : (
                <div
                  className="d-grid"
                  style={{
                    gridTemplateColumns: getGridColumns(),
                    gap: 16,
                  }}
                >
                  {paginatedRooms.map((room) => {
                    const booking = bookings.find(
                      (b) => b.roomId === room.roomId,
                    );
                    const hasBill = billedRoomIdsOfCurrentMonth.includes(
                      room.roomId,
                    );
                    const bill = billsOfCurrentCycle.find(
                      (b: any) => b.roomId === room.roomId,
                    );

                    return (
                      <BillCard
                        key={room.roomId}
                        room={room}
                        booking={booking}
                        bill={bill}
                        hasBill={hasBill}
                        canCreateBill={!!currentBillMonth}
                        canCreateBillForBooking={canCreateBillForBooking}
                        formatThaiDate={(d) => formatThaiDate(new Date(d))}
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
