import React, { useState, useRef } from "react";
import { ChevronDown, Check } from "lucide-react";
import { useClickOutside } from "@/hooks/useClickOutside";

export default function SortDropdown({ sort, setSort }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Tự động đóng dropdown khi click ra bên ngoài
  useClickOutside(dropdownRef, () => setIsOpen(false));

  const options = [
    { value: "popular", label: "Phổ biến nhất" },
    { value: "favorite", label: "Đã yêu thích" },
    { value: "newest", label: "Mới nhất" },
    { value: "name-asc", label: "Tên A → Z" }
  ];

  const activeOption = options.find((opt) => opt.value === sort) || options[0];

  return (
    <div className="relative shrink-0" ref={dropdownRef}>
      {/* Nút bấm hiển thị trạng thái hiện tại (Đã ép chiều cao h-10, ngăn co cụm bằng shrink-0 và không cho ngắt dòng) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between gap-1.5 h-10 w-full min-w-[145px] sm:min-w-[160px] bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-color)] text-xs font-semibold rounded-lg px-3 sm:px-3.5 cursor-pointer hover:border-[#ccff00]/40 transition-all select-none shrink-0 flex-nowrap whitespace-nowrap"
      >
        <div className="flex items-center gap-1">
          <span className="text-[var(--text-muted)] font-normal">Sắp xếp:</span>
          <span>{activeOption.label}</span>
        </div>
        <ChevronDown size={14} className={`transition-transform duration-200 shrink-0 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {/* Popover tùy chỉnh danh sách sắp xếp */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-48 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl shadow-2xl p-1 z-50 animate-slide-down">
          {options.map((opt) => {
            const isActive = opt.value === sort;
            return (
              <button
                key={opt.value}
                onClick={() => {
                  setSort(opt.value);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-left text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  isActive
                    ? "bg-primary text-black"
                    : "text-[var(--text-color)] hover:bg-[var(--border-color)]/30"
                }`}
              >
                {/* Dấu tích ✓ */}
                <span className="w-3.5 flex items-center justify-center shrink-0">
                  {isActive && <Check size={14} className="stroke-[3px]" />}
                </span>
                <span>{opt.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
