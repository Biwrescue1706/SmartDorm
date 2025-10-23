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
  status: number;
  returnStatus: number | null;
  createdAt: string;
}
