// src/types/BookingHistory.ts
export interface BookingHistory {
  bookingId: string;

  room?: { number?: string };
  customer?: { userName?: string };

  fullName?: string;
  cphone?: string;

  bookingDate?: string | null;
  checkin?: string | null;
  checkinAt?: string | null;

  // Checkout (flattened)
  checkout?: string | null;
  ReturnApprovalStatus?: number;
  RefundApprovalDate?: string | null;
  checkoutStatus?: number;
  checkoutAt?: string | null;
}