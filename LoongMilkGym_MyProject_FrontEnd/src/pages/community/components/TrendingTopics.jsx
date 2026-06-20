import { Flame } from "lucide-react";

export default function TrendingTopics() {
  return (
    <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-3xl p-6 shadow-sm flex flex-col gap-4">
      <h3 className="text-sm font-black text-[var(--text-color)] uppercase tracking-wider">
        Xu hướng (Trending)
      </h3>
      <div className="flex flex-col gap-3">
        <div className="flex justify-between items-center">
          <div>
            <h4 className="text-xs font-black text-[var(--text-color)]">#LegDay</h4>
            <p className="text-[10px] text-[var(--text-muted)] font-bold">12.5k bài viết</p>
          </div>
          <Flame className="w-4 h-4 text-orange-500" />
        </div>
        <div className="flex justify-between items-center">
          <div>
            <h4 className="text-xs font-black text-[var(--text-color)]">#PushDay</h4>
            <p className="text-[10px] text-[var(--text-muted)] font-bold">8.2k bài viết</p>
          </div>
          <Flame className="w-4 h-4 text-orange-500 animate-pulse" />
        </div>
        <div className="flex justify-between items-center">
          <div>
            <h4 className="text-xs font-black text-[var(--text-color)]">#YogaFlow</h4>
            <p className="text-[10px] text-[var(--text-muted)] font-bold">5.1k bài viết</p>
          </div>
          <Flame className="w-4 h-4 text-orange-500" />
        </div>
      </div>
    </div>
  );
}

