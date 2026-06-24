import React from "react";
import { Users, CheckCircle2, UserX } from "lucide-react";

export default function UsersStatsBar({ userStats }) {
  const statsWidgets = [
    { label: "Tổng người dùng", value: userStats?.total || 0, icon: Users, color: "text-blue-500 bg-blue-500/10 border-blue-500/20" },
    { label: "Đang hoạt động", value: userStats?.active || 0, icon: CheckCircle2, color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" },
    { label: "Đang bị khóa", value: userStats?.suspended || 0, icon: UserX, color: "text-rose-500 bg-rose-500/10 border-rose-500/20" }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
      {statsWidgets.map((w, i) => {
        const Icon = w.icon;
        return (
          <div key={i} className="p-4 rounded-3xl bg-[var(--bg-secondary)] border border-[var(--border-color)]/60 flex items-center justify-between shadow-sm">
            <div className="space-y-1">
              <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-wider">{w.label}</span>
              <p className="text-2xl font-black text-[var(--text-color)]">{w.value.toLocaleString()}</p>
            </div>
            <div className={`p-2.5 rounded-2xl border ${w.color} flex items-center justify-center`}>
              <Icon className="w-5 h-5" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
