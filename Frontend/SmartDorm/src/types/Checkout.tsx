export interface Customer {
  customerId: string;
  fullName: string;
  cphone: string;
  userId: string;
  userName: string;
}

export interface Room {
  roomId: string;
  number: string;
}

export interface Booking {
  bookingId: string;
  room: Room;
  customer: Customer;
  checkin: string;
  checkout: string | null;
  actualCheckout?: string | null;   // ✅ วันที่เช็คเอาท์จริง
  checkoutStatus: number;           // ✅ 0=ยังไม่เช็คเอาท์, 1=เช็คเอาท์แล้ว
  returnStatus: number | null;      // ✅ 0=รออนุมัติ, 1=อนุมัติ, 2=ปฏิเสธ
  createdAt: string;
}
