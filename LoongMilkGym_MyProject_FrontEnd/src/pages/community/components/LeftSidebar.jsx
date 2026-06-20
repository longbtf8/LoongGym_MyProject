import CommunityNav from "./CommunityNav";
import TrendingTopics from "./TrendingTopics";

export default function LeftSidebar({ activeNav, navItems, onNavSelect }) {
  return (
    <aside className="hidden lg:flex lg:flex-col gap-6 w-[240px] shrink-0 lg:h-full lg:overflow-y-auto lg:pr-1 [scrollbar-width:none]">
      <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-3xl p-5 shadow-sm">
        <CommunityNav activeNav={activeNav} items={navItems} onSelect={onNavSelect} />
      </div>
      <TrendingTopics />
    </aside>
  );
}

