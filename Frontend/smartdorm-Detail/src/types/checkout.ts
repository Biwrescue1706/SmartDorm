// src/types/checkout.ts
export type CheckoutBooking = {
  bookingId: string;
  createdAt: string;
  checkin: string;
  checkinAt?: string | null;
  fullName?: string | null;
  cphone?: string | null;
  approveStatus: number;
  checkinStatus: number;
};

export type CheckoutRoom = {
  number: string;
};

export type CheckoutCustomer = {
  userName?: string | null;
};

export type Checkout = {
  checkoutId: string;

  ReturnApprovalStatus: number; // 0 = รอ | 1 = อนุมัติ | 2 = ปฏิเสธ

  checkout: string;
  checkoutStatus: number; // 0 = ยังไม่ | 1 = เช็คเอาท์แล้ว
  checkoutAt?: string | null;

  booking: CheckoutBooking;
  room: CheckoutRoom;
  customer: CheckoutCustomer;
};