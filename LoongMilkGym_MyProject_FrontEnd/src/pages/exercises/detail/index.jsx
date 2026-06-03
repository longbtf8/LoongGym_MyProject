import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useGetExerciseBySlugQuery } from "@/services/exercise/exerciseApi";
import { ArrowLeft, Clock, Flame, Dumbbell, ShieldAlert, Award, Sparkles, Heart, Plus, Loader2 } from "lucide-react";

const difficultyMap = {
  beginner: { label: "Người mới", css: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  intermediate: { label: "Trung bình", css: "bg-[#ccff00]/10 text-[#ccff00] border-[#ccff00]/20" },
  advanced: { label: "Nâng cao", css: "bg-rose-500/10 text-rose-400 border-rose-500/20" }
};

// Helper để trích xuất Video ID từ link YouTube
function getYouTubeId(url) {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

export default function ExerciseDetail() {
  const { slug } = useParams();
  const { data, isLoading, error } = useGetExerciseBySlugQuery(slug);
  const [toastMessage, setToastMessage] = useState("");

  const exercise = data?.data;

  const showComingSoon = (feature) => {
    setToastMessage(`Tính năng "${feature}" sẽ sớm ra mắt!`);
    setTimeout(() => {
      setToastMessage("");
    }, 3000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--bg-color)] flex items-center justify-center text-[var(--text-color)]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={32} className="animate-spin text-[#ccff00]" />
          <span className="text-sm text-[var(--text-muted)] font-medium">Đang tải chi tiết bài tập...</span>
        </div>
      </div>
    );
  }

  if (error || !exercise) {
    return (
      <div className="min-h-screen bg-[var(--bg-color)] flex items-center justify-center text-[var(--text-color)] p-6">
        <div className="max-w-md w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-8 text-center flex flex-col items-center gap-4">
          <ShieldAlert size={48} className="text-rose-500" />
          <h2 className="text-xl font-bold">Không tìm thấy bài tập</h2>
          <p className="text-sm text-[var(--text-muted)]">
            Bài tập không tồn tại hoặc đã được gỡ bỏ khỏi thư viện.
          </p>
          <Link
            to="/exercises"
            className="mt-2 bg-[#ccff00] text-black font-bold text-sm px-5 py-2.5 rounded-lg flex items-center gap-2 transition-all active:scale-95 shadow-md shadow-[#ccff00]/10 hover:bg-[#b5e600]"
          >
            <ArrowLeft size={16} />
            Quay lại thư viện
          </Link>
        </div>
      </div>
    );
  }

  const primaryMuscle = exercise.muscles?.find((m) => m.role === "primary")?.muscleGroup?.name || "Toàn thân";
  const secondaryMuscles = exercise.muscles
    ?.filter((m) => m.role === "secondary")
    .map((m) => m.muscleGroup?.name)
    .join(", ") || "Không có";

  const diffInfo = difficultyMap[exercise.difficulty] || { label: exercise.difficulty, css: "bg-[var(--border-color)] text-[var(--text-color)]" };
  const ytVideoId = getYouTubeId(exercise.videoUrl);

  return (
    <div className="min-h-screen bg-[var(--bg-color)] text-[var(--text-color)] py-8 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-24 right-4 z-50 bg-[var(--bg-secondary)] border border-[#ccff00]/30 text-[var(--text-color)] rounded-xl px-4 py-3 flex items-center gap-2 shadow-2xl animate-slide-down">
          <Sparkles size={16} className="text-[#ccff00]" />
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      <div className="max-w-5xl mx-auto flex flex-col gap-6">
        
        {/* Breadcrumb */}
        <nav className="text-xs text-[var(--text-muted)] flex items-center gap-2 flex-wrap">
          <Link to="/exercises" className="hover:text-[#ccff00] transition-colors">Thư viện</Link>
          <span>/</span>
          <span className="text-[var(--text-color)] opacity-60 capitalize">{primaryMuscle}</span>
          <span>/</span>
          <span className="text-[#ccff00] font-semibold">{exercise.name}</span>
        </nav>

        {/* Header Title */}
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-[var(--text-color)]">
            {exercise.name}
          </h1>
          <p className="text-sm text-[var(--text-muted)] max-w-3xl leading-relaxed">
            {exercise.description || "Bài tập cốt lõi để phát triển sức mạnh và cải thiện kỹ thuật tập luyện."}
          </p>
        </div>

        {/* Main Grid Block */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Left Column (Video Player + Guide Steps + Mistakes) */}
          <div className="lg:col-span-2 flex flex-col gap-8">
            
            {/* Video Player Box */}
            <div className="aspect-video w-full rounded-2xl overflow-hidden bg-[var(--bg-secondary)] border border-[var(--border-color)] relative shadow-lg">
              {ytVideoId ? (
                <iframe
                  src={`https://www.youtube.com/embed/${ytVideoId}?autoplay=0&rel=0`}
                  title={`Video hướng dẫn bài tập ${exercise.name}`}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                ></iframe>
              ) : exercise.thumbnailUrl ? (
                <div className="w-full h-full relative">
                  <img
                    src={exercise.thumbnailUrl}
                    alt={exercise.name}
                    className="w-full h-full object-cover opacity-80"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <span className="text-sm text-white/60 bg-[var(--bg-color)]/80 px-4 py-2 rounded-xl backdrop-blur-sm border border-[var(--border-color)]/20">
                      Chưa có video hướng dẫn
                    </span>
                  </div>
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[var(--text-muted)]">
                  <span>Video đang được cập nhật</span>
                </div>
              )}
            </div>

            {/* Guide Steps */}
            <section className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-6 flex flex-col gap-6 shadow-xl">
              <h2 className="text-xl font-bold text-[var(--text-color)] flex items-center gap-2 border-b border-[var(--border-color)] pb-4">
                <Sparkles className="text-[#ccff00]" size={20} />
                Hướng dẫn thực hiện
              </h2>

              {exercise.steps && exercise.steps.length > 0 ? (
                <div className="flex flex-col gap-8 relative pl-4 before:absolute before:left-[21px] before:top-4 before:bottom-4 before:w-[2px] before:bg-[var(--border-color)]">
                  {exercise.steps.map((step, idx) => (
                    <div key={step.id || idx} className="flex gap-4 items-start relative">
                      {/* Step Number Badge */}
                      <div className="w-8 h-8 rounded-full bg-[var(--bg-color)] border border-[#ccff00] text-[#ccff00] font-extrabold flex items-center justify-center shrink-0 z-10 text-sm shadow-md">
                        {step.stepOrder || idx + 1}
                      </div>
                      
                      {/* Step Text Info */}
                      <div className="flex flex-col gap-1.5 pt-0.5">
                        <h4 className="font-bold text-[var(--text-color)] text-base">{step.title}</h4>
                        <p className="text-sm text-[var(--text-muted)] leading-relaxed">{step.instruction}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-[var(--text-muted)]">Hướng dẫn thực hiện đang được cập nhật.</p>
              )}
            </section>

            {/* Common Mistakes */}
            <section className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-6 flex flex-col gap-6 shadow-xl">
              <h2 className="text-xl font-bold text-[var(--text-color)] flex items-center gap-2 border-b border-[var(--border-color)] pb-4">
                <ShieldAlert className="text-rose-500" size={20} />
                Lỗi thường gặp
              </h2>

              {exercise.commonMistakes && exercise.commonMistakes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {exercise.commonMistakes.map((mistake, idx) => (
                    <div key={mistake.id || idx} className="bg-[var(--bg-color)] border border-[var(--border-color)] hover:border-rose-500/20 rounded-xl p-4 flex gap-3 items-start transition-all">
                      <span className="w-6 h-6 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center shrink-0 font-bold text-xs select-none">
                        ✕
                      </span>
                      <div className="flex flex-col gap-1">
                        <h4 className="text-sm font-bold text-[var(--text-color)]">{mistake.title}</h4>
                        <p className="text-xs text-[var(--text-muted)] leading-relaxed">{mistake.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-[var(--text-muted)]">Chưa có thông tin về lỗi kỹ thuật thường gặp.</p>
              )}
            </section>

          </div>

          {/* Right Column (Info Sidebar Card) */}
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-5 flex flex-col gap-6 shadow-xl lg:sticky lg:top-24">
            
            {/* Box title */}
            <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-4">
              <h3 className="text-lg font-bold text-[var(--text-color)]">Thông tin</h3>
              <span className={`px-2.5 py-1 rounded-md text-xs font-bold border ${diffInfo.css}`}>
                {diffInfo.label}
              </span>
            </div>

            {/* Specs list */}
            <div className="flex flex-col gap-4">
              {/* Thiết bị */}
              <div className="flex items-center justify-between text-sm py-1">
                <span className="text-[var(--text-muted)] flex items-center gap-2">
                  <Dumbbell size={16} className="text-[#ccff00]" />
                  Thiết bị
                </span>
                <span className="font-semibold text-[var(--text-color)]">{exercise.primaryEquipment?.name || "Tự trọng"}</span>
              </div>
              
              {/* Cơ chính */}
              <div className="flex items-center justify-between text-sm py-1">
                <span className="text-[var(--text-muted)] flex items-center gap-2">
                  <Award size={16} className="text-[#ccff00]" />
                  Cơ chính
                </span>
                <span className="font-semibold text-[#ccff00] capitalize">{primaryMuscle}</span>
              </div>

              {/* Cơ phụ */}
              <div className="flex items-center justify-between text-sm py-1">
                <span className="text-[var(--text-muted)] flex items-center gap-2">
                  <Sparkles size={16} className="text-[#ccff00]" />
                  Cơ phụ
                </span>
                <span className="font-semibold text-[var(--text-color)] text-right max-w-[180px] truncate" title={secondaryMuscles}>
                  {secondaryMuscles}
                </span>
              </div>

              {/* Calories */}
              {exercise.estimatedCalories && (
                <div className="flex items-center justify-between text-sm py-1">
                  <span className="text-[var(--text-muted)] flex items-center gap-2">
                    <Flame size={16} className="text-[#ccff00]" />
                    Calo ước tính
                  </span>
                  <span className="font-semibold text-[var(--text-color)]">~{exercise.estimatedCalories} kcal / 3 set</span>
                </div>
              )}

              {/* Duration */}
              {exercise.durationSeconds && (
                <div className="flex items-center justify-between text-sm py-1">
                  <span className="text-[var(--text-muted)] flex items-center gap-2">
                    <Clock size={16} className="text-[#ccff00]" />
                    Thời gian
                  </span>
                  <span className="font-semibold text-[var(--text-color)]">
                    ~{Math.round(exercise.durationSeconds / 60)} phút / set
                  </span>
                </div>
              )}
            </div>

            {/* Control buttons */}
            <div className="flex flex-col gap-3 border-t border-[var(--border-color)] pt-5">
              <button
                onClick={() => showComingSoon("Thêm vào lịch tập")}
                className="w-full bg-[#ccff00] hover:bg-[#b5e600] text-black font-bold text-sm py-3 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-98 shadow-md shadow-[#ccff00]/10 cursor-pointer"
              >
                <Plus size={16} />
                Thêm vào lịch tập
              </button>
              
              <button
                onClick={() => showComingSoon("Lưu vào yêu thích")}
                className="w-full bg-transparent hover:bg-[var(--border-color)]/20 border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-color)] font-bold text-sm py-3 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer"
              >
                <Heart size={16} />
                Lưu vào yêu thích
              </button>
            </div>
            
          </div>

        </div>

      </div>
    </div>
  );
}
