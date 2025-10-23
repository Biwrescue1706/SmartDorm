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

export interface Bill {
  billId: string;
  number: string;
  month: string;
  total: number;
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
  status: number;
  dueDate: string;
  createdAt: string;
  slipUrl?: string | null;
  room: Room;
  customer: Customer;
  payment?: { slipUrl?: string | null };
}
