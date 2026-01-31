// src/types/Overview.ts
export interface OverviewBill {
  billId: string;
  roomId: string;
  month: string;
  total: number;
  dueDate: string;
  billStatus: number;
}

export interface OverviewRoom {
  booking: any;          // 👈 ตัวนี้แหละคือ key
  roomId: string;
  number: string;
  bill: OverviewBill | null;
  hasBooking: boolean;
}

export interface OverviewResponse {
  year: number;
  month: number;
  totalRooms: number;
  data: OverviewRoom[];
}