import { useNavigate } from "react-router-dom";
import LoginForm from "../components/Auth/LoginForm";

export default function Login() {
  const navigate = useNavigate();

  return (
    <div
  className="d-flex justify-content-center pt-4"
  style={{
    minHeight: "100vh",
    background: "linear-gradient(135deg, #eef2ff, #f8f9fa)",
  }}
>
  <LoginForm onSuccess={() => navigate("/dashboard")} />
</div>
  );
}
