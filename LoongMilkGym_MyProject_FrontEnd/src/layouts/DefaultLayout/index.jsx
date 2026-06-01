import React from "react";
import { useTheme } from "@/context/ThemeContext";
import { Link } from "react-router-dom";

function DefaultLayout({ children }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="flex flex-col min-h-screen bg-[var(--bg-color)] text-[var(--text-color)] font-sans transition-colors duration-300">
      {/* Sticky Premium Glassmorphism Navbar */}
      <header className="sticky top-0 z-40 w-full bg-[var(--bg-color)]/80 backdrop-blur-md border-b border-[var(--border-color)] transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Chameleon Logo */}
          <Link to="/" className="no-underline flex items-center gap-2">
            <span className={`text-2xl font-black tracking-tighter bg-gradient-to-r bg-clip-text text-transparent select-none filter transition-all duration-300 drop-shadow-[0_2px_8px_rgba(204,255,0,0.15)] ${
              theme === "light" 
                ? "from-[#8db400] to-[#0092ad]" 
                : "from-[#ccff00] to-[#00f5d4]"
            }`}>
              LoongMilKGym
            </span>
          </Link>

          {/* Right actions */}
          <div className="flex items-center gap-4">
            {/* Theme switcher */}
            <button 
              className="bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-color)] px-4 py-2 rounded-full cursor-pointer text-xs font-semibold shadow-sm hover:bg-[var(--border-color)] hover:-translate-y-0.5 transition-all duration-200"
              onClick={toggleTheme}
            >
              {theme === "light" ? "🌙 Tối" : "☀️ Sáng"}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-[32px] p-6 sm:p-10 shadow-sm relative overflow-hidden transition-colors duration-300">
          {children}
        </div>
      </main>

      {/* Modern Footer */}
      <footer className="w-full bg-[var(--bg-secondary)] border-t border-[var(--border-color)] py-6 mt-auto transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-[var(--text-muted)]">
          <p>© 2026 <span className="font-extrabold text-[var(--text-color)]">LoongMilKGym</span>. All rights reserved. — Đồng hành cùng sức mạnh cá nhân.</p>
        </div>
      </footer>
    </div>
  );
}

export default DefaultLayout;
