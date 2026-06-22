import React, { useState, useEffect, useRef } from "react";
import { Award, CheckCircle, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useGetDashboardSummaryQuery } from "@/services/dashboard/dashboardApi";
import { useGetActivePlanQuery } from "@/services/roadmap/roadmapApi";
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

  // Fetch active training plan days
  const { data: activePlanData, isError: isPlanError } = useGetActivePlanQuery(undefined, {
    skip: !isLoggedIn,
  });
  const apiStats = isLoggedIn ? responseData?.data?.stats : null;
  const activePlan = isLoggedIn && !isPlanError ? activePlanData?.data : null;

  // Compute actual daily progress values (0 or 100%)
  const dailyWorkouts = apiStats?.weeklyWorkoutDaysMap || [0, 0, 0, 0, 0, 0, 0];
  const weeklyWorkoutMinutes = apiStats?.weeklyWorkoutMinutesMap || [0, 0, 0, 0, 0, 0, 0];
  
  // Calculate current week dates (Monday to Sunday)
  const today = new Date();
  const dayOfWeek = today.getDay();
  const diffToMonday = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
  const monday = new Date(today);
  monday.setDate(diffToMonday);
  monday.setHours(0, 0, 0, 0);

  const weekDays = ["Hai", "Ba", "Tư", "Năm", "Sáu", "Bảy", "CN"];
  const days = weekDays.map((name, index) => {
    if (isLoggedIn) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + index);

      // Find matching day in active plan using YYYY-MM-DD local format
      const planDay = activePlan?.days?.find((pd) => {
        const pdDateStr = new Date(pd.scheduledDate).toISOString().split("T")[0];
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, "0");
        const r = String(d.getDate()).padStart(2, "0");
        const dStr = `${y}-${m}-${r}`;
        return pdDateStr === dStr;
      });

      const isCompleted = planDay?.status === "completed" || dailyWorkouts[index] === 1;
      const mins = isCompleted 
        ? (weeklyWorkoutMinutes[index] || planDay?.metadata?.durationMinutes || 45) 
        : (planDay?.metadata?.durationMinutes || 0);

      // Determine if there is a scheduled workout on this day
      const isScheduled = planDay && planDay.title && !["nghỉ ngơi", "nghỉ", "rest"].includes(planDay.title.toLowerCase());

      return {
        name,
        active: isCompleted,
        isScheduled: isScheduled && !isCompleted,
        title: planDay?.title || (isCompleted ? "Bài tập thể chất" : "Nghỉ ngơi"),
        mins: mins || (isScheduled ? 30 : 0),
      };
    } else {
      // Mock data for beautiful presentation if not logged in
      const mockActive = [true, false, true, false, false, false, false];
      const mockScheduled = [false, false, false, false, true, false, true];
      const mockTitles = [
        "Ngực & Tay sau",
        "Nghỉ ngơi",
        "Lưng & Bắp tay",
        "Nghỉ ngơi",
        "Chân & Bụng",
        "Nghỉ ngơi",
        "Vai & Tay trước",
      ];
      const mockMins = [30, 0, 45, 0, 50, 0, 45];

      return {
        name,
        active: mockActive[index],
        isScheduled: mockScheduled[index],
        title: mockTitles[index],
        mins: mockMins[index],
      };
    }
  });

  const completedCount = apiStats ? apiStats.completedWorkoutsThisWeek : 2;

  // Achievement carousel state
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const startXRef = useRef(0);
  const carouselRef = useRef(null);

  // Auto-next interval when not dragging
  useEffect(() => {
    if (isDragging) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % ACHIEVEMENT_SLIDES.length);
    }, 3500);

    return () => clearInterval(timer);
  }, [isDragging]);

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % ACHIEVEMENT_SLIDES.length);
  };

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + ACHIEVEMENT_SLIDES.length) % ACHIEVEMENT_SLIDES.length);
  };

  // Dragging logic
  const startDrag = (clientX) => {
    setIsDragging(true);
    startXRef.current = clientX;
    setDragOffset(0);
  };

  const moveDrag = (clientX) => {
    if (!isDragging) return;
    const currentOffset = clientX - startXRef.current;
    setDragOffset(currentOffset);
  };

  const endDrag = () => {
    if (!isDragging) return;
    setIsDragging(false);

    if (dragOffset < -60) {
      handleNextSlide();
    } else if (dragOffset > 60) {
      handlePrevSlide();
    }
    setDragOffset(0);
  };

  // Navigation handlers with smooth scroll to top
  const handleNavigateDashboard = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    navigate(isLoggedIn ? paths.dashboard : paths.login);
  };

  const handleNavigatePlan = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    navigate(isLoggedIn ? paths.myPlan : paths.login);
  };

  return (
    <section className="w-full py-10">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* CỘT TRÁI: TIẾN ĐỘ HÀNG TUẦN (7/12 cols) */}
        <div className="lg:col-span-7 flex flex-col p-6 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-[2rem] shadow-sm relative overflow-hidden">
          
          <div className="flex items-center justify-between mb-4 z-10">
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

          {/* Biểu đồ tiến độ cao cấp */}
          <div className="relative flex-1 w-full flex items-end justify-between px-2 pt-6 z-10 min-h-[160px]">
            
            {/* Background Grid Lines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-50 pb-2 pt-6 px-1">
              <div className="border-t border-dashed border-[var(--border-color)] w-full text-[8px] text-[var(--text-muted)] font-bold pt-0.5">60 phút</div>
              <div className="border-t border-dashed border-[var(--border-color)] w-full text-[8px] text-[var(--text-muted)] font-bold pt-0.5">30 phút</div>
              <div className="border-t border-dashed border-[var(--border-color)] w-full text-[8px] text-[var(--text-muted)] font-bold pt-0.5">Lịch nghỉ</div>
            </div>

            {/* Bars Column */}
            {days.map((day, idx) => {
              const fillPercentage = day.active 
                ? Math.min(100, Math.max(25, (day.mins / 60) * 100)) 
                : day.isScheduled 
                  ? Math.min(100, Math.max(25, (day.mins / 60) * 100))
                  : 0;

              return (
                <div key={idx} className="flex-1 h-full flex flex-col items-center justify-end group relative z-10">
                  
                  {/* Thin Pill Bar Container */}
                  <div className="w-4 bg-[var(--bg-color)]/60 dark:bg-[var(--bg-color)]/20 border border-[var(--border-color)] h-[85%] rounded-full overflow-hidden flex items-end relative shadow-inner">
                    {day.active ? (
                      <div 
                        style={{ height: `${fillPercentage}%` }}
                        className="w-full rounded-full transition-all duration-700 bg-gradient-to-t from-primary/80 to-primary relative"
                      >
                        <div className="absolute top-0 left-0 right-0 h-1.5 bg-white/40 rounded-full animate-pulse" />
                      </div>
                    ) : day.isScheduled ? (
                      <div 
                        style={{ height: `${fillPercentage}%` }}
                        className="w-full rounded-full transition-all duration-700 bg-primary/10 border border-dashed border-primary/45 relative h-full"
                      />
                    ) : null}
                  </div>

                  {/* Enhanced Tooltip */}
                  <div className="absolute bottom-[90%] left-1/2 -translate-x-1/2 bg-black/95 text-white text-[10px] font-bold px-2.5 py-1.5 rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50 shadow-lg border border-white/10 flex flex-col items-center">
                    <span className="text-[9px] text-gray-400">Thứ {day.name}</span>
                    <span className="text-primary font-black mt-0.5">{day.title}</span>
                    <span className="text-[9px] text-gray-300 mt-0.5">
                      {day.active ? `Đã tập (${day.mins} phút)` : day.isScheduled ? `Lịch tập (${day.mins} phút)` : "Nghỉ ngơi"}
                    </span>
                  </div>

                </div>
              );
            })}
          </div>

          {/* Days Label Row (Aligned perfectly at the bottom) */}
          <div className="w-full flex justify-between px-2 pt-3 pb-2 border-t border-[var(--border-color)] mt-2 mb-2 z-10">
            {days.map((day, idx) => (
              <div key={idx} className="flex-1 flex justify-center">
                <span className={`text-[11px] sm:text-xs font-black tracking-tight select-none transition-all duration-200 px-2 py-0.5 rounded-md ${
                  day.active 
                    ? "bg-primary text-black scale-105 shadow-sm shadow-primary/20" 
                    : day.isScheduled 
                      ? "border border-dashed border-primary/40 text-primary bg-primary/5"
                      : "text-[var(--text-muted)]"
                }`}>
                  {day.name}
                </span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between mt-auto z-10">
            <div className="flex items-center gap-2 text-xs font-bold text-[var(--text-muted)]">
              <CheckCircle className="w-4 h-4 text-green-500" />
              {completedCount}/7 Ngày hoàn thành
            </div>
            <button 
              onClick={handleNavigatePlan}
              className="text-xs font-black text-[var(--text-primary)] hover:opacity-85 flex items-center gap-0.5 cursor-pointer bg-transparent border-0"
            >
              Chi tiết lịch tập
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* CỘT PHẢI: HUY HIỆU / THÀNH TỰU VỚI SLIDESHOW ẢNH TRƯỢT MƯỢT (5/12 cols) */}
        <div className="lg:col-span-5 flex flex-col p-6 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-[2rem] shadow-sm overflow-hidden select-none">
          <div className="mb-4">
            <h3 className="text-lg font-black text-[var(--text-color)] m-0 leading-tight">
              Khoảnh khắc thành tựu
            </h3>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              Thực hiện thử thách để mở khóa các danh hiệu đặc quyền.
            </p>
          </div>

          {/* Premium Auto-Looping Sliding Carousel */}
          <div 
            ref={carouselRef}
            onMouseDown={(e) => e.button === 0 && startDrag(e.clientX)}
            onMouseMove={(e) => moveDrag(e.clientX)}
            onMouseUp={endDrag}
            onMouseLeave={endDrag}
            onTouchStart={(e) => startDrag(e.touches[0].clientX)}
            onTouchMove={(e) => moveDrag(e.touches[0].clientX)}
            onTouchEnd={endDrag}
            className="relative flex-1 w-full aspect-video sm:aspect-auto sm:h-44 rounded-2xl overflow-hidden border border-[var(--border-color)] shadow-inner mb-4 group cursor-grab active:cursor-grabbing touch-pan-y"
          >
            
            {/* Horizontal Sliding Track */}
            <div 
              style={{
                display: "flex",
                width: `${ACHIEVEMENT_SLIDES.length * 100}%`,
                height: "100%",
                transform: `translateX(calc(-${(currentSlide * 100) / ACHIEVEMENT_SLIDES.length}% + ${dragOffset}px))`,
                transition: isDragging ? "none" : "transform 0.5s cubic-bezier(0.25, 0.8, 0.25, 1)"
              }}
              className="h-full"
            >
              {ACHIEVEMENT_SLIDES.map((slide) => (
                <div 
                  key={slide.id}
                  style={{ width: `${100 / ACHIEVEMENT_SLIDES.length}%` }}
                  className="h-full relative shrink-0"
                >
                  <img 
                    src={slide.image} 
                    alt={slide.title} 
                    draggable="false"
                    className="w-full h-full object-cover pointer-events-none select-none group-hover:scale-[1.02] transition-transform duration-700 ease-out"
                  />
                  
                  {/* Dark gradient mask */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/10 pointer-events-none" />

                  {/* Slide content overlay */}
                  <div className="absolute bottom-3 left-3 right-3 text-left pointer-events-none select-none">
                    <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary/20 border border-primary/35 rounded-md text-primary text-[8px] font-black tracking-widest uppercase mb-1.5">
                      <Award className="w-2.5 h-2.5" />
                      Thành tựu tuần
                    </div>
                    <h4 className="text-sm font-black text-white m-0 tracking-tight">
                      {slide.title}
                    </h4>
                    <p className="text-[10px] text-gray-300 mt-0.5 m-0 leading-tight font-medium">
                      {slide.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Small Pagination Dots inside Carousel */}
            <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5 pointer-events-auto">
              {ACHIEVEMENT_SLIDES.map((_, idx) => (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentSlide(idx);
                  }}
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
            onClick={handleNavigateDashboard}
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
