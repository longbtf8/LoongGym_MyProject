import React from "react";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

function ActiveInjuryBanner({ activeInjuries, handleResolveInjury }) {
  if (!activeInjuries || activeInjuries.length === 0) return null;

  return (
    <div className="bg-red-500/10 border-2 border-red-500/30 rounded-3xl p-5 flex flex-col sm:flex-row items-start gap-4 animate-pulse-slow shadow-lg">
      <div className="bg-red-500 text-black p-2 rounded-2xl">
        <AlertTriangle className="w-6 h-6 font-bold" />
      </div>
      <div className="flex-1">
        <h4 className="font-extrabold text-sm sm:text-base text-red-400 uppercase tracking-wide">
          Cảnh báo chấn thương đang hoạt động!
        </h4>
        <p className="text-xs text-[var(--text-color)] font-medium mt-1">
          Hệ thống ghi nhận bạn đang gặp chấn thương vùng{" "}
          <strong className="text-red-400">
            {activeInjuries.map((i) => i.bodyPart).join(", ")}
          </strong>
          . Vui lòng giảm 30-50% cường độ tập, tránh các bài tập tác động trực tiếp vùng này.
        </p>
        <div className="flex flex-wrap gap-2 mt-3">
          {activeInjuries.map((injury) => (
            <button
              key={injury.id}
              onClick={() => handleResolveInjury(injury.id)}
              className="bg-emerald-500 hover:bg-emerald-600 text-black text-[10px] font-black uppercase tracking-wider px-3.5 py-1.5 rounded-xl border-0 flex items-center gap-1 cursor-pointer transition-all"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Đã Khỏi: {injury.bodyPart}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ActiveInjuryBanner;
