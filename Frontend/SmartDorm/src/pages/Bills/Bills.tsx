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
import type { Booking } from "../../types/All";

export default function Bills() {
  const { handleLogout, role, adminName, adminUsername } =
    useAuth();

  const {
    rooms,
    bookings,
    existingBills,
    loading,
    reloadAll,
  } = useCreateBill();

  const [openDialog, setOpenDialog] =
    useState(false);

  const [selectedRoom, setSelectedRoom] =
    useState<any>(null);

  const [currentPage, setCurrentPage] =
    useState(1);

  const [rowsPerPage, setRowsPerPage] =
    useState(15);

  const [statusFilter, setStatusFilter] =
    useState<"billed" | "notBilled">(
      "notBilled",
    );

  const [todayStr, setTodayStr] =
    useState("");

  // responsive
  const [windowWidth, setWindowWidth] =
    useState(window.innerWidth);

  // format thai date
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

    return `${date.getDate()} ${
      monthsThai[date.getMonth()]
    } ${date.getFullYear() + 543}`;
  };

  // วันนี้
  useEffect(() => {
    const now = new Date();
    setTodayStr(formatThaiDate(now));
  }, []);

  // resize
  useEffect(() => {
    const handleResize = () =>
      setWindowWidth(window.innerWidth);

    window.addEventListener(
      "resize",
      handleResize,
    );

    return () =>
      window.removeEventListener(
        "resize",
        handleResize,
      );
  }, []);

  // grid
  const getGridColumns = () => {
    if (windowWidth >= 600)
      return "repeat(3, 1fr)";

    if (windowWidth >= 481)
      return "repeat(2, 1fr)";

    return "1fr";
  };

  // ห้องที่มีผู้เช่า
  const allBookedRooms = rooms.filter(
    (room) => {
      const booking = bookings.find(
        (b) =>
          String(b.roomId) ===
          String(room.roomId),
      );

      return !!booking?.checkinAt;
    },
  );

  // bills เดือนปัจจุบัน
  const billsOfCurrentCycle =
    useMemo(() => {
      const now = new Date();

      // วันที่ 1 ของเดือน
      const startOfMonth = new Date(
        now.getFullYear(),
        now.getMonth(),
        1,
        0,
        0,
        0,
      );

      // วันสุดท้ายของเดือน
      const endOfMonth = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        0,
        23,
        59,
        59,
      );

      return existingBills.filter(
        (b: any) => {
          const billDate = new Date(
            b.month,
          );

          return (
            billDate >=
              startOfMonth &&
            billDate <= endOfMonth
          );
        },
      );
    }, [existingBills]);

  // roomId ที่ออกบิลแล้ว
  const billedRoomIdsOfCurrentMonth =
    useMemo(() => {
      return billsOfCurrentCycle.map(
        (b: any) =>
          String(b.roomId),
      );
    }, [billsOfCurrentCycle]);

  // count
  const billedCount =
    allBookedRooms.filter((r) =>
      billedRoomIdsOfCurrentMonth.includes(
        String(r.roomId),
      ),
    ).length;

  const notBilledCount =
    allBookedRooms.length -
    billedCount;

  // filter
  const filteredRooms =
    allBookedRooms.filter((room) => {
      const hasBill =
        billedRoomIdsOfCurrentMonth.includes(
          String(room.roomId),
        );

      if (statusFilter === "billed")
        return hasBill;

      if (
        statusFilter ===
        "notBilled"
      )
        return !hasBill;

      return true;
    });

  // pagination
  const totalItems =
    filteredRooms.length;

  const startIndex =
    (currentPage - 1) *
    rowsPerPage;

  const paginatedRooms =
    filteredRooms.slice(
      startIndex,
      startIndex + rowsPerPage,
    );

  useEffect(() => {
    const totalPages = Math.ceil(
      totalItems / rowsPerPage,
    );

    if (
      currentPage > totalPages &&
      totalPages > 0
    ) {
      setCurrentPage(totalPages);
    }
  }, [
    totalItems,
    rowsPerPage,
    currentPage,
  ]);

  // open dialog
  const handleOpenDialog = (
    room: any,
  ) => {
    setSelectedRoom(room);
    setOpenDialog(true);
  };

  // create bill rule
  const canCreateBillForBooking = (
    booking: Booking,
  ) => {
    const alreadyHasBill =
      existingBills.some(
        (bill: any) => {
          const now =
            new Date();

          const startOfMonth =
            new Date(
              now.getFullYear(),
              now.getMonth(),
              1,
              0,
              0,
              0,
            );

          const endOfMonth =
            new Date(
              now.getFullYear(),
              now.getMonth() + 1,
              0,
              23,
              59,
              59,
            );

          const billDate =
            new Date(
              bill.month,
            );

          return (
            String(
              bill.roomId,
            ) ===
              String(
                booking.roomId,
              ) &&
            billDate >=
              startOfMonth &&
            billDate <=
              endOfMonth
          );
        },
      );

    return !alreadyHasBill;
  };

  const isDesktop =
    windowWidth >= 1400;

  return (
    <div
      className="d-flex min-vh-100 mx-2 mt-0 mb-4"
      style={{
        fontFamily:
          "Sarabun, sans-serif",
      }}
    >
      <Nav
        onLogout={handleLogout}
        role={role}
        adminName={adminName}
        adminUsername={adminUsername}
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
          <h2 className="fw-bold text-center text-black mb-2">
            สร้างบิลห้องพัก
          </h2>

          <h5 className="text-center text-black mb-3">
            วันนี้: <b>{todayStr}</b>
          </h5>

          {/* refresh */}
          <div className="d-flex justify-content-center mb-3">
            <button
              className="btn btn-primary fw-bold px-4"
              onClick={() =>
                window.location.reload()
              }
            >
              รีเฟรชหน้าจอ
            </button>
          </div>

          {/* summary */}
          <div className="container mb-3">
            <div className="row g-3 justify-content-center text-center">
              {/* not billed */}
              <div className="col-6 col-md-3">
                <div
                  className="p-3 rounded-4 shadow-sm fw-bold"
                  onClick={() => {
                    setStatusFilter(
                      "notBilled",
                    );

                    setCurrentPage(1);
                  }}
                  style={{
                    cursor: "pointer",
                    fontSize: "1.5rem",
                    background:
                      statusFilter ===
                      "notBilled"
                        ? "linear-gradient(135deg, #ef233c, #650011)"
                        : "linear-gradient(135deg, #6c0011, #ef233c)",
                    color: "white",
                  }}
                >
                  ยังไม่ได้ออกบิล

                  <div
                    style={{
                      fontSize: "1.5rem",
                    }}
                  >
                    {notBilledCount}
                  </div>
                </div>
              </div>

              {/* billed */}
              <div className="col-6 col-md-3">
                <div
                  className="p-3 rounded-4 shadow-sm fw-bold"
                  onClick={() => {
                    setStatusFilter(
                      "billed",
                    );

                    setCurrentPage(1);
                  }}
                  style={{
                    cursor: "pointer",
                    fontSize: "1.5rem",
                    background:
                      statusFilter ===
                      "billed"
                        ? "linear-gradient(135deg, #38b000, #008000)"
                        : "linear-gradient(135deg, #008000, #91ff5e)",
                    color: "white",
                  }}
                >
                  ออกบิลแล้ว

                  <div
                    style={{
                      fontSize: "1.5rem",
                    }}
                  >
                    {billedCount}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {loading ? (
            <p className="text-center">
              กำลังโหลดข้อมูล...
            </p>
          ) : (
            <>
              {isDesktop ? (
                <BillTable
                  rooms={paginatedRooms}
                  bookings={bookings}
                  existingBills={
                    existingBills
                  }
                  canCreateBill={true}
                  showBillDateColumn={
                    statusFilter ===
                    "billed"
                  }
                  showActionColumn={
                    statusFilter ===
                    "notBilled"
                  }
                  canCreateBillForBooking={
                    canCreateBillForBooking
                  }
                  formatThaiDate={(d) =>
                    formatThaiDate(
                      new Date(d),
                    )
                  }
                  onCreateBill={
                    handleOpenDialog
                  }
                />
              ) : (
                <div
                  className="d-grid"
                  style={{
                    gridTemplateColumns:
                      getGridColumns(),
                    gap: 16,
                  }}
                >
                  {paginatedRooms.map(
                    (room) => {
                      const booking =
                        bookings.find(
                          (b) =>
                            String(
                              b.roomId,
                            ) ===
                            String(
                              room.roomId,
                            ),
                        );

                      const hasBill =
                        billedRoomIdsOfCurrentMonth.includes(
                          String(
                            room.roomId,
                          ),
                        );

                      const bill =
                        billsOfCurrentCycle.find(
                          (b: any) =>
                            String(
                              b.roomId,
                            ) ===
                            String(
                              room.roomId,
                            ),
                        );

                      return (
                        <BillCard
                          key={
                            room.roomId
                          }
                          room={room}
                          booking={
                            booking
                          }
                          bill={bill}
                          hasBill={
                            hasBill
                          }
                          canCreateBill={
                            true
                          }
                          canCreateBillForBooking={
                            canCreateBillForBooking
                          }
                          formatThaiDate={(
                            d,
                          ) =>
                            formatThaiDate(
                              new Date(
                                d,
                              ),
                            )
                          }
                          onCreateBill={
                            handleOpenDialog
                          }
                        />
                      );
                    },
                  )}
                </div>
              )}

              {!openDialog && (
                <Pagination
                  currentPage={
                    currentPage
                  }
                  totalItems={
                    totalItems
                  }
                  rowsPerPage={
                    rowsPerPage
                  }
                  onPageChange={
                    setCurrentPage
                  }
                  onRowsPerPageChange={(
                    rows,
                  ) => {
                    setRowsPerPage(
                      rows,
                    );

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
        onClose={() =>
          setOpenDialog(false)
        }
        room={selectedRoom}
        reloadExistingBills={
          reloadAll
        }
      />
    </div>
  );
}