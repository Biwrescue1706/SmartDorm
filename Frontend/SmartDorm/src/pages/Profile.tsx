import Nav from "../components/Nav";
import { useAuth } from "../hooks/useAuth";
import { useProfile } from "../hooks/useProfile";
import ProfileCard from "../components/Profile/ProfileCard";

export default function Profile() {
  const { message, handleLogout, role } = useAuth();
  const { admin, loading, updateProfile } = useProfile();

  return (
    <>
      <Nav message={message} onLogout={handleLogout} role={role} />

      <div
        className="container d-flex justify-content-center align-items-center"
        style={{ minHeight: "100vh", paddingTop: "80px" }}
      >
        {loading ? (
          <p className="text-center text-muted">⏳ กำลังโหลดข้อมูล...</p>
        ) : admin ? (
          <ProfileCard admin={admin} onSave={(name) => updateProfile({ name })} />
        ) : (
          <p className="text-danger">ไม่พบข้อมูลผู้ใช้</p>
        )}
      </div>
    </>
  );
}
