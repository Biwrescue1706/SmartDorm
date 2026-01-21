// src/types/BookingHistory.ts
export interface BookingHistory {
  bookingId: string;

  room?: {
    number?: string;
  };

  customer?: {
    userName?: string;
  };

  fullName?: string;
  cphone?: string;

  // Booking
  bookingDate?: string | null;
  checkin?: string | null;
  checkinAt?: string | null;

  // Checkout (flattened from backend)
  checkout?: string | null;     // วันที่ขอคืน
  checkoutAt?: string | null;   // วันที่เช็คเอาท์จริง
}