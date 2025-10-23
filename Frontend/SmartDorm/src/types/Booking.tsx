// src/types/Booking.tsx
export interface Customer {
  userName: string;
  ctitle: string;
  cname: string;
  csurname: string;
  fullName: string;
  cphone: string;
  cmumId: string;
}

export interface Room {
  number: string;
  size: string;
}

export interface Booking {
  bookingId: string;
  createdAt: string;
  checkin: string;
  checkout: string;
  status: number; // 0=รออนุมัติ, 1=อนุมัติ, 2=ไม่อนุมัติ
  slipUrl?: string;
  room: Room;
  customer: Customer;
}
