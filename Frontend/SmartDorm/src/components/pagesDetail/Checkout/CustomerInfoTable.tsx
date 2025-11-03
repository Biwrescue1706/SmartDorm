import type { Booking } from "../../../types/pagesDetail/checkout";
import CustomerInfoRow from "./CustomerInfoRow";

export default function CustomerInfoTable({ booking }: { booking: Booking }) {
  return (
    <div className="mb-3">
      <h5 className="fw-bold text-success">ข้อมูลผู้เช่า</h5>
      <table className="table table-sm table-bordered">
        <tbody>
          <CustomerInfoRow label="หมายเลขห้อง" value={booking.room.number} />
          <CustomerInfoRow label="ชื่อ-สกุล" value={booking.customer.fullName} />
          <CustomerInfoRow label="เบอร์โทร" value={booking.customer.cphone} />
        </tbody>
      </table>
    </div>
  );
}
