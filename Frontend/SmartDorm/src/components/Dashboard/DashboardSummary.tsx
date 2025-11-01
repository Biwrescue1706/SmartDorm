import DashboardCard from "./DashboardCard";

interface Props {
  totalRooms: number;
  availableRooms: number;
  bookedRooms: number;
  pendingBookings: number;
  pendingCheckouts: number;
}

export default function DashboardSummary({
  totalRooms,
  availableRooms,
  bookedRooms,
  pendingBookings,
  pendingCheckouts,
}: Props) {
  return (
    <div className="container my-3">
      {/*  ปรับ grid ให้การ์ดขนาดเล็กและจัดแน่นขึ้น */}
      <div className="row g-2 justify-content-center">
        <div className="col-5 col-sm-3 col-md-2 col-lg-2">
          <DashboardCard
            title="ห้องทั้งหมด"
            count={totalRooms}
            color="linear-gradient(135deg, #00b4d8, #0077b6)"
            link="/rooms"
          />
        </div>

        <div className="col-3 col-sm-3 col-md-2 col-lg-2">
          <DashboardCard
            title="ห้องว่าง"
            count={availableRooms}
            color="linear-gradient(135deg, #38b000, #008000)"
            link=""
          />
        </div>

        <div className="col-3 col-sm-3 col-md-2 col-lg-2">
          <DashboardCard
            title="ห้องเต็ม"
            count={bookedRooms}
            color="linear-gradient(135deg, #ef233c, #d90429)"
            link=""
          />
        </div>

        <div className="col-3 col-sm-3 col-md-2 col-lg-2">
          <DashboardCard
            title="คำขอจองห้อง"
            count={pendingBookings}
            color="linear-gradient(135deg, #ffb703, #fb8500)"
            link="/bookings"
          />
        </div>

        <div className="col-3 col-sm-3 col-md-2 col-lg-2">
          <DashboardCard
            title="คำขอคืนห้อง"
            count={pendingCheckouts}
            color="linear-gradient(135deg, #8338ec, #3a0ca3)"
            link="/checkout"
          />
        </div>
      </div>
    </div>
  );
}
