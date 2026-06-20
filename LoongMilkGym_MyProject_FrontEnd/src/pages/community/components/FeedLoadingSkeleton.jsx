export default function FeedLoadingSkeleton() {
  return (
    <div className="flex flex-col gap-6 w-full">
      {[1, 2, 3].map((n) => (
        <div
          key={n}
          className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-3xl p-6 shadow-sm flex flex-col gap-4 animate-pulse"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[var(--border-color)]/30 shrink-0" />
              <div className="flex flex-col gap-2">
                <div className="h-3.5 w-28 bg-[var(--border-color)]/30 rounded-full" />
                <div className="h-2.5 w-16 bg-[var(--border-color)]/20 rounded-full" />
              </div>
            </div>
            <div className="w-6 h-6 bg-[var(--border-color)]/20 rounded-lg" />
          </div>

          <div className="flex flex-col gap-2.5 mt-2">
            <div className="h-3 w-full bg-[var(--border-color)]/30 rounded-full" />
            <div className="h-3 w-[92%] bg-[var(--border-color)]/30 rounded-full" />
            <div className="h-3 w-[65%] bg-[var(--border-color)]/20 rounded-full" />
          </div>

          <div className="w-full aspect-[16/9] sm:aspect-[21/9] bg-[var(--border-color)]/25 rounded-2xl mt-1" />
          <div className="h-[1px] bg-[var(--border-color)]/30 mt-1" />
          <div className="flex items-center justify-around">
            <div className="h-8 w-20 bg-[var(--border-color)]/25 rounded-xl" />
            <div className="h-8 w-20 bg-[var(--border-color)]/25 rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  );
}

