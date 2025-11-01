import ForgotUsernameForm from "../components/ForgotPassword/ForgotUsernameForm";

export default function ForgotUsername() {
  return (
    <div
      className="d-flex justify-content-center align-items-center bg-light"
      style={{ minHeight: "100vh" }}
    >
      <div className="card shadow p-4" style={{ maxWidth: "400px", width: "100%" }}>
        <h4 className="fw-bold text-center mb-4">🔑 ลืมรหัสผ่าน</h4>
        <ForgotUsernameForm />
      </div>
    </div>
  );
}
