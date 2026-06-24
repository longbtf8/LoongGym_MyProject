import React from "react";
import { Search, X, RefreshCw, FilterX } from "lucide-react";
import CustomSelect from "@/components/common/CustomSelect";

export default function FilterToolbar({
  searchVal,
  setSearchVal,
  searchPlaceholder = "Tìm kiếm...",
  filters = [],
  onRefresh,
  onClear,
  isFilterActive = false,
  extraActions
}) {
  return (
    <div className="p-5 border-b border-[var(--border-color)]/60 bg-black/10 space-y-4 rounded-t-3xl">
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full pl-11 pr-10 py-3 rounded-2xl bg-[var(--bg-color)] border border-[var(--border-color)]/60 focus:border-[var(--color-primary)] focus:outline-none text-xs font-semibold placeholder-[var(--text-muted)]/50 text-[var(--text-color)] transition-all"
          />
          {searchVal && (
            <button
              onClick={() => setSearchVal("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-color)] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {extraActions && (
          <div className="flex items-center gap-2 self-end md:self-auto">
            {extraActions}
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <div className="flex flex-wrap items-center gap-3">
          {filters.map((f, idx) => {
            if (f.type === "select") {
              return (
                <CustomSelect
                  key={idx}
                  value={f.value}
                  onChange={f.onChange}
                  options={f.options}
                  placeholder={f.placeholder}
                  variant="filter"
                />
              );
            }
            if (f.type === "date") {
              return (
                <div
                  key={idx}
                  className="flex items-center gap-2 bg-[var(--bg-color)] border border-[var(--border-color)]/60 rounded-2xl px-3 py-2"
                >
                  <span className="text-[9px] font-black text-[var(--text-muted)] uppercase">
                    {f.label}
                  </span>
                  <input
                    type="date"
                    value={f.value || ""}
                    onChange={(e) => f.onChange(e.target.value)}
                    className="bg-transparent text-xs font-bold text-[var(--text-color)] focus:outline-none cursor-pointer [&::-webkit-calendar-picker-indicator]:dark:invert [&::-webkit-calendar-picker-indicator]:opacity-75 [&::-webkit-calendar-picker-indicator]:hover:opacity-100 transition-opacity"
                  />
                </div>
              );
            }
            return null;
          })}
        </div>

        <div className="flex items-center gap-2">
          {onClear && isFilterActive && (
            <button
              onClick={onClear}
              className="px-4 py-2.5 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5"
              title="Xóa bộ lọc"
            >
              <FilterX className="w-4 h-4" />
              <span>Xóa lọc</span>
            </button>
          )}

          {onRefresh && (
            <button
              onClick={onRefresh}
              className="p-3 rounded-2xl bg-[var(--bg-color)] border border-[var(--border-color)]/60 text-[var(--text-muted)] hover:text-[var(--text-color)] hover:border-[var(--border-color)] transition-all cursor-pointer flex items-center justify-center"
              title="Làm mới"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
