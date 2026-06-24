import React, { useState, useEffect } from "react";
import { AlertTriangle, X, ShieldAlert, Loader2 } from "lucide-react";

export default function BanUserModal({ user, mode, isOpen, onClose, onConfirm, isLoading }) {
  const [banDuration, setBanDuration] = useState("3_days");
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setBanDuration("3_days");
      setReason(mode === "unlock" ? "Mở khóa tài khoản" : "");
      setError("");
    }
  }, [isOpen, mode]);

  if (!isOpen || !user) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError("Vui lòng nhập lý do thực hiện.");
      return;
    }
    setError("");

    if (mode === "lock") {
      onConfirm({
        status: banDuration === "3_days" ? "SUSPENDED" : "BANNED",
        duration: banDuration,
        reason: reason.trim(),
      });
    } else {
      onConfirm({
        status: "ACTIVE",
        reason: reason.trim(),
      });
    }
  };

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
            mode === "lock" 
              ? "bg-rose-500/10 text-rose-500" 
              : "bg-[var(--color-primary)]/10 text-[var(--color-primary)]"
          }`}>
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-black uppercase tracking-wider text-[var(--text-color)]">
              {mode === "lock" ? "Khóa tài khoản" : "Mở khóa tài khoản"}
            </h3>
            <p className="text-[11px] font-bold text-[var(--text-muted)] mt-0.5">
              Thành viên: {user.profile?.fullName || user.email}
            </p>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "lock" ? (
            <>
              {/* Alert Warning Box */}
              <div className="p-3.5 rounded-2xl bg-rose-500/5 border border-rose-500/10 flex items-start gap-3 text-rose-400">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <p className="text-[11px] font-bold leading-normal">
                  Khóa tài khoản sẽ thu hồi tất cả phiên đăng nhập (Refresh Tokens). Người dùng này sẽ bị đăng xuất khỏi mọi thiết bị ngay lập tức.
                </p>
              </div>

              {/* Lock duration options */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-wider">Thời hạn khóa</label>
                <div className="grid grid-cols-2 gap-3">
                  <label className={`p-3 rounded-2xl border flex flex-col justify-center cursor-pointer transition-all ${
                    banDuration === "3_days"
                      ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5"
                      : "border-[var(--border-color)]/60 hover:border-[var(--border-color)] bg-[var(--bg-color)]/20"
                  }`}>
                    <input 
                      type="radio" 
                      name="duration" 
                      value="3_days"
                      checked={banDuration === "3_days"}
                      onChange={() => setBanDuration("3_days")}
                      className="sr-only"
                    />
                    <span className="text-xs font-black text-[var(--text-color)]">3 ngày</span>
                    <span className="text-[9px] font-bold text-[var(--text-muted)] mt-0.5">Khóa tạm thời</span>
                  </label>

                  <label className={`p-3 rounded-2xl border flex flex-col justify-center cursor-pointer transition-all ${
                    banDuration === "permanent"
                      ? "border-rose-500 bg-rose-500/5"
                      : "border-[var(--border-color)]/60 hover:border-[var(--border-color)] bg-[var(--bg-color)]/20"
                  }`}>
                    <input 
                      type="radio" 
                      name="duration" 
                      value="permanent"
                      checked={banDuration === "permanent"}
                      onChange={() => setBanDuration("permanent")}
                      className="sr-only"
                    />
                    <span className="text-xs font-black text-[var(--text-color)]">Vĩnh viễn</span>
                    <span className="text-[9px] font-bold text-[var(--text-muted)] mt-0.5">Banned vĩnh viễn</span>
                  </label>
                </div>
              </div>
            </>
          ) : (
            <div className="p-3.5 rounded-2xl bg-[var(--color-primary)]/5 border border-[var(--color-primary)]/10 flex items-start gap-3 text-[var(--color-primary)]">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <p className="text-[11px] font-bold leading-normal">
                Tài khoản sẽ được mở khóa hoạt động trở lại. Người dùng cần phải tự đăng nhập lại trên thiết bị của họ.
              </p>
            </div>
          )}

          {/* Reason input */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-wider">
              {mode === "lock" ? "Lý do khóa" : "Ghi chú lý do mở khóa"}
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={mode === "lock" ? "Nhập lý do chi tiết..." : "Nhập ghi chú chi tiết..."}
              rows={3}
              className="w-full px-3.5 py-3 rounded-2xl bg-[var(--bg-color)] border border-[var(--border-color)]/60 focus:border-[var(--color-primary)] focus:outline-none text-xs font-semibold text-[var(--text-color)] placeholder-[var(--text-muted)]/50 resize-none transition-all"
            />
            {error && (
              <p className="text-[10px] font-bold text-rose-500">{error}</p>
            )}
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
                mode === "lock"
                  ? "bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-500/10"
                  : "bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-black shadow-lg shadow-[#ccff00]/10"
              } disabled:opacity-50`}
            >
              {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {mode === "lock" ? "Khóa tài khoản" : "Mở khóa"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
