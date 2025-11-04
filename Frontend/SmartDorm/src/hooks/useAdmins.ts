import { useState, useEffect } from "react";
import { API_BASE } from "../config";
import { type Admin } from "../types/admin";
import Swal from "sweetalert2";

export function useAdmins() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);

  // ฟังก์ชันช่วยเหลือสำหรับแสดง Toast Notification
  const showToast = (icon: 'success' | 'error', title: string) => {
    Swal.fire({
      toast: true,
      position: "top-end",
      icon: icon, // สามารถเป็น 'success' หรือ 'error'
      title: title,
      timer: 1500,
      showConfirmButton: false,
    });
  };

  // โหลดทั้งหมด (Fetch All)
  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/admin/getall`, {
        credentials: "include",
      });
      const data = await res.json();
      setAdmins(data);
    } catch (error) {
      showToast('error', "ไม่สามารถโหลดข้อมูลได้");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  // ✅ เพิ่ม Admin (Add Admin)
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
        showToast('error', "เพิ่มผู้ดูแลไม่สำเร็จ");
        return; 
      }
      
      showToast('success', "เพิ่มผู้ดูแลสำเร็จ");
      await fetchAdmins(); // รีเฟรชข้อมูล
    } catch (error) {
      showToast('error', "เกิดข้อผิดพลาดในการเชื่อมต่อ");
    }
  };

  // ✅ แก้ไข Admin (Update Admin)
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
        showToast('error', "อัปเดตข้อมูลไม่สำเร็จ");
        return; 
      }

      showToast('success', "อัปเดตข้อมูลสำเร็จ");
      await fetchAdmins(); // รีเฟรชข้อมูล
    } catch (error) {
      showToast('error', "เกิดข้อผิดพลาดในการเชื่อมต่อ");
    }
  };

  // ✅ ลบ Admin (Delete Admin)
  const deleteAdmin = async (adminId: string) => {
    try {
      const res = await fetch(`${API_BASE}/admin/${adminId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) {
        showToast('error', "ลบผู้ดูแลไม่สำเร็จ");
        return; 
      }
      
      showToast('success', "ลบผู้ดูแลสำเร็จ");
      await fetchAdmins(); // รีเฟรชข้อมูล
    } catch (error) {
      showToast('error', "เกิดข้อผิดพลาดในการเชื่อมต่อ");
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
