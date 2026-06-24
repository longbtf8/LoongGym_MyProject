import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Users, 
  MessageSquare, 
  ShieldAlert, 
  ShoppingBag, 
  Dumbbell, 
  RefreshCw, 
  Clock, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2, 
  Activity, 
  ChevronRight 
} from "lucide-react";
import PageHeader from "@/components/common/PageHeader";
import StatusBadge from "@/components/common/StatusBadge";
import { useGetDashboardQuery } from "@/services/admin/adminApi";
import paths from "@/config/path";

export default function DashboardPage() {
  const { data, isLoading, isError, isFetching, refetch } = useGetDashboardQuery();
  const navigate = useNavigate();
  const [lastUpdated, setLastUpdated] = useState("");

  useEffect(() => {
    if (data) {
      const now = new Date();
      const pad = (n) => String(n).padStart(2, "0");
      setLastUpdated(`${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`);
    }
  }, [data]);

  const stats = data?.data;

  // 1. Loading State
  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <div className="h-8 w-48 bg-[var(--border-color)]/60 rounded-lg"></div>
            <div className="h-4 w-72 bg-[var(--border-color)]/60 rounded-lg"></div>
          </div>
          <div className="h-10 w-24 bg-[var(--border-color)]/60 rounded-xl"></div>
        </div>

        {/* Stat Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-32 rounded-3xl bg-[var(--bg-secondary)] border border-[var(--border-color)]/40 p-6 flex flex-col justify-between">
              <div className="flex justify-between items-center">
                <div className="h-4 w-24 bg-[var(--border-color)]/60 rounded"></div>
                <div className="h-8 w-8 rounded-full bg-[var(--border-color)]/60"></div>
              </div>
              <div className="h-8 w-16 bg-[var(--border-color)]/60 rounded"></div>
              <div className="h-3 w-32 bg-[var(--border-color)]/60 rounded"></div>
            </div>
          ))}
        </div>

        {/* Bottom grid skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 h-96 rounded-3xl bg-[var(--bg-secondary)] border border-[var(--border-color)]/40 p-6"></div>
          <div className="lg:col-span-8 h-96 rounded-3xl bg-[var(--bg-secondary)] border border-[var(--border-color)]/40 p-6"></div>
        </div>
      </div>
    );
  }

  // 2. Error State
  if (isError) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6 space-y-6">
        <div className="w-16 h-16 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center shadow-lg border border-rose-500/20">
          <AlertCircle className="w-8 h-8" />
        </div>
        <div className="space-y-2 max-w-md">
          <h3 className="text-lg font-black text-[var(--text-color)]">Không thể tải dữ liệu Dashboard</h3>
          <p className="text-xs text-[var(--text-muted)] font-semibold">
            Đã có lỗi xảy ra trong quá trình lấy thông tin tổng quan hệ thống. Vui lòng kiểm tra lại kết nối mạng hoặc thử lại.
          </p>
        </div>
        <button
          onClick={refetch}
          className="px-5 py-2.5 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-black text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-primary/20"
        >
          <RefreshCw className="w-4 h-4" /> Thử lại ngay
        </button>
      </div>
    );
  }

  // Helper formats
  const formatNumber = (num) => new Intl.NumberFormat().format(num || 0);

  const statCards = [
    {
      title: "TỔNG NGƯỜI DÙNG",
      value: formatNumber(stats?.users?.total),
      subtitle: `${formatNumber(stats?.users?.active)} tài khoản đang hoạt động`,
      icon: Users,
      colorClass: "text-blue-500 bg-blue-500/10 border-blue-500/20",
      linkTo: paths.USERS,
    },
    {
      title: "NGƯỜI DÙNG HOẠT ĐỘNG",
      value: formatNumber(stats?.users?.active),
      subtitle: `${formatNumber(stats?.users?.suspended)} tài khoản bị khóa`,
      icon: CheckCircle2,
      colorClass: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
      linkTo: `${paths.USERS}?status=ACTIVE`,
    },
    {
      title: "TỔNG BÀI VIẾT",
      value: formatNumber(stats?.posts?.total),
      subtitle: `${formatNumber(stats?.posts?.visible)} bài viết đang hiển thị`,
      icon: MessageSquare,
      colorClass: "text-indigo-500 bg-indigo-500/10 border-indigo-500/20",
      linkTo: paths.POSTS,
    },
    {
      title: "REPORT ĐANG CHỜ",
      value: formatNumber(stats?.reports?.pending),
      subtitle: `${formatNumber(stats?.reports?.resolved)} báo cáo đã xử lý`,
      icon: ShieldAlert,
      colorClass: "text-amber-500 bg-amber-500/10 border-amber-500/20",
      alert: (stats?.reports?.pending || 0) > 0,
      linkTo: `${paths.REPORTS}?status=PENDING`,
    },
    {
      title: "TỔNG SẢN PHẨM",
      value: formatNumber(stats?.products?.total),
      subtitle: `${formatNumber(stats?.products?.active)} đang bán, ${formatNumber(stats?.products?.outOfStock)} hết hàng`,
      icon: ShoppingBag,
      colorClass: "text-pink-500 bg-pink-500/10 border-pink-500/20",
      linkTo: paths.PRODUCTS,
    },
    {
      title: "GIÁO ÁN ĐÃ XUẤT BẢN",
      value: formatNumber(stats?.workoutPrograms?.published),
      subtitle: `${formatNumber(stats?.workoutPrograms?.unpublished)} giáo án nháp`,
      icon: Dumbbell,
      colorClass: "text-[#ccff00] bg-[#ccff00]/10 border-[#ccff00]/20",
      linkTo: `${paths.WORKOUT_PROGRAMS}?published=true`,
    },
  ];

  return (
    <div className="space-y-6 animate-reactions-in">
      {/* Top Header Block */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-[var(--text-color)]">Tổng quan hệ thống</h2>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] font-semibold mt-1">
            Quản lý hoạt động, nội dung và dữ liệu của LoongMilkGym.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {lastUpdated && (
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)]/60 text-[10px] sm:text-xs font-bold text-[var(--text-muted)]">
              <Clock className="w-3.5 h-3.5" />
              Cập nhật lúc: {lastUpdated}
            </div>
          )}
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="px-4 py-2 rounded-xl bg-[var(--color-primary)] text-black hover:bg-[var(--color-primary-hover)] disabled:bg-[var(--color-primary)]/40 text-xs font-extrabold flex items-center gap-2 shadow-lg shadow-[#ccff00]/10 transition-all cursor-pointer select-none"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? "animate-spin" : ""}`} />
            Làm mới
          </button>
        </div>
      </div>

      {/* Stats Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <Link
              key={idx}
              to={card.linkTo}
              className={`rounded-3xl bg-[var(--bg-secondary)] border border-[var(--border-color)]/60 p-6 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-[var(--color-primary)]/40 hover:shadow-[var(--color-primary)]/5 group cursor-pointer ${
                card.alert ? "relative overflow-hidden before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1.5 before:bg-amber-500" : ""
              }`}
            >
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-black text-[var(--text-muted)] tracking-wider group-hover:text-[var(--text-color)] transition-colors">
                  {card.title}
                </span>
                <div className={`p-2 rounded-2xl border ${card.colorClass} flex items-center justify-center transition-all group-hover:scale-110 duration-300`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="my-2">
                <span className="text-3xl font-black text-[var(--text-color)] tracking-tight group-hover:text-[var(--color-primary)] transition-colors">
                  {card.value}
                </span>
              </div>
              <div className="flex justify-between items-center mt-1">
                <p className="text-[11px] font-bold text-[var(--text-muted)] truncate max-w-[85%]">
                  {card.subtitle}
                </p>
                <ChevronRight className="w-3.5 h-3.5 text-[var(--text-muted)] opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Main split sections */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left column: Recent Admin logs */}
        <div className="lg:col-span-4 rounded-3xl bg-[var(--bg-secondary)] border border-[var(--border-color)]/60 p-6 flex flex-col justify-between shadow-lg">
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-[var(--border-color)]/60 pb-3">
              <Activity className="w-4 h-4 text-[var(--color-primary)]" />
              <h3 className="text-xs font-black uppercase text-[var(--text-color)] tracking-wider">
                Hoạt động gần đây
              </h3>
            </div>

            {/* Logs List */}
            {(!stats?.recentActivities || stats.recentActivities.length === 0) ? (
              <div className="py-8 flex flex-col items-center justify-center text-center space-y-2">
                <Activity className="w-8 h-8 text-[var(--text-muted)]/40" />
                <p className="text-xs font-semibold text-[var(--text-muted)]">Chưa có lịch sử hoạt động nào.</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1 no-scrollbar">
                {stats.recentActivities.map((act) => (
                  <div key={act.id} className="flex items-start gap-3 p-3 rounded-2xl bg-[var(--bg-color)]/60 border border-[var(--border-color)]/30 hover:border-[var(--border-color)]/70 transition-all">
                    <div className="w-2 h-2 rounded-full bg-[var(--color-primary)] mt-1.5 flex-shrink-0 animate-pulse" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-[var(--text-color)] leading-normal break-words">
                        {act.description}
                      </p>
                      <span className="text-[9px] font-extrabold text-[var(--text-muted)] mt-1 block">
                        {new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(act.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="pt-4 border-t border-[var(--border-color)]/40 mt-4 text-center">
            <span className="text-[10px] font-black text-[var(--text-muted)]">
              Nhật ký tự động dọn dẹp sau 30 ngày
            </span>
          </div>
        </div>

        {/* Right column: Recent Reports */}
        <div className="lg:col-span-8 rounded-3xl bg-[var(--bg-secondary)] border border-[var(--border-color)]/60 p-6 flex flex-col justify-between shadow-lg">
          <div>
            <div className="flex justify-between items-center border-b border-[var(--border-color)]/60 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-500" />
                <h3 className="text-xs font-black uppercase text-[var(--text-color)] tracking-wider">
                  Báo cáo mới nhất
                </h3>
              </div>
              <Link
                to={paths.REPORTS}
                className="flex items-center gap-1 text-[10px] font-black text-[var(--text-primary)] hover:underline cursor-pointer select-none"
              >
                Xem tất cả
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Reports content */}
            {(!stats?.recentReports || stats.recentReports.length === 0) ? (
              <div className="py-16 flex flex-col items-center justify-center text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-black text-[var(--text-color)]">Hệ thống an toàn</h4>
                  <p className="text-xs font-semibold text-[var(--text-muted)]">Hiện không có báo cáo nào cần xử lý.</p>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto no-scrollbar">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[var(--border-color)]/50">
                      <th className="py-2 text-[10px] font-black text-[var(--text-muted)] tracking-wider">Bài viết</th>
                      <th className="py-2 text-[10px] font-black text-[var(--text-muted)] tracking-wider">Người đăng</th>
                      <th className="py-2 text-[10px] font-black text-[var(--text-muted)] tracking-wider">Lý do</th>
                      <th className="py-2 text-[10px] font-black text-[var(--text-muted)] tracking-wider">Người báo cáo</th>
                      <th className="py-2 text-[10px] font-black text-[var(--text-muted)] tracking-wider text-center">Trạng thái</th>
                      <th className="py-2 text-[10px] font-black text-[var(--text-muted)] tracking-wider text-right">Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentReports.map((report) => (
                      <tr 
                        key={report.id} 
                        className="border-b border-[var(--border-color)]/40 hover:bg-[var(--border-color)]/10 transition-colors"
                      >
                        <td className="py-3 pr-3 max-w-[200px]">
                          <p className="text-xs font-extrabold text-[var(--text-color)] truncate">
                            {report.post?.contentPreview}
                          </p>
                          {report.totalReportsOnPost > 1 && (
                            <span className="inline-block mt-0.5 px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-500 text-[8px] font-black">
                              {report.totalReportsOnPost} báo cáo
                            </span>
                          )}
                        </td>
                        <td className="py-3 pr-3 text-xs font-bold text-[var(--text-color)] truncate">
                          {report.post?.authorName}
                        </td>
                        <td className="py-3 pr-3 text-xs font-semibold text-[var(--text-muted)] truncate max-w-[120px]">
                          {report.reason || "Không có lý do chi tiết"}
                        </td>
                        <td className="py-3 pr-3 text-xs font-bold text-[var(--text-color)] truncate">
                          {report.reporterName}
                        </td>
                        <td className="py-3 text-center">
                          <StatusBadge 
                            status={report.status === "pending" ? "Đang chờ" : "Đã xử lý"}
                            type={report.status === "pending" ? "warning" : "success"}
                          />
                        </td>
                        <td className="py-3 text-right">
                          <button
                            onClick={() => navigate(`${paths.REPORTS}?status=${report.status.toUpperCase()}&reportId=${report.id}`)}
                            className="px-3 py-1.5 rounded-lg bg-[var(--border-color)]/50 hover:bg-[var(--border-color)] text-[10px] font-black text-[var(--text-color)] transition-all cursor-pointer"
                          >
                            Xem
                          </button>

                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

