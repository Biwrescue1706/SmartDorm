// src/types/Bill.ts

export interface Room {
  roomId: string;
  number: string;
}

export interface Customer {
  customerId: string;
  userId: string;
  userName: string;
}

export interface Payment {
  slipUrl?: string | null;
}

export interface Bill {
  billId: string;
  month: string;
  rent: number;
  service: number;

  wBefore: number;
  wAfter: number;
  eBefore: number;
  eAfter: number;

  wUnits: number;
  eUnits: number;
  waterCost: number;
  electricCost: number;

  fine: number;
  overdueDays: number;
  total: number;

  billStatus: number; // 0=ยังไม่จ่าย, 1=จ่ายแล้ว, 2=รอตรวจสอบ
  dueDate: string;

  // ✅ snapshot ผู้เช่า (อยู่ใน Bill จริง)
  ctitle?: string | null;
  cname?: string | null;
  csurname?: string | null;
  fullName?: string | null;
  cphone?: string | null;

  slipUrl?: string | null;

  createdAt: string;
  updatedAt: string;

  // relations
  room: Room;
  customer?: Customer | null;
  payment?: Payment | null;
}