import { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { API_BASE } from "../config";
import type { ChangePasswordInput, ChangePasswordResponse } from "../types/Auth";

export function useChangePassword() {
  const [loading, setLoading] = useState(false);

  const changePassword = async (data: ChangePasswordInput) => {
    try {
      setLoading(true);
      const res = await axios.put<ChangePasswordResponse>(
        `${API_BASE}/auth/change-password`,
        data,
        { withCredentials: true }
      );
      Swal.fire("สำเร็จ", res.data.message, "success");
      return true;
    } catch (err: any) {
      Swal.fire(
        "ผิดพลาด",
        err.response?.data?.error || "ไม่สามารถเปลี่ยนรหัสผ่านได้",
        "error"
      );
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { changePassword, loading };
}
