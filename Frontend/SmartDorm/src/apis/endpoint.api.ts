// src/api/endpoint.api.ts

/* ==================== 🔐 AUTH ==================== */
export const Login = "/auth/login";
export const Register = "/auth/register";
export const Verify = "/auth/verify";
export const Logout = "/auth/logout";

/* ==================== 🧾 BOOKING ==================== */
export const GetAllBooking = "/booking/getall";
export const GetBookingById = (id: string) => `/booking/${id}`;
export const CreateBooking = "/booking/create";
export const ApproveBooking = (id: string) => `/booking/${id}/approve`;
export const RejectBooking = (id: string) => `/booking/${id}/reject`;
export const UpdateBooking = (id: string) => `/booking/${id}`; 
export const DeleteBooking = (id: string) => `/booking/${id}`;
export const checkinBooking = (id: string) => `/booking/${id}/checkin`;

/* ==================== 🚪 CHECKOUT ==================== */
export const GetAllCheckout = "/checkout/getall";
export const GetMyBookings = (userId: string) => `/checkout/myBookings/${userId}`;
export const ApproveCheckout = (id: string) => `/checkout/${id}/approveCheckout`;
export const RejectCheckout = (id: string) => `/checkout/${id}/rejectCheckout`;
export const DeleteCheckout = (id: string) => `/checkout/${id}`;
export const EditCheckout = (id: string) => `/checkout/${id}`;
export const ConfirmReturn = (id: string) => `/checkout/${id}/confirm-return`;

/* ==================== 🏢 ROOM ==================== */
export const GetAllRoom = "/room/getall";
export const CreateRoom = "/room/create";
export const UpdateRoom = (id: string) => `/room/${id}`;
export const DeleteRoom = (id: string) => `/room/${id}`;

/* ==================== 💵 BILL ==================== */
export const GetAllBill = "/bill/getall";
export const CreateBill = "/bill/create";
export const UpdateBill = (id: string) => `/bill/edit/${id}`;
export const DeleteBill = (id: string) => `/bill/${id}`;

/* ==================== 💰 PAYMENT ==================== */
export const GetAllPayment = "/payment/getall";
export const CreatePayment = "/payment/create";
export const VerifyPayment = (id: string) => `/payment/${id}/verify`;
export const DeletePayment = (id: string) => `/payment/${id}`;

/* ==================== 👤 CUSTOMER ==================== */
export const GetAllCustomer = "/customer/getall";
export const GetCustomerById = (id: string) => `/customer/${id}`;
export const CreateCustomer = "/customer/create";
export const UpdateCustomer = (id: string) => `/customer/${id}`;
export const DeleteCustomer = (id: string) => `/customer/${id}`;
