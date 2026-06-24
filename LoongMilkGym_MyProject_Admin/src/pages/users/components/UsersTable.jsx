import React from "react";
import { Users, Eye, Shield } from "lucide-react";
import StatusBadge from "@/components/common/StatusBadge";
import Pagination from "@/components/common/Pagination";

export default function UsersTable({
  usersList,
  isLoading,
  onOpenDetail,
  formatDateStr,
  currentAdminId,
  isCurrentUserSuperAdmin,
  onRoleChangeClick,
  pagination,
  currentPage,
  limit,
  onPageChange,
}) {
  return (
    <div className="rounded-3xl bg-[var(--bg-secondary)] border border-[var(--border-color)]/60 shadow-lg">
      <div className="overflow-x-auto no-scrollbar min-h-[300px]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[var(--border-color)]/50 bg-[var(--bg-color)]/30">

              <th className="p-4 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-wider">Người dùng</th>
              <th className="p-4 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-wider">Email</th>
              <th className="p-4 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-wider">Vai trò</th>
              <th className="p-4 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-wider">Trạng thái</th>
              <th className="p-4 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-wider text-center">Bài viết</th>
              <th className="p-4 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-wider text-center">Buổi tập</th>
              <th className="p-4 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-wider">Lần cuối đăng nhập</th>
              <th className="p-4 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-wider text-right">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <tr key={idx} className="animate-pulse">

                  <td className="p-4">
                    <div className="flex gap-2">
                      <div className="w-9 h-9 bg-[var(--border-color)]/60 rounded-full" />
                      <div className="space-y-1.5 flex-1">
                        <div className="h-4 w-32 bg-[var(--border-color)]/60 rounded" />
                        <div className="h-3 w-16 bg-[var(--border-color)]/40 rounded" />
                      </div>
                    </div>
                  </td>
                  <td className="p-4"><div className="h-4 w-32 bg-[var(--border-color)]/60 rounded" /></td>
                  <td className="p-4"><div className="h-5 w-16 bg-[var(--border-color)]/60 rounded-full" /></td>
                  <td className="p-4"><div className="h-5 w-16 bg-[var(--border-color)]/60 rounded-full" /></td>
                  <td className="p-4 text-center"><div className="h-4 w-8 bg-[var(--border-color)]/60 rounded mx-auto" /></td>
                  <td className="p-4 text-center"><div className="h-4 w-8 bg-[var(--border-color)]/60 rounded mx-auto" /></td>
                  <td className="p-4"><div className="h-4 w-24 bg-[var(--border-color)]/60 rounded" /></td>
                  <td className="p-4 text-right"><div className="h-8 w-16 bg-[var(--border-color)]/60 rounded-xl ml-auto" /></td>
                </tr>
              ))
            ) : usersList.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-12 text-center">
                  <div className="flex flex-col items-center justify-center gap-3 text-[var(--text-muted)]">
                    <Users className="w-12 h-12 text-[var(--text-muted)]/60" />
                    <p className="text-xs font-black uppercase tracking-wider">
                      Không tìm thấy người dùng phù hợp.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              usersList.map((user) => {
                return (
                  <tr 
                    key={user.id} 
                    className="border-b border-[var(--border-color)]/40 hover:bg-[var(--border-color)]/10 transition-colors cursor-pointer group"
                    onClick={() => onOpenDetail(user.id)}
                  >

                    {/* Name & Avatar */}
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {user.profile?.avatarUrl ? (
                          <img 
                            src={user.profile.avatarUrl} 
                            alt={user.profile.fullName} 
                            className="w-9 h-9 rounded-full object-cover border border-[var(--border-color)]/60"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-[var(--border-color)] flex items-center justify-center text-xs font-black text-[var(--text-color)] border border-[var(--border-color)]/80">
                            {(user.profile?.fullName || user.email || "U").charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-xs font-black text-[var(--text-color)] group-hover:text-[var(--color-primary)] transition-colors truncate">
                            {user.profile?.fullName || "Chưa đặt tên"}
                          </p>
                          <span className="text-[9px] font-bold text-[var(--text-muted)]">ID: {user.id.substring(0, 8)}...</span>
                        </div>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="p-4 text-xs font-bold text-[var(--text-color)] truncate max-w-[150px]">
                      {user.email}
                    </td>

                    {/* Role */}
                    <td className="p-4 text-xs">
                      {user.isSuperAdmin ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-black tracking-wide bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-[0_0_8px_rgba(245,158,11,0.15)]">
                          SUPER ADMIN
                        </span>
                      ) : (
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black tracking-wide ${
                          user.role === "ADMIN" 
                            ? "bg-purple-500/10 text-purple-400 border border-purple-500/20" 
                            : "bg-[var(--border-color)] text-[var(--text-muted)]"
                        }`}>
                          {user.role}
                        </span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="p-4 text-xs">
                    <StatusBadge 
                      status={user.status === "ACTIVE" ? "Đang hoạt động" : user.status === "SUSPENDED" ? "Bị khóa" : "Bị cấm"}
                      type={user.status === "ACTIVE" ? "success" : user.status === "SUSPENDED" ? "warning" : "error"}
                    />
                    </td>

                    {/* Posts count */}
                    <td className="p-4 text-center text-xs font-black text-[var(--text-color)]">
                      {user._count?.communityPosts || 0}
                    </td>

                    {/* Workout sessions count */}
                    <td className="p-4 text-center text-xs font-black text-[var(--text-color)]">
                      {user._count?.workoutSessions || 0}
                    </td>

                    {/* Last login date */}
                    <td className="p-4 text-xs font-bold text-[var(--text-color)]">
                      {user.lastLoginAt ? formatDateStr(user.lastLoginAt) : "Chưa từng đăng nhập"}
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-2 justify-end">
                        <button
                          onClick={() => onOpenDetail(user.id)}
                          className="p-2 rounded-xl bg-[var(--border-color)]/40 hover:bg-[var(--color-primary)] hover:text-black text-[var(--text-muted)] transition-all cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span className="text-[10px] font-black hidden sm:inline">Xem</span>
                        </button>
                        {user.id !== currentAdminId && !user.isSuperAdmin && isCurrentUserSuperAdmin && (
                          <button
                            onClick={() => onRoleChangeClick(user)}
                            className="p-2 rounded-xl bg-purple-500/10 hover:bg-purple-500 hover:text-white text-purple-400 border border-purple-500/20 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                            title={user.role === "ADMIN" ? "Hạ vai trò xuống USER" : "Nâng vai trò lên ADMIN"}
                          >
                            <Shield className="w-3.5 h-3.5" />
                            <span className="text-[10px] font-black hidden sm:inline">Đổi quyền</span>
                          </button>
                        )}
                      </div>
                    </td>

                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      {pagination && pagination.totalPages > 1 && (
        <Pagination
          pagination={pagination}
          currentPage={currentPage}
          limit={limit}
          onPageChange={onPageChange}
          label="người dùng"
        />
      )}
    </div>
  );
}
