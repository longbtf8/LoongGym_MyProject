import React from "react";
import { ShoppingBag, CheckCircle, FileEdit, AlertTriangle, Archive } from "lucide-react";

export default function ProductStatsCards({ stats, activeStatusFilter, onStatusFilterChange }) {
  const productStats = stats?.products || {
    total: 0,
    active: 0,
    draft: 0,
    outOfStock: 0,
    archived: 0,
  };

  const cards = [
    {
      key: "all",
      title: "Tổng sản phẩm",
      value: productStats.total,
      icon: ShoppingBag,
      colorClass: "text-blue-500 bg-blue-500/10 border-blue-500/20",
      filterValue: "",
    },
    {
      key: "active",
      title: "Đang bán",
      value: productStats.active,
      icon: CheckCircle,
      colorClass: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
      filterValue: "active",
    },
    {
      key: "draft",
      title: "Bản nháp",
      value: productStats.draft,
      icon: FileEdit,
      colorClass: "text-amber-500 bg-amber-500/10 border-amber-500/20",
      filterValue: "draft",
    },
    {
      key: "out_of_stock",
      title: "Hết hàng",
      value: productStats.outOfStock,
      icon: AlertTriangle,
      colorClass: "text-orange-500 bg-orange-500/10 border-orange-500/20",
      filterValue: "out_of_stock",
    },
    {
      key: "archived",
      title: "Lưu trữ",
      value: productStats.archived,
      icon: Archive,
      colorClass: "text-neutral-500 bg-neutral-500/10 border-neutral-500/20",
      filterValue: "archived",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        const isActive = activeStatusFilter === card.filterValue;

        return (
          <button
            key={card.key}
            onClick={() => onStatusFilterChange(card.filterValue)}
            className={`p-4 rounded-2xl border text-left transition-all duration-300 relative overflow-hidden group cursor-pointer ${
              isActive
                ? "bg-[var(--border-color)]/25 border-emerald-500 shadow-md shadow-emerald-500/5 translate-y-[-2px]"
                : "bg-[var(--bg-secondary)] border-[var(--border-color)]/60 hover:border-[var(--border-color)] hover:shadow-lg hover:translate-y-[-2px]"
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-black uppercase text-[var(--text-muted)] tracking-wider">
                {card.title}
              </span>
              <div className={`p-2 rounded-xl border ${card.colorClass} transition-transform duration-300 group-hover:scale-110`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-xl sm:text-2xl font-black text-[var(--text-color)]">
                {card.value.toLocaleString("vi-VN")}
              </span>
              <span className="text-[10px] text-[var(--text-muted)] font-medium">SP</span>
            </div>
            {isActive && (
              <div className="absolute right-0 bottom-0 w-2 h-2 bg-emerald-500 rounded-tl-lg" />
            )}
          </button>
        );
      })}
    </div>
  );
}
