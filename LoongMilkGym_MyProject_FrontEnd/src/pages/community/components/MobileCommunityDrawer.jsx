import { Compass, X } from "lucide-react";
import CommunityNav from "./CommunityNav";

export default function MobileCommunityDrawer({
  activeNav,
  navItems,
  onClose,
  onNavSelect,
}) {
  return (
    <div className="fixed inset-0 z-50 lg:hidden flex">
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity animate-fade-in"
        onClick={onClose}
      />

      <div className="relative flex flex-col w-[280px] max-w-[85%] h-full bg-[var(--bg-secondary)] border-r border-[var(--border-color)] p-6 shadow-2xl animate-slide-right text-left justify-between">
        <div className="flex flex-col gap-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Compass className="w-5 h-5 text-primary" />
              <h3 className="text-sm font-black text-[var(--text-color)] uppercase tracking-widest">
                Danh mục
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-[var(--border-color)]/45 rounded-xl text-[var(--text-muted)] cursor-pointer"
            >
              <X className="w-4.5 h-4.5" />
            </button>
          </div>

          <CommunityNav
            activeNav={activeNav}
            items={navItems}
            onSelect={(id) => {
              onNavSelect(id);
              onClose();
            }}
          />
        </div>
      </div>
    </div>
  );
}

