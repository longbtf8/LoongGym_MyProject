import React, { useState } from "react";
import { Link } from "react-router-dom";
import { 
  X, Mail, ShieldAlert, UserX, UserCheck, Loader2
} from "lucide-react";
import { useGetUserDetailQuery } from "@/services/admin/adminApi";
import StatusBadge from "@/components/common/StatusBadge";
import UserOverviewTab from "./UserOverviewTab";
import UserActivityTab from "./UserActivityTab";
import UserModerationTab from "./UserModerationTab";

export default function UserDetailDrawer({ userId, isOpen, onClose, onLockClick, onUnlockClick, onRoleChangeClick, currentAdminId, isCurrentUserSuperAdmin, onPostClick }) {
  const [activeTab, setActiveTab] = useState("overview");
  
  const { data, isLoading, isError, refetch } = useGetUserDetailQuery(userId, {
    skip: !userId || !isOpen,
  });

  if (!isOpen) return null;

  const detail = data?.data;
  const user = detail?.user;

  const isSelf = user?.id === currentAdminId;
  const canModifyRole = user && !isSelf && !user.isSuperAdmin && isCurrentUserSuperAdmin;
  const canModifyStatus = user && !isSelf && !user.isSuperAdmin && (user.role !== "ADMIN" || isCurrentUserSuperAdmin);

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90] transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Drawer Body */}
      <div className="fixed right-0 top-0 bottom-0 w-full sm:w-[500px] bg-[var(--bg-secondary)] border-l border-[var(--border-color)]/60 z-[100] flex flex-col shadow-2xl animate-slide-in no-scrollbar">
        
        {/* Header */}
        <div className="p-6 border-b border-[var(--border-color)]/60 flex justify-between items-start">
          <div className="flex items-center gap-4 min-w-0">
            {user?.profile?.avatarUrl ? (
              <img 
                src={user.profile.avatarUrl} 
                alt={user.profile.fullName || "User Avatar"} 
                className="w-14 h-14 rounded-full object-cover border-2 border-[var(--color-primary)]/20 shadow-md flex-shrink-0"
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-[var(--border-color)] flex items-center justify-center text-lg font-black text-[var(--text-color)] border-2 border-[var(--border-color)]/50 flex-shrink-0">
                {user?.profile?.fullName?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <h3 className="text-lg font-black text-[var(--text-color)] truncate">
                {user?.profile?.fullName || "Chưa thiết lập tên"}
              </h3>
              <p className="text-xs text-[var(--text-muted)] font-semibold truncate flex items-center gap-1.5 mt-0.5">
                <Mail className="w-3.5 h-3.5" />
                {user?.email}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <StatusBadge 
                  status={user?.status === "ACTIVE" ? "Đang hoạt động" : user?.status === "SUSPENDED" ? "Bị khóa tạm thời" : "Khóa vĩnh viễn"}
                  type={user?.status === "ACTIVE" ? "success" : user?.status === "SUSPENDED" ? "warning" : "danger"}
                />
                {user?.isSuperAdmin ? (
                  <span className="px-2 py-0.5 rounded text-[10px] font-black tracking-wide bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-[0_0_8px_rgba(245,158,11,0.15)]">
                    SUPER ADMIN
                  </span>
                ) : (
                  <span className={`px-2 py-0.5 rounded text-[10px] font-black tracking-wide ${
                    user?.role === "ADMIN" ? "bg-purple-500/10 text-purple-400 border border-purple-500/20" : "bg-[var(--border-color)] text-[var(--text-muted)]"
                  }`}>
                    {user?.role}
                  </span>
                )}
              </div>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl bg-[var(--border-color)]/40 text-[var(--text-muted)] hover:text-[var(--text-color)] hover:bg-[var(--border-color)]/70 transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Controls */}
        <div className="flex border-b border-[var(--border-color)]/40 px-6">
          {[
            { id: "overview", label: "Tổng quan" },
            { id: "activity", label: "Hoạt động" },
            { id: "moderation", label: "Kiểm duyệt" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-3 px-4 text-xs font-black relative cursor-pointer transition-colors ${
                activeTab === tab.id 
                  ? "text-[var(--color-primary)]" 
                  : "text-[var(--text-muted)] hover:text-[var(--text-color)]"
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--color-primary)] rounded-full animate-reactions-in" />
              )}
            </button>
          ))}
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
          {isLoading && (
            <div className="h-48 flex flex-col items-center justify-center space-y-3">
              <Loader2 className="w-8 h-8 text-[var(--color-primary)] animate-spin" />
              <p className="text-xs font-bold text-[var(--text-muted)]">Đang tải thông tin chi tiết...</p>
            </div>
          )}

          {isError && (
            <div className="py-8 text-center space-y-3">
              <ShieldAlert className="w-10 h-10 text-rose-500 mx-auto" />
              <p className="text-xs font-bold text-[var(--text-color)]">Đã xảy ra lỗi khi tải dữ liệu người dùng.</p>
              <button 
                onClick={refetch}
                className="px-4 py-2 rounded-xl bg-[var(--color-primary)] text-black text-xs font-extrabold cursor-pointer"
              >
                Thử lại
              </button>
            </div>
          )}

          {!isLoading && !isError && user && (
            <>
              {activeTab === "overview" && <UserOverviewTab user={user} />}
              {activeTab === "activity" && (
                <UserActivityTab 
                  detail={detail} 
                  user={user} 
                  onPostClick={onPostClick} 
                  onClose={onClose} 
                />
              )}
              {activeTab === "moderation" && <UserModerationTab detail={detail} />}
            </>
          )}
        </div>

        {/* Footer actions */}
        {!isLoading && !isError && user && (
          <div className="p-6 border-t border-[var(--border-color)]/60 bg-[var(--bg-color)]/30 flex gap-3">
            {isSelf ? (
              <p className="text-[11px] font-bold text-[var(--text-muted)] italic text-center w-full">
                Bạn không thể thao tác khóa tài khoản của chính mình.
              </p>
            ) : user.isSuperAdmin ? (
              <p className="text-[11px] font-bold text-amber-500 italic text-center w-full">
                Tài khoản Admin tối cao (Super Admin) được bảo vệ toàn diện.
              </p>
            ) : (!canModifyRole && user.role === "ADMIN") ? (
              <p className="text-[11px] font-bold text-purple-400 italic text-center w-full">
                Chỉ Admin tối cao (Super Admin) mới có quyền thao tác tài khoản Admin này.
              </p>
            ) : (
              <>
                {canModifyRole && (
                  <button
                    onClick={() => onRoleChangeClick(user)}
                    className="flex-1 py-3 px-4 rounded-2xl bg-purple-500 hover:bg-purple-650 text-white text-xs font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-purple-500/10"
                  >
                    <ShieldAlert className="w-4 h-4" />
                    {user.role === "ADMIN" ? "Hạ quyền User" : "Nâng quyền Admin"}
                  </button>
                )}

                {canModifyStatus && (
                  user.status === "ACTIVE" ? (
                    <button
                      onClick={() => onLockClick(user)}
                      className="flex-1 py-3 px-4 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-rose-500/10"
                    >
                      <UserX className="w-4 h-4" />
                      Khóa tài khoản
                    </button>
                  ) : (
                    <button
                      onClick={() => onUnlockClick(user)}
                      className="flex-1 py-3 px-4 rounded-2xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-black text-xs font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-[#ccff00]/10"
                    >
                      <UserCheck className="w-4 h-4" />
                      Mở khóa tài khoản
                    </button>
                  )
                )}
              </>
            )}
          </div>
        )}
      </div>
    </>
  );
}
