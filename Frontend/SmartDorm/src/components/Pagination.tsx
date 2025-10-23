// ✅ ใช้ Bootstrap ล้วน ๆ ไม่มี CSS เพิ่ม
export interface PaginationProps {
  currentPage: number;
  totalItems: number;
  rowsPerPage: number;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rows: number) => void;
}

export default function Pagination({
  currentPage,
  totalItems,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
}: PaginationProps) {
  // ✅ ป้องกันการหารศูนย์
  const totalPages = Math.max(1, Math.ceil(totalItems / rowsPerPage));

  // ✅ ช่วงข้อมูลที่แสดง
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1;
  const endItem = Math.min(currentPage * rowsPerPage, totalItems);

  // ✅ แสดงหน้าทีละ 5 หน้า
  const pageRange = 5;
  let startPage = Math.max(1, currentPage - Math.floor(pageRange / 2));
  let endPage = startPage + pageRange - 1;
  if (endPage > totalPages) {
    endPage = totalPages;
    startPage = Math.max(1, endPage - pageRange + 1);
  }

  const pages: number[] = [];
  for (let i = startPage; i <= endPage; i++) pages.push(i);

  return (
    <div className="d-flex flex-column flex-md-row align-items-center justify-content-between mt-3 gap-3">
      {/* ✅ จำนวนต่อหน้า */}
      <div className="d-flex align-items-center">
        <label className="fw-semibold me-2 mb-0">แสดงต่อหน้า:</label>
        <select
          className="form-select w-auto"
          value={rowsPerPage}
          onChange={(e) => onRowsPerPageChange(Number(e.target.value))}
        >
          {[10, 16, 20, 25, 30, 35, 40, 45, 50].map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </div>

      {/* ✅ แสดงช่วงข้อมูล */}
      <div className="small text-center text-md-start flex-grow-1">
        แสดง {startItem}–{endItem} จากทั้งหมด {totalItems} รายการ
      </div>

      {/* ✅ ปุ่ม Pagination */}
      <nav aria-label="Pagination Navigation">
        <ul className="pagination mb-0 justify-content-center flex-wrap">
          {/* หน้าแรก */}
          <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
            <button className="page-link" onClick={() => onPageChange(1)}>
              &laquo;
            </button>
          </li>

          {/* ก่อนหน้า */}
          <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
            <button
              className="page-link"
              onClick={() => onPageChange(currentPage - 1)}
            >
              &lt;
            </button>
          </li>

          {/* ... ซ้าย */}
          {startPage > 1 && (
            <li className="page-item disabled">
              <span className="page-link">…</span>
            </li>
          )}

          {/* หมายเลขหน้า */}
          {pages.map((p) => (
            <li
              key={p}
              className={`page-item ${p === currentPage ? "active" : ""}`}
            >
              <button className="page-link" onClick={() => onPageChange(p)}>
                {p}
              </button>
            </li>
          ))}

          {/* ... ขวา */}
          {endPage < totalPages && (
            <li className="page-item disabled">
              <span className="page-link">…</span>
            </li>
          )}

          {/* ถัดไป */}
          <li
            className={`page-item ${
              currentPage === totalPages ? "disabled" : ""
            }`}
          >
            <button
              className="page-link"
              onClick={() => onPageChange(currentPage + 1)}
            >
              &gt;
            </button>
          </li>

          {/* หน้าสุดท้าย */}
          <li
            className={`page-item ${
              currentPage === totalPages ? "disabled" : ""
            }`}
          >
            <button
              className="page-link"
              onClick={() => onPageChange(totalPages)}
            >
              &raquo;
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
}
