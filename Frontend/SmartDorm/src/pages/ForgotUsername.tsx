import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForgotPassword } from "../hooks/useForgotPassword";

export default function ForgotUsername() {
  const [username, setUsername] = useState("");
  const { checkUsername } = useForgotPassword();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = await checkUsername(username);
      navigate("/reset-password", { state: { username, name: data.name } });
    } catch {}
  };

  return (
    <div className="container-fluid min-vh-100 d-flex flex-column p-0 bg-dark bg-gradient">

      {/* NAVBAR (เหมือน Login) */}
      <nav className="navbar navbar-dark bg-transparent px-3 py-2">
        <div className="container-fluid d-flex justify-content-between align-items-center">

          {/* ปุ่มย้อนกลับ ซ้ายเหมือน Login */}
          <button
            className="btn btn-outline-warning fw-semibold"
            onClick={() => navigate("/")}
          >
            ⬅
          </button>

          {/* LOGO ตรงกลางเหมือน Login */}
          <div className="d-flex flex-column align-items-center mx-auto">
            <div className="d-flex align-items-center gap-2">
              <img
                src="https://smartdorm-admin.biwbong.shop/SmartDorm.webp"
                alt="logo"
                width="48"
                height="48"
                className="img-fluid"
              />
              <span className="fw-bold h4 text-warning mb-0">
                SmartDorm
              </span>
            </div>

            <small className="text-light opacity-75">
              ระบบจัดการหอพักสำหรับผู้ดูแล
            </small>
          </div>

          {/* dummy ด้านขวาให้บาลานซ์ */}
          <div className="invisible">
            <button className="btn btn-outline-warning">X</button>
          </div>
        </div>
      </nav>

      {/* CARD FORM เหมือน Login */}
      <div className="flex-grow-1 d-flex justify-content-center align-items-center">
        <div
          className="card shadow-lg border-0 text-center p-4 bg-secondary bg-opacity-25 col-11 col-sm-9 col-md-7 col-lg-5 col-xl-4"
        >
          <h2 className="fw-bold text-white mb-3">🔑 ลืมรหัสผ่าน</h2>
          <h3 className="text-white mb-4">
            กรุณากรอกชื่อผู้ใช้เพื่อตรวจสอบข้อมูล
          </h3>

          <form onSubmit={handleSubmit}>
            <div className="mb-3 text-start">
              <label className="form-label text-warning fw-semibold">
                ชื่อผู้ใช้ (Username)
              </label>
              <input
                type="text"
                className="form-control text-center"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoFocus
              />
            </div>

            <button type="submit" className="btn btn-warning w-100 fw-bold text-dark">
              ตรวจสอบชื่อผู้ใช้
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}