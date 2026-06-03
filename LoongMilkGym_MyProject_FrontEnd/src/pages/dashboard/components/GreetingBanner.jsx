import React from "react";
import { Zap, Play } from "lucide-react";

function GreetingBanner({ userInfo, userName, userInitial, displayGoal }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-3xl shadow-sm transition-all duration-200">
      <div className="flex items-center gap-4">
        {/* Avatar */}
        {userInfo?.profile?.avatarUrl ? (
          <img 
            src={userInfo.profile.avatarUrl} 
            alt={userName} 
            className="w-16 h-16 rounded-full object-cover border-2 border-primary/40 shadow-sm"
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-black text-primary border border-primary/20 shadow-sm">
            {userInitial}
          </div>
        )}
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-[var(--text-color)] m-0">
            Xin chào, {userName || "Alex"}
          </h1>
          <div className="flex items-center gap-1.5 mt-1.5">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-bold bg-amber-500/10 text-amber-700 border border-amber-500/20 dark:bg-amber-500/15 dark:text-amber-400 dark:border-amber-500/30 rounded-full">
              <Zap className="w-3 h-3 fill-current" />
              {displayGoal}
            </span>
          </div>
        </div>
      </div>
      
      <button className="flex items-center justify-center gap-2 px-6 py-3.5 bg-primary text-black font-extrabold text-sm rounded-2xl hover:bg-primary-hover hover:-translate-y-0.5 active:scale-95 transition-all duration-200 shadow-md shadow-primary/10 cursor-pointer w-full sm:w-auto">
        <Play className="w-4 h-4 fill-current" />
        Bắt đầu tập hôm nay
      </button>
    </div>
  );
}

export default GreetingBanner;
