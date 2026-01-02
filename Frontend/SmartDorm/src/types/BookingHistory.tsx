// src/types/BookingHistory.ts
export interface BookingHistory {
  bookingId: string;

  room?: {
    number: string;
  };

  customer?: {
    userName?: string;
  };

  fullName?: string;
  cphone?: string;

  // Booking
  bookingDate?: string; // วันที่จอง
  checkin?: string;
  checkinAt?: string;

  // Checkout (relation)
  checkout?: {
    checkout?: string;
    RefundApprovalDate?: string;
    checkoutStatus?: number;
    checkoutAt?: string;

  }[];
}
