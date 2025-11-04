// src/hooks/useAuth.ts
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { API_BASE } from "../config";
import { Login, Register, Verify, Logout } from "../apis/endpoint.api";
import type { LoginCredentials, RegisterData } from "../types/Auth";

export function useAuth() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("กำลังโหลด...");
  const [isAuth, setIsAuth] = useState<boolean | null>(null);
  const [role, setRole] = useState<number | null>(null);
  const navigate = useNavigate();

  // ----------------------------- Register -----------------------------
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
        Swal.fire({
          icon: "error",
          title: "ข้อผิดพลาด",
          text: "ไม่สามารถเชื่อมต่อกับ Backend ได้",
          timer: 1500,
          showConfirmButton: false,
        });
        return false;
      }

      const result = await res.json();

      if (res.ok) {
        Swal.fire({
          icon: "success",
          title: "สมัครสมาชิกสำเร็จ",
          text: "ระบบได้บันทึกข้อมูลของคุณแล้ว",
          timer: 1500,
          showConfirmButton: false,
        });
        return true;
      } else {
        Swal.fire({
          icon: "error",
          title: "ล้มเหลว",
          text: result.error || "สมัครสมาชิกไม่สำเร็จ",
          timer: 1500,
          showConfirmButton: false,
        });
        return false;
      }
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------- Login -----------------------------
  const login = async (credentials: LoginCredentials) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}${Login}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
        credentials: "include",
        mode: "cors",
      }).catch(() => null);

      if (!res) {
        Swal.fire({
          icon: "error",
          title: "ข้อผิดพลาด",
          text: "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้",
          timer: 1500,
          showConfirmButton: false,
        });
        return false;
      }

      const data = await res.json();

      if (!res.ok) {
        Swal.fire({
toast: true,
        position: "top-end",
          icon: "error",
          title: "ล้มเหลว",
          text: data.error || "เข้าสู่ระบบไม่สำเร็จ",
          timer: 1500,
          showConfirmButton: false,
        });
        return false;
      }

      Swal.fire({
toast: true,
        position: "top-end",
        icon: "success",
        title: "เข้าสู่ระบบสำเร็จ",
        text: `ยินดีต้อนรับ ${data.admin?.name || credentials.username}`,
        timer: 1500,
        showConfirmButton: false,
      });
      await new Promise((resolve) => setTimeout(resolve, 1500));
      return true;
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------- Logout -----------------------------
  const handleLogout = async () => {
    const res = await fetch(`${API_BASE}${Logout}`, {
      method: "POST",
      credentials: "include",
      mode: "cors",
    }).catch(() => null);

    if (res?.ok) {
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: "ออกจากระบบสำเร็จ",
        timer: 1500,
        showConfirmButton: false,
      });
    } else {
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "error",
        title: "ออกจากระบบไม่สำเร็จ",
        timer: 1500,
        showConfirmButton: false,
      });
    }

    setIsAuth(false);
    setRole(null);
    setMessage("กำลังโหลด...");
    setTimeout(() => navigate("/"), 1500);
  };

  // ----------------------------- Verify Auth -----------------------------
  useEffect(() => {
    const verify = async () => {
      const res = await fetch(`${API_BASE}${Verify}`, {
        method: "GET",
        credentials: "include",
        mode: "cors",
      }).catch(() => null);

      if (!res || !res.ok) {
        setIsAuth(false);
        setRole(null);
        Swal.fire({
          toast: true,
          position: "top-end",
          icon: "warning",
          title: "กรุณาเข้าสู่ระบบ",
          timer: 2000,
          showConfirmButton: false,
        });
        setTimeout(() => navigate("/"), 2000);
        return;
      }

      const data = await res.json().catch(() => null);
      if (data?.valid) {
        setIsAuth(true);
        setRole(data.admin?.role ?? 1);
        setMessage(`${data.admin?.name}`);
      } else {
        setIsAuth(false);
        setRole(null);
      }
    };

    verify();
  }, [navigate]);

  return { register, login, loading, message, isAuth, handleLogout, role };
}

// ----------------------------- Route Guard -----------------------------
export async function verifyAuth(): Promise<boolean> {
  const res = await fetch(`${API_BASE}${Verify}`, {
    method: "GET",
    credentials: "include",
    mode: "cors",
  }).catch(() => null);

  if (!res || !res.ok) return false;

  const data = await res.json().catch(() => null);
  return data?.valid === true;
}
