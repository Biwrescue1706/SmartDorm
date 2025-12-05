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
      Swal.fire({
          toast: true,
          position: "top-end",
          icon: "success",
          title: "พบผู้ใช้",
          text: `ชื่อ: ${res.data.name}`,
          timer: 1500,
          showConfirmButton: false,
});
      return res.data;
    } catch (err: any) {
      Swal.fire(({
          toast: true,
          position: "top-end",
          icon: "error",
          title: "ผิดพลาด",
          text: err.response?.data?.error || "ไม่พบชื่อผู้ใช้",
          timer: 1500,
          showConfirmButton: false,
});
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
      Swal.fire({
          toast: true,
          position: "top-end",
          icon: "success",
          title: "ตั้งรหัสผ่านใหม่สำเร็จ",
          text: "ระบบได้ทำการบันทึกทุกข้อมูลของคุณเรียบร้อยแล้วครับ",
          timer: 1500,
          showConfirmButton: false,
});
      return res.data;
    } catch (err: any) {
      Swal.fire(({
          toast: true,
          position: "top-end",
          icon: "error",
          title: "ผิดพลาด",
          text: err.response?.data?.error || "รีเซ็ตรหัสผ่านไม่สำเร็จ",
          timer: 1500,
          showConfirmButton: false,
});
      throw err;
    }
  };

  return { checkUsername, resetPassword };
}
