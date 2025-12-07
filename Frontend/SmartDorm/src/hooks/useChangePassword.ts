import { useState } from "react";
import axios from "axios";
import { API_BASE } from "../config";
import type {
  ChangePasswordInput,
  ChangePasswordResponse,
} from "../types/Auth";
import { toast } from "../utils/toast"; // ⬅️ ใช้ toast ตัวกลาง

export function useChangePassword() {
  const [loading, setLoading] = useState(false);

  const changePassword = async (data: ChangePasswordInput) => {
    try {
      setLoading(true);

      await axios.put<ChangePasswordResponse>(
        `${API_BASE}/auth/change-password`,
        data,
        { withCredentials: true }
      );

      toast(
        "success",
        "เปลี่ยนรหัสผ่านสำเร็จ",
        "ระบบได้อัปเดตรหัสใหม่เรียบร้อยแล้ว"
      );
      return true;
    } catch (err: any) {
      toast("error", "เปลี่ยนรหัสผ่านไม่สำเร็จ", "กรุณาตรวจสอบข้อมูลอีกครั้ง");
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { changePassword, loading };
}
