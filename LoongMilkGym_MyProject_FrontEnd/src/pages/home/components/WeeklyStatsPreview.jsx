import React from "react";
import { useNavigate } from "react-router-dom";
import { Clock, Flame, Award, ShieldAlert, Lock } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useGetDashboardSummaryQuery } from "@/services/dashboard/dashboardApi";
import paths from "@/config/path";

function WeeklyStatsPreview() {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();

  // Fetch dashboard stats if logged in
  const { data: responseData, isLoading } = useGetDashboardSummaryQuery(undefined, {
    skip: !isLoggedIn,
    refetchOnMountOrArgChange: true,
  });

  const apiStats = responseData?.data?.stats;
  const statsReady = isLoggedIn && apiStats && !isLoading;

  // Compute stats dynamically or fallback to mock data
  const stats = [
    {
      title: "Tổng số phút tập luyện",
      value: statsReady ? `${apiStats.totalWorkoutMinutesThisWeek} phút` : (isLoggedIn ? "..." : "180 phút"),
      icon: Clock,
      color: "bg-primary text-primary",
      bars: statsReady ? apiStats.weeklyWorkoutMinutesMap : (isLoggedIn ? [0, 0, 0, 0, 0, 0, 0] : [30, 45, 60, 20, 0, 50, 40]), // Mon-Sun
      label: statsReady ? "Tuần này" : (isLoggedIn ? "Đang tải..." : "Dữ liệu mẫu"),
    },
    {
      title: "Lượng Calo đã đốt",
      value: statsReady ? `${apiStats.caloriesBurnedThisWeek.toLocaleString()} Kcal` : (isLoggedIn ? "..." : "12,450 Kcal"),
      icon: Flame,
      color: "bg-orange-500 text-orange-500",
      bars: statsReady ? apiStats.weeklyCaloriesMap : (isLoggedIn ? [0, 0, 0, 0, 0, 0, 0] : [200, 350, 450, 150, 0, 400, 300]), // Mon-Sun
      label: statsReady ? `Tiêu hao tuần này` : (isLoggedIn ? "Đang tải..." : "Đạt 92% mục tiêu"),
    },
    {
      title: "Số buổi đã hoàn thành",
      value: statsReady ? `${apiStats.completedWorkoutsThisWeek} buổi` : (isLoggedIn ? "..." : "4 buổi"),
      icon: Award,
      color: "bg-indigo-500 text-indigo-500",
      bars: statsReady ? apiStats.weeklyWorkoutDaysMap : (isLoggedIn ? [0, 0, 0, 0, 0, 0, 0] : [1, 1, 1, 0, 0, 1, 0]), // Mon-Sun
      label: statsReady ? "Hoàn thành tuần này" : (isLoggedIn ? "Đang tải..." : "Đều đặn"),
    },
    {
      title: "Thời gian ngủ trung bình",
      value: statsReady ? `${apiStats.averageSleepHours} giờ/ngày` : (isLoggedIn ? "..." : "7.2 giờ/ngày"),
      icon: ShieldAlert,
      color: "bg-green-500 text-green-500",
      bars: statsReady ? apiStats.weeklySleepMap : (isLoggedIn ? [0, 0, 0, 0, 0, 0, 0] : [7, 6.5, 8, 7, 7.5, 6.8, 8.2]), // Mon-Sun
      label: statsReady ? "Phục hồi trung bình" : (isLoggedIn ? "Đang tải..." : "Chất lượng tốt"),
    },
  ];

  const days = ["Hai", "Ba", "Tư", "Năm", "Sáu", "Bảy", "CN"];

  return (
    <section className="w-full py-8 relative">
      {/* Container cards grid */}
      <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 ${!isLoggedIn ? "blur-[3px] select-none pointer-events-none" : ""}`}>
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const maxVal = Math.max(...stat.bars) || 1;
          
          return (
            <div 
              key={index}
              className="flex flex-col p-5 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-3xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300"
            >
              {/* Header của Card */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-extrabold text-[var(--text-muted)] uppercase tracking-wider">
                  {stat.title}
                </span>
                <div className={`p-2 rounded-xl bg-gray-500/10 ${stat.color.split(" ")[1]}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              
              {/* Giá trị chính */}
              <div className="mb-4">
                <h3 className="text-2xl font-black text-[var(--text-color)] m-0 leading-tight">
                  {stat.value}
                </h3>
                <span className="text-[11px] font-bold text-[var(--text-muted)]">
                  {stat.label}
                </span>
              </div>
              
              {/* Đồ thị cột Mini */}
              <div className="flex items-end justify-between gap-1.5 h-12 mt-auto pt-2">
                {stat.bars.map((bar, barIdx) => {
                  const heightPercent = (bar / maxVal) * 100;
                  return (
                    <div 
                      key={barIdx} 
                      className="flex-1 flex flex-col items-center gap-1 group/bar relative"
                    >
                      <div 
                        style={{ height: `${Math.max(heightPercent, 8)}%` }}
                        className={`w-full rounded-t-sm transition-all duration-500 ${stat.color.split(" ")[0]} opacity-80 group-hover/bar:opacity-100`}
                      />
                      
                      <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-black text-white text-[9px] font-black px-1.5 py-0.5 rounded opacity-0 pointer-events-none group-hover/bar:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10 shadow-md">
                        {bar}
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* Labels thứ trong tuần */}
              <div className="flex items-center justify-between gap-1.5 mt-2">
                {days.map((day, idx) => (
                  <span key={idx} className="flex-1 text-center text-[9px] font-bold text-[var(--text-muted)]">
                    {day}
                  </span>
                ))}
              </div>

            </div>
          );
        })}
      </div>

      {/* Lock overlay if not logged in */}
      {!isLoggedIn && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[var(--bg-color)]/30 backdrop-blur-md border border-[var(--border-color)] rounded-[2rem] p-6 text-center">
          <div className="w-14 h-14 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-lg shadow-primary/10 mb-4 animate-bounce">
            <Lock className="w-5 h-5" />
          </div>
          <h4 className="text-lg font-black text-[var(--text-color)] tracking-tight mb-2">
            Thống kê sức khỏe & Luyện tập
          </h4>
          <p className="text-xs text-[var(--text-muted)] max-w-sm mb-5 leading-relaxed">
            Đăng nhập để đo lường tự động số phút tập, calo tiêu hao, giấc ngủ và tiến trình hàng tuần của riêng bạn.
          </p>
          <button 
            onClick={() => navigate(paths.login)} 
            className="tap-stable inline-flex items-center justify-center min-h-11 px-8 py-3 bg-primary text-black font-extrabold text-sm rounded-xl shadow-md shadow-primary/20 active:opacity-90 cursor-pointer border-0 select-none"
          >
            Đăng nhập ngay
          </button>
        </div>
      )}
    </section>
  );
}

export default WeeklyStatsPreview;
