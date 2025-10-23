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
}

export default function BookingTable({
  bookings = [],
  onApprove,
  onReject,
  onDelete,
  onEditSuccess,
}: Props) {
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  //  แบ่งหน้า
  const filteredRooms = bookings;
  const totalPages = Math.ceil(filteredRooms.length / rowsPerPage);
  const indexOfLast = currentPage * rowsPerPage;
  const indexOfFirst = indexOfLast - rowsPerPage;
  bookings = filteredRooms.slice(indexOfFirst, indexOfLast);

  //  รีเซ็ตหน้าถ้า page เกิน
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [currentPage, totalPages]);

  return (
    //  ใช้ className "responsive-table" เพื่อผูกกับ CSS ทั้งหมด
    <div className="responsive-table" style={{ overflowX: "auto" }}>
      <table
        className="table table-sm table-striped align-middle text-center"
        style={{ tableLayout: "fixed", width: "100%" }}
      >
        <thead>
          <tr>
            <th style={{ width: "20%" }}>#</th>
            <th style={{ width: "35%" }}>ห้อง</th>
            <th style={{ width: "65%" }}>Line ผู้จอง</th>
            <th style={{ width: "60%" }}>ชื่อผู้จอง</th>
            <th style={{ width: "60%" }}>เบอร์โทร</th>
            <th style={{ width: "55%" }}>วันจอง</th>
            <th style={{ width: "55%" }}>วันเข้าพัก</th>
            <th style={{ width: "55%" }}>วันคืนห้อง</th>
            <th style={{ width: "60%" }}>สลิป</th>
            <th style={{ width: "56%" }}>สถานะ</th>
            <th style={{ width: "56%" }}>การจัดการ</th>
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
              />
            ))
          ) : (
            <tr>
              <td colSpan={11} className="text-center py-4 text-muted">
                ไม่พบข้อมูลการจอง
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/*  Pagination */}
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
  );
}
