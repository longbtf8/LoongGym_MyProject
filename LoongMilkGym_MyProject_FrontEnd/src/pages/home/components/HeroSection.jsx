import React from "react";
import { useNavigate } from "react-router-dom";
import { Zap, Play, Dumbbell, Calendar, Users, Award } from "lucide-react";
import paths from "@/config/path";

function HeroSection() {
  const navigate = useNavigate();

  return (
    <section className="relative w-full flex flex-col-reverse lg:flex-row items-center gap-10 pt-2 pb-10 lg:pt-4 lg:pb-16">
      
      {/* CỘT TRÁI: TIÊU ĐỀ & LỜI KÊU GỌI HÀNH ĐỘNG */}
      <div className="flex-1 flex flex-col items-start text-left max-w-2xl">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-black tracking-widest uppercase bg-primary/10 border border-primary/20 dark:border-primary/30 text-[var(--text-primary)] rounded-full mb-6">
          <Zap className="w-3.5 h-3.5 fill-current" />
          Mang sức mạnh tới bạn
        </div>
        
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] text-[var(--text-color)] mb-6">
          Tập luyện thông minh. <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--text-primary)] to-indigo-500">
            Sống mạnh mẽ hơn.
          </span>
        </h1>
        
        <p className="text-base sm:text-lg text-[var(--text-muted)] leading-relaxed mb-8 max-w-xl">
          Hệ thống hỗ trợ tập luyện thông minh giúp bạn tối ưu hóa thời gian, thiết kế giáo án cá nhân hóa và phục hồi khoa học dựa trên công nghệ AI tiên tiến nhất.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <button 
            onClick={() => navigate(paths.dashboard)}
            className="flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-4 bg-primary text-black font-extrabold text-base rounded-2xl hover:bg-primary-hover hover:-translate-y-0.5 active:scale-95 transition-all duration-200 shadow-lg shadow-primary/20 cursor-pointer border-0"
          >
            Khám phá ngay
          </button>
          
          <button 
            onClick={() => navigate(paths.exercises)}
            className="flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-4 bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-color)] font-extrabold text-base rounded-2xl hover:border-primary/40 hover:-translate-y-0.5 active:scale-95 transition-all duration-200 shadow-sm cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current text-[var(--text-primary)]" />
            Xem demo
          </button>
        </div>
      </div>
      
      {/* CỘT PHẢI: HÌNH ẢNH NỔI BẬT & BADGES NỔI */}
      <div className="flex-1 w-full relative flex items-center justify-center">
        {/* Wrapper hình ảnh */}
        <div className="relative w-full max-w-[480px] aspect-[4/5] rounded-[3rem] overflow-hidden border border-[var(--border-color)] shadow-2xl group">
          <img 
            src="https://res.cloudinary.com/dvlp6zqdo/image/upload/v1781797855/LoongMilkGym_APP/homepage/hero_athlete.jpg" 
            alt="Gym Warrior" 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
        </div>

        {/* Badge 1: 30+ Bài tập (Góc trên trái) */}
        <div className="absolute top-6 left-4 sm:left-6 flex items-center gap-3 px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl shadow-xl animate-bounce-slow">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
            <Dumbbell className="w-5 h-5 text-primary" />
          </div>
          <div>
            <div className="text-sm font-black text-[var(--text-color)]">30+</div>
            <div className="text-[10px] font-bold text-[var(--text-muted)] tracking-wider uppercase">Bài tập</div>
          </div>
        </div>

        {/* Badge 2: 12 Lịch tập (Góc dưới phải) */}
        <div className="absolute bottom-8 right-4 sm:right-6 flex items-center gap-3 px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl shadow-xl animate-bounce-slow delay-300">
          <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-500">
            <Calendar className="w-5 h-5 text-indigo-500" />
          </div>
          <div>
            <div className="text-sm font-black text-[var(--text-color)]">12</div>
            <div className="text-[10px] font-bold text-[var(--text-muted)] tracking-wider uppercase">Lịch tập</div>
          </div>
        </div>

        {/* Badge 3: 100+ Học viên (Góc trên phải) */}
        <div className="absolute top-24 right-4 sm:right-6 flex items-center gap-3 px-4 py-2.5 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl shadow-xl">
          <div className="w-8 h-8 bg-green-500/10 rounded-lg flex items-center justify-center text-green-500">
            <Users className="w-4 h-4 text-green-500" />
          </div>
          <div>
            <div className="text-xs font-black text-[var(--text-color)]">100+</div>
            <div className="text-[9px] font-bold text-[var(--text-muted)] tracking-wider uppercase">Học viên</div>
          </div>
        </div>

      </div>

    </section>
  );
}

export default HeroSection;
