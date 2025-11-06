// src/modules/Bills/billModel.ts
// 🧾 ประเภทข้อมูลอินพุตเมื่อสร้างบิลใหม่
export interface CreateBillInput {
  roomId: string;
  customerId: string;
  month: string;
  wBefore?: number;
  wAfter: number;
  eBefore?: number;
  eAfter: number;
}

// ✏️ ประเภทข้อมูลเมื่ออัปเดตบิล
export interface BillUpdateInput {
  [key: string]: any;
}

// 💰 โครงสร้างข้อมูลบิลหลัก
export interface Bill {
  billId: string;
  month: Date;
  total: number;
  rent: number;
  service: number;
  waterCost: number;
  electricCost: number;
  fine: number;
  dueDate: Date;
  status: number;
  slipUrl?: string | null; // ✅ เพิ่ม slipUrl ให้ตรงกับ Prisma
}
