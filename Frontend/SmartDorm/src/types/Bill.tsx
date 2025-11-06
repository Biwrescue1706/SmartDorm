// src/types/Bill.ts
export interface Room {
  roomId: string;
  number: string;
}

export interface Customer {
  customerId: string;
  fullName: string;
  userName?: string;
  cphone: string;
}

export interface Payment {
  slipUrl?: string | null;
}

export interface Bill {
  [x: string]: any;
  billId: string;
  number: string;          // หมายเลขบิล
  month: string;           // เดือนที่ออกบิล (ISO string)
  total: number;           // ยอดรวมทั้งหมด
  rent: number;            // ค่าเช่า
  service: number;         // ค่าบริการส่วนกลาง
  wBefore: number;         // หน่วยน้ำก่อนหน้า
  wAfter: number;          // หน่วยน้ำปัจจุบัน
  eBefore: number;         // หน่วยไฟก่อนหน้า
  eAfter: number;          // หน่วยไฟปัจจุบัน
  wUnits: number;          // จำนวนหน่วยน้ำที่ใช้
  eUnits: number;          // จำนวนหน่วยไฟที่ใช้
  waterCost: number;       // ค่าน้ำ
  electricCost: number;    // ค่าไฟ
  fine: number;            // ค่าปรับ (ถ้ามี)
  status: number;          // 0=รอดำเนินการ, 1=ชำระแล้ว, 2=เลยกำหนด
  dueDate: string;         // วันครบกำหนดชำระ
  createdAt: string;       // วันที่สร้างบิล
  slipUrl?: string | null; // URL ของสลิป (ถ้ามี)
  room: Room;              // ห้องที่เกี่ยวข้อง
  customer: Customer;      // ลูกค้าที่เกี่ยวข้อง
  payment?: Payment;       // ข้อมูลการจ่ายเงิน (optional)
}
