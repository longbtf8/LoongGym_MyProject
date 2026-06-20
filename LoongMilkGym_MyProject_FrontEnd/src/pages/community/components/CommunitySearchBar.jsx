import { Menu, Search } from "lucide-react";

export default function CommunitySearchBar({
  searchQuery,
  onSearchChange,
  onClearSearch,
  onOpenMobileNav,
}) {
  return (
    <div className="flex items-center gap-3 pt-0.5 pb-2 lg:pt-0 lg:pb-2.5 mb-[-8px] lg:mb-[-12px] shrink-0">
      <button
        onClick={onOpenMobileNav}
        className="flex lg:hidden items-center justify-center w-10 h-10 bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:bg-[var(--border-color)]/30 rounded-2xl text-[var(--text-color)] transition-all cursor-pointer shadow-sm shrink-0 animate-fade-in"
      >
        <Menu className="w-5 h-5" />
      </button>

      <div className="flex-1 relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Tìm bài viết, từ khóa, người dùng..."
          className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-color)] rounded-2xl pl-10 pr-10 py-2.5 text-xs font-semibold placeholder-[var(--text-muted)] focus:outline-none focus:border-primary transition-all shadow-sm"
        />
        {searchQuery && (
          <button
            onClick={onClearSearch}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-primary hover:text-primary-hover bg-transparent border-0 cursor-pointer"
          >
            Xóa
          </button>
        )}
      </div>
    </div>
  );
}

