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
  approveStatus: number;
  checkinStatus: number;
  checkoutStatus: number;
  slipUrl?: string;
  room: Room;
  customer: Customer;
}
