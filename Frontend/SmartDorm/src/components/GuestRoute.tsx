// ✅ src/components/GuestRoute.tsx
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { verifyAuth } from "../hooks/useAuth";

export default function GuestRoute({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [isAuth, setIsAuth] = useState(false);

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

  // 🔐 ตรวจสอบ token (ให้รันครั้งเดียวจริง ๆ)
  useEffect(() => {
    if (ran.current) return; // กันไม่ให้รันซ้ำใน dev
    ran.current = true;

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
          fontSize: "15px",
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
