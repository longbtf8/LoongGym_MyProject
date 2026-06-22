import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, AlertCircle } from "lucide-react";
import paths from "@/config/path";

export default function NotFound() {
  return (
    <div className="min-h-[calc(100vh-8rem)] flex flex-col items-center justify-center text-center p-6 animate-reactions-in">
      <div className="w-16 h-16 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500 mb-6 border border-rose-500/20">
        <AlertCircle className="w-8 h-8" />
      </div>
      <h2 className="text-3xl font-black text-[var(--text-color)] tracking-tight">404 - Không tìm thấy trang</h2>
      <p className="text-sm text-[var(--text-muted)] font-semibold max-w-sm mt-3 leading-relaxed">
        Trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển sang địa chỉ khác.
      </p>
      <Link
        to={paths.dashboard}
        className="mt-8 px-5 py-2.5 rounded-xl bg-[var(--color-primary)] text-black hover:bg-[var(--color-primary-hover)] text-xs font-extrabold flex items-center gap-2 shadow-lg shadow-primary/20 transition-all cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" /> Quay lại Trang chủ
      </Link>
    </div>
  );
}
