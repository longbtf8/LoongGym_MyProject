import React from "react";
import { Calendar, Award, Phone, MapPin, Target } from "lucide-react";

export default function UserOverviewTab({ user }) {
  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6 animate-reactions-in">
      {/* Cards widget */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded-2xl bg-[var(--bg-color)]/60 border border-[var(--border-color)]/40 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-wider">Ngày tham gia</p>
            <p className="text-sm font-black text-[var(--text-color)] mt-0.5">
              {formatDate(user.createdAt)}
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[var(--bg-color)]/60 border border-[var(--border-color)]/40 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
            <Award className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-wider">Cấp độ</p>
            <p className="text-sm font-black text-[var(--color-primary)] mt-0.5">
              {user.profile?.membershipTier || "Standard"}
            </p>
          </div>
        </div>
      </div>

      {/* Personal details */}
      <div className="p-5 rounded-2xl bg-[var(--bg-color)]/60 border border-[var(--border-color)]/40 space-y-4">
        <h4 className="text-[11px] font-black uppercase text-[var(--text-color)] tracking-widest border-b border-[var(--border-color)]/40 pb-2 mb-2">
          Thông tin cá nhân
        </h4>
        
        <div className="flex items-start gap-3">
          <Phone className="w-4 h-4 text-[var(--text-muted)] mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-[10px] font-black text-[var(--text-muted)]">Số điện thoại</p>
            <p className="text-xs font-bold text-[var(--text-color)] mt-0.5">
              {user.profile?.phone || "Chưa cập nhật"}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <MapPin className="w-4 h-4 text-[var(--text-muted)] mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-[10px] font-black text-[var(--text-muted)]">Vị trí (Địa chỉ)</p>
            <p className="text-xs font-bold text-[var(--text-color)] mt-0.5">
              {user.profile?.address || "Chưa cập nhật"}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Target className="w-4 h-4 text-[var(--text-muted)] mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-[10px] font-black text-[var(--text-muted)]">Mục tiêu tập luyện</p>
            <p className="text-xs font-bold text-[var(--text-color)] mt-0.5">
              {user.profile?.goal || "Chưa thiết lập mục tiêu"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-[var(--border-color)]/30 mt-2">
          <div>
            <p className="text-[10px] font-black text-[var(--text-muted)]">Giới tính</p>
            <p className="text-xs font-bold text-[var(--text-color)] mt-0.5">
              {user.profile?.gender === "male" ? "Nam" : user.profile?.gender === "female" ? "Nữ" : "Khác/Chưa cập nhật"}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-black text-[var(--text-muted)]">Ngày sinh</p>
            <p className="text-xs font-bold text-[var(--text-color)] mt-0.5">
              {formatDate(user.profile?.birthDate)}
            </p>
          </div>
        </div>
      </div>

      {/* Account stats */}
      <div className="p-5 rounded-2xl bg-[var(--bg-color)]/60 border border-[var(--border-color)]/40 space-y-3">
        <h4 className="text-[11px] font-black uppercase text-[var(--text-color)] tracking-widest border-b border-[var(--border-color)]/40 pb-2">
          Thông tin tài khoản
        </h4>
        <div className="flex justify-between items-center text-xs">
          <span className="font-bold text-[var(--text-muted)]">Lần cuối đăng nhập</span>
          <span className="font-extrabold text-[var(--text-color)]">
            {user.lastLoginAt ? `${formatTime(user.lastLoginAt)} - ${formatDate(user.lastLoginAt)}` : "Chưa từng đăng nhập"}
          </span>
        </div>
        {user.status === "SUSPENDED" && user.suspendedUntil && (
          <div className="flex justify-between items-center text-xs text-amber-500">
            <span className="font-bold">Hạn khóa tạm thời đến</span>
            <span className="font-black">
              {formatTime(user.suspendedUntil)} - {formatDate(user.suspendedUntil)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
