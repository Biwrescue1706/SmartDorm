// src/components/Checkout/CheckoutTable.tsx
import { useEffect, useState } from "react";
import CheckoutRow from "./CheckoutRow";
import type { Booking } from "../../types/Checkout";
import Pagination from "../Pagination";

interface Props {
  checkouts: Booking[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onEdit: (booking: Booking) => void;
  onDelete: (id: string, roomNum: string) => void;
  onConfirmReturn: (id: string) => void; // ✅ เพิ่ม prop นี้
}

export default function CheckoutTable({
  checkouts,
  onApprove,
  onReject,
  onEdit,
  onDelete,
  onConfirmReturn, // ✅ รับ prop
}: Props) {
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const totalPages = Math.max(1, Math.ceil(checkouts.length / rowsPerPage));
  const indexOfLast = currentPage * rowsPerPage;
  const indexOfFirst = indexOfLast - rowsPerPage;
  const currentCheckouts = checkouts.slice(indexOfFirst, indexOfLast);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [currentPage, totalPages]);

  return (
    <>
      <div className="responsive-table" style={{ overflowX: "auto" }}>
        <table
          className="table table-sm table-striped align-middle text-center"
          style={{ tableLayout: "fixed", width: "100%" }}
        >
          <thead className="table-dark">
            <tr>
              <th>#</th>
              <th>ห้อง</th>
              <th>ชื่อผู้จอง</th>
              <th>เบอร์โทร</th>
              <th>วันเข้าพัก</th>
              <th>วันที่ขอคืน</th>
              <th>สถานะ</th>
              <th>วันคืนจริง / จัดการ</th>
              <th>การจัดการ</th>
            </tr>
          </thead>
          <tbody>
            {currentCheckouts.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center py-3 text-muted">
                  ไม่มีข้อมูลการคืนห้อง
                </td>
              </tr>
            ) : (
              currentCheckouts.map((b, i) => (
                <CheckoutRow
                  key={b.bookingId}
                  booking={b}
                  index={indexOfFirst + i + 1}
                  onApprove={onApprove}
                  onReject={onReject}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onConfirmReturn={onConfirmReturn} // ✅ ส่งต่อไปยัง Row
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-2">
        <Pagination
          totalItems={checkouts.length}
          rowsPerPage={rowsPerPage}
          currentPage={currentPage}
          onPageChange={(page) => setCurrentPage(page)}
          onRowsPerPageChange={(rows) => {
            setRowsPerPage(rows);
            setCurrentPage(1);
          }}
        />
      </div>
    </>
  );
}
