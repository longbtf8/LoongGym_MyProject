import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Pagination({ page, setPage, totalPages }) {
  if (totalPages <= 1) return null;

  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    pages.push(i);
  }

  return (
    <div className="flex items-center justify-center gap-1.5 mt-8">
      {/* Nút Trước */}
      <button
        onClick={() => setPage(page - 1)}
        disabled={page === 1}
        className="p-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-color)] hover:border-[#ccff00]/40 disabled:opacity-40 disabled:hover:text-[var(--text-muted)] disabled:hover:border-[var(--border-color)] transition-all cursor-pointer disabled:cursor-not-allowed"
      >
        <ChevronLeft size={16} />
      </button>

      {/* Số trang */}
      {pages.map((p) => {
        const isActive = page === p;
        return (
          <button
            key={p}
            onClick={() => setPage(p)}
            className={`w-9 h-9 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
              isActive
                ? "bg-[#ccff00] text-black shadow-md shadow-[#ccff00]/10 font-bold"
                : "bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-color)] hover:border-[#ccff00]/40"
            }`}
          >
            {p}
          </button>
        );
      })}

      {/* Nút Sau */}
      <button
        onClick={() => setPage(page + 1)}
        disabled={page === totalPages}
        className="p-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-color)] hover:border-[#ccff00]/40 disabled:opacity-40 disabled:hover:text-[var(--text-muted)] disabled:hover:border-[var(--border-color)] transition-all cursor-pointer disabled:cursor-not-allowed"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}
