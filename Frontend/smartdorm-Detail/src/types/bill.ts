export interface Room {
  number: string;
}

export interface Booking {
  fullName?: string;
}

export interface Customer {
  userName: string;
}

export interface Admin {
  name: string;
}

export interface Bill {
  billId: string;
  billNumber: string;

  month: string;
  billDate: string;
  createdAt: string;
  dueDate: string;

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
  billStatus: number;

  overdueDays: number;

  paidAt?: string;

  cname?: string;
  csurname?: string;
  fullName?: string;

  room: Room;
  booking?: Booking;
  customer?: Customer;

  adminCreated?: Admin;
}

export interface DormProfile {
  dormId?: string;
  key: string;

  dormName?: string;
  address?: string;
  phone?: string;
  email?: string;
  taxId?: string;
  taxType?: number;

  receiverTitle?: string;
  receiverName?: string;
  receiverSurname?: string;
  receiverFullName?: string;

  signatureUrl?: string | null;

  service: number;
  waterRate: number;
  electricRate: number;
  overdueFinePerDay: number;

  createdAt?: string;
  updatedAt?: string;
}
