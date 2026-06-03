import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  Dumbbell, 
  Clock, 
  Flame, 
  Play, 
  Compass, 
  ShoppingBag, 
  Users, 
  User, 
  Sparkles, 
  Utensils, 
  Moon, 
  Zap, 
  Plus, 
  Trophy, 
  Heart,
  ArrowRight
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import httpRequest from "@/services/api";
import paths from "@/config/path";

function Dashboard() {
  const { userInfo, userName, userInitial } = useAuth();
  const [apiData, setApiData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch dữ liệu thật từ API trong background
  useEffect(() => {
    let isMounted = true;
    const fetchSummary = async () => {
      try {
        const response = await httpRequest.get("/dashboard/summary");
        if (response?.success && isMounted) {
          setApiData(response.data);
        }
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu bảng điều khiển:", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchSummary();
    return () => {
      isMounted = false;
    };
  }, []);

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

  // Tính toán phần trăm tiến trình dinh dưỡng
  const getPercent = (value, target) => {
    if (!target) return 0;
    const pct = Math.round((value / target) * 100);
    return pct > 100 ? 100 : pct;
  };

  const proteinPct = getPercent(nutrition.protein, nutrition.proteinTarget);
  const carbsPct = getPercent(nutrition.carbs, nutrition.carbsTarget);
  const fatPct = getPercent(nutrition.fat, nutrition.fatTarget);

  // Điểm số phục hồi
  const recoveryScore = apiData?.recoveryScore || 85;

  return (
    <div className="min-h-screen bg-[var(--bg-color)] text-[var(--text-color)] transition-colors duration-300 py-6 sm:py-10 px-4 sm:px-6 lg:px-8 pb-28 lg:pb-12">
      <div className="max-w-7xl mx-auto flex flex-col gap-6">
        
        {/* ═══ KHU VỰC A: GREETING BANNER ═══ */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-3xl shadow-sm transition-all duration-200">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            {userInfo?.profile?.avatarUrl ? (
              <img 
                src={userInfo.profile.avatarUrl} 
                alt={userName} 
                className="w-16 h-16 rounded-full object-cover border-2 border-primary/40 shadow-sm"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-black text-primary border border-primary/20 shadow-sm">
                {userInitial}
              </div>
            )}
            <div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-[var(--text-color)] m-0">
                Xin chào, {userName || "Alex"}
              </h1>
              <div className="flex items-center gap-1.5 mt-1.5">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-bold bg-primary/10 text-primary border border-primary/20 rounded-full">
                  <Zap className="w-3 h-3 fill-current" />
                  {displayGoal}
                </span>
              </div>
            </div>
          </div>
          
          <button className="flex items-center justify-center gap-2 px-6 py-3.5 bg-primary text-black font-extrabold text-sm rounded-2xl hover:bg-primary-hover hover:-translate-y-0.5 active:scale-95 transition-all duration-200 shadow-md shadow-primary/10 cursor-pointer w-full sm:w-auto">
            <Play className="w-4 h-4 fill-current" />
            Bắt đầu tập hôm nay
          </button>
        </div>

        {/* ═══ GRID 3 CỘT (DESKTOP) ═══ */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          {/* ════ CỘT LỚN 1 ════ */}
          <div className="flex flex-col gap-6">
            
            {/* KHU VỰC B: BÀI TẬP HÔM NAY */}
            <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-3xl p-6 shadow-sm flex flex-col justify-between min-h-[300px]">
              <div>
                <span className="text-[10px] sm:text-xs font-bold text-[var(--text-muted)] tracking-wider uppercase">Bài tập hôm nay</span>
                <h2 className="text-lg sm:text-xl font-black text-[var(--text-color)] mt-1.5 mb-5 tracking-tight">Ngực & Tay sau</h2>
                
                {/* 3 Stat Chips */}
                <div className="grid grid-cols-3 gap-3 my-4">
                  <div className="flex flex-col items-center justify-center p-3 bg-[var(--bg-color)] border border-[var(--border-color)] rounded-2xl text-center">
                    <Dumbbell className="w-5 h-5 text-primary mb-1.5" />
                    <span className="text-xs font-black text-[var(--text-color)]">8 Bài</span>
                    <span className="text-[9px] text-[var(--text-muted)] font-medium mt-0.5">Số lượng</span>
                  </div>
                  <div className="flex flex-col items-center justify-center p-3 bg-[var(--bg-color)] border border-[var(--border-color)] rounded-2xl text-center">
                    <Clock className="w-5 h-5 text-primary mb-1.5" />
                    <span className="text-xs font-black text-[var(--text-color)]">60 Phút</span>
                    <span className="text-[9px] text-[var(--text-muted)] font-medium mt-0.5">Thời gian</span>
                  </div>
                  <div className="flex flex-col items-center justify-center p-3 bg-[var(--bg-color)] border border-[var(--border-color)] rounded-2xl text-center">
                    <Flame className="w-5 h-5 text-primary mb-1.5" />
                    <span className="text-xs font-black text-[var(--text-color)]">Khó</span>
                    <span className="text-[9px] text-[var(--text-muted)] font-medium mt-0.5">Mức độ</span>
                  </div>
                </div>
              </div>

              <button className="w-full py-3.5 bg-transparent border border-primary text-primary hover:bg-primary hover:text-black font-extrabold text-sm rounded-2xl transition-all duration-200 active:scale-95 cursor-pointer mt-4">
                Bắt đầu tập
              </button>
            </div>

            {/* KHU VỰC E: TIẾN ĐỘ TUẦN NÀY */}
            <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-3xl p-6 shadow-sm">
              <h3 className="text-xs sm:text-sm font-black text-[var(--text-color)] tracking-wider uppercase mb-5">Tiến độ tuần này</h3>
              
              {/* Biểu đồ cột */}
              <div className="flex items-end justify-between h-36 pt-2 px-1">
                {[
                  { label: "T2", val: 35, active: false },
                  { label: "T3", val: 55, active: false },
                  { label: "T4", val: 85, active: true }, // Ngày hiện tại active như mockup
                  { label: "T5", val: 15, active: false },
                  { label: "T6", val: 8, active: false },
                  { label: "T7", val: 0, active: false },
                  { label: "CN", val: 0, active: false },
                ].map((item, idx) => (
                  <div key={idx} className="flex flex-col items-center gap-2 flex-1">
                    <div className="w-4.5 sm:w-6 bg-[var(--bg-color)] rounded-full border border-[var(--border-color)] h-24 flex items-end overflow-hidden">
                      <div 
                        style={{ height: `${item.val}%` }}
                        className={`w-full rounded-full transition-all duration-500 ${
                          item.active 
                            ? "bg-primary shadow-[0_0_12px_rgba(204,255,0,0.5)]" 
                            : "bg-neutral-300 dark:bg-neutral-800"
                        }`}
                      />
                    </div>
                    <span className={`text-[10px] font-bold ${item.active ? "text-primary font-black" : "text-[var(--text-muted)]"}`}>
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* ════ CỘT LỚN 2 ════ */}
          <div className="flex flex-col gap-6">
            
            {/* KHU VỰC C: DINH DƯỠNG HÔM NAY */}
            <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-3xl p-6 shadow-sm flex flex-col justify-between min-h-[300px]">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs sm:text-sm font-black text-[var(--text-color)] tracking-wider uppercase m-0 flex items-center gap-1.5">
                    <Utensils className="w-4.5 h-4.5 text-[var(--text-muted)]" />
                    Dinh dưỡng hôm nay
                  </h3>
                </div>

                <div className="flex flex-col gap-4 mt-2">
                  {/* Protein */}
                  <div>
                    <div className="flex justify-between text-xs font-bold mb-1.5">
                      <span className="text-[var(--text-color)] flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-primary" />
                        Protein
                      </span>
                      <span className="text-[var(--text-muted)]">
                        {nutrition.protein} / {nutrition.proteinTarget}g
                      </span>
                    </div>
                    <div className="h-2 w-full bg-[var(--bg-color)] border border-[var(--border-color)] rounded-full overflow-hidden">
                      <div 
                        style={{ width: `${proteinPct}%` }}
                        className="h-full bg-primary rounded-full transition-all duration-500" 
                      />
                    </div>
                  </div>

                  {/* Carbs */}
                  <div>
                    <div className="flex justify-between text-xs font-bold mb-1.5">
                      <span className="text-[var(--text-color)] flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-cyan-400" />
                        Carbs
                      </span>
                      <span className="text-[var(--text-muted)]">
                        {nutrition.carbs} / {nutrition.carbsTarget}g
                      </span>
                    </div>
                    <div className="h-2 w-full bg-[var(--bg-color)] border border-[var(--border-color)] rounded-full overflow-hidden">
                      <div 
                        style={{ width: `${carbsPct}%` }}
                        className="h-full bg-cyan-400 rounded-full transition-all duration-500" 
                      />
                    </div>
                  </div>

                  {/* Fat */}
                  <div>
                    <div className="flex justify-between text-xs font-bold mb-1.5">
                      <span className="text-[var(--text-color)] flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-amber-500" />
                        Fat
                      </span>
                      <span className="text-[var(--text-muted)]">
                        {nutrition.fat} / {nutrition.fatTarget}g
                      </span>
                    </div>
                    <div className="h-2 w-full bg-[var(--bg-color)] border border-[var(--border-color)] rounded-full overflow-hidden">
                      <div 
                        style={{ width: `${fatPct}%` }}
                        className="h-full bg-amber-500 rounded-full transition-all duration-500" 
                      />
                    </div>
                  </div>
                </div>
              </div>

              <button className="w-full py-3.5 bg-transparent border border-[var(--border-color)] hover:border-primary/45 text-[var(--text-color)] hover:text-primary font-extrabold text-sm rounded-2xl transition-all duration-200 active:scale-95 cursor-pointer mt-6 flex items-center justify-center gap-2">
                <Plus className="w-4 h-4" />
                Thêm bữa ăn
              </button>
            </div>

            {/* KHU VỰC F: CHỈ SỐ PHỤC HỒI */}
            <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-3xl p-6 shadow-sm">
              <h3 className="text-xs sm:text-sm font-black text-[var(--text-color)] tracking-wider uppercase mb-5 flex items-center gap-1.5">
                <Heart className="w-4.5 h-4.5 text-[var(--text-muted)]" />
                Chỉ số phục hồi
              </h3>

              {/* Vòng tròn SVG */}
              <div className="flex justify-center my-2">
                <div className="relative flex items-center justify-center">
                  <svg className="w-28 h-28 transform -rotate-90">
                    <circle
                      cx="56"
                      cy="56"
                      r="46"
                      className="stroke-neutral-200 dark:stroke-neutral-800"
                      strokeWidth="7"
                      fill="transparent"
                    />
                    <circle
                      cx="56"
                      cy="56"
                      r="46"
                      className="stroke-primary transition-all duration-1000 ease-out"
                      strokeWidth="7"
                      fill="transparent"
                      strokeDasharray={289.03}
                      strokeDashoffset={289.03 - (recoveryScore / 100) * 289.03}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-2xl font-black text-[var(--text-color)]">{recoveryScore}%</span>
                    <span className="text-[10px] font-black text-primary uppercase tracking-wider mt-0.5">Tốt</span>
                  </div>
                </div>
              </div>

              {/* 3 Sub Stats */}
              <div className="grid grid-cols-3 gap-2 mt-5">
                <div className="flex flex-col items-center justify-center p-2.5 bg-[var(--bg-color)] border border-[var(--border-color)] rounded-2xl text-center">
                  <Moon className="w-4 h-4 text-purple-400 mb-1" />
                  <span className="text-[10px] font-medium text-[var(--text-muted)]">Giấc ngủ</span>
                  <span className="text-xs font-black text-[var(--text-color)] mt-0.5">7h 20m</span>
                </div>
                <div className="flex flex-col items-center justify-center p-2.5 bg-[var(--bg-color)] border border-[var(--border-color)] rounded-2xl text-center">
                  <Zap className="w-4 h-4 text-primary mb-1" />
                  <span className="text-[10px] font-medium text-[var(--text-muted)]">Năng lượng</span>
                  <span className="text-xs font-black text-[var(--text-color)] mt-0.5">Cao</span>
                </div>
                <div className="flex flex-col items-center justify-center p-2.5 bg-[var(--bg-color)] border border-[var(--border-color)] rounded-2xl text-center">
                  <User className="w-4 h-4 text-emerald-400 mb-1" />
                  <span className="text-[10px] font-medium text-[var(--text-muted)]">Đau cơ</span>
                  <span className="text-xs font-black text-[var(--text-color)] mt-0.5">Nhẹ</span>
                </div>
              </div>
            </div>

          </div>

          {/* ════ CỘT LỚN 3 ════ */}
          <div className="flex flex-col gap-6">
            
            {/* KHU VỰC D: AI COACH INSIGHT */}
            <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-3xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-black text-[var(--text-color)] tracking-wider uppercase m-0 leading-none">AI Coach Insight</h3>
                  <span className="text-[9px] text-primary font-bold mt-1 block">Vừa cập nhật</span>
                </div>
              </div>

              <div className="p-4 bg-[var(--bg-color)] border border-[var(--border-color)] rounded-2xl text-xs font-semibold text-[var(--text-color)] leading-relaxed italic my-4 relative">
                "Hôm nay recovery tốt, tập buổi Push với cường độ trung bình để tối ưu hóa sự phát triển cơ bắp mà không gây quá tải."
              </div>

              <button className="w-full py-3 bg-[var(--bg-color)] border border-[var(--border-color)] hover:border-primary/45 rounded-2xl text-xs font-bold text-[var(--text-color)] hover:text-primary transition-all flex items-center justify-center gap-2 cursor-pointer">
                Hỏi AI Coach
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* KHU VỰC G: QUICK ACTIONS GRID */}
            <div className="grid grid-cols-2 gap-3">
              <Link 
                to={paths.exercises}
                className="flex flex-col items-center justify-center p-4 bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:border-primary/40 rounded-2xl transition-all group no-underline shadow-sm"
              >
                <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-2.5 transition-colors group-hover:bg-primary group-hover:text-black">
                  <Dumbbell className="w-4.5 h-4.5" />
                </div>
                <span className="text-xs font-bold text-[var(--text-color)]">Thư viện</span>
              </Link>

              <Link 
                to="/route-placeholder"
                className="flex flex-col items-center justify-center p-4 bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:border-primary/40 rounded-2xl transition-all group no-underline shadow-sm"
              >
                <div className="w-9 h-9 rounded-full bg-cyan-500/10 text-cyan-500 flex items-center justify-center mb-2.5 transition-colors group-hover:bg-cyan-500 group-hover:text-black">
                  <Compass className="w-4.5 h-4.5" />
                </div>
                <span className="text-xs font-bold text-[var(--text-color)]">Lộ trình</span>
              </Link>

              <Link 
                to="/shop-placeholder"
                className="flex flex-col items-center justify-center p-4 bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:border-primary/40 rounded-2xl transition-all group no-underline shadow-sm"
              >
                <div className="w-9 h-9 rounded-full bg-orange-500/10 text-orange-500 flex items-center justify-center mb-2.5 transition-colors group-hover:bg-orange-500 group-hover:text-black">
                  <ShoppingBag className="w-4.5 h-4.5" />
                </div>
                <span className="text-xs font-bold text-[var(--text-color)]">Cửa hàng</span>
              </Link>

              <Link 
                to="/community-placeholder"
                className="flex flex-col items-center justify-center p-4 bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:border-primary/40 rounded-2xl transition-all group no-underline shadow-sm"
              >
                <div className="w-9 h-9 rounded-full bg-indigo-500/10 text-indigo-500 flex items-center justify-center mb-2.5 transition-colors group-hover:bg-indigo-500 group-hover:text-black">
                  <Users className="w-4.5 h-4.5" />
                </div>
                <span className="text-xs font-bold text-[var(--text-color)]">Cộng đồng</span>
              </Link>
            </div>

            {/* KHU VỰC H: BẢNG XẾP HẠNG TUẦN */}
            <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-3xl p-6 shadow-sm">
              <h3 className="text-xs sm:text-sm font-black text-[var(--text-color)] tracking-wider uppercase mb-4 flex items-center gap-1.5">
                <Trophy className="w-4.5 h-4.5 text-[var(--text-muted)]" />
                Bảng xếp hạng tuần
              </h3>

              <div className="flex flex-col gap-2.5">
                {/* TOP 1 */}
                <div className="flex items-center gap-3 p-3 bg-[var(--bg-color)] border border-primary/20 rounded-2xl shadow-xs">
                  <span className="text-sm font-black w-6 text-center text-primary">1</span>
                  <div className="w-7 h-7 rounded-full bg-primary/15 text-primary flex items-center justify-center text-xs font-black">
                    MT
                  </div>
                  <span className="text-xs font-bold text-[var(--text-color)] flex-1 truncate">Minh T.</span>
                  <span className="text-[11px] font-black text-primary">4200 pts</span>
                </div>

                {/* TOP 2 */}
                <div className="flex items-center gap-3 p-3 bg-[var(--bg-color)] border border-[var(--border-color)] rounded-2xl">
                  <span className="text-sm font-black w-6 text-center text-[var(--text-muted)]">2</span>
                  <div className="w-7 h-7 rounded-full bg-neutral-200 dark:bg-neutral-800 text-[var(--text-muted)] flex items-center justify-center text-xs font-bold">
                    HP
                  </div>
                  <span className="text-xs font-bold text-[var(--text-color)] flex-1 truncate">Hoàng P.</span>
                  <span className="text-[11px] font-semibold text-[var(--text-muted)]">3850 pts</span>
                </div>

                {/* TOP 3 */}
                <div className="flex items-center gap-3 p-3 bg-[var(--bg-color)] border border-[var(--border-color)] rounded-2xl">
                  <span className="text-sm font-black w-6 text-center text-[var(--text-muted)]">3</span>
                  <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                    {userInitial || "A"}
                  </div>
                  <span className="text-xs font-bold text-[var(--text-color)] flex-1 truncate">{userName || "Alex"} (Bạn)</span>
                  <span className="text-[11px] font-semibold text-[var(--text-muted)]">3100 pts</span>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}

export default Dashboard;
