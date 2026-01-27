export interface Room {
  number: string;
}

export interface Booking {
  fullName?: string;
}

export interface Customer {
  userName: string;
}

export interface Bill {
  billId: string;
  month: string;
  rent: number;
  service: number;
  fine: number;

  wBefore: number;
  wAfter: number;
  wUnits: number;
  waterCost: number;

  eBefore: number;
  eAfter: number;
  eUnits: number;
  electricCost: number;

  total: number;
  dueDate: string;
  billStatus: number;

  // เพิ่มให้ตรงกับที่ใช้ในหน้าแสดงผล
  overdueDays: number;        // จำนวนวันที่ค้างชำระ
  paidAt?: string;            // วันที่ชำระ (อาจยังไม่มี)
  cname?: string;             // ชื่อผู้จ่าย
  csurname?: string;          // นามสกุลผู้จ่าย
  fullName?: string;          // ชื่อเต็มผู้จ่าย (ถ้ามีจาก backend)

  room: Room;
  booking?: Booking;
  customer?: Customer;
}