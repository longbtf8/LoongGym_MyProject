import React from "react";
import { Link } from "react-router-dom";
import { Heart, Moon, Zap, User } from "lucide-react";

function RecoveryScore({ recovery }) {
  const {
    recoveryScore = 0,
    sleepHoursText = "--",
    energyText = "--",
    sorenessText = "--",
    hasLog = false,
  } = recovery || {};

  // Determine recovery status text and color
  let statusText = "Chưa ghi nhận";
  let statusColor = "text-[var(--text-muted)]";
  if (hasLog) {
    if (recoveryScore >= 80) {
      statusText = "Tốt";
      statusColor = "text-emerald-500";
    } else if (recoveryScore >= 50) {
      statusText = "Trung bình";
      statusColor = "text-yellow-500";
    } else {
      statusText = "Kém";
      statusColor = "text-red-500";
    }
  }

  return (
    <Link
      to="/recovery"
      className="block bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-3xl p-6 shadow-sm hover:border-primary transition-all duration-300 group cursor-pointer"
    >
      <div className="flex justify-between items-center mb-5">
        <h3 className="text-xs sm:text-sm font-black text-[var(--text-color)] tracking-wider uppercase flex items-center gap-1.5">
          <Heart className="w-4.5 h-4.5 text-[var(--text-muted)] group-hover:text-primary transition-colors" />
          Chỉ số phục hồi
        </h3>
        <span className="text-[10px] bg-primary/10 text-primary font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
          Chi tiết
        </span>
      </div>

      {/* Vòng tròn SVG */}
      <div className="flex justify-center my-2">
        <div className="relative w-28 h-28 flex items-center justify-center mx-auto">
          <svg className="w-28 h-28 transform -rotate-90 absolute top-0 left-0">
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
              className={`transition-all duration-1000 ease-out ${
                hasLog
                  ? recoveryScore >= 80
                    ? "stroke-emerald-500"
                    : recoveryScore >= 50
                    ? "stroke-yellow-500"
                    : "stroke-red-500"
                  : "stroke-neutral-400"
              }`}
              strokeWidth="7"
              fill="transparent"
              strokeDasharray={289.03}
              strokeDashoffset={289.03 - (recoveryScore / 100) * 289.03}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center text-center">
            <span className="text-2xl font-black text-[var(--text-color)]">
              {hasLog ? `${recoveryScore}%` : "--"}
            </span>
            <span className={`text-[10px] font-black uppercase tracking-wider mt-0.5 ${statusColor}`}>
              {statusText}
            </span>
          </div>
        </div>
      </div>

      {/* 3 Sub Stats */}
      <div className="grid grid-cols-3 gap-2 mt-5">
        <div className="flex flex-col items-center justify-center p-2.5 bg-[var(--bg-color)] border border-[var(--border-color)] rounded-2xl text-center">
          <Moon className="w-4 h-4 text-purple-400 mb-1" />
          <span className="text-[10px] font-medium text-[var(--text-muted)]">Giấc ngủ</span>
          <span className="text-xs font-black text-[var(--text-color)] mt-0.5">{sleepHoursText}</span>
        </div>
        <div className="flex flex-col items-center justify-center p-2.5 bg-[var(--bg-color)] border border-[var(--border-color)] rounded-2xl text-center">
          <Zap className="w-4.5 h-4.5 text-primary mb-1" />
          <span className="text-[10px] font-medium text-[var(--text-muted)]">Năng lượng</span>
          <span className="text-xs font-black text-[var(--text-color)] mt-0.5">{energyText}</span>
        </div>
        <div className="flex flex-col items-center justify-center p-2.5 bg-[var(--bg-color)] border border-[var(--border-color)] rounded-2xl text-center">
          <User className="w-4 h-4 text-emerald-400 mb-1" />
          <span className="text-[10px] font-medium text-[var(--text-muted)]">Đau cơ</span>
          <span className="text-xs font-black text-[var(--text-color)] mt-0.5">{sorenessText}</span>
        </div>
      </div>
    </Link>
  );
}

export default RecoveryScore;
