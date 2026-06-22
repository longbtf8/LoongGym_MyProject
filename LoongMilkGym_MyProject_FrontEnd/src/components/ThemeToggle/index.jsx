import React from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

function ThemeToggle({ className = "" }) {
  const { theme, toggleTheme } = useTheme();

  // Kiểm tra xem className truyền vào đã có position chưa (fixed, absolute, relative)
  const hasPosition = /\b(fixed|absolute|relative)\b/.test(className);
  const positionClass = hasPosition ? "" : "relative";

  return (
    <div className={`${positionClass} group ${className}`}>
      <button
        onClick={toggleTheme}
        className="w-10 h-10 flex items-center justify-center rounded-full bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-muted)] cursor-pointer hover:text-[var(--text-color)] hover:bg-[var(--border-color)] transition-all duration-200 hover:-translate-y-0.5 relative before:absolute before:content-[''] before:w-full before:h-4 before:-bottom-3 before:left-0"
        aria-label="Chuyển đổi giao diện sáng/tối"
      >
        {theme === "light" ? (
          <Moon className="w-[18px] h-[18px] animate-slide-down" />
        ) : (
          <Sun className="w-[18px] h-[18px] animate-slide-down" />
        )}
      </button>

      {/* Tooltip đồng bộ thích nghi cao cấp */}
      <span className="absolute -bottom-10 left-1/2 -translate-x-1/2 px-3 py-1.5 text-[10px] font-bold rounded-lg whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 z-50 shadow-md border 
        bg-neutral-900 text-white border-neutral-800
        dark:bg-neutral-800 dark:text-neutral-100 dark:border-primary/20 dark:shadow-[0_0_12px_rgba(204,255,0,0.12)]"
      >
        {theme === "light" ? "Bật giao diện tối" : "Bật giao diện sáng"}
      </span>
    </div>
  );
}

export default ThemeToggle;
