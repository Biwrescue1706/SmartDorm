// ✅ src/components/GuestRoute.tsx
import { useEffect, useState, type ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { verifyAuth } from "../hooks/useAuth";

export default function GuestRoute({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [isAuth, setIsAuth] = useState(false);

  const text = "กำลังรอการตอบกลับจาก Server.";
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [index, setIndex] = useState(0);

  // 🔁 Typewriter Loop (พิมพ์-ลบ-พิมพ์)
  useEffect(() => {
    if (!loading) return; // server ตอบแล้ว หยุดอนิเมชัน

    const speed = isDeleting ? 30 : 60; // ลบเร็วกว่า

    const timeout = setTimeout(() => {
      if (!isDeleting) {
        // พิมพ์เพิ่มทีละตัว
        setDisplayText(text.slice(0, index + 1));
        setIndex(prev => prev + 1);

        // พิมพ์ครบแล้ว → เริ่มลบ
        if (index + 1 === text.length) {
          setTimeout(() => setIsDeleting(true), 500); // หน่วงนิดนึงก่อนลบ
        }
      } else {
        // ลบทีละตัว
        setDisplayText(text.slice(0, index - 1));
        setIndex(prev => prev - 1);

        // ถ้าลบหมดแล้ว → เริ่มพิมพ์ใหม่
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
      const valid = await verifyAuth();
      setIsAuth(valid);
      setLoading(false);
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
          fontSize: "28px",
          fontWeight: "bold",
          whiteSpace: "pre",
        }}
      >
        {displayText}
      </div>
    );

  if (isAuth) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}