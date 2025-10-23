// ✅ src/components/ProtectedRoute.tsx
import { useEffect, useState, type ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { verifyAuth } from "../hooks/useAuth";

/**
 * 🔒 ป้องกันผู้ใช้ที่ไม่ได้ล็อกอินจากการเข้าหน้าภายใน
 */
export default function ProtectedRoute({ children }: { children: ReactNode }) {
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
        ⏳ <b>กำลังตรวจสอบสิทธิ์การเข้าถึง...</b>
      </div>
    );

  return isAuth ? <>{children}</> : <Navigate to="/" replace />;
}
