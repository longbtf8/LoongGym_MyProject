import { Compass } from "lucide-react";

export default function EmptyFeed({ searchQuery }) {
  return (
    <div className="text-center py-20 border border-dashed border-[var(--border-color)] rounded-3xl">
      <Compass className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-4 opacity-50" />
      <p className="text-sm font-semibold text-[var(--text-muted)]">
        {searchQuery
          ? "Không tìm thấy bài viết hoặc người dùng phù hợp."
          : "Chưa có bài viết công khai nào. Hãy là người đầu tiên chia sẻ!"}
      </p>
    </div>
  );
}

