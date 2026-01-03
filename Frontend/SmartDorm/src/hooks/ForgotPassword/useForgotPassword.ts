import axios from "axios";
import { API_BASE } from "../../config";
import type {
  CheckUsernameResponse,
  ForgotPasswordInput,
  ForgotPasswordResponse,
} from "../../types/Auth";
import { toast } from "../../utils/toast"; // ⬅️ ใช้ toast กลาง

export function useForgotPassword() {
  // ตรวจสอบ username
  const checkUsername = async (
    username: string
  ): Promise<CheckUsernameResponse> => {
    try {
      const res = await axios.post<CheckUsernameResponse>(
        `${API_BASE}/auth/forgot/check`,
        { username }
      );

      toast("success", "พบผู้ใช้", `ชื่อ: ${res.data.name}`);
      return res.data;
    } catch (err: any) {
      toast(
        "error",
        "ไม่พบผู้ใช้",
        err.response?.data?.error || "ชื่อผู้ใช้ไม่ถูกต้อง"
      );
      throw err;
    }
  };

  // ตั้งรหัสผ่านใหม่
  const resetPassword = async (
    data: ForgotPasswordInput
  ): Promise<ForgotPasswordResponse> => {
    try {
      const res = await axios.put<ForgotPasswordResponse>(
        `${API_BASE}/auth/forgot/reset`,
        data
      );

      toast(
        "success",
        "รีเซ็ตรหัสผ่านสำเร็จ",
        "ระบบได้บันทึกรหัสผ่านใหม่เรียบร้อยแล้ว"
      );
      return res.data;
    } catch (err: any) {
      toast(
        "error",
        "รีเซ็ตรหัสผ่านไม่สำเร็จ",
        err.response?.data?.error || "กรุณาลองใหม่อีกครั้ง"
      );
      throw err;
    }
  };

  return { checkUsername, resetPassword };
}
