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
  actualCheckin: any;
  bookingId: string;
  createdAt: string;
  checkin: string;
  checkout?: string;
  approveStatus: number;   // 0=รออนุมัติ, 1=อนุมัติแล้ว
  checkinStatus: number;   // 0=ยังไม่เช็คอิน, 1=เช็คอินแล้ว
  checkoutStatus: number;  // 0=ยังไม่เช็คเอาท์, 1=เช็คเอาท์แล้ว
  slipUrl?: string;
  room: Room;
  customer: Customer;
}
