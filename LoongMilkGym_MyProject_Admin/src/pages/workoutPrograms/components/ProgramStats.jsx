import { Dumbbell, Eye, FileText } from "lucide-react";

export default function ProgramStats({ summaryStats, activeStatus = "", onStatusChange }) {
  const total = summaryStats?.total || 0;
  const published = summaryStats?.published || 0;
  const draft = summaryStats?.draft || 0;

  const statsList = [
    {
      label: "Tổng giáo án",
      value: total,
      icon: Dumbbell,
      status: "",
      color: "from-blue-500/20 to-indigo-500/20 text-indigo-400 border-indigo-500/30",
    },
    {
      label: "Đã xuất bản",
      value: published,
      icon: Eye,
      status: "true",
      color: "from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/30",
    },
    {
      label: "Bản nháp",
      value: draft,
      icon: FileText,
      status: "false",
      color: "from-amber-500/20 to-orange-500/20 text-amber-400 border-amber-500/30",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {statsList.map((stat, idx) => {
        const Icon = stat.icon;
        return (
          <button
            type="button"
            key={idx}
            onClick={() => onStatusChange?.(stat.status)}
            aria-pressed={activeStatus === stat.status}
            className={`p-5 rounded-2xl bg-gradient-to-br ${stat.color} border flex items-center justify-between shadow-md text-left transition-all cursor-pointer hover:-translate-y-0.5 hover:shadow-lg ${
              activeStatus === stat.status ? "ring-2 ring-[var(--color-primary)] ring-offset-2 ring-offset-[var(--bg-color)]" : ""
            }`}
          >
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider opacity-80">
                {stat.label}
              </span>
              <h3 className="text-2xl font-black">{stat.value}</h3>
            </div>
            <div className="p-3 rounded-xl bg-black/10 border border-white/5">
              <Icon className="w-5 h-5" />
            </div>
          </button>
        );
      })}
    </div>
  );
}
