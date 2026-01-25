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
  roomId: string;
  number: string;
  bill: OverviewBill | null;
}

export interface OverviewResponse {
  year: number;
  month: number;
  totalRooms: number;
  data: OverviewRoom[];
}