import { Send } from "lucide-react";
import { DEFAULT_AVATAR_URL } from "../constants/community.constants";
import { capitalizeName, formatTime } from "../utils/communityFormat";

export default function CommentsSection({
  commentInput,
  comments,
  onCommentChange,
  onProfileClick,
  onSendComment,
  userInfo,
}) {
  return (
    <div className="flex flex-col gap-4.5 border-t border-[var(--border-color)]/45 pt-4.5 mt-2 animate-slide-down">
      {comments && comments.length > 0 && (
        <div className="flex flex-col gap-3.5 max-h-[250px] overflow-y-auto pr-1">
          {comments.map((comm) => {
            const profileId = comm.userId || comm.user?.id;

            return (
              <div key={comm.id} className="flex gap-2.5 items-start">
                <div
                  onClick={() => onProfileClick(profileId)}
                  className="w-8 h-8 rounded-full p-[1px] bg-gradient-to-tr from-primary to-[#00f5d4] shadow-sm shrink-0 cursor-pointer hover:opacity-90"
                >
                  <img
                    src={comm.user?.profile?.avatarUrl || DEFAULT_AVATAR_URL}
                    alt="comm avatar"
                    className="w-full h-full rounded-full object-cover bg-black"
                  />
                </div>
                <div className="flex-1 bg-[var(--border-color)]/15 border border-[var(--border-color)]/20 px-3.5 py-2.5 rounded-2xl">
                  <div className="flex justify-between items-center">
                    <span
                      onClick={() => onProfileClick(profileId)}
                      className="text-xs font-black text-[var(--text-color)] hover:text-primary cursor-pointer transition-all"
                    >
                      {capitalizeName(comm.user?.profile?.fullName || "GymLife Member")}
                    </span>
                    <span className="text-[9px] text-[var(--text-muted)] font-bold">
                      {formatTime(comm.createdAt)}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-[var(--text-color)] mt-1 leading-relaxed">
                    {comm.content}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="flex gap-2.5 items-center">
        <div className="w-8 h-8 rounded-full p-[1px] bg-gradient-to-tr from-primary to-[#00f5d4] shadow-sm shrink-0">
          <img
            src={userInfo?.profile?.avatarUrl || DEFAULT_AVATAR_URL}
            alt="my avatar"
            className="w-full h-full rounded-full object-cover bg-black"
          />
        </div>
        <div className="flex-1 relative flex items-center">
          <input
            type="text"
            placeholder="Viết bình luận..."
            value={commentInput || ""}
            onChange={(e) => onCommentChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") onSendComment();
            }}
            className="w-full pl-4 pr-10 py-2.5 text-xs bg-[var(--border-color)]/20 border border-[var(--border-color)]/30 text-[var(--text-color)] rounded-2xl focus:outline-none focus:border-primary transition-all font-semibold"
          />
          <button
            onClick={onSendComment}
            className="absolute right-2 p-1.5 hover:bg-primary/10 rounded-xl text-primary transition-all cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

