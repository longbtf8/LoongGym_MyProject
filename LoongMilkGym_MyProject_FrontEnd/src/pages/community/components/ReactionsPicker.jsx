import { useState, useEffect, useRef } from "react";
import { ThumbsUp } from "lucide-react";
import { REACTION_EMOJIS } from "../constants/community.constants";

export default function ReactionsPicker({ onSelect, onClose, className = "", style = {}, variant = "post", onMouseEnter, onMouseLeave }) {
  const pickerRef = useRef(null);
  const [clickedIndex, setClickedIndex] = useState(null);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const mouseLeaveTimeoutRef = useRef(null);

  const isComment = variant === "comment";

  // Sizing parameters
  const containerPadding = isComment ? "px-2.5 py-1" : "px-2.5 sm:px-4 py-1.5 sm:py-2.5";
  const containerGap = isComment ? "gap-1.5 sm:gap-2.5" : "gap-1.5 sm:gap-3";
  const buttonSize = isComment ? "w-7.5 h-7.5 sm:w-9 sm:h-9" : "w-8 h-8 sm:w-10 sm:h-10";
  const textSize = isComment ? "text-lg sm:text-2xl" : "text-xl sm:text-3xl";
  const thumbsUpSize = isComment ? "w-[18px] h-[18px] sm:w-[26px] sm:h-[26px]" : "w-[22px] h-[22px] sm:w-[32px] sm:h-[32px]";
  const tooltipOffset = isComment ? "bottom-[calc(100%+4px)]" : "bottom-[calc(100%+4px)] sm:bottom-[calc(100%+6px)]";

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener("pointerdown", handleOutsideClick);
    return () => document.removeEventListener("pointerdown", handleOutsideClick);
  }, [onClose]);

  useEffect(() => {
    return () => {
      if (mouseLeaveTimeoutRef.current) {
        clearTimeout(mouseLeaveTimeoutRef.current);
      }
    };
  }, []);

  const handleMouseEnter = () => {
    if (mouseLeaveTimeoutRef.current) {
      clearTimeout(mouseLeaveTimeoutRef.current);
    }
    if (onMouseEnter) {
      onMouseEnter();
    }
  };

  const handleMouseLeave = () => {
    if (mouseLeaveTimeoutRef.current) {
      clearTimeout(mouseLeaveTimeoutRef.current);
    }
    mouseLeaveTimeoutRef.current = setTimeout(() => {
      onClose();
    }, 180);
    if (onMouseLeave) {
      onMouseLeave();
    }
  };

  const handleEmojiClick = (type, index) => {
    setClickedIndex(index);
    setTimeout(() => {
      onSelect(type);
    }, 180);
  };

  const hasCoords = Object.keys(style).length > 0;
  const positioningClass = hasCoords ? "" : "absolute bottom-[calc(100%+4px)] left-0";

  return (
    <div
      ref={pickerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`z-50 pt-3 pb-2 ${positioningClass} ${className}`}
      style={style}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Invisible bridge to prevent mouseleave flicker when moving cursor from button to picker */}
      <div className="absolute inset-x-0 -bottom-2 top-0 bg-transparent -z-10" />

      <div className={`flex items-center bg-white dark:bg-neutral-800 border border-neutral-200/80 dark:border-neutral-700/80 rounded-full shadow-2xl animate-reactions-in whitespace-nowrap ${containerPadding} ${containerGap}`}>
        {REACTION_EMOJIS.map((react, index) => (
          <button
            key={react.type}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleEmojiClick(react.type, index);
            }}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
            style={{ animationDelay: `${index * 30}ms` }}
            className={`relative ${buttonSize} ${textSize} cursor-pointer shrink-0 outline-none select-none animate-emoji-pop reaction-emoji-btn flex items-center justify-center rounded-full ${
              clickedIndex === index ? "animate-emoji-selected" : ""
            }`}
            aria-label={react.label}
          >
            {hoveredIndex === index && (
              <div className={`absolute ${tooltipOffset} left-1/2 bg-black/85 dark:bg-neutral-900/95 text-white text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded shadow-lg pointer-events-none whitespace-nowrap animate-tooltip-in z-30`}>
                {react.label}
              </div>
            )}
            <span className="emoji-icon-wrapper flex items-center justify-center">
              {react.type === "like" ? (
                <ThumbsUp className={`${thumbsUpSize} text-[#4d7c0f] dark:text-[#ccff00] fill-[#ccff00] transition-transform duration-200`} />
              ) : (
                react.emoji
              )}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
