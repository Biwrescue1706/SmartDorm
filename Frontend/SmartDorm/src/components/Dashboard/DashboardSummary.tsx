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
    <div className="container my-4">
      <div className="row g-3 justify-content-center">

        <div className="col-4 col-md-2">
          <DashboardCard title="ห้องทั้งหมด" count={totalRooms} link="/rooms" />
        </div>

        <div className="col-4 col-md-2">
          <DashboardCard title="ห้องว่าง" count={availableRooms} link="/rooms" />
        </div>

        <div className="col-4 col-md-2">
          <DashboardCard title="ห้องเต็ม" count={bookedRooms} link="/rooms" />
        </div>

        <div className="col-4 col-md-2">
          <DashboardCard title="คำขอจอง" count={pendingBookings} link="/bookings" />
        </div>

        <div className="col-4 col-md-2">
          <DashboardCard title="คำขอคืน" count={pendingCheckouts} link="/checkout" />
        </div>

      </div>
    </div>
  );
}