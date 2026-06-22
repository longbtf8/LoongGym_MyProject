export default function FeedLoadingSkeleton() {
  return (
    <div className="flex flex-col gap-6 w-full relative">
      <style>{`
        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
        .shimmer-bg-dark {
          background: linear-gradient(
            90deg,
            rgba(255, 255, 255, 0.03) 25%,
            rgba(204, 255, 0, 0.08) 37%,
            rgba(255, 255, 255, 0.03) 63%
          );
          background-size: 200% 100%;
          animation: shimmer 1.6s infinite linear;
        }
      `}</style>

      {/* Top Gym-themed micro loader banner */}
      <div className="flex items-center justify-center gap-3 py-3 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border border-primary/20 rounded-2xl shadow-sm animate-pulse">
        <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-black tracking-widest uppercase text-primary">
          Đang nạp bảng tin LoongMilkGym...
        </span>
      </div>

      {[1, 2].map((n) => (
        <div
          key={n}
          className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-3xl p-6 shadow-sm flex flex-col gap-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Avatar Shimmer */}
              <div className="w-10 h-10 rounded-full shrink-0 shimmer-bg-dark" />
              <div className="flex flex-col gap-2">
                {/* Author Name Shimmer */}
                <div className="h-3.5 w-32 rounded-full shimmer-bg-dark" />
                {/* Time Shimmer */}
                <div className="h-2.5 w-20 rounded-full shimmer-bg-dark opacity-75" />
              </div>
            </div>
            {/* Options Button Shimmer */}
            <div className="w-6 h-6 rounded-lg shimmer-bg-dark opacity-50" />
          </div>

          <div className="flex flex-col gap-2.5 mt-2">
            {/* Post Content Lines Shimmer */}
            <div className="h-3 w-full rounded-full shimmer-bg-dark" />
            <div className="h-3 w-[92%] rounded-full shimmer-bg-dark" />
            <div className="h-3 w-[65%] rounded-full shimmer-bg-dark" />
          </div>

          {/* Media Box Shimmer */}
          <div className="w-full aspect-[16/9] sm:aspect-[21/9] rounded-2xl mt-1 shimmer-bg-dark opacity-80" />
          <div className="h-[1px] bg-[var(--border-color)]/30 mt-1" />
          <div className="flex items-center justify-around">
            {/* Reactions Shimmer */}
            <div className="h-8 w-24 rounded-xl shimmer-bg-dark opacity-60" />
            {/* Comments Shimmer */}
            <div className="h-8 w-24 rounded-xl shimmer-bg-dark opacity-60" />
          </div>
        </div>
      ))}
    </div>
  );
}
