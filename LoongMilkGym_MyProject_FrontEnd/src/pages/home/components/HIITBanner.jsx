import React from "react";
import { Play, Sparkles, Flame, ShieldCheck } from "lucide-react";

function HIITBanner() {
  return (
    <section className="w-full py-8">
      <div className="relative overflow-hidden w-full bg-gradient-to-br from-gray-900 to-indigo-950 border border-indigo-500/25 rounded-[2.5rem] shadow-xl p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-10">
        
        {/* Decorative background lights */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-60 h-60 bg-primary/5 rounded-full blur-[80px] pointer-events-none" />

        {/* LEFT SIDE: INFOS */}
        <div className="flex-1 flex flex-col items-start text-left z-10">
          <div className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 border border-primary/25 rounded-full text-primary text-[10px] font-black tracking-widest uppercase mb-4">
            <Sparkles className="w-3 h-3 text-primary fill-current" />
            Dành riêng cho bạn
          </div>
          
          <h3 className="text-2xl sm:text-3xl font-black text-white m-0 tracking-tight leading-tight mb-4">
            Đốt cháy mỡ thừa cùng HIIT 30'
          </h3>

          <div className="flex flex-wrap items-center gap-y-2 gap-x-6 mb-6">
            <span className="flex items-center gap-1.5 text-xs text-gray-300 font-extrabold">
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              Mục tiêu: Đốt mỡ & Sức bền
            </span>
            <span className="flex items-center gap-1.5 text-xs text-primary font-black">
              <Flame className="w-4 h-4 text-primary fill-current" />
              Lượng calo: ~400Kcal
            </span>
          </div>

          {/* Difficulty/Progress bar indicator */}
          <div className="w-full max-w-sm">
            <div className="flex justify-between items-center text-[10px] font-black uppercase text-gray-400 tracking-wider mb-2">
              <span>Cường độ tập luyện</span>
              <span className="text-primary font-black">75% (Nâng cao)</span>
            </div>
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden border border-white/5">
              <div 
                className="h-full bg-gradient-to-r from-primary to-indigo-500 rounded-full transition-all duration-1000"
                style={{ width: "75%" }}
              />
            </div>
          </div>
        </div>

        {/* RIGHT SIDE: VIDEO PREVIEW THUMBNAIL */}
        <div className="w-full md:w-auto shrink-0 z-10 flex items-center justify-center">
          <div className="relative w-full max-w-[320px] aspect-video rounded-3xl overflow-hidden border border-white/10 shadow-2xl group cursor-pointer">
            <img 
              src="https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=600" 
              alt="HIIT Workout Video" 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            />
            {/* Dark mask overlay */}
            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/25 transition-all duration-300" />

            {/* Neon Green Play Button */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-14 h-14 rounded-full bg-primary text-black flex items-center justify-center shadow-lg shadow-primary/30 group-hover:scale-110 group-hover:bg-white transition-all duration-300">
                <Play className="w-5 h-5 fill-current ml-0.5" />
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}

export default HIITBanner;
