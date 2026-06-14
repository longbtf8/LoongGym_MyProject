import React from "react";
import { Sparkles, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import paths from "@/config/path";

function AICoachInsight() {
  return (
    <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-3xl p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
          <Sparkles className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-xs sm:text-sm font-black text-[var(--text-color)] tracking-wider uppercase m-0 leading-none">AI Coach Insight</h3>
          <span className="text-[9px] text-primary font-black mt-1 block">Vừa cập nhật</span>
        </div>
      </div>

      <div className="p-4 bg-[var(--bg-color)] border border-[var(--border-color)] rounded-2xl text-xs font-semibold text-[var(--text-color)] leading-relaxed italic my-4 relative">
        "Hôm nay recovery tốt, tập buổi Push với cường độ trung bình để tối ưu hóa sự phát triển cơ bắp mà không gây quá tải."
      </div>

      <Link 
        to={paths.aiCoach}
        className="w-full py-3 bg-[var(--bg-color)] border border-[var(--border-color)] hover:border-primary/45 rounded-2xl text-xs font-bold text-[var(--text-color)] hover:text-[var(--text-primary)] transition-all flex items-center justify-center gap-2 cursor-pointer no-underline"
      >
        Hỏi AI Coach
        <ArrowRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  );
}

export default AICoachInsight;
