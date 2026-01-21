// src/types/checkout.ts

export type CheckoutBooking = {
  bookingId: string;
  createdAt: string;
  checkin: string;
  actualCheckin?: string | null;
  fullName?: string;
  cphone?: string;
  approveStatus: number;
  checkinStatus: number;
};

export type CheckoutRoom = {
  number: string;
};

export type CheckoutCustomer = {
  userName?: string;
};

export type Checkout = {
  checkoutId: string;

  ReturnApprovalStatus: number;         // 0 = รอ | 1 = อนุมัติ | 2 = ปฏิเสธ
  

  checkout: string;
checkoutStatus: number; // 0 = ยังไม่ | 1 = เช็คเอาท์แล้ว
  checkoutAt?: string | null;

  booking: CheckoutBooking;
  room: CheckoutRoom;
  customer: CheckoutCustomer;
};
