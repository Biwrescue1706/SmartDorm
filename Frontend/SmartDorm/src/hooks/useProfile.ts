// src/hooks/useProfile.ts
import { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE } from "../config";
import type {
  Admin,
  UpdateProfileInput,
  UpdateProfileResponse,
} from "../types/Auth";
import { toast } from "../utils/toast"; // ใช้ toast กลาง

export function useProfile() {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(true);

  /* ---------------- LOAD PROFILE ---------------- */
  const fetchProfile = async () => {
    try {
      const res = await axios.get<Admin>(`${API_BASE}/auth/profile`, {
        withCredentials: true,
      });
      setAdmin(res.data);
    } catch (err: any) {
      toast("error", "โหลดข้อมูลไม่สำเร็จ", err.response?.data?.error);
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- UPDATE PROFILE (RETURN ADMIN ใหม่) ---------------- */
  const updateProfile = async (
    data: UpdateProfileInput
  ): Promise<Admin> => {
    try {
      const res = await axios.put<UpdateProfileResponse>(
        `${API_BASE}/auth/profile`,
        data,
        { withCredentials: true }
      );

      // backend ควรส่ง admin กลับมาด้วย (ถ้ายังไม่ได้ให้แก้ backend)
      const updated = res.data.admin;

      // อัปเดต state ให้หน้า Profile ใช้ชื่อใหม่ทันที
      setAdmin(updated);

      toast("success", "อัปเดตโปรไฟล์สำเร็จ", res.data.message);

      return updated; // <-- สำคัญมาก! ให้ Profile.tsx ใช้ setAdminName(updated.name)
    } catch (err: any) {
      toast("error", "อัปเดตไม่สำเร็จ", err.response?.data?.error);
      throw err; // ให้ caller จัดการ error ต่อ
    }
  };

  /* ---------------- FIRST LOAD ---------------- */
  useEffect(() => {
    fetchProfile();
  }, []);

  return {
    admin,
    loading,
    updateProfile,
  };
}
