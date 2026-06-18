import React from "react";
import { useAuth } from "@/hooks/useAuth";
import { useGetDashboardSummaryQuery } from "@/services/dashboard/dashboardApi";
import LoadingScreen from "@/components/LoadingScreen";

// Import subcomponents
import GreetingBanner from "./components/GreetingBanner";
import TodayWorkoutCard from "./components/TodayWorkoutCard";
import NutritionTracker from "./components/NutritionTracker";
import RecoveryScore from "./components/RecoveryScore";
import AICoachInsight from "./components/AICoachInsight";
import WeeklyProgressChart from "./components/WeeklyProgressChart";
import QuickActionsGrid from "./components/QuickActionsGrid";

function Dashboard() {
  const { userInfo, userName, userInitial } = useAuth();
  
  // Sử dụng RTK Query Hook để fetch dữ liệu từ API
  const { data: responseData, isLoading } = useGetDashboardSummaryQuery();
  const apiData = responseData?.data;

  // Hiển thị màn hình Loading nếu đang fetch lần đầu
  if (isLoading) {
    return <LoadingScreen message="Đang tải dữ liệu bảng điều khiển..." />;
  }

  // Xác định mục tiêu của người dùng (từ API hoặc từ profile hoặc mặc định)
  const userGoal = apiData?.user?.goal || userInfo?.profile?.goal || "gain_muscle";
  const displayGoal = {
    gain_muscle: "Tăng cơ",
    lose_weight: "Giảm cân",
    maintain: "Duy trì vóc dáng",
  }[userGoal] || "Tăng cơ";

  // Thông số dinh dưỡng
  const nutrition = apiData?.nutrition || {
    protein: 0,
    proteinTarget: 160,
    carbs: 0,
    carbsTarget: 300,
    fat: 0,
    fatTarget: 80
  };

  // Điểm số phục hồi
  const recovery = apiData?.recovery || {
    recoveryScore: 0,
    sleepHoursText: "--",
    energyText: "--",
    sorenessText: "--",
    hasLog: false,
  };

  return (
    <div className="w-full text-[var(--text-color)] transition-colors duration-300">
      <div className="max-w-7xl mx-auto flex flex-col gap-6">
        
        {/* ═══ KHU VỰC A: GREETING BANNER ═══ */}
        <GreetingBanner 
          userInfo={userInfo} 
          userName={userName} 
          userInitial={userInitial} 
          displayGoal={displayGoal} 
          workout={apiData?.todayWorkout}
        />

        {/* ═══ GRID 3 CỘT (DESKTOP) ═══ */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          {/* ════ CỘT LỚN 1 ════ */}
          <div className="flex flex-col gap-6">
            {/* KHU VỰC B: BÀI TẬP HÔM NAY */}
            <TodayWorkoutCard workout={apiData?.todayWorkout} />

            {/* KHU VỰC E: TIẾN ĐỘ TUẦN NÀY */}
            <WeeklyProgressChart />
          </div>

          {/* ════ CỘT LỚN 2 ════ */}
          <div className="flex flex-col gap-6">
            {/* KHU VỰC C: DINH DƯỠNG HÔM NAY */}
            <NutritionTracker nutrition={nutrition} />

            {/* KHU VỰC F: CHỈ SỐ PHỤC HỒI */}
            <RecoveryScore recovery={recovery} />
          </div>

          {/* ════ CỘT LỚN 3 ════ */}
          <div className="flex flex-col gap-6">
            {/* KHU VỰC D: AI COACH INSIGHT */}
            <AICoachInsight />

            {/* KHU VỰC G: QUICK ACTIONS GRID */}
            <QuickActionsGrid />
          </div>

        </div>

      </div>
    </div>
  );
}

export default Dashboard;
