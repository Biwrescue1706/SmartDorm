export interface Room {
  number: string;
  size: string;
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
  checkout?: string;
  actualCheckout?: string;
  actualCheckin?: string;
  approveStatus: number;
  returnStatus: number | null;
  checkoutStatus?: number | null;
  createdAt: string;
}
