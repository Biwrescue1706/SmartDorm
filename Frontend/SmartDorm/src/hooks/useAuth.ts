// src/hooks/useAuth.ts
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "../utils/toast"; // <-- เรียกใช้ toast แยกไฟล์แล้ว
import { API_BASE } from "../config";
import { Login, Register, Verify, Logout } from "../apis/endpoint.api";
import type { LoginCredentials, RegisterData } from "../types/Auth";

export function useAuth() {
  const [loading, setLoading] = useState(false);
  const [isAuth, setIsAuth] = useState<boolean | null>(null);
  const [role, setRole] = useState<number | null>(null);
  const [adminName, setAdminName] = useState<string>("");
  const [adminUsername, setAdminUsername] = useState<string>("");
  const [message, setMessage] = useState("กำลังโหลด...");
  const navigate = useNavigate();

  /* ---------------- Register ---------------- */
  const register = async (data: RegisterData) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}${Register}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      }).catch(() => null);

      if (!res) {
        toast(
          "error",
          "ไม่สามารถโหลดข้อมูลได้",
          "ไม่สามารถเชื่อมต่อกับ Backend ได้"
        );
        return false;
      }

      const result = await res.json();

      if (res.ok) {
        toast("success", "เพิ่มสมาชิกสำเร็จ", "ระบบได้บันทึกข้อมูลของคุณแล้ว");
        return true;
      } else {
        toast("error", "เพิ่มสมาชิกไม่สำเร็จ", result.error);
        return false;
      }
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- Login ---------------- */
  const login = async (credentials: LoginCredentials) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}${Login}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
        credentials: "include",
      }).catch(() => null);

      if (!res) {
        toast("error", "ข้อผิดพลาด", "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้");
        return false;
      }

      const data = await res.json();

      if (!res.ok) {
        toast(
          "error",
          "เข้าสู่ระบบไม่สำเร็จ",
          data.error || "กรุณาตรวจสอบข้อมูลอีกครั้ง"
        );
        return false;
      }

      toast(
        "success",
        "เข้าสู่ระบบสำเร็จ",
        `ยินดีต้อนรับ ${data.admin?.name || credentials.username}`
      );

      await new Promise((r) => setTimeout(r, 1500));
      return true;
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- Logout ---------------- */
  const handleLogout = async () => {
    const res = await fetch(`${API_BASE}${Logout}`, {
      method: "POST",
      credentials: "include",
    }).catch(() => null);

    toast(
      res?.ok ? "success" : "error",
      res?.ok ? "ออกจากระบบสำเร็จ" : "ออกจากระบบไม่สำเร็จ",
      res?.ok ? "กรุณาเข้าสู่ระบบ" : "ออกจากระบบไม่สำเร็จ"
    );

    setIsAuth(false);
    setRole(null);
    setMessage("กำลังโหลด...");
    setAdminName("");
    setAdminUsername("");
    setTimeout(() => navigate("/"), 1500);
  };

  /* ---------------- Verify Auth ---------------- */
  useEffect(() => {
    const verify = async () => {
      const res = await fetch(`${API_BASE}${Verify}`, {
        method: "GET",
        credentials: "include",
      }).catch(() => null);

      if (!res || !res.ok) {
        setIsAuth(false);
        setRole(null);
        setAdminName("");
        setAdminUsername("");

        toast("warning", "กรุณาเข้าสู่ระบบ", "กรุณาเข้าสู่ระบบ");

        setTimeout(() => navigate("/"), 2000);
        return;
      }

      const data = await res.json().catch(() => null);

      if (data?.valid) {
        setIsAuth(true);
        setRole(data.admin?.role ?? 1);
        setAdminName(data.admin?.name ?? "");
        setAdminUsername(data.admin?.username ?? "");
        setMessage(data.admin?.name || "ไม่พบชื่อ");
      } else {
        setIsAuth(false);
      }
    };

    verify();
  }, [navigate]);

  return {
    register,
    login,
    loading,
    isAuth,
    handleLogout,
    role,
    message,
    adminName,
    adminUsername,
    setAdminName,
  };
}

/* ---------------- Route Guard ---------------- */
export async function verifyAuth(): Promise<boolean> {
  const res = await fetch(`${API_BASE}${Verify}`, {
    method: "GET",
    credentials: "include",
  }).catch(() => null);

  if (!res || !res.ok) return false;
  const data = await res.json().catch(() => null);
  return data?.valid === true;
}
