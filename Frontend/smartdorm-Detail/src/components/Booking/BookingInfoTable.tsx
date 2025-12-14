//src/components/Booking/BookingInfoTable.tsx
import type { Booking } from "../../types/booking";
import StatusBadge from "./StatusBadge";

const formatThaiDate = (d?: string) =>
  d
    ? new Date(d).toLocaleDateString("th-TH", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "-";

export default function BookingInfoTable({ booking }: { booking: Booking }) {
  return (
    <div>
      <h5 className="fw-bold text-primary text-center mb-3">
        รายละเอียดการจอง
      </h5>

      {/* =====================
          CARD (<1400)
      ====================== */}
      <div className="d-xxl-none">
        <div className="card shadow-sm">
          <div className="card-body p-3">
            <p>
              <strong>วันจอง : </strong> {formatThaiDate(booking.createdAt)}
            </p>
            <p>
              <strong>วันที่ขอเข้าพัก : </strong>{" "}
              {formatThaiDate(booking.checkin)}
            </p>
            <p>
              <strong>สถานะการจอง : </strong>{" "}
              <StatusBadge type="approve" status={booking.approveStatus} />
            </p>

            {booking.approveStatus === 1 && (
              <p>
                <strong>สถานะเช็คอิน : </strong>{" "}
                <StatusBadge type="checkin" status={booking.checkinStatus} />
              </p>
            )}

            {booking.actualCheckin && (
              <p className="mb-0">
                <strong>วันเข้าเช็คอิน : </strong>{" "}
                {formatThaiDate(booking.actualCheckin)}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* =====================
          TABLE (≥1400)
      ====================== */}
      <div className="d-none d-xxl-block">
        <div className="table-responsive">
          <table className="table table-sm table-bordered text-center align-middle shadow-sm mb-0">
            <thead className="table-light">
              <tr>
                <th style={{ width: "35%" }}>รายการ</th>
                <th>ข้อมูล</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>วันจอง</td>
                <td>{formatThaiDate(booking.createdAt)}</td>
              </tr>
              <tr>
                <td>วันที่ขอเข้าพัก</td>
                <td>{formatThaiDate(booking.checkin)}</td>
              </tr>
              <tr>
                <td>สถานะการจอง</td>
                <td>
                  <StatusBadge type="approve" status={booking.approveStatus} />
                </td>
              </tr>

              {booking.approveStatus === 1 && (
                <tr>
                  <td>สถานะเช็คอิน</td>
                  <td>
                    <StatusBadge
                      type="checkin"
                      status={booking.checkinStatus}
                    />
                  </td>
                </tr>
              )}

              {booking.actualCheckin && (
                <tr>
                  <td>วันเข้าเช็คอิน</td>
                  <td>{formatThaiDate(booking.actualCheckin)}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
