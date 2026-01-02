// src/types/booking.ts

export type Room = {
  roomId: string;
  number: string;
};

export type Customer = {
  customerId: string;
  userName?: string | null; // สมมติมี username ใช้แสดงในระบบ
};

export type Booking = {
  bookingId: string;

  // ข้อมูลผู้เช่า
  ctitle?: string | null;
  cname?: string | null;
  csurname?: string | null;
  fullName?: string | null;
  cphone?: string | null;
  cmumId?: string | null; // หมายเลขบัตรประชาชน

  // วันที่และเช็คอิน
  bookingDate: string; // วันที่จอง
  checkin: string;     // วันที่แจ้งเข้าพัก
  checkinAt?: string | null; // วันที่เช็คอินจริง
  checkinStatus: number;     // 0 = ยังไม่เช็คอิน, 1 = เช็คอินแล้ว

  // การอนุมัติ
  approveStatus: number;     // 0 = รออนุมัติ, 1 = อนุมัติ, 2 = ปฏิเสธ
  approvedAt?: string | null;

  slipUrl?: string | null; // รูปสลิป

  createdAt: string;
  updatedAt: string;

  // Relation
  room: Room;
  customer?: Customer | null;

  // Relation arrays (ถ้าต้องใช้)
  checkout?: any[];
  bills?: any[];
};