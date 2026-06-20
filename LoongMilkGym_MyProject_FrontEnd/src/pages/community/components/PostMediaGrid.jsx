export default function PostMediaGrid({ media }) {
  if (!media || media.length === 0) return null;

  return (
    <div className="mt-2">
      {media.length === 1 && (
        <div className="relative w-full rounded-2xl overflow-hidden border border-[var(--border-color)] bg-black/15 flex items-center justify-center max-h-[500px]">
          <div
            className="absolute inset-0 bg-cover bg-center blur-md opacity-30 scale-105"
            style={{ backgroundImage: `url(${media[0].mediaUrl})` }}
          />
          <img
            src={media[0].mediaUrl}
            alt="post media"
            className="relative z-10 w-full h-auto max-h-[500px] object-contain block mx-auto"
          />
        </div>
      )}

      {media.length === 2 && (
        <div className="grid grid-cols-2 gap-1 rounded-2xl overflow-hidden border border-[var(--border-color)] aspect-[3/2] w-full">
          {media.map((med) => (
            <div
              key={med.id}
              className="relative w-full h-full min-h-0 overflow-hidden flex items-center justify-center bg-black/15"
            >
              <div
                className="absolute inset-0 bg-cover bg-center blur-md opacity-30 scale-105"
                style={{ backgroundImage: `url(${med.mediaUrl})` }}
              />
              <img
                src={med.mediaUrl}
                alt="post media"
                className="relative z-10 max-h-full max-w-full object-contain"
              />
            </div>
          ))}
        </div>
      )}

      {media.length === 3 && (
        <div className="grid grid-cols-2 gap-1 rounded-2xl overflow-hidden border border-[var(--border-color)] aspect-[3/2] w-full">
          <div className="relative w-full h-full min-h-0 overflow-hidden">
            <img
              src={media[0].mediaUrl}
              alt="post media"
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>
          <div className="grid grid-rows-2 gap-1 h-full min-h-0">
            {[1, 2].map((idx) => (
              <div key={idx} className="relative w-full h-full min-h-0 overflow-hidden">
                <img
                  src={media[idx].mediaUrl}
                  alt="post media"
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {media.length === 4 && (
        <div className="grid grid-cols-2 gap-1 rounded-2xl overflow-hidden border border-[var(--border-color)] aspect-[3/2] w-full">
          <div className="grid grid-rows-2 gap-1 h-full min-h-0">
            {[0, 1].map((idx) => (
              <div key={idx} className="relative w-full h-full min-h-0 overflow-hidden">
                <img
                  src={media[idx].mediaUrl}
                  alt="post media"
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
          <div className="grid grid-rows-2 gap-1 h-full min-h-0">
            {[2, 3].map((idx) => (
              <div key={idx} className="relative w-full h-full min-h-0 overflow-hidden">
                <img
                  src={media[idx].mediaUrl}
                  alt="post media"
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {media.length >= 5 && (
        <div className="grid grid-cols-2 gap-1 rounded-2xl overflow-hidden border border-[var(--border-color)] aspect-[1/1] w-full">
          <div className="grid grid-rows-2 gap-1 h-full min-h-0">
            {[0, 1].map((idx) => (
              <div key={idx} className="relative w-full h-full min-h-0 overflow-hidden">
                <img
                  src={media[idx].mediaUrl}
                  alt="post media"
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
          <div className="grid grid-rows-3 gap-1 h-full min-h-0">
            {[2, 3].map((idx) => (
              <div key={idx} className="relative w-full h-full min-h-0 overflow-hidden">
                <img
                  src={media[idx].mediaUrl}
                  alt="post media"
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
            ))}
            <div className="relative w-full h-full min-h-0 overflow-hidden">
              <img
                src={media[4].mediaUrl}
                alt="post media"
                className="absolute inset-0 w-full h-full object-cover"
              />
              {media.length > 5 && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-lg font-black pointer-events-none select-none z-10">
                  +{media.length - 5}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

