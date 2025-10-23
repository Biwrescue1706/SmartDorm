import "bootstrap/dist/css/bootstrap.min.css";

export default function NotFound() {
  return (
    <div className="d-flex flex-column justify-content-center align-items-center vh-100 text-center bg-light">
      <h1 className="display-1 fw-bold mb-3 text-danger">404</h1>
      <p className="fs-5 mb-4 text-secondary">ไม่พบหน้าที่คุณกำลังค้นหา</p>
      <a href="/" className="btn btn-primary px-4 py-2">
        กลับไปหน้าแรก
      </a>
    </div>
  );
}
