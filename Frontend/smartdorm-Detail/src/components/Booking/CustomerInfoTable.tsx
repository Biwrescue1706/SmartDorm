//src/components/Booking/CustomerInfoTable.tsx
import type { Booking, Customer } from "../../types/booking";

export default function CustomerInfoTable({
  booking,
  customer,
}: {
  booking: Booking;
  customer: Customer;
}) {
  return (
    <div className="mb-4">
      <h5 className="fw-bold text-primary text-center mb-3">
        ข้อมูลผู้จอง
      </h5>

      {/* =====================
          CARD (<1400)
      ====================== */}
      <div className="d-xxl-none">
        <div className="card shadow-sm mb-2">
          <div className="card-body p-3">
            <p><strong>รหัสการจอง : </strong> {booking.bookingId}</p>
            <p><strong>ห้อง : </strong> {booking.room.number}</p>
            <p><strong>LINE ผู้ใช้ : </strong> {customer.userName}</p>
            <p><strong>ชื่อ-สกุล : </strong> {booking.fullName}</p>
            <p className="mb-0"><strong>เบอร์โทร : </strong> {booking.cphone}</p>
          </div>
        </div>
      </div>

      {/* =====================
          TABLE (≥1400)
      ====================== */}
      <div className="d-none d-xxl-block">
        <div className="table-responsive">
          <table className="table table-bordered table-sm text-center align-middle shadow-sm mb-0">
            <thead className="table-light">
              <tr>
                <th style={{ width: "35%" }}>รายการ</th>
                <th>ข้อมูล</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>รหัสการจอง</td>
                <td className="text-break">{booking.bookingId}</td>
              </tr>
              <tr>
                <td>ห้อง </td>
                <td>{booking.room.number}</td>
              </tr>
              <tr>
                <td>LINE ผู้ใช้ </td>
                <td className="text-break">{customer.userName}</td>
              </tr>
              <tr>
                <td>ชื่อ-สกุล </td>
                <td>{booking.fullName}</td>
              </tr>
              <tr>
                <td>เบอร์โทร</td>
                <td>{booking.cphone}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
