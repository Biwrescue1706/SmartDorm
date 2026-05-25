// ✅ src/components/ProtectedRoute.tsx
import { useEffect, useState, type ReactNode } from "react";

import { Navigate, useLocation } from "react-router-dom";

import { API_BASE } from "../config";

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const [isAuth, setIsAuth] = useState(false);

  const [mustChangePassword, setMustChangePassword] = useState(false);

  const text = "กำลังรอการตอบกลับจาก Server ...";

  const [displayText, setDisplayText] = useState("");

  const [isDeleting, setIsDeleting] = useState(false);

  const [index, setIndex] = useState(0);

  // 🔁 Typewriter loop
  useEffect(() => {
    if (!loading) return;

    const speed = isDeleting ? 30 : 60;

    const timeout = setTimeout(() => {
      if (!isDeleting) {
        // พิมพ์เพิ่ม
        setDisplayText(text.slice(0, index + 1));

        setIndex((prev) => prev + 1);

        // พิมพ์ครบ → เริ่มลบ
        if (index + 1 === text.length) {
          setTimeout(() => setIsDeleting(true), 500);
        }
      } else {
        // ลบทีละตัว
        setDisplayText(text.slice(0, index - 1));

        setIndex((prev) => prev - 1);

        // ลบหมด → เริ่มใหม่
        if (index - 1 === 0) {
          setIsDeleting(false);
        }
      }
    }, speed);

    return () => clearTimeout(timeout);
  }, [index, isDeleting, loading]);

  // 🔐 ตรวจสอบ token
  useEffect(() => {
    const check = async () => {
      try {
        console.clear();

        if (import.meta.env.PROD) {
          console.clear();
        }

        const res = await fetch(`${API_BASE}/auth/verify`, {
          method: "GET",

          credentials: "include",
        });

        const data = await res.json();

        setIsAuth(data.valid === true);

        setMustChangePassword(data.admin?.mustChangePassword === true);
      } catch {
        setIsAuth(false);
      } finally {
        setLoading(false);
      }
    };

    check();
  }, []);

  // 🔄 Loading
  if (loading)
    return (
      <div
        style={{
          height: "100vh",

          display: "flex",

          alignItems: "center",

          justifyContent: "center",

          fontSize: "15px",

          fontWeight: "bold",

          whiteSpace: "pre",
        }}
      >
        {displayText}
      </div>
    );

  // ❌ ยังไม่ได้ login
  if (!isAuth) {
    return <Navigate to="/" replace />;
  }

  // ✅ login แล้วแต่ยังไม่เปลี่ยนรหัส
  if (mustChangePassword && location.pathname !== "/reset-password") {
    return <Navigate to="/reset-password" replace />;
  }

  // ✅ ใช้งานได้ปกติ
  return <>{children}</>;
}
