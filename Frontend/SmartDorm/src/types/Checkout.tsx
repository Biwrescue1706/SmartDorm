export interface Customer {
  customerId: string;
  userId: string;
  userName: string;
}

export interface Room {
  roomId: string;
  number: string;
}

export interface Booking {
  fullName: string;
  cphone: string;
  checkin: string;
  checkout: string | null;
  actualCheckout?: string | null; // ✅ วันที่เช็คเอาท์จริง
  checkoutStatus: number; // ✅ 0=ยังไม่เช็คเอาท์, 1=เช็คเอาท์แล้ว
  returnStatus: number | null; // ✅ 0=รออนุมัติ, 1=อนุมัติ, 2=ปฏิเสธ
  createdAt: string;
  bookingId: string;
  room: Room;
  customer: Customer;
}
