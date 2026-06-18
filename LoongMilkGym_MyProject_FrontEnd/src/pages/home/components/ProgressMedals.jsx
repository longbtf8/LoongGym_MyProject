import React, { useState, useEffect } from "react";
import { Award, CheckCircle, ChevronRight, Zap, Flame, ShieldAlert } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useGetDashboardSummaryQuery } from "@/services/dashboard/dashboardApi";
import paths from "@/config/path";

const ACHIEVEMENT_SLIDES = [
  {
    id: 1,
    image: "https://res.cloudinary.com/dvlp6zqdo/image/upload/v1781799368/LoongMilkGym_APP/homepage/achievement_1.jpg",
    title: "Chiến binh kỷ luật",
    desc: "Duy trì tập luyện kiên trì mỗi ngày",
  },
  {
    id: 2,
    image: "https://res.cloudinary.com/dvlp6zqdo/image/upload/v1781799371/LoongMilkGym_APP/homepage/achievement_2.jpg",
    title: "Bứt phá giới hạn",
    desc: "Đạt mốc tiêu thụ hơn 1000 Kcal",
  },
  {
    id: 3,
    image: "https://res.cloudinary.com/dvlp6zqdo/image/upload/v1781799373/LoongMilkGym_APP/homepage/achievement_3.jpg",
    title: "Vô song sức mạnh",
    desc: "Hoàn thành các bài tập tạ nặng",
  },
  {
    id: 4,
    image: "https://res.cloudinary.com/dvlp6zqdo/image/upload/v1781799375/LoongMilkGym_APP/homepage/achievement_4.jpg",
    title: "Chiến tích phục hồi",
    desc: "Tối ưu hóa giấc ngủ & cơ bắp",
  },
  {
    id: 5,
    image: "https://res.cloudinary.com/dvlp6zqdo/image/upload/v1781799376/LoongMilkGym_APP/homepage/achievement_5.jpg",
    title: "Ý chí sắt đá",
    desc: "Chinh phục lộ trình huấn luyện khắt khe",
  },
];

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

  // Achievement carousel state
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setIsFading(true);
      setTimeout(() => {
        setCurrentSlide((prev) => (prev + 1) % ACHIEVEMENT_SLIDES.length);
        setIsFading(false);
      }, 500);
    }, 3500); // Auto-next every 3.5 seconds

    return () => clearInterval(timer);
  }, []);

  const handleDotClick = (idx) => {
    if (idx === currentSlide) return;
    setIsFading(true);
    setTimeout(() => {
      setCurrentSlide(idx);
      setIsFading(false);
    }, 500);
  };

  return (
    <section className="w-full py-10">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* CỘT TRÁI: TIẾN ĐỘ HÀNG TUẦN (7/12 cols) */}
        <div className="lg:col-span-7 flex flex-col p-6 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-[2rem] shadow-sm">
          <div className="flex items-center justify-between mb-4">
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

          {/* Biểu đồ tiến độ (Fixed Height & CSS alignment) */}
          <div className="flex items-end justify-between gap-3.5 h-36 pt-2 border-b border-[var(--border-color)] pb-2.5 mb-4">
            {days.map((day, idx) => (
              <div key={idx} className="flex-1 h-full flex flex-col items-center gap-1.5 group relative">
                {/* Thanh tiến trình */}
                <div className="w-full bg-[var(--bg-color)] border border-[var(--border-color)] flex-1 rounded-md overflow-hidden flex items-end">
                  <div 
                    style={{ height: day.active ? "100%" : "0%" }}
                    className="w-full rounded-sm transition-all duration-700 bg-primary"
                  />
                </div>
                
                {/* Label ngày */}
                <span className={`text-[10px] font-black m-0 leading-none ${day.active ? "text-[var(--text-color)]" : "text-[var(--text-muted)]"}`}>
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

          <div className="flex items-center justify-between mt-auto">
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

        {/* CỘT PHẢI: HUY HIỆU / THÀNH TỰU VỚI SLIDESHOW ẢNH (5/12 cols) */}
        <div className="lg:col-span-5 flex flex-col p-6 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-[2rem] shadow-sm overflow-hidden">
          <div className="mb-4">
            <h3 className="text-lg font-black text-[var(--text-color)] m-0 leading-tight">
              Khoảnh khắc thành tựu
            </h3>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              Thực hiện thử thách để mở khóa các danh hiệu đặc quyền.
            </p>
          </div>

          {/* Premium Auto-Looping Image Carousel */}
          <div className="relative flex-1 w-full aspect-video sm:aspect-auto sm:h-44 rounded-2xl overflow-hidden border border-[var(--border-color)] shadow-inner mb-4 group">
            
            {/* Achievement Image with Zoom & Fade transition */}
            <img 
              src={ACHIEVEMENT_SLIDES[currentSlide].image} 
              alt={ACHIEVEMENT_SLIDES[currentSlide].title} 
              className={`w-full h-full object-cover group-hover:scale-[1.03] transition-all duration-700 ease-out ${
                isFading ? "opacity-30 scale-95 blur-sm" : "opacity-100 scale-100"
              }`}
            />
            
            {/* Dark gradient mask */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/10" />

            {/* Slide content overlay */}
            <div className={`absolute bottom-3 left-3 right-3 text-left transition-all duration-500 ${
              isFading ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"
            }`}>
              <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary/20 border border-primary/35 rounded-md text-primary text-[8px] font-black tracking-widest uppercase mb-1.5">
                <Award className="w-2.5 h-2.5" />
                Thành tựu tuần
              </div>
              <h4 className="text-sm font-black text-white m-0 tracking-tight">
                {ACHIEVEMENT_SLIDES[currentSlide].title}
              </h4>
              <p className="text-[10px] text-gray-300 mt-0.5 m-0 leading-tight font-medium">
                {ACHIEVEMENT_SLIDES[currentSlide].desc}
              </p>
            </div>

            {/* Small Pagination Dots inside Carousel */}
            <div className="absolute top-3 right-3 flex items-center gap-1.5">
              {ACHIEVEMENT_SLIDES.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => handleDotClick(idx)}
                  className={`w-1.5 h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                    idx === currentSlide 
                      ? "bg-primary w-3.5" 
                      : "bg-white/40 hover:bg-white/70"
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>

          <button
            onClick={() => navigate(isLoggedIn ? paths.dashboard : paths.login)}
            className="w-full py-3 bg-[var(--bg-color)] border border-[var(--border-color)] hover:border-primary/45 text-[var(--text-color)] font-extrabold text-xs rounded-xl hover:-translate-y-0.5 active:scale-95 transition-all duration-200 shadow-sm cursor-pointer"
          >
            {isLoggedIn ? "Xem bảng điều khiển" : "Đăng nhập để bắt đầu"}
          </button>
        </div>

      </div>
    </section>
  );
}

export default ProgressMedals;
