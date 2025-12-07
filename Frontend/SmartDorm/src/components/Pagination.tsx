// src/components/Pagination.tsx
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
  const SCB_PURPLE = "#4A0080";
  const SCB_GOLD = "#FFC800";

  const totalPages = Math.max(1, Math.ceil(totalItems / rowsPerPage));
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1;
  const endItem = Math.min(currentPage * rowsPerPage, totalItems);

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
    <div
      className="d-flex flex-column flex-md-row align-items-center justify-content-between mt-4 gap-3 py-2"
      style={{
        background: "#F8F5FC",
        borderRadius: "10px",
        border: `1px solid ${SCB_PURPLE}`,
        boxShadow: "0 2px 6px rgba(0,0,0,.1)",
      }}
    >
      {/* จำนวนต่อหน้า */}
      <div className="d-flex align-items-center ms-3">
        <label
          className="fw-semibold me-2 mb-0"
          style={{ color: SCB_PURPLE }}
        >
          แสดงต่อหน้า:
        </label>
        <select
          className="form-select w-auto border-0 fw-semibold"
          style={{ color: SCB_PURPLE }}
          value={rowsPerPage}
          onChange={(e) => onRowsPerPageChange(Number(e.target.value))}
        >
          {[10, 20, 30, 40, 50].map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </div>

      {/* แสดงช่วงข้อมูล */}
      <div
        className="small text-center text-md-start fw-semibold"
        style={{ color: SCB_PURPLE }}
      >
        แสดง {startItem}–{endItem} จากทั้งหมด {totalItems} รายการ
      </div>

      {/* Pagination Buttons */}
      <nav aria-label="Pagination Navigation" className="me-3">
        <ul className="pagination mb-0 justify-content-center">

          {/* หน้าแรก */}
          <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
            <button
              className="page-link"
              style={{ color: SCB_PURPLE }}
              onClick={() => onPageChange(1)}
            >
              &laquo;
            </button>
          </li>

          {/* ก่อนหน้า */}
          <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
            <button
              className="page-link"
              style={{ color: SCB_PURPLE }}
              onClick={() => onPageChange(currentPage - 1)}
            >
              &lt;
            </button>
          </li>

          {startPage > 1 && (
            <li className="page-item disabled">
              <span className="page-link" style={{ color: SCB_PURPLE }}>
                …
              </span>
            </li>
          )}

          {/* หมายเลขหน้า */}
          {pages.map((p) => (
            <li key={p} className={`page-item ${p === currentPage ? "active" : ""}`}>
              <button
                className="page-link fw-bold"
                style={{
                  background: p === currentPage ? SCB_GOLD : "white",
                  color: p === currentPage ? "#2D1A47" : SCB_PURPLE,
                  borderColor: SCB_PURPLE,
                }}
                onClick={() => onPageChange(p)}
              >
                {p}
              </button>
            </li>
          ))}

          {endPage < totalPages && (
            <li className="page-item disabled">
              <span className="page-link" style={{ color: SCB_PURPLE }}>
                …
              </span>
            </li>
          )}

          {/* ถัดไป */}
          <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
            <button
              className="page-link"
              style={{ color: SCB_PURPLE }}
              onClick={() => onPageChange(currentPage + 1)}
            >
              &gt;
            </button>
          </li>

          {/* หน้าสุดท้าย */}
          <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
            <button
              className="page-link"
              style={{ color: SCB_PURPLE }}
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
