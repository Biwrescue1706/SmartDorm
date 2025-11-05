import type { Booking, Customer } from "../../types/booking";
import CustomerInfoRow from "./CustomerInfoRow";

export default function CustomerInfoTable({
  booking,
  customer,
}: {
  booking: Booking;
  customer: Customer;
}) {
  return (
    <div className="mb-3">
      <h5 className="fw-bold text-primary text-center mb-3">ข้อมูลผู้จอง</h5>
      <table className="table table-sm table-bordered">
        <thead>
          <tr>
            <th className="text-center">รายการ</th>
            <th className="text-center">ข้อมูล</th>
          </tr>
        </thead>
        <tbody>
          <CustomerInfoRow label="ห้อง" value={booking.room.number} />
          <CustomerInfoRow label="Line" value={customer.userName} />
          <CustomerInfoRow label="ชื่อผู้จอง" value={booking.fullName} />
          <CustomerInfoRow label="เบอร์โทร" value={booking.cphone} />
        </tbody>
      </table>
    </div>
  );
}
