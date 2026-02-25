// src/types/BillDetail.ts
export interface BillDetail {
  billId: string;
  roomId: string;
  month: string;
  total: number;
  dueDate: string;
  billStatus: number;

  rent: number;
  service: number;
  fine?: number;
  overdueDays?: number;

  wBefore: number;
  wAfter: number;
  wUnits: number;
  waterCost: number;

  eBefore: number;
  eAfter: number;
  eUnits: number;
  electricCost: number;

  paidAt?: string | null;
  cname: string;
  csurname: string;
  fullName?: string;

  createdAt: string;

  room?: {
    number: string;
  };
}
