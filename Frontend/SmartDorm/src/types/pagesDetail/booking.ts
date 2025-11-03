//src/types/pagesDetail/booking.ts
export interface Room {
  number: string;
  size: string;
  rent: number;
  deposit: number;
  bookingFee: number;
}

export interface Customer {
  fullName: string;
  cphone: string;
}

export interface Booking {
  bookingId: string;
  room: Room;
  customer: Customer;
  slipUrl?: string;
  checkin: string;
  actualCheckin?: string;
  checkout?: string;
  approveStatus: number;
  createdAt: string;
  checkinStatus: number;
}
