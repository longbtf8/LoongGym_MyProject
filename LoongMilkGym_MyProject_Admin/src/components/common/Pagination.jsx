import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Pagination({ pagination, currentPage, limit, onPageChange, label = "bản ghi" }) {
  if (!pagination || pagination.totalPages <= 1) return null;

  const totalPages = pagination.totalPages;
  const startIdx = ((currentPage - 1) * limit) + 1;
  const endIdx = Math.min(currentPage * limit, pagination.total);

  // Calculate page range (max 3 pages centered around currentPage)
  let startPage = Math.max(1, currentPage - 1);
  let endPage = Math.min(totalPages, currentPage + 1);

  if (currentPage === 1) {
    endPage = Math.min(totalPages, 3);
  } else if (currentPage === totalPages) {
    startPage = Math.max(1, totalPages - 2);
  }

  const pageNumbers = [];
  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="p-4 border-t border-[var(--border-color)]/60 flex items-center justify-between w-full">
      <span className="text-[11px] font-bold text-[var(--text-muted)]">
        Hiển thị từ {startIdx} đến {endIdx} trong tổng số {pagination.total} {label}
      </span>
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`p-1.5 rounded-xl border transition-all cursor-pointer ${
            currentPage === 1
              ? "border-[var(--border-color)]/30 text-[var(--text-muted)]/40 opacity-30 cursor-not-allowed"
              : "border-[var(--border-color)] text-[var(--text-color)] hover:bg-[var(--color-primary)] hover:text-black hover:border-[var(--color-primary)] hover:shadow-lg hover:shadow-[var(--color-primary)]/10"
          }`}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {pageNumbers.map((pageNum) => {
          const isPageActive = currentPage === pageNum;
          return (
            <button
              key={pageNum}
              onClick={() => onPageChange(pageNum)}
              className={`w-7.5 h-7.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                isPageActive 
                  ? "bg-[var(--color-primary)] text-black shadow-lg shadow-[#ccff00]/10 border-0"
                  : "border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-color)] hover:border-[var(--text-color)]"
              }`}
            >
              {pageNum}
            </button>
          );
        })}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`p-1.5 rounded-xl border transition-all cursor-pointer ${
            currentPage === totalPages
              ? "border-[var(--border-color)]/30 text-[var(--text-muted)]/40 opacity-30 cursor-not-allowed"
              : "border-[var(--border-color)] text-[var(--text-color)] hover:bg-[var(--color-primary)] hover:text-black hover:border-[var(--color-primary)] hover:shadow-lg hover:shadow-[var(--color-primary)]/10"
          }`}
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
