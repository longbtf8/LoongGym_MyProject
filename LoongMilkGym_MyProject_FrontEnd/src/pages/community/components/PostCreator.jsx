import { Dumbbell, Image, Smile } from "lucide-react";
import { DEFAULT_AVATAR_URL } from "../constants/community.constants";

export default function PostCreator({ userInfo, onCreatePost, onProfileClick }) {
  return (
    <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-3xl p-6 shadow-sm flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <div
          onClick={onProfileClick}
          className="w-10 h-10 rounded-full p-[2px] bg-gradient-to-tr from-primary to-[#00f5d4] shadow-sm cursor-pointer hover:opacity-90 shrink-0"
        >
          <img
            src={userInfo?.profile?.avatarUrl || DEFAULT_AVATAR_URL}
            alt="avatar"
            className="w-full h-full rounded-full object-cover bg-black"
          />
        </div>
        <button
          onClick={onCreatePost}
          className="flex-1 bg-[var(--border-color)]/25 hover:bg-[var(--border-color)]/45 text-left px-5 py-3 rounded-full text-xs font-semibold text-[var(--text-muted)] transition-all cursor-pointer border border-[var(--border-color)]/20 truncate"
        >
          Bạn đang cảm thấy thế nào? Ghi nhật ký tập luyện...
        </button>
      </div>

      <div className="h-[1px] bg-[var(--border-color)]/50" />

      <div className="flex justify-around items-center text-xs font-bold text-[var(--text-muted)] px-2">
        <button
          onClick={onCreatePost}
          className="flex items-center gap-2 hover:text-[var(--text-color)] transition-all cursor-pointer"
        >
          <Image className="w-4.5 h-4.5 text-emerald-500" />
          <span>Ảnh</span>
        </button>
        <button
          onClick={onCreatePost}
          className="flex items-center gap-2 hover:text-[var(--text-color)] transition-all cursor-pointer"
        >
          <Smile className="w-4.5 h-4.5 text-amber-500" />
          <span>Cảm xúc</span>
        </button>
        <button
          onClick={onCreatePost}
          className="flex items-center gap-2 hover:text-[var(--text-color)] transition-all cursor-pointer"
        >
          <Dumbbell className="w-4.5 h-4.5 text-primary" />
          <span>Workout</span>
        </button>
      </div>
    </div>
  );
}

