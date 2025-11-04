import type { Booking ,Customer } from "../../types/booking";
import CustomerInfoRow from "./CustomerInfoRow";

export default function CustomerInfoTable({ booking , customer }: { booking: Booking , customer :Customer}) {
  return (
    <div className="mb-3">
      <h5 className="fw-bold text-primary">ข้อมูลผู้จอง</h5>
      <table className="table table-sm table-bordered">
        <tbody>
          <CustomerInfoRow label="หมายเลขห้อง" value={booking.room.number} />
          <CustomerInfoRow label="Line" value={customer.userName} />
          <CustomerInfoRow label="ชื่อ-สกุล" value={booking.fullName} />
          <CustomerInfoRow label="เบอร์โทร" value={booking.cphone} />
        </tbody>
      </table>
    </div>
  );
}
