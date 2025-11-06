// src/types/Bill.ts

export interface Room {
  roomId: string;
  number: string;
}

export interface Booking {
  bookingId: string;
  fullName?: string | null; // ✅ snapshot จาก Booking
  cphone?: string | null;   // ✅ snapshot จาก Booking
}

export interface Customer {
  customerId: string;
  userId: string;
  userName: string;
}

export interface Payment {
  slipUrl?: string | null;
}

export interface Bill {
  billId: string;
  month: string;           // วันที่ออกบิล (ISO string)
  rent: number;
  service: number;
  wBefore: number;
  wAfter: number;
  eBefore: number;
  eAfter: number;
  wUnits: number;
  eUnits: number;
  waterCost: number;
  electricCost: number;
  fine: number;
  overdueDays: number;
  total: number;
  status: number;          // 0 = ค้างชำระ, 1 = ชำระแล้ว
  dueDate: string;
  slipUrl?: string | null; // ✅ ถ้ามีใน Bill โดยตรง

  createdAt: string;
  updatedAt: string;

  // ✅ ความสัมพันธ์
  room: Room;
  booking?: Booking | null;     // ✅ ชื่อและเบอร์โทรจะอยู่ในนี้
  customer?: Customer | null;   // ใช้ในบางกรณี
  payment?: Payment | null;     // slip จาก Payment
}
