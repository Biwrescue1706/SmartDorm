import { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE } from "../config";
import type {
  Admin,
  UpdateProfileInput,
  UpdateProfileResponse,
} from "../types/Auth";
import { toast } from "../utils/toast"; // ⬅️ ใช้ toast กลาง

export function useProfile() {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(true);

  // โหลดข้อมูลโปรไฟล์
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

  // อัปเดตชื่อโปรไฟล์
  const updateProfile = async (data: UpdateProfileInput) => {
    try {
      const res = await axios.put<UpdateProfileResponse>(
        `${API_BASE}/auth/profile`,
        data,
        { withCredentials: true }
      );

      toast("success", "อัปเดตโปรไฟล์สำเร็จ", res.data.message);

      // อัปเดต state ให้ UI เปลี่ยนทันที
      setAdmin((prev) => (prev ? { ...prev, name: data.name } : prev));
    } catch (err: any) {
      toast("error", "อัปเดตไม่สำเร็จ", err.response?.data?.error);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return { admin, loading, updateProfile };
}
