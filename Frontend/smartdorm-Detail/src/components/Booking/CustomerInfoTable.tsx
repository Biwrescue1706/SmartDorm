// Booking/components/Booking/CustomerInfoTable.tsx
import type { Booking, Customer } from "../../types/booking";
import CustomerInfoRow from "./CustomerInfoRow";

export default function CustomerInfoTable({ booking, customer }: { booking: Booking; customer: Customer }) {
  return (
    <div className="mb-4">
      <h5 className="fw-bold text-primary text-center mb-3">ข้อมูลผู้จอง</h5>
      <table className="table table-bordered table-sm text-center align-middle shadow-sm">
        <thead className="table-light">
          <tr>
            <th>รายการ</th>
            <th>ข้อมูล</th>
          </tr>
        </thead>
        <tbody>
          <CustomerInfoRow label="ห้อง" value={booking.room.number} />
          <CustomerInfoRow label="LINE ผู้ใช้" value={customer.userName} />
          <CustomerInfoRow label="ชื่อ-สกุล" value={booking.fullName} />
          <CustomerInfoRow label="เบอร์โทร" value={booking.cphone} />
        </tbody>
      </table>
    </div>
  );
}