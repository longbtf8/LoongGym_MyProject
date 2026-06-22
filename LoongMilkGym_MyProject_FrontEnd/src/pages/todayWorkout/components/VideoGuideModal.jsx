import { useEffect } from "react";
import { Play, X } from "lucide-react";

const getYouTubeId = (url) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
};

export default function VideoGuideModal({ exercise, onClose }) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-[2px] flex items-center justify-center z-[999999] p-4">
      <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-[24px] p-4 w-full max-w-[760px] flex flex-col gap-4 shadow-2xl animate-slide-up">
        <div className="flex justify-between items-start gap-3">
          <div className="min-w-0">
            <span className="text-[10px] uppercase font-black tracking-wider text-primary">
              Video hướng dẫn
            </span>
            <h3 className="font-extrabold text-base text-[var(--text-color)] truncate">
              {exercise.name || "Bài tập"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-[var(--bg-color)] rounded-lg text-[var(--text-muted)] hover:text-[var(--text-color)] border-0 bg-transparent cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="aspect-video w-full rounded-2xl overflow-hidden bg-[var(--bg-color)] border border-[var(--border-color)]">
          {getYouTubeId(exercise.videoUrl) ? (
            <iframe
              src={`https://www.youtube.com/embed/${getYouTubeId(exercise.videoUrl)}?autoplay=1&rel=0`}
              title={`Video hướng dẫn ${exercise.name || "bài tập"}`}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-3 p-6 text-center">
              {exercise.thumbnailUrl && (
                <img
                  src={exercise.thumbnailUrl}
                  alt={exercise.name || "Bài tập"}
                  className="absolute inset-0 w-full h-full object-cover opacity-20"
                />
              )}
              <span className="relative text-xs text-[var(--text-muted)] font-bold">
                Video này cần mở bằng trình phát bên ngoài.
              </span>
              <a
                href={exercise.videoUrl}
                target="_blank"
                rel="noreferrer"
                className="relative h-10 px-4 rounded-xl bg-primary text-black text-xs font-black flex items-center justify-center gap-2 no-underline"
              >
                <Play className="w-3.5 h-3.5 fill-black" />
                Mở video
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
