import React, { useState, useEffect, useRef } from "react";
import { ChevronDown, Check } from "lucide-react";

export default function CustomSelect({
  value,
  onChange,
  options = [],
  placeholder = "Chọn...",
  variant = "form",
  error = false,
  className = "",
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const allOptions =
    options.length > 0 && options[0]?.value === ""
      ? options
      : [{ label: placeholder, value: "" }, ...options.filter((o) => o.value !== "")];

  const selectedOption =
    allOptions.find((opt) => opt.value === value) ||
    (value ? { label: value, value } : allOptions[0]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const triggerClass =
    variant === "compact"
      ? `px-1.5 py-1 text-xs font-bold rounded-lg border-2 bg-[var(--input-bg)] text-[var(--text-color)] outline-none transition-all flex items-center gap-1 cursor-pointer min-w-[52px] ${
          error ? "border-rose-500/60" : "border-[var(--border-color)] focus:border-primary"
        }`
      : variant === "filter"
        ? `px-4 py-3 rounded-2xl bg-[var(--bg-color)] border border-[var(--border-color)] hover:border-primary text-xs font-black text-[var(--text-color)] cursor-pointer transition-all flex items-center gap-2 select-none`
        : `w-full rounded-xl bg-[var(--bg-color)] border px-4 py-3 text-xs sm:text-sm font-semibold outline-none transition-all text-[var(--text-color)] flex items-center justify-between cursor-pointer ${
            error ? "border-rose-500/60" : "border-[var(--border-color)] focus:border-primary/65"
          }`;

  return (
    <div className={`relative ${variant === "form" || variant === "filter" ? "w-full" : ""} ${className}`} ref={containerRef}>
      <button type="button" onClick={() => setIsOpen(!isOpen)} className={triggerClass}>
        <span className={!value && variant !== "compact" ? "text-[var(--text-muted)]" : ""}>
          {selectedOption?.label || placeholder}
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-[var(--text-muted)] transition-transform duration-200 shrink-0 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div
          className={`absolute left-0 py-1.5 min-w-full rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] shadow-2xl z-[200] overflow-hidden ${
            variant === "compact" ? "mt-1 min-w-[100px]" : "mt-1 w-full"
          }`}
        >
          <div className="max-h-[240px] overflow-y-auto no-scrollbar">
            {allOptions.map((opt, idx) => {
              const isSelected = opt.value === value;
              return (
                <button
                  key={`${opt.value}-${idx}`}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2.5 text-xs font-bold transition-colors flex items-center justify-between cursor-pointer ${
                    isSelected
                      ? "bg-primary/10 text-primary font-black"
                      : "text-[var(--text-color)] hover:bg-black/10 hover:text-primary"
                  }`}
                >
                  <span>{opt.label}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-primary shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
