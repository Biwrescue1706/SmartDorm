// src/components/Dashboard/DashboardTable.tsx
import { useState, useEffect } from "react";
import DashboardRow from "./DashboardRow";
import DashboardFilter from "./DashboradFilter";
import Pagination from "../Pagination";
import type { Room } from "../../types/Room";

interface Props {
  rooms: Room[];
}

export default function DashboardTable({ rooms }: Props) {
  const [filter, setFilter] = useState<"all" | "available" | "booked">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const filteredRooms = rooms.filter((room) => {
    if (filter === "available") return room.status === 0;
    if (filter === "booked") return room.status === 1;
    return true;
  });

  const indexOfLast = currentPage * rowsPerPage;
  const indexOfFirst = indexOfLast - rowsPerPage;
  const currentRooms = filteredRooms.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredRooms.length / rowsPerPage);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) setCurrentPage(1);
  }, [currentPage, totalPages, filter]);

  return (
    <div className="bg-white p-3 shadow-sm rounded ">
      <DashboardFilter active={filter} onChange={(s) => setFilter(s)} />

      {/*  ใช้ responsive-table แทน table-responsive */}
      <div className="responsive-table" style={{ overflowX: "auto" }}>
        <table
          className="table table-sm table-striped align-middle text-center"
          style={{ tableLayout: "fixed", width: "100%" }}
        >
          <thead className="table-dark">
            <tr>
              <th style={{ width: "3%" }}>#</th>
              <th style={{ width: "5%" }}>ห้อง</th>
              <th style={{ width: "10%" }}>ขนาด</th>
              <th style={{ width: "5%" }}>ค่าเช่า</th>
              <th style={{ width: "5%" }}>สถานะ</th>
            </tr>
          </thead>
          <tbody>
            {currentRooms.length > 0 ? (
              currentRooms.map((room, idx) => (
                <DashboardRow
                  key={room.roomId}
                  room={room}
                  idx={indexOfFirst + idx}
                />
              ))
            ) : (
              <tr>
                <td colSpan={5} className="text-muted py-3">
                  ไม่พบข้อมูล
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        totalItems={filteredRooms.length}
        rowsPerPage={rowsPerPage}
        currentPage={currentPage}
        onPageChange={(page) => setCurrentPage(page)}
        onRowsPerPageChange={(rows) => {
          setRowsPerPage(rows);
          setCurrentPage(1);
        }}
      />
    </div>
  );
}
