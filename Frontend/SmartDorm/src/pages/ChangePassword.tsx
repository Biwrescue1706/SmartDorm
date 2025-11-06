import Nav from "../components/Nav";
import { useAuth } from "../hooks/useAuth";
import ChangePasswordForm from "../components/ChangePassword/ChangePasswordForm";

export default function ChangePassword() {
  const { message, handleLogout, role, adminName, adminUsername } = useAuth();

  return (
    <>
      <Nav
        message={message}
        onLogout={handleLogout}
        role={role}
        adminName={adminName}
        adminUsername={adminUsername}
      />

      <div
        className="container d-flex justify-content-center align-items-center"
        style={{ minHeight: "100vh", paddingTop: "80px" }}
      >
        <div
          className="card shadow-sm border-0 p-4 w-100"
          style={{
            maxWidth: "500px",
            borderRadius: "16px",
            background: "linear-gradient(180deg, #ffffff, #f8f9fa)",
          }}
        >
          <h4 className="fw-bold text-center mb-4 text-primary">
            🔑 เปลี่ยนรหัสผ่าน
          </h4>

          <ChangePasswordForm />
        </div>
      </div>
    </>
  );
}
