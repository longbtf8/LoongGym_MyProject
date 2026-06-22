import React from "react";
import { Link } from "react-router-dom";
import { Dumbbell, CalendarDays, ShoppingBag, Users } from "lucide-react";
import paths from "@/config/path";

function QuickActionsGrid() {
  return (
    <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-3xl p-6 shadow-sm">
      <h3 className="text-xs sm:text-sm font-black text-[var(--text-color)] tracking-wider uppercase mb-4">Lối tắt nhanh</h3>
      
      <div className="grid grid-cols-2 gap-3">
        <Link 
          to={paths.exercises}
          className="flex flex-col items-center justify-center p-4 bg-[var(--bg-color)]/60 border border-[var(--border-color)] hover:border-primary/45 rounded-2xl transition-all group no-underline shadow-sm"
        >
          <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-2.5 transition-colors group-hover:bg-primary group-hover:text-black">
            <Dumbbell className="w-4.5 h-4.5" />
          </div>
          <span className="text-xs font-bold text-[var(--text-color)]">Thư viện</span>
        </Link>

        <Link 
          to={paths.myPlan}
          className="flex flex-col items-center justify-center p-4 bg-[var(--bg-color)]/60 border border-[var(--border-color)] hover:border-cyan-500/45 rounded-2xl transition-all group no-underline shadow-sm"
        >
          <div className="w-9 h-9 rounded-full bg-cyan-500/10 text-cyan-500 flex items-center justify-center mb-2.5 transition-colors group-hover:bg-cyan-500 group-hover:text-black">
            <CalendarDays className="w-4.5 h-4.5" />
          </div>
          <span className="text-xs font-bold text-[var(--text-color)]">Lịch tập</span>
        </Link>

        <Link 
          to={paths.store}
          className="flex flex-col items-center justify-center p-4 bg-[var(--bg-color)]/60 border border-[var(--border-color)] hover:border-orange-500/45 rounded-2xl transition-all group no-underline shadow-sm"
        >
          <div className="w-9 h-9 rounded-full bg-orange-500/10 text-orange-500 flex items-center justify-center mb-2.5 transition-colors group-hover:bg-orange-500 group-hover:text-black">
            <ShoppingBag className="w-4.5 h-4.5" />
          </div>
          <span className="text-xs font-bold text-[var(--text-color)]">Cửa hàng</span>
        </Link>

        <Link 
          to={paths.community}
          className="flex flex-col items-center justify-center p-4 bg-[var(--bg-color)]/60 border border-[var(--border-color)] hover:border-indigo-500/45 rounded-2xl transition-all group no-underline shadow-sm"
        >
          <div className="w-9 h-9 rounded-full bg-indigo-500/10 text-indigo-500 flex items-center justify-center mb-2.5 transition-colors group-hover:bg-indigo-500 group-hover:text-black">
            <Users className="w-4.5 h-4.5" />
          </div>
          <span className="text-xs font-bold text-[var(--text-color)]">Cộng đồng</span>
        </Link>
      </div>
    </div>
  );
}

export default QuickActionsGrid;
