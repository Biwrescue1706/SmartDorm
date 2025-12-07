import { useState, useEffect } from "react";
import { API_BASE } from "../config";
import { type Admin } from "../types/admin";
import { toast } from "../utils/toast"; // ใช้ toast ที่มี 3 args

export function useAdmins() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);

  // โหลดข้อมูลผู้ดูแลทั้งหมด
  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/admin/getall`, {
        credentials: "include",
      });

      if (!res.ok) {
        toast("error", "โหลดข้อมูลไม่สำเร็จ", "ไม่สามารถโหลดข้อมูลผู้ดูแลได้");
        return;
      }

      const data = await res.json();
      setAdmins(data);
      toast("success", "โหลดข้อมูลสำเร็จ", "ดึงข้อมูลผู้ดูแลทั้งหมดแล้ว");
    } catch {
      toast("error", "เชื่อมต่อไม่สำเร็จ", "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  // เพิ่ม Admin
  const addAdmin = async (
    adminData: Omit<Admin, "adminId" | "createdAt" | "updatedAt"> & {
      password: string;
    }
  ) => {
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(adminData),
      });

      if (!res.ok) {
        toast("error", "เพิ่มไม่สำเร็จ", "ไม่สามารถเพิ่มผู้ดูแลได้");
        return;
      }

      toast("success", "เพิ่มผู้ดูแลสำเร็จ", "ระบบได้บันทึกข้อมูลเรียบร้อย");
      await fetchAdmins();
    } catch {
      toast("error", "เกิดข้อผิดพลาด", "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์");
    }
  };

  // อัปเดต Admin
  const updateAdmin = async (
    adminId: string,
    data: Partial<Admin> & { password?: string }
  ) => {
    try {
      const res = await fetch(`${API_BASE}/admin/${adminId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        toast("error", "อัปเดตไม่สำเร็จ", "ไม่สามารถแก้ไขข้อมูลได้");
        return;
      }

      toast("success", "อัปเดตข้อมูลสำเร็จ", "บันทึกข้อมูลใหม่เรียบร้อยแล้ว");
      await fetchAdmins();
    } catch {
      toast("error", "เกิดข้อผิดพลาด", "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์");
    }
  };

  // ลบ Admin
  const deleteAdmin = async (adminId: string) => {
    try {
      const res = await fetch(`${API_BASE}/admin/${adminId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) {
        toast("error", "ลบไม่สำเร็จ", "ไม่สามารถลบผู้ดูแลได้");
        return;
      }

      toast("success", "ลบผู้ดูแลสำเร็จ", "ข้อมูลถูกลบออกจากระบบแล้ว");
      await fetchAdmins();
    } catch {
      toast("error", "เกิดข้อผิดพลาด", "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์");
    }
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
