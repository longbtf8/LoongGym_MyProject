import React from "react";
import { FileText, CheckCircle2, EyeOff, Flag } from "lucide-react";

export default function PostsStatsBar({ counts }) {
  const statsWidgets = [
    {
      label: "Tổng số bài đăng",
      value: counts?.total || 0,
      icon: FileText,
      color: "bg-blue-500/10 text-blue-400 border border-blue-500/20"
    },
    {
      label: "Đang hiển thị công khai",
      value: counts?.visible || 0,
      icon: CheckCircle2,
      color: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
    },
    {
      label: "Tạm ẩn vi phạm",
      value: counts?.hidden || 0,
      icon: EyeOff,
      color: "bg-amber-500/10 text-amber-400 border border-amber-500/20"
    },
    {
      label: "Bài viết bị báo cáo",
      value: counts?.withReports || 0,
      icon: Flag,
      color: "bg-rose-500/10 text-rose-400 border border-rose-500/20"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
