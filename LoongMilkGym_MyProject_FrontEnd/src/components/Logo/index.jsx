import React from "react";
import { Link } from "react-router-dom";
import { useTheme } from "@/context/ThemeContext";
import paths from "@/config/path";

function Logo({ className = "text-2xl", to = paths.home, isLink = true }) {
  const { theme } = useTheme();

  const logoText = (
    <span className={`font-black tracking-tighter bg-gradient-to-r bg-clip-text text-transparent select-none filter transition-all duration-300 drop-shadow-[0_2px_8px_rgba(204,255,0,0.15)] ${className} ${
      theme === "light"
        ? "from-[#99cc00] to-[#00a8cc]"
        : "from-[#ccff00] to-[#00f5d4]"
    }`}>
      LoongMilKGym
    </span>
  );

  if (isLink) {
    return (
      <Link to={to} className="no-underline inline-flex items-center shrink-0">
        {logoText}
      </Link>
    );
  }

  return logoText;
}

export default Logo;
