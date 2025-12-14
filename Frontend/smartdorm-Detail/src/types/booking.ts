//src/types/booking.ts
export type Room = {
  roomId: string;
  number: string;
};

export type Customer = {
  customerId: string;
  userName?: string;
};

export type Booking = {
  bookingId: string;
  fullName?: string;
  cphone?: string;

  createdAt: string;
  checkin: string;
  actualCheckin?: string | null;

  approveStatus: number;   // 0 รอ / 1 อนุมัติ / 2 ปฏิเสธ
  checkinStatus: number;   // 0 ยังไม่เข้า / 1 เช็คอินแล้ว

  room: Room;
  customer: Customer;
};
