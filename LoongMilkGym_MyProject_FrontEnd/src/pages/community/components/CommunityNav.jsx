export default function CommunityNav({ activeNav, items, onSelect }) {
  return (
    <nav className="flex flex-col gap-1">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = activeNav === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onSelect(item.id)}
            className={`flex items-center gap-3 w-full px-4 py-3.5 text-xs font-black rounded-2xl transition-all cursor-pointer uppercase tracking-wider ${
              isActive
                ? "bg-primary text-black shadow-md"
                : "text-[var(--text-muted)] hover:text-[var(--text-color)] hover:bg-[var(--border-color)]/20"
            }`}
          >
            <Icon className="w-4 h-4" />
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

