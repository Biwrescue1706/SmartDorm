export interface Room {
  number: string;
  size: string;
  rent: number;
  deposit: number;
  bookingFee: number;
}

export interface Customer {
  userName: string;
}

export interface Booking {
  bookingId: string;
  fullName: string;
  cphone: string;
  slipUrl?: string;
  checkin: string;
  actualCheckin?: string;
  checkout?: string;
  approveStatus: number;
  createdAt: string;
  checkinStatus: number;
  room: Room;
  customer: Customer;
}
