import { DEFAULT_AVATAR_URL } from "../constants/community.constants";

export default function MatchingUsers({
  localFollows,
  matchingUsers,
  onFollowToggle,
  onProfileClick,
  currentUserId,
}) {
  if (matchingUsers.length === 0) return null;

  return (
    <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-3xl p-5 shadow-sm flex flex-col gap-4 animate-fade-in shrink-0">
      <h4 className="text-xs font-black text-[var(--text-color)] uppercase tracking-wider">
        Người liên quan
      </h4>
      <div className="flex flex-col gap-4">
        {matchingUsers.map((user) => {
          const isFollowing =
            localFollows[user.id] !== undefined ? localFollows[user.id] : user.isFollowing;
          const fullName = user.profile?.fullName || user.username || "Thành viên";
          const details = [];

          if (user.profile?.role || user.profile?.job) {
            details.push(user.profile?.role || user.profile?.job);
          }
          if (user.profile?.followersCount || user.followersCount) {
            details.push(`${user.profile?.followersCount || user.followersCount} người theo dõi`);
          }
          if (user.profile?.address || user.profile?.location) {
            details.push(user.profile?.address || user.profile?.location);
          }

          const detailsStr = details.join(" · ");

          return (
            <div
              key={user.id}
              className="flex items-center justify-between gap-4 p-2 rounded-2xl hover:bg-[var(--bg-color)]/30 transition-all duration-200"
            >
              <div
                onClick={() => onProfileClick(user.id)}
                className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
              >
                <div className="w-12 h-12 rounded-full p-[2px] bg-gradient-to-tr from-primary to-[#00f5d4] shrink-0 flex items-center justify-center">
                  {user.profile?.avatarUrl && user.profile.avatarUrl !== DEFAULT_AVATAR_URL ? (
                    <img
                      src={user.profile.avatarUrl}
                      alt={fullName}
                      className="w-full h-full rounded-full object-cover bg-black"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-[var(--bg-color)] flex items-center justify-center text-sm font-black text-primary capitalize select-none">
                      {fullName ? fullName.trim().charAt(0).toUpperCase() : "?"}
                    </div>
                  )}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-black text-[var(--text-color)] truncate hover:text-primary transition-all">
                    {fullName}
                  </span>
                  {detailsStr && (
                    <span className="text-[10px] text-[var(--text-muted)] font-semibold truncate mt-0.5">
                      {detailsStr}
                    </span>
                  )}
                  {user.profile?.bio && (
                    <span className="text-[10px] text-[var(--text-muted)] italic truncate mt-0.5">
                      "{user.profile.bio}"
                    </span>
                  )}
                </div>
              </div>

              {user.id !== currentUserId && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onFollowToggle(user.id, isFollowing);
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer shadow-sm active:scale-95 ${
                    isFollowing
                      ? "bg-[var(--border-color)]/30 text-[var(--text-color)] hover:bg-[var(--border-color)]/50"
                      : "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20"
                  }`}
                >
                  {isFollowing ? "Đang theo dõi" : "Theo dõi"}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

