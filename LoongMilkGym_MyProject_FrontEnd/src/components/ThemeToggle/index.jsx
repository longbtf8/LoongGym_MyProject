import React from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

function ThemeToggle({ className = "" }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`w-10 h-10 flex items-center justify-center rounded-full bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-muted)] cursor-pointer hover:text-[var(--text-color)] hover:bg-[var(--border-color)] transition-all duration-200 hover:-translate-y-0.5 ${className}`}
      aria-label="Chuyển đổi giao diện sáng/tối"
    >
      {theme === "light" ? (
        <Moon className="w-[18px] h-[18px] animate-slide-down" />
      ) : (
        <Sun className="w-[18px] h-[18px] animate-slide-down" />
      )}
    </button>
  );
}

export default ThemeToggle;
