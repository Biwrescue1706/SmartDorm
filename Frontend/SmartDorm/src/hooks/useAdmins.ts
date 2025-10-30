import { useState, useEffect } from "react";
import { API_BASE } from "../config";
import { type Admin } from "../types/admin";

export function useAdmins() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);

  // โหลดทั้งหมด
  const fetchAdmins = async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/getall`, {
        credentials: "include",
      });
      const data = await res.json();
      setAdmins(data);
    } catch {
      console.error("โหลดข้อมูลผู้ดูแลล้มเหลว");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  // ✅ เพิ่ม Admin
  const addAdmin = async (
    adminData: Omit<Admin, "adminId" | "createdAt" | "updatedAt"> & {
      password: string;
    }
  ) => {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(adminData),
    });
    if (!res.ok) throw new Error("เพิ่มผู้ดูแลไม่สำเร็จ");
    await fetchAdmins();
  };

  // ✅ แก้ไข Admin
  const updateAdmin = async (
    adminId: string,
    data: Partial<Admin> & { password?: string }
  ) => {
    const res = await fetch(`${API_BASE}/admin/${adminId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("อัปเดตข้อมูลไม่สำเร็จ");
    await fetchAdmins();
  };

  // ✅ ลบ Admin
  const deleteAdmin = async (adminId: string) => {
    const res = await fetch(`${API_BASE}/admin/${adminId}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (!res.ok) throw new Error("ลบผู้ดูแลไม่สำเร็จ");
    await fetchAdmins();
  };

  return {
    admins,
    loading,
    fetchAdmins,
    addAdmin,
    updateAdmin,
    deleteAdmin,
  };
}
