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

  room: Room;
  booking?: Booking;
  customer?: Customer;
}