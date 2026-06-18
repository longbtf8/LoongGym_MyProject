import React from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, Sparkles, Clock, ArrowRight, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import paths from "@/config/path";

function HIITBanner() {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();

  const handleActionClick = () => {
    // Navigate to AI Coach and prompt it about Progressive Overload!
    navigate(paths.aiCoach);
  };

  return (
    <section className="w-full py-8">
      <div className="relative overflow-hidden w-full bg-gradient-to-br from-gray-900 to-indigo-950 border border-indigo-500/20 rounded-[2.5rem] shadow-xl p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-10">
        
        {/* Decorative background lights */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-60 h-60 bg-primary/5 rounded-full blur-[80px] pointer-events-none" />

        {/* LEFT SIDE: ARTICLE SUMMARY */}
        <div className="flex-1 flex flex-col items-start text-left z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 border border-primary/25 rounded-full text-primary text-[10px] font-black tracking-widest uppercase mb-4">
            <Sparkles className="w-3 h-3 text-primary fill-current" />
            Kiến thức huấn luyện chuyên gia
          </div>
          
          <h3 className="text-2xl sm:text-3xl font-black text-white m-0 tracking-tight leading-tight mb-3">
            Bí quyết đột phá: Tăng cơ giảm mỡ tối ưu bằng nguyên lý Progressive Overload
          </h3>

          <p className="text-xs sm:text-sm text-gray-300 leading-relaxed mb-6 max-w-2xl font-medium">
            Bạn tập luyện chăm chỉ nhưng cơ bắp ngừng phát triển? Hãy cùng Ban huấn luyện khám phá cơ chế tăng tiến tải trọng để kích hoạt tối đa sợi cơ mới và tối ưu lượng calo tiêu hao trong mỗi buổi tập.
          </p>

          <div className="flex flex-wrap items-center gap-y-2 gap-x-6 mb-6 border-t border-white/10 pt-4 w-full">
            <span className="flex items-center gap-1.5 text-xs text-gray-400 font-extrabold">
              <User className="w-4 h-4 text-indigo-400" />
              Tác giả: Coach AI GymLife
            </span>
            <span className="flex items-center gap-1.5 text-xs text-primary font-black">
              <Clock className="w-4 h-4 text-primary" />
              5 phút đọc
            </span>
          </div>

          <button
            onClick={handleActionClick}
            className="flex items-center gap-1.5 px-5 py-3 bg-primary text-black font-extrabold text-xs rounded-xl shadow-lg shadow-primary/15 hover:bg-primary-hover hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer border-0"
          >
            Đọc bài viết cùng AI Coach
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* RIGHT SIDE: ARTICLE IMAGE COVER */}
        <div className="w-full md:w-auto shrink-0 z-10 flex items-center justify-center">
          <div 
            onClick={handleActionClick}
            className="relative w-full max-w-[320px] aspect-video sm:aspect-auto sm:w-72 sm:h-44 rounded-3xl overflow-hidden border border-white/10 shadow-2xl group cursor-pointer"
          >
            <img 
              src="https://res.cloudinary.com/dvlp6zqdo/image/upload/v1781797857/LoongMilkGym_APP/homepage/hiit_banner.jpg" 
              alt="Article Cover" 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            />
            {/* Dark mask overlay */}
            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/25 transition-all duration-300" />

            {/* Read Badge */}
            <div className="absolute top-3 right-3 bg-black/80 backdrop-blur-md border border-white/10 text-white text-[9px] font-black tracking-wider uppercase px-2.5 py-1 rounded-md flex items-center gap-1.5">
              <BookOpen className="w-3 h-3 text-primary" />
              Bài viết
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}

export default HIITBanner;
