// ===========================
// Core Entities
// ===========================

export interface Admin {
  adminId: string;
  username: string;
  name: string;
  role: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Room {
  roomId: string;
  number: string;
  size?: string;
  rent?: number;
  deposit?: number;
  bookingFee?: number;
  status?: number;
  createdAt?: string;
  updatedAt?: string;

  adminCreated?: Admin;
  adminUpdated?: Admin;
}

export interface Customer {
  customerId: string;
  userId?: string;
  userName?: string;
}

export interface Payment {
  slipUrl?: string | null;
  paidAt: string;
}

// ===========================
// Bill
// ===========================

export interface Bill {
  billId: string;
  billNumber: string;
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

  billStatus: number;
  dueDate: string;

  paidAt?: string | null;
  billDate?: string | null;

  ctitle?: string | null;
  cname?: string | null;
  csurname?: string | null;
  fullName?: string | null;
  cphone?: string | null;

  slipUrl?: string | null;

  createdAt: string;
  updatedAt: string;

  adminCreated?: Admin | null;

  room?: Room | null;
  customer?: Customer | null;
  payment?: Payment | null;
}

// ===========================
// Booking / Checkout
// ===========================

export interface Checkout {
  checkoutId: string;
  checkout: string;
  ReturnApprovalStatus: number;
  RefundApprovalDate?: string | null;

  checkoutStatus: number;
  checkoutAt?: string | null;

  createdAt?: string;
  updatedAt?: string;
}

export interface Booking {
  bookingId: string;
  roomId: string;
  customerId: string;

  ctitle?: string;
  cname?: string;
  csurname?: string;
  fullName?: string;
  cphone?: string;

  checkin: string;
  checkinAt?: string;
  checkinStatus: number;

  approveStatus: number;
  approvedAt?: string;

  bookingDate: string;
  slipUrl?: string;

  createdAt: string;
  updatedAt: string;

  room?: Room;
  customer?: Customer;

  checkout?: Checkout | null;
}

// ===========================
// Auth
// ===========================

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  name: string;
  username: string;
  password: string;
}

export interface AuthResponse {
  message?: string;
  error?: string;
}

export interface ChangePasswordInput {
  oldPassword: string;
  newPassword: string;
}

export interface ForgotPasswordInput {
  username: string;
  newPassword: string;
}

// ===========================
// Overview
// ===========================

export interface OverviewBill {
  billId: string;
  roomId: string;
  month: string;
  total: number;
  dueDate: string;
  billStatus: number;
}

export interface OverviewRoom {
  booking: any;
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