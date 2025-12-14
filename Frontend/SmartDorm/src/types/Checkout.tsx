export interface Checkout {
  checkoutId: string;

  // ตาม backend / prisma
  status: number;          // 0=PENDING, 1=APPROVED, 2=REJECTED
  checkoutStatus: number;  // 0=WAITING_FOR_CHECKOUT, 1=CHECKED_OUT

  requestedCheckout?: string;
  approvedAt?: string | null;
  actualCheckout?: string | null;
  createdAt?: string;
  updatedAt?: string;

  booking?: {
    bookingId: string;
    fullName?: string;
    cphone?: string;

    // วันเช็คอินจริง (ใช้ใน dialog)
    actualCheckin?: string | null;

    // วันที่สร้าง booking (ใช้แสดงข้อมูล)
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