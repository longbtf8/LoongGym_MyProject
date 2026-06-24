import React from "react";
import { AlertTriangle, X, ShieldAlert, Loader2, ShieldCheck } from "lucide-react";

export default function ConfirmRoleModal({ user, targetRole, isOpen, onClose, onConfirm, isLoading }) {
  if (!isOpen || !user) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm({ role: targetRole });
  };

  const isAdminTarget = targetRole === "ADMIN";

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal Box */}
      <div className="relative w-full max-w-md bg-[var(--bg-secondary)] border border-[var(--border-color)]/60 rounded-3xl p-6 shadow-2xl z-10 animate-scale-up">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-[var(--border-color)]/40 text-[var(--text-muted)] hover:text-[var(--text-color)] transition-all cursor-pointer"
        >
          <X className="w-4.5 h-4.5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 border-b border-[var(--border-color)]/60 pb-4 mb-4">
          <div className={`p-2.5 rounded-2xl ${
            isAdminTarget 
              ? "bg-purple-500/10 text-purple-400" 
              : "bg-blue-500/10 text-blue-400"
          }`}>
            {isAdminTarget ? <ShieldCheck className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5" />}
          </div>
          <div>
            <h3 className="text-sm font-black uppercase tracking-wider text-[var(--text-color)]">
              {isAdminTarget ? "Cấp quyền Admin" : "Hạ quyền User"}
            </h3>
            <p className="text-[11px] font-bold text-[var(--text-muted)] mt-0.5">
              Thành viên: {user.profile?.fullName || user.email}
            </p>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className={`p-3.5 rounded-2xl border flex items-start gap-3 ${
            isAdminTarget 
              ? "bg-purple-500/5 border-purple-500/10 text-purple-400" 
              : "bg-blue-500/5 border-blue-500/10 text-blue-400"
          }`}>
            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <p className="text-[11px] font-bold leading-normal">
              {isAdminTarget 
                ? "Bạn có chắc chắn muốn nâng quyền cho tài khoản này thành Quản trị viên (ADMIN) không? Tài khoản này sẽ có toàn quyền truy cập, chỉnh sửa, xóa dữ liệu trên hệ thống Admin."
                : "Bạn có chắc chắn muốn hạ quyền tài khoản này xuống Người dùng (USER) không? Tài khoản này sẽ ngay lập tức mất quyền truy cập vào tất cả các tính năng quản lý hệ thống."}
            </p>
          </div>

          <div className="text-xs font-semibold text-[var(--text-muted)]">
            Email tài khoản: <span className="text-[var(--text-color)] font-extrabold">{user.email}</span>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-2xl bg-[var(--border-color)]/50 hover:bg-[var(--border-color)] text-[var(--text-color)] text-xs font-extrabold transition-all cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className={`flex-1 py-3 rounded-2xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                isAdminTarget
                  ? "bg-purple-500 hover:bg-purple-600 text-white shadow-lg shadow-purple-500/10"
                  : "bg-blue-500 hover:bg-blue-600 text-white shadow-lg shadow-blue-500/10"
              } disabled:opacity-50`}
            >
              {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Xác nhận
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
