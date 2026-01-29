//src/types/BillCreate.ts

export interface Room {
  roomId: string;
  number: string;
  rent: number;
}

export interface Booking {
  bookingId: string;
  roomId: string;
  approveStatus: number;
  room: Room;
}

export interface Bill {
  billId: string;
  roomId: string;
  month: string;
}

export interface CreateBillPayload {
  month: string;
  wAfter: number;
  eAfter: number;
}