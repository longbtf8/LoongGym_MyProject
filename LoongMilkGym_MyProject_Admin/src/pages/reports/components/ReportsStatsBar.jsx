import React from "react";
import { Flag, AlertTriangle, CheckCircle2 } from "lucide-react";

export default function ReportsStatsBar({ reportsStats }) {
  const statsWidgets = [
    {
      label: "Tổng số báo cáo",
      value: reportsStats?.total || 0,
      icon: Flag,
      color: "bg-blue-500/10 text-blue-400 border border-blue-500/20"
    },
    {
      label: "Đang chờ giải quyết",
      value: reportsStats?.pending || 0,
      icon: AlertTriangle,
      color: "bg-orange-500/10 text-orange-400 border border-orange-500/20"
    },
    {
      label: "Báo cáo đã xử lý",
      value: reportsStats?.resolved || 0,
      icon: CheckCircle2,
      color: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
    }
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
            <div className={`p-2.5 rounded-2xl ${w.color} flex items-center justify-center`}>
              <Icon className="w-5 h-5" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
