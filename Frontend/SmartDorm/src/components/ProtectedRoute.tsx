// ✅ src/components/ProtectedRoute.tsx
import { useEffect, useState, type ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { verifyAuth } from "../hooks/useAuth";

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [isAuth, setIsAuth] = useState(false);

  const text = "รอการตอบกลับจาก Server ...";
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [index, setIndex] = useState(0);

  // 🔁 Typewriter loop
  useEffect(() => {
    if (!loading) return; // ถ้าโหลดเสร็จแล้ว หยุด animation

    const speed = isDeleting ? 30 : 60;

    const timeout = setTimeout(() => {
      if (!isDeleting) {
        // พิมพ์เพิ่ม
        setDisplayText(text.slice(0, index + 1));
        setIndex(prev => prev + 1);

        // ถ้าพิมพ์ครบแล้ว → เริ่มลบ
        if (index + 1 === text.length) {
          setTimeout(() => setIsDeleting(true), 500);
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
          alignItems: "center",
          justifyContent: "center",
          fontSize: "28px",
          fontWeight: "bold",
          whiteSpace: "pre",
        }}
      >
        {displayText}
      </div>
    );

  return isAuth ? <>{children}</> : <Navigate to="/" replace />;
}