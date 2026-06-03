import React from "react";
import { Heart, Moon, Zap, User } from "lucide-react";

function RecoveryScore({ recoveryScore }) {
  return (
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
          <Zap className="w-4.5 h-4.5 text-primary mb-1" />
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
  );
}

export default RecoveryScore;
