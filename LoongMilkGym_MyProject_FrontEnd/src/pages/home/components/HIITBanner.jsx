import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Users } from "lucide-react";
import paths from "@/config/path";

function HIITBanner() {
  const navigate = useNavigate();

  const handleActionClick = () => {
    navigate(paths.community);
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
            <Users className="w-3 h-3 text-primary" />
            Cộng đồng LoongMilkGym
          </div>
          
          <h3 className="text-2xl sm:text-3xl font-black text-white m-0 tracking-tight leading-tight mb-3">
            Kết nối cùng cộng đồng tập luyện của chúng tôi
          </h3>

          <p className="text-xs sm:text-sm text-gray-300 leading-relaxed mb-6 max-w-2xl font-medium">
            Chia sẻ kiến thức, trao đổi kỹ năng và lan tỏa năng lượng tích cực cùng những người đang theo đuổi phiên bản khỏe hơn mỗi ngày.
          </p>

          <button
            onClick={handleActionClick}
            className="flex items-center gap-1.5 px-5 py-3 bg-primary text-black font-extrabold text-xs rounded-xl shadow-lg shadow-primary/15 hover:bg-primary-hover hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer border-0"
          >
            Đến cộng đồng
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
              src="/congdonggym.jpg" 
              alt="Cộng đồng LoongMilkGym" 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            />
            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/25 transition-all duration-300" />
          </div>
        </div>

      </div>
    </section>
  );
}

export default HIITBanner;
