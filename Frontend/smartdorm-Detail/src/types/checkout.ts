export interface Room {
  number: string;
  size: string;
}

export interface Customer {
  userName: string;
}

export interface Booking {
  bookingId: string;
  room: Room;
  fullName: string;
  cphone: string;
  slipUrl?: string;
  checkin: string;
  checkout?: string;
  actualCheckout?: string;
  actualCheckin?: string;
  approveStatus: number;
  returnStatus: number | null;
  checkoutStatus?: number | null;
  createdAt: string;
    customer: Customer;
}
