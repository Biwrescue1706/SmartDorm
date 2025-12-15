export interface BookingHistory {
  bookingId: string;

  room?: {
    number: string;
  };

  customer?: {
    userName?: string;
  };

  // จาก Booking
  fullName?: string;
  cphone?: string;
  createdAt?: string;
  actualCheckin?: string;
  checkin?: string;

  // จาก Checkout
  requestedCheckout?: string;
  actualCheckout?: string;
}
