import React from "react";
import { Users, ShoppingBag, Receipt, Activity, TrendingUp, ArrowUpRight, ArrowDownRight } from "lucide-react";

export default function Dashboard() {
  const stats = [
    {
      label: "Tổng người dùng",
      value: "1,248",
      change: "+12.5%",
      isPositive: true,
      icon: Users,
      color: "from-blue-500/10 to-indigo-500/10",
      textColor: "text-blue-500",
    },
    {
      label: "Doanh thu tháng",
      value: "48,250,000 đ",
      change: "+18.2%",
      isPositive: true,
      icon: ShoppingBag,
      color: "from-emerald-500/10 to-teal-500/10",
      textColor: "text-emerald-500",
    },
    {
      label: "Đơn hàng mới",
      value: "84",
      change: "-3.1%",
      isPositive: false,
      icon: Receipt,
      color: "from-amber-500/10 to-orange-500/10",
      textColor: "text-amber-500",
    },
    {
      label: "Lượt luyện tập",
      value: "3,150",
      change: "+24.8%",
      isPositive: true,
      icon: Activity,
      color: "from-pink-500/10 to-rose-500/10",
      textColor: "text-rose-500",
    },
  ];

  const recentUsers = [
    { name: "Bùi Long", email: "long@loongmilkgym.com", date: "Vừa xong", status: "Active" },
    { name: "Nguyễn Văn A", email: "a.nguyen@gmail.com", date: "5 phút trước", status: "Active" },
    { name: "Trần Thị B", email: "b.tran@yahoo.com", date: "1 giờ trước", status: "Inactive" },
    { name: "Lê Văn C", email: "c.le@outlook.com", date: "3 giờ trước", status: "Active" },
  ];

  return (
    <div className="space-y-8 animate-reactions-in">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-black tracking-tight text-[var(--text-color)]">Tổng quan hệ thống</h2>
        <p className="text-xs sm:text-sm text-[var(--text-muted)] font-semibold mt-1">
          Theo dõi trạng thái và chỉ số vận hành của LoongMilkGym.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              className="p-6 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)]/60 shadow-lg flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">{stat.label}</span>
                <div className={`p-2.5 rounded-xl bg-gradient-to-br ${stat.color} ${stat.textColor}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-black text-[var(--text-color)] leading-tight">{stat.value}</h3>
                <div className="flex items-center gap-1 mt-2">
                  {stat.isPositive ? (
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                  ) : (
                    <TrendingUp className="w-3.5 h-3.5 text-rose-500 transform rotate-180" />
                  )}
                  <span className={`text-xs font-bold ${stat.isPositive ? "text-emerald-500" : "text-rose-500"}`}>
                    {stat.change}
                  </span>
                  <span className="text-[10px] font-bold text-[var(--text-muted)]">so với tuần trước</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Details Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Operations Progress */}
        <div className="p-6 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)]/60 shadow-lg lg:col-span-2">
          <h3 className="text-base font-black text-[var(--text-color)] mb-4">Mục tiêu vận hành tháng</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span>Người dùng đăng ký mới</span>
                <span>85%</span>
              </div>
              <div className="h-2 w-full bg-[var(--border-color)]/60 rounded-full overflow-hidden">
                <div className="h-full bg-[var(--color-primary)] rounded-full" style={{ width: "85%" }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span>Chỉ tiêu doanh thu</span>
                <span>62%</span>
              </div>
              <div className="h-2 w-full bg-[var(--border-color)]/60 rounded-full overflow-hidden">
                <div className="h-full bg-cyan-500 rounded-full" style={{ width: "62%" }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span>Lượt phản hồi AI tích cực</span>
                <span>94%</span>
              </div>
              <div className="h-2 w-full bg-[var(--border-color)]/60 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: "94%" }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: New Members */}
        <div className="p-6 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)]/60 shadow-lg">
          <h3 className="text-base font-black text-[var(--text-color)] mb-4">Thành viên mới đăng ký</h3>
          <div className="divide-y divide-[var(--border-color)]/60">
            {recentUsers.map((user, idx) => (
              <div key={idx} className="py-3 flex items-center justify-between first:pt-0 last:pb-0">
                <div>
                  <h4 className="text-xs font-black text-[var(--text-color)]">{user.name}</h4>
                  <p className="text-[10px] text-[var(--text-muted)] font-semibold mt-0.5">{user.email}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-[var(--text-muted)] block">{user.date}</span>
                  <span className={`inline-block text-[9px] font-bold px-1.5 py-0.5 rounded-full mt-1 ${
                    user.status === "Active" ? "bg-emerald-500/10 text-emerald-500" : "bg-gray-500/10 text-gray-500"
                  }`}>
                    {user.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
