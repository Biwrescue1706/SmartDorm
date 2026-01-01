export interface Customer {
  customerId: string;
  userName: string;
}

export interface Room {
  roomId: string;
  number: string;
  size: string;
  rent: number;
  deposit: number;
  bookingFee: number;
}

export interface Checkout {
  checkoutId: string;
  checkout: string;       // วันที่ขอคืน
  checkoutAt?: string;    // วันที่คืนจริง
  checkoutStatus: number;
}

export interface Booking {
  bookingId: string;
  roomId: string;
  customerId: string;

  ctitle?: string;
  cname?: string;
  csurname?: string;
  fullName?: string;
  cphone?: string;
  cmumId?: string;

  checkin: string;
  checkinAt?: string;
  checkinStatus: number;

  approveStatus: number;
  approvedAt?: string;

  bookingDate: string;
  slipUrl?: string;

  createdAt: string;
  updatedAt: string;

  room: Room;
  customer: Customer;

  checkout?: Checkout[]; // relation checkout[]
}