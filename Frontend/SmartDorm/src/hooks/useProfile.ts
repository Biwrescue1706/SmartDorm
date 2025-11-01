import { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { API_BASE } from "../config";
import type { Admin, UpdateProfileInput, UpdateProfileResponse } from "../types/Auth";

export function useProfile() {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(true);

  // ✅ โหลดข้อมูลโปรไฟล์
  const fetchProfile = async () => {
    try {
      const res = await axios.get<Admin>(`${API_BASE}/auth/profile`, {
        withCredentials: true,
      });
      setAdmin(res.data);
    } catch (err: any) {
      Swal.fire("ผิดพลาด", err.response?.data?.error || "โหลดข้อมูลไม่สำเร็จ", "error");
    } finally {
      setLoading(false);
    }
  };

  // ✅ อัปเดตชื่อ
  const updateProfile = async (data: UpdateProfileInput) => {
    try {
      const res = await axios.put<UpdateProfileResponse>(
        `${API_BASE}/auth/profile`,
        data,
        { withCredentials: true }
      );
      Swal.fire("สำเร็จ", res.data.message, "success");
      setAdmin((prev) => (prev ? { ...prev, name: data.name } : prev));
    } catch (err: any) {
      Swal.fire("ผิดพลาด", err.response?.data?.error || "อัปเดตไม่สำเร็จ", "error");
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return { admin, loading, updateProfile };
}
