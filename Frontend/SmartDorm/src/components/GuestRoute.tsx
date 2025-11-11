// ✅ src/components/GuestRoute.tsx
import { useEffect, useState, type ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { verifyAuth } from "../hooks/useAuth";

/**
 * 🧭 ใช้กับหน้า Login / Register
 * ถ้ามี token แล้ว → redirect ไป Dashboard
 */
export default function GuestRoute({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [isAuth, setIsAuth] = useState(false);

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
      <div className="text-center mt-5">
        ⏳ <b>รอการตอบกลับ ของ Server .... ...</b>
      </div>
    );

  if (isAuth) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}
