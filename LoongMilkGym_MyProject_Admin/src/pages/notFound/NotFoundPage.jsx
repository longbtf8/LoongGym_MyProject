import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, AlertCircle } from "lucide-react";
import paths from "@/config/path";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-color)] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-[var(--bg-secondary)] border border-[var(--border-color)]/60 p-8 rounded-3xl shadow-2xl flex flex-col items-center text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center shadow-lg">
          <AlertCircle className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-black text-[var(--text-color)]">404 - Không tìm thấy trang</h2>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] font-semibold leading-relaxed">
            Trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển sang địa chỉ khác.
          </p>
        </div>
        <Link
          to={paths.DASHBOARD}
          className="px-5 py-2.5 rounded-xl bg-[var(--color-primary)] text-black hover:bg-[var(--color-primary-hover)] text-xs font-extrabold flex items-center gap-2 shadow-lg shadow-primary/20 transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Quay lại Trang chủ
        </Link>
      </div>
    </div>
  );
}
