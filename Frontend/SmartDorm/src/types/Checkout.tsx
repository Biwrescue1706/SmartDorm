// src/types/Checkout.tsx
export interface Checkout {
  checkoutId: string;

  // ตาม prisma
  checkout: string; // วันที่ขอคืน
  ReturnApprovalStatus: number; // 0=PENDING, 1=APPROVED, 2=REJECTED
  RefundApprovalDate?: string | null;

  checkoutStatus: number; // 0=WAITING, 1=CHECKED_OUT
  checkoutAt?: string | null;

  createdAt?: string;
  updatedAt?: string;

  booking?: {
    bookingId: string;
    fullName?: string;
    cphone?: string;
    actualCheckin?: string | null;
    createdAt?: string;
  };

  room?: {
    number: string;
  };

  customer?: {
    userName?: string;
    userId?: string;
  };
}
