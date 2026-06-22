import React from "react";
import { Search, Filter, ShieldCheck, Mail, Calendar } from "lucide-react";

export default function Users() {
  const users = [
    { id: 1, name: "Bùi Long", email: "long@loonggym.com", role: "Quản trị viên", date: "20-05-2026", status: "Active" },
    { id: 2, name: "Nguyễn Văn A", email: "a.nguyen@gmail.com", role: "Hội viên", date: "15-06-2026", status: "Active" },
    { id: 3, name: "Trần Thị B", email: "b.tran@yahoo.com", role: "Hội viên Premium", date: "10-06-2026", status: "Inactive" },
    { id: 4, name: "Lê Văn C", email: "c.le@outlook.com", role: "Hội viên", date: "01-06-2026", status: "Active" },
  ];

  return (
    <div className="space-y-6 animate-reactions-in">
      <div>
        <h2 className="text-2xl font-black tracking-tight text-[var(--text-color)]">Quản lý người dùng</h2>
        <p className="text-xs sm:text-sm text-[var(--text-muted)] font-semibold mt-1">
          Xem danh sách hội viên, phân quyền tài khoản và quản lý trạng thái hoạt động.
        </p>
      </div>

      {/* Control bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="Tìm kiếm người dùng..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)]/60 text-xs font-bold outline-none text-[var(--text-color)] focus:border-[var(--input-focus-border)] transition-all"
          />
        </div>
        <button className="w-full sm:w-auto px-4 py-2 border border-[var(--border-color)] text-[var(--text-color)] bg-[var(--bg-secondary)] rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer hover:bg-[var(--border-color)]/30 transition-all">
          <Filter className="w-4 h-4" /> Bộ lọc
        </button>
      </div>

      {/* Users table */}
      <div className="overflow-x-auto rounded-2xl border border-[var(--border-color)]/60 bg-[var(--bg-secondary)] shadow-lg">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-[var(--border-color)]/60 bg-[var(--border-color)]/20 text-xs font-bold text-[var(--text-muted)]">
              <th className="p-4">Họ và tên</th>
              <th className="p-4">Email</th>
              <th className="p-4">Vai trò</th>
              <th className="p-4">Ngày đăng ký</th>
              <th className="p-4">Trạng thái</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-color)]/60 text-xs font-semibold text-[var(--text-color)]">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-[var(--border-color)]/10 transition-colors">
                <td className="p-4 font-black">{user.name}</td>
                <td className="p-4 text-[var(--text-muted)] flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5" /> {user.email}
                </td>
                <td className="p-4">
                  <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    user.role.includes("Quản trị") ? "bg-[var(--color-primary)]/10 text-[var(--text-primary)]" : "bg-cyan-500/10 text-cyan-500"
                  }`}>
                    {user.role.includes("Quản trị") && <ShieldCheck className="w-3.5 h-3.5" />}
                    {user.role}
                  </span>
                </td>
                <td className="p-4 text-[var(--text-muted)]">
                  <span className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5" /> {user.date}
                  </span>
                </td>
                <td className="p-4">
                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-bold ${
                    user.status === "Active" ? "bg-emerald-500/10 text-emerald-500" : "bg-gray-500/10 text-gray-500"
                  }`}>
                    {user.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
