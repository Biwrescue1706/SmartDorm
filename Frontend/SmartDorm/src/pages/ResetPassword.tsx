import ResetPasswordForm from "../components/ForgotPassword/ResetPasswordForm";

export default function ResetPassword() {
  return (
    <div
      className="d-flex justify-content-center align-items-center bg-light"
      style={{ minHeight: "100vh" }}
    >
      <div className="card shadow p-4" style={{ maxWidth: "400px", width: "100%" }}>
        <h4 className="fw-bold text-center mb-4">🔐 ตั้งรหัสผ่านใหม่</h4>
        <ResetPasswordForm />
      </div>
    </div>
  );
}
