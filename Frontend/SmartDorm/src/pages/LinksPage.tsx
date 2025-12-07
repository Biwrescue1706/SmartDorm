// src/pages/LinksPage.tsx
import Swal from "sweetalert2";
import Nav from "../components/Nav";
import { useAuth } from "../hooks/useAuth";

interface LinkItem {
  title: string;
  url: string;
  color: string;
}

export default function LinksPage() {
  const { handleLogout, role, adminName, adminUsername } = useAuth();

  const links: LinkItem[] = [
    {
      title: "หน้าเว็บการจอง",
      url: "https://liff.line.me/2008099518-L7zaPqwo",
      color: "#20c997",
    },
    {
      title: "หน้าชำระบิล",
      url: "https://liff.line.me/2008099518-RGPO9wep",
      color: "#0d6efd",
    },
    {
      title: "หน้าการคืนห้อง",
      url: "https://liff.line.me/2008099518-djnrq87l",
      color: "#dc3545",
    },
  ];

  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(url);
    Swal.fire({
      toast: true,
      position: "top-end",
      icon: "success",
      title: "คัดลอกลิงก์เรียบร้อยแล้ว",
      showConfirmButton: false,
      timer: 1200,
    });
  };

  return (
    <>
      {/* 🔝 Navbar */}
      return (
      <Nav
        onLogout={handleLogout}
        role={role}
        adminName={adminName}
        adminUsername={adminUsername}
      />
      );
      <main className="main-content flex-grow-1 px-3 py-4 mt-6 mt-lg-5">
        <div
          className="min-vh-100 d-flex flex-column align-items-center justify-content-start bg-light"
          style={{ padding: "40px 10px" }}
        >
          <div className="container text-center">
            <h2 className="fw-bold mb-4 text-primary">
              🔗 รวมลิงก์ SmartDorm LIFF
            </h2>

            <div className="d-flex flex-column align-items-center gap-3">
              {links.map((link) => (
                <div
                  key={link.title}
                  className="card shadow-sm border-0 p-3 w-100"
                  style={{
                    maxWidth: "500px",
                    borderRadius: "15px",
                    background: "#fff",
                  }}
                >
                  <h5 className="fw-bold mb-2" style={{ color: link.color }}>
                    {link.title}
                  </h5>

                  <a
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-decoration-none d-block text-break mb-2"
                    style={{ color: "#333" }}
                  >
                    {link.url}
                  </a>

                  <button
                    className="btn btn-sm btn-outline-secondary fw-semibold"
                    onClick={() => handleCopy(link.url)}
                  >
                    📋 คัดลอกลิงก์
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
