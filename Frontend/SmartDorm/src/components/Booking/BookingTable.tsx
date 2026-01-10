//src/components/Booking/BookingTable.tsx
import BookingRow from "./BookingRow";
import Pagination from "../Pagination";
import type { Booking, Checkout } from "../../types/Booking";

interface Props {
  bookings: Booking[];
  checkout?: Checkout[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onDelete: (id: string, roomNum: string) => void;
  onEditSuccess: () => void;
  onCheckin?: (id: string) => void;
  role?: number | null;
  showActualColumn?: boolean;

  // Pagination
  currentPage: number;
  rowsPerPage: number;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rows: number) => void;
}

export default function BookingTable({
  bookings,
  checkout,
  onApprove,
  onReject,
  onDelete,
  onEditSuccess,
  onCheckin,
  role,
  showActualColumn,
  currentPage,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
}: Props) {
  const useCard =
    window.innerWidth < 600 ||
    (window.innerWidth < 1400 && window.innerWidth >= 600);

  const mode = useCard ? "card" : "table";

  const showActualCheckinColumn = !!showActualColumn;

  // ✅ เรียงข้อมูลก่อน: 1) ตามหมายเลขห้อง 2) ตามวันที่สร้าง
  const sortedBookings = bookings.slice().sort((a, b) => {
    const roomA = Number(a.room.number);
    const roomB = Number(b.room.number);

    if (roomA !== roomB) return roomA - roomB;

    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });

  // ✅ Pagination ทำจาก sortedBookings
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedBookings = sortedBookings.slice(startIndex, endIndex);
  
  return (
    <div
      className="container mt-3"
      style={{ paddingLeft: "10px", paddingRight: "10px" }}
    >
      {mode === "table" ? (
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
                  <th>LINE</th>
                  <th>ชื่อ</th>
                  <th>เบอร์</th>
                  <th>วันที่จอง</th>
                  <th>วันแจ้งเข้าพัก</th>
                  {showActualCheckinColumn && <th>วันเข้าพักจริง</th>}
                  <th>สลิป</th>
                  <th>สถานะ</th>

                  {checkout?.[0]?.checkout && (
                    <th>วันที่ขอคืน</th>
                  )}
                  {checkout?.[0]?.checkoutAt && (
                  <th>วันเช็คเอาท์จริง</th>
                  )}

                  {role === 0 && <th>แก้ไข</th>}
                  {role === 0 && <th>ลบ</th>}
                </tr>
              </thead>

              <tbody>
                {paginatedBookings.map((b, i) => (
                  <BookingRow
                    key={b.bookingId}
                    booking={b}
                    index={startIndex + i + 1}
                    role={role}
                    mode="table"
                    checkout={b.checkout?.[0]}
                    showActualCheckinColumn={showActualCheckinColumn}
                    onApprove={onApprove}
                    onReject={onReject}
                    onDelete={onDelete}
                    onEditSuccess={onEditSuccess}
                    onCheckin={onCheckin}
                  />
                ))}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={currentPage}
            totalItems={sortedBookings.length}
            rowsPerPage={rowsPerPage}
            onPageChange={onPageChange}
            onRowsPerPageChange={onRowsPerPageChange}
          />
        </>
      ) : (
        <>
          <div className="row g-3">
            {paginatedBookings.map((b, i) => (
              <div key={b.bookingId} className="col-12 col-md-4">
                <BookingRow
                  booking={b}
                  index={startIndex + i + 1}
                  role={role}
                  mode="card"
                  checkout={b.checkout?.[0]}
                  showActualCheckinColumn={true}
                  onApprove={onApprove}
                  onReject={onReject}
                  onDelete={onDelete}
                  onEditSuccess={onEditSuccess}
                  onCheckin={onCheckin}
                />
              </div>
            ))}
          </div>

          <Pagination
            currentPage={currentPage}
            totalItems={sortedBookings.length}
            rowsPerPage={rowsPerPage}
            onPageChange={onPageChange}
            onRowsPerPageChange={onRowsPerPageChange}
          />
        </>
      )}
    </div>
  );
}
