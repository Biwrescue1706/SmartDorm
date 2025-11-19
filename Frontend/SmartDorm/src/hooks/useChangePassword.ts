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
      await axios.put<ChangePasswordResponse>(
        `${API_BASE}/auth/change-password`,
        data,
        { withCredentials: true }
      );

      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: "เปลี่ยนรหัสสำเร็จ",
        timer: 1500,
        showConfirmButton: false,
      });

      return true;
    } catch (err: any) {
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "error",
        title: "ไม่สามารถเปลี่ยนรหัสสำเร็จ",
        timer: 1500,
        showConfirmButton: false,
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { changePassword, loading };
}