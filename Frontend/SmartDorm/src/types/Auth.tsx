/* ===========================
   🔐 Authentication Types
=========================== */

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

/* ===========================
   🔑 Password Management
=========================== */

export interface ChangePasswordInput {
  oldPassword: string;
  newPassword: string;
}

export interface ChangePasswordResponse {
  message: string;
}

/* ✅ ใช้กับ “ลืมรหัสผ่าน” (Forgot Password / Reset Password) */
export interface ForgotPasswordInput {
  newPassword: string;
}

export interface ForgotPasswordResponse {
  message: string;
}

/* ===========================
   👤 Admin Profile Types
=========================== */

export interface Admin {
  adminId: string;
  username: string;
  name: string;
  role: number; // 0 = Super Admin, 1 = Admin
}

export interface UpdateProfileInput {
  name: string;
}

export interface UpdateProfileResponse {
  message: string;
  admin: Admin;
}

export interface CheckUsernameResponse {
  name: string;
}

export interface ForgotPasswordInput {
  newPassword: string;
}

export interface ForgotPasswordResponse {
  message: string;
}
