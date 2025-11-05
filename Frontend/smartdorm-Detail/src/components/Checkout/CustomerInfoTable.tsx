import type { Booking, Customer } from "../../types/checkout";
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
      <h5 className="fw-bold text-black text-center mb-3">
        ข้อมูลผู้เช่า
      </h5>

      <table className="table table-sm table-bordered">
        {/*  หัวตาราง */}
        <thead className="table-light text-center">
          <tr>
            <th style={{ width: "40%" }}>รายการ</th>
            <th>ข้อมูล</th>
          </tr>
        </thead>

        {/*  เนื้อหาตาราง */}
        <tbody>
          <CustomerInfoRow label="ห้อง" value={booking.room.number} />
          <CustomerInfoRow label="Line" value={customer.userName} />
          <CustomerInfoRow label="ชื่อ-สกุล" value={booking.fullName} />
          <CustomerInfoRow label="เบอร์โทร" value={booking.cphone} />
        </tbody>
      </table>
    </div>
  );
}
