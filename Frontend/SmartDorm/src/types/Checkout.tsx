export interface Checkout {
  checkoutId: string;
  status: number; // 0=PENDING, 1=APPROVED, 2=COMPLETED, 3=REJECTED

  requestedCheckout?: string;
  approvedAt?: string;
  actualCheckout?: string;
  createdAt?: string;

  booking?: {
    bookingId: string;
    fullName?: string;
    cphone?: string;
  };

  room?: {
    number: string;
  };

  customer?: {
    userName?: string;
  };
}
