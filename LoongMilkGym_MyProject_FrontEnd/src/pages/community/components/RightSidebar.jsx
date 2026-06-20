import YoutubeIcon from "./YoutubeIcon";

export default function RightSidebar({ trainers }) {
  return (
    <aside className="hidden lg:flex lg:flex-col gap-6 w-[280px] shrink-0 lg:h-full lg:overflow-y-auto lg:pr-1 [scrollbar-width:none]">
      <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-3xl p-6 shadow-sm flex flex-col gap-4">
        <h3 className="text-sm font-black text-[var(--text-color)] uppercase tracking-wider">
          Gợi ý Huấn Luyện Viên
        </h3>
        <div className="flex flex-col gap-3">
          {trainers.map((trainer, i) => (
            <a
              key={i}
              href={trainer.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3 border border-[var(--border-color)]/50 bg-[var(--border-color)]/10 hover:bg-[var(--border-color)]/25 rounded-2xl transition-all group cursor-pointer"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <img
                  src={trainer.avatar}
                  alt={trainer.name}
                  className="w-9 h-9 rounded-full object-cover border border-primary/20 shrink-0"
                />
                <div className="overflow-hidden">
                  <h4 className="text-xs font-black text-[var(--text-color)] truncate group-hover:text-primary transition-all">
                    {trainer.name}
                  </h4>
                  <p className="text-[9px] text-[var(--text-muted)] font-bold mt-0.5 truncate">
                    {trainer.role}
                  </p>
                </div>
              </div>
              <div className="w-8 h-8 bg-red-600/10 text-red-500 rounded-xl flex items-center justify-center shrink-0 ml-2 group-hover:bg-red-600/20 transition-all">
                <YoutubeIcon className="w-4 h-4 fill-red-500 text-red-500" />
              </div>
            </a>
          ))}
        </div>
      </div>
    </aside>
  );
}

