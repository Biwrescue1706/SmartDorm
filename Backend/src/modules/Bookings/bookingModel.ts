export interface BookingInput {
  userId: string;
  userName: string;
  ctitle: string;
  cname: string;
  csurname: string;
  cphone: string;
  cmumId: string;
  roomId: string;
  checkin: string; // วันที่ระบุว่าจะเช็คอิน
  checkout?: string; // วันที่ระบุว่าจะเช็คเอาท์
  slip?: Express.Multer.File;
}

export interface BookingUpdateInput {
  approveStatus?: number;
  checkinStatus?: number;
  checkoutStatus?: number;
  actualCheckin?: Date;
  actualCheckout?: Date;
  returnStatus?: number;
}

export interface Booking {
  bookingId: string;
  roomId: string;
  customerId: string;
  slipUrl?: string;
  checkin: Date;
  checkout?: Date;
  actualCheckin?: Date;
  actualCheckout?: Date;
  approveStatus: number;
  checkinStatus: number;
  checkoutStatus: number;
  returnStatus?: number;
  createdAt: Date;
  updatedAt: Date;
}
