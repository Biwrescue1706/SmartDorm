// ✅ src/components/ProtectedRoute.tsx
import { useEffect, useState, type ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { verifyAuth } from "../hooks/useAuth";

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [isAuth, setIsAuth] = useState(false);

  // 🔠 ข้อความ typewriter
  const text = "กำลังรอการตอบกลับจาก Server.";
  const [displayText, setDisplayText] = useState("");

  // ⌨️ effect ให้พิมพ์ทีละตัว
  useEffect(() => {
    let index = 0;

    const interval = setInterval(() => {
      setDisplayText(text.slice(0, index));
      index++;

      if (index > text.length) clearInterval(interval);
    }, 50); // ความเร็วการพิมพ์

    return () => clearInterval(interval);
  }, []);

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