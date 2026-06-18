import React from "react";
import { Award, CheckCircle, ChevronRight, Zap, Flame, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useGetDashboardSummaryQuery } from "@/services/dashboard/dashboardApi";
import paths from "@/config/path";

function ProgressMedals() {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();

  // Fetch dashboard summary
  const { data: responseData } = useGetDashboardSummaryQuery(undefined, {
    skip: !isLoggedIn,
  });

  const apiStats = isLoggedIn ? responseData?.data?.stats : null;

  // Compute actual daily progress values (0 or 100%)
  const dailyWorkouts = apiStats?.weeklyWorkoutDaysMap || [1, 0, 1, 0, 0, 1, 0]; // Monday - Sunday
  const weeklyWorkoutMinutes = apiStats?.weeklyWorkoutMinutesMap || [30, 0, 45, 0, 0, 50, 0];
  
  const days = [
    { name: "Hai", active: dailyWorkouts[0] === 1, value: dailyWorkouts[0] === 1 ? 100 : 0, mins: weeklyWorkoutMinutes[0] },
    { name: "Ba", active: dailyWorkouts[1] === 1, value: dailyWorkouts[1] === 1 ? 100 : 0, mins: weeklyWorkoutMinutes[1] },
    { name: "Tư", active: dailyWorkouts[2] === 1, value: dailyWorkouts[2] === 1 ? 100 : 0, mins: weeklyWorkoutMinutes[2] },
    { name: "Năm", active: dailyWorkouts[3] === 1, value: dailyWorkouts[3] === 1 ? 100 : 0, mins: weeklyWorkoutMinutes[3] },
    { name: "Sáu", active: dailyWorkouts[4] === 1, value: dailyWorkouts[4] === 1 ? 100 : 0, mins: weeklyWorkoutMinutes[4] },
    { name: "Bảy", active: dailyWorkouts[5] === 1, value: dailyWorkouts[5] === 1 ? 100 : 0, mins: weeklyWorkoutMinutes[5] },
    { name: "CN", active: dailyWorkouts[6] === 1, value: dailyWorkouts[6] === 1 ? 100 : 0, mins: weeklyWorkoutMinutes[6] },
  ];

  const completedCount = apiStats ? apiStats.completedWorkoutsThisWeek : 3;
  const currentStreak = apiStats ? apiStats.currentStreak : 2;
  const totalCalories = apiStats ? apiStats.caloriesBurnedThisWeek : 850;

  // Unlocked logic for 3 achievements
  const achievements = [
    {
      id: "streak",
      title: "Kỷ luật thép",
      desc: "Chuỗi 3 ngày liên tiếp",
      icon: Flame,
      color: "from-orange-500 to-red-500 text-orange-500",
      unlocked: currentStreak >= 3,
    },
    {
      id: "sessions",
      title: "Kiên trì",
      desc: "Tập luyện 3 buổi/tuần",
      icon: Zap,
      color: "from-primary to-green-500 text-primary",
      unlocked: completedCount >= 3,
    },
    {
      id: "calories",
      title: "Chinh phục",
      desc: "Đốt cháy > 500 Kcal",
      icon: Award,
      color: "from-blue-500 to-indigo-500 text-blue-400",
      unlocked: totalCalories >= 500,
    },
  ];

  return (
    <section className="w-full py-10">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* CỘT TRÁI: TIẾN ĐỘ HÀNG TUẦN (7/12 cols) */}
        <div className="lg:col-span-7 flex flex-col p-6 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-[2rem] shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-black text-[var(--text-color)] m-0 leading-tight">
                Tiến độ hàng tuần
              </h3>
              <p className="text-xs text-[var(--text-muted)] mt-1">
                {isLoggedIn ? "Lịch trình tập luyện được đo lường tự động." : "Dữ liệu tập luyện mẫu."}
              </p>
            </div>
            
            <span className="px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest bg-green-500/10 text-green-600 border border-green-500/20 dark:bg-green-500/15 dark:text-green-400 dark:border-green-500/25 rounded-full">
              {completedCount >= 3 ? "Đạt chỉ tiêu" : "Đang cố gắng"}
            </span>
          </div>

          {/* Biểu đồ tiến độ */}
          <div className="flex items-end justify-between gap-4 h-32 pt-4 border-b border-[var(--border-color)] pb-3">
            {days.map((day, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 group relative">
                {/* Thanh tiến trình */}
                <div className="w-full bg-[var(--bg-color)] border border-[var(--border-color)] h-full rounded-lg overflow-hidden flex items-end">
                  <div 
                    style={{ height: day.active ? "100%" : "0%" }}
                    className="w-full rounded-md transition-all duration-700 bg-primary"
                  />
                </div>
                
                {/* Label ngày */}
                <span className={`text-[10px] font-black ${day.active ? "text-[var(--text-color)]" : "text-[var(--text-muted)]"}`}>
                  {day.name}
                </span>

                {/* Tooltip */}
                {day.active && (
                  <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-black text-white text-[9px] font-black px-1.5 py-0.5 rounded opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10 shadow-md">
                    {day.mins > 0 ? `${day.mins} phút` : "Hoàn thành"}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-2 text-xs font-bold text-[var(--text-muted)]">
              <CheckCircle className="w-4 h-4 text-green-500" />
              {completedCount}/7 Ngày hoàn thành
            </div>
            <button 
              onClick={() => navigate(isLoggedIn ? paths.myPlan : paths.login)}
              className="text-xs font-black text-[var(--text-primary)] hover:opacity-85 flex items-center gap-0.5 cursor-pointer bg-transparent border-0"
            >
              Chi tiết lịch tập
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* CỘT PHẢI: HUY HIỆU / THÀNH TỰU (5/12 cols) */}
        <div className="lg:col-span-5 flex flex-col p-6 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-[2rem] shadow-sm">
          <div className="mb-4">
            <h3 className="text-lg font-black text-[var(--text-color)] m-0 leading-tight">
              Bảng thành tựu tuần
            </h3>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              Thực hiện thử thách để mở khóa các danh hiệu đặc quyền.
            </p>
          </div>

          {/* Cabinet of Achievements */}
          <div className="flex flex-col gap-3.5 my-auto">
            {achievements.map((ach) => {
              const Icon = ach.icon;
              return (
                <div 
                  key={ach.id}
                  className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all duration-300 ${
                    ach.unlocked 
                      ? "bg-gradient-to-r from-gray-500/5 to-transparent border-[var(--border-color)] shadow-sm" 
                      : "bg-gray-500/[0.02] border-[var(--border-color)] opacity-55"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Glowing Icon Wrapper */}
                    <div className="relative shrink-0 flex items-center justify-center">
                      {ach.unlocked && (
                        <div className={`absolute w-8 h-8 rounded-full blur-md opacity-35 bg-gradient-to-br ${ach.color.split(" ")[0]}`} />
                      )}
                      <div className={`relative w-10 h-10 rounded-xl bg-gray-500/10 border border-gray-500/15 flex items-center justify-center ${
                        ach.unlocked ? ach.color.split(" ")[1] : "text-[var(--text-muted)]"
                      }`}>
                        <Icon className="w-5 h-5 fill-current" />
                      </div>
                    </div>

                    <div className="text-left">
                      <h4 className={`text-xs font-black m-0 tracking-tight ${ach.unlocked ? "text-[var(--text-color)]" : "text-[var(--text-muted)]"}`}>
                        {ach.title}
                      </h4>
                      <p className="text-[10px] text-[var(--text-muted)] mt-0.5 m-0 leading-none">
                        {ach.desc}
                      </p>
                    </div>
                  </div>

                  <div>
                    {ach.unlocked ? (
                      <span className="text-[9px] font-black uppercase tracking-wider text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-md">
                        Đã mở khóa
                      </span>
                    ) : (
                      <div className="text-[var(--text-muted)] p-1.5">
                        <Lock className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <button
            onClick={() => navigate(isLoggedIn ? paths.dashboard : paths.login)}
            className="w-full mt-4 py-3 bg-[var(--bg-color)] border border-[var(--border-color)] hover:border-primary/45 text-[var(--text-color)] font-extrabold text-xs rounded-xl hover:-translate-y-0.5 active:scale-95 transition-all duration-200 shadow-sm cursor-pointer"
          >
            {isLoggedIn ? "Xem bảng điều khiển" : "Đăng nhập để bắt đầu"}
          </button>
        </div>

      </div>
    </section>
  );
}

export default ProgressMedals;
