import BookingRow from "./BookingRow";
import type { Booking } from "../../types/Booking";
import Pagination from "../Pagination";
import { useEffect, useState } from "react";

interface Props {
  bookings?: Booking[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onDelete: (id: string, roomNum: string) => void;
  onEditSuccess: () => void;
  onCheckin?: (id: string) => void;
  role?: number | null;
  activeFilter: "pending" | "approved" | "rejected" | "checkinPending";
}

export default function BookingTable({
  bookings = [],
  onApprove,
  onReject,
  onDelete,
  onEditSuccess,
  onCheckin,
  role,
  activeFilter,
}: Props) {
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const filteredRooms = bookings;
  const totalPages = Math.ceil(filteredRooms.length / rowsPerPage);
  const indexOfLast = currentPage * rowsPerPage;
  const indexOfFirst = indexOfLast - rowsPerPage;
  bookings = filteredRooms.slice(indexOfFirst, indexOfLast);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [currentPage, totalPages]);

  return (
    <div className="booking-table-container mx-3">
      <div className="responsive-table" style={{ overflowX: "auto" }}>
        <table
          className="table table-sm table-striped align-middle text-center"
          style={{ tableLayout: "fixed", width: "100%" }}
        >
          <thead className="table-dark">
            <tr>
              <th scope="col" style={{ width: "50%" }}>
                #
              </th>
              <th scope="col" style={{ width: "80%" }}>
                ห้อง
              </th>
              <th scope="col" style={{ width: "120%" }}>
                Line
              </th>
              <th scope="col" style={{ width: "120%" }}>
                ชื่อผู้จอง
              </th>
              <th scope="col" style={{ width: "120%" }}>
                เบอร์โทร
              </th>
              <th scope="col" style={{ width: "120%" }}>
                วันจอง
              </th>
              <th scope="col" style={{ width: "120%" }}>
                วันที่แจ้งเข้าพัก
              </th>

              <th scope="col" style={{ width: "120%" }}>
                วันเข้าพักจริง
              </th>
              <th scope="col" style={{ width: "120%" }}>
                สลิป
              </th>
              <th scope="col" style={{ width: "120%" }}>
                สถานะ
              </th>
              {role === 0 && (
                <th scope="col" style={{ width: "120%" }}>
                  แก้ไข
                </th>
              )}
              {role === 0 && (
                <th scope="col" style={{ width: "120%" }}>
                  ลบ
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {bookings.length > 0 ? (
              bookings.map((b, i) => (
                <BookingRow
                  key={b.bookingId}
                  booking={b}
                  index={i + 1}
                  onApprove={onApprove}
                  onReject={onReject}
                  onDelete={onDelete}
                  onEditSuccess={onEditSuccess}
                  onCheckin={onCheckin}
                  role={role}
                  activeFilter={activeFilter} // Pass down
                />
              ))
            ) : (
              <tr>
                <td
                  colSpan={
                    10 +
                    (role === 0 ? 2 : 0)
                  }
                  className="text-center py-4 text-muted"
                >
                  ไม่พบข้อมูลการจอง
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-5 mx-5">
        <Pagination
          totalItems={filteredRooms.length}
          rowsPerPage={rowsPerPage}
          currentPage={currentPage}
          onPageChange={(page) => setCurrentPage(page)}
          onRowsPerPageChange={(rows) => {
            setRowsPerPage(rows);
            setCurrentPage(1);
          }}
        />
      </div>
    </div>
  );
}
