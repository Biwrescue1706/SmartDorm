// ✅ src/components/GuestRoute.tsx
import { useEffect, useRef, useState, type ReactNode } from "react";

import { Navigate } from "react-router-dom";

import { API_BASE } from "../config";

export default function GuestRoute({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);

  const [isAuth, setIsAuth] = useState(false);

  const [mustChangePassword, setMustChangePassword] = useState(false);

  const text = "กำลังรอการตอบกลับจาก Server ...";

  const [displayText, setDisplayText] = useState("");

  const [isDeleting, setIsDeleting] = useState(false);

  const [index, setIndex] = useState(0);

  const ran = useRef(false);

  // 🔁 Typewriter Loop
  useEffect(() => {
    if (!loading) return;

    const speed = isDeleting ? 30 : 60;

    const timeout = setTimeout(() => {
      if (!isDeleting) {
        setDisplayText(text.slice(0, index + 1));

        setIndex((prev) => prev + 1);

        if (index + 1 === text.length) {
          setTimeout(() => setIsDeleting(true), 500);
        }
      } else {
        setDisplayText(text.slice(0, index - 1));

        setIndex((prev) => prev - 1);

        if (index - 1 === 0) {
          setIsDeleting(false);
        }
      }
    }, speed);

    return () => clearTimeout(timeout);
  }, [index, isDeleting, loading]);

  // 🔐 ตรวจสอบ token
  useEffect(() => {
    if (import.meta.env.PROD) {
      console.clear();
    }

    console.clear();

    if (ran.current) return;

    ran.current = true;

    const check = async () => {
      try {
        const res = await fetch(`${API_BASE}/auth/verify`, {
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

  if (loading)
    return (
      <div
        style={{
          height: "100vh",

          display: "flex",

          justifyContent: "center",

          alignItems: "center",

          fontSize: "15px",

          fontWeight: "bold",

          whiteSpace: "pre",
        }}
      >
        {displayText}
      </div>
    );

  // ✅ login แล้วแต่ต้องเปลี่ยนรหัส
  if (isAuth && mustChangePassword) {
    return <Navigate to="/reset-password" replace />;
  }

  // ✅ login ปกติ
  if (isAuth) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
