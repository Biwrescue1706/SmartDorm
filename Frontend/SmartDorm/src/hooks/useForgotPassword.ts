import axios from "axios";
import Swal from "sweetalert2";
import { API_BASE } from "../config";
import type {
  CheckUsernameResponse,
  ForgotPasswordInput,
  ForgotPasswordResponse,
} from "../types/Auth";

export function useForgotPassword() {
  // ✅ ตรวจสอบว่ามี username จริงไหม
  const checkUsername = async (username: string): Promise<CheckUsernameResponse> => {
    try {
      const res = await axios.post<CheckUsernameResponse>(
        `${API_BASE}/auth/forgot/check`,
        { username }
      );
      Swal.fire("พบผู้ใช้", `ชื่อ: ${res.data.name}`, "success");
      return res.data;
    } catch (err: any) {
      Swal.fire("ผิดพลาด", err.response?.data?.error || "ไม่พบชื่อผู้ใช้", "error");
      throw err;
    }
  };

  // ✅ ตั้งรหัสผ่านใหม่
  const resetPassword = async (data: ForgotPasswordInput): Promise<ForgotPasswordResponse> => {
    try {
      const res = await axios.put<ForgotPasswordResponse>(
        `${API_BASE}/auth/forgot/reset`,
        data
      );
      Swal.fire("สำเร็จ", res.data.message, "success");
      return res.data;
    } catch (err: any) {
      Swal.fire("ผิดพลาด", err.response?.data?.error || "รีเซ็ตรหัสผ่านไม่สำเร็จ", "error");
      throw err;
    }
  };

  return { checkUsername, resetPassword };
}
