import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { 
  useGetExerciseBySlugQuery,
  useGetFavoriteExercisesQuery,
  useToggleFavoriteExerciseMutation
} from "@/services/exercise/exerciseApi";
import { useGetActivePlanQuery, useLazyGetDayDetailsQuery, useUpdateDayDetailsMutation } from "@/services/roadmap/roadmapApi";
import { ArrowLeft, Clock, Flame, Dumbbell, ShieldAlert, Award, Sparkles, Heart, Plus, Loader2, X, Check } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useRequireAuth } from "@/hooks/useRequireAuth";

const difficultyMap = {
  beginner: { label: "Người mới", css: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  intermediate: { label: "Trung bình", css: "bg-[var(--text-primary)]/10 text-[var(--text-primary)] border-[var(--text-primary)]/20" },
  advanced: { label: "Nâng cao", css: "bg-rose-500/10 text-rose-400 border-rose-500/20" }
};

// Helper để trích xuất Video ID từ link YouTube
function getYouTubeId(url) {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

const FAVORITE_EXERCISES_KEY = "loongmilk.favoriteExercises";

const getStoredFavorites = () => {
  try {
    return JSON.parse(localStorage.getItem(FAVORITE_EXERCISES_KEY) || "[]");
  } catch (error) {
    return [];
  }
};

const getLocalDateString = (dateInput = new Date()) => {
  if (typeof dateInput === "string" && dateInput.includes("T")) {
    return dateInput.split("T")[0];
  }
  const date = new Date(dateInput);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export default function ExerciseDetail() {
  const { slug } = useParams();
  const { isLoggedIn } = useAuth();
  const { requireAuth } = useRequireAuth();
  const { data, isLoading, error } = useGetExerciseBySlugQuery(slug);
  const [toastMessage, setToastMessage] = useState("");
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedScheduleDayId, setSelectedScheduleDayId] = useState("");
  const [scheduleMessage, setScheduleMessage] = useState("");
  const { data: activePlanRes, isFetching: isFetchingPlan } = useGetActivePlanQuery(undefined, {
    skip: !isLoggedIn,
  });
  const { data: favoriteExercisesRes } = useGetFavoriteExercisesQuery(undefined, {
    skip: !isLoggedIn,
  });
  const [toggleFavoriteDb] = useToggleFavoriteExerciseMutation();
  const [getDayDetails, { isFetching: isFetchingDayDetails }] = useLazyGetDayDetailsQuery();
  const [updateDayDetails, { isLoading: isAddingToSchedule }] = useUpdateDayDetailsMutation();

  const exercise = data?.data;
  const activePlan = activePlanRes?.data;
  const scheduleDays = activePlan?.days || [];
  const favoriteIds = isLoggedIn ? (favoriteExercisesRes?.data?.favoriteIds || []) : [];
  const isFavorite = exercise ? favoriteIds.includes(exercise.id) : false;

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage("");
    }, 3000);
  };

  const toggleFavorite = async () => {
    if (!exercise) return;
    if (!requireAuth()) return;
    try {
      const res = await toggleFavoriteDb(exercise.id).unwrap();
      showToast(res.message || (res.data?.isFavorite ? "Đã lưu vào yêu thích." : "Đã bỏ khỏi yêu thích."));
    } catch (err) {
      console.error("Lỗi khi thay đổi trạng thái yêu thích:", err);
    }
  };

  const openScheduleModal = () => {
    if (!requireAuth()) return;
    setScheduleMessage("");
    const todayStr = getLocalDateString();
    const futureDays = scheduleDays.filter((day) => getLocalDateString(day.scheduledDate) >= todayStr);
    const defaultDay = futureDays.find((day) => day.status !== "completed") || futureDays[0];
    setSelectedScheduleDayId(defaultDay?.id || "");
    setShowScheduleModal(true);
  };

  const handleAddExerciseToDay = async () => {
    if (!exercise || !selectedScheduleDayId) return;

    try {
      const dayDetailsRes = await getDayDetails(selectedScheduleDayId).unwrap();
      const dayExercises = dayDetailsRes?.data?.exercises || [];
      const cleanExercises = dayExercises.map((ex, index) => ({
        id: ex.id,
        exerciseId: ex.exerciseId,
        exerciseOrder: ex.exerciseOrder || index + 1,
        sets: ex.sets || 3,
        repsMin: ex.repsMin || 8,
        repsMax: ex.repsMax || 12,
        weightKg: ex.weightKg || 0,
        restSeconds: ex.restSeconds || 90,
        tempo: ex.tempo || "2-0-1-0",
        note: ex.note || ""
      }));

      await updateDayDetails({
        dayId: selectedScheduleDayId,
        data: {
          metadata: {
            customExercises: [
              ...cleanExercises,
              {
                exerciseId: exercise.id,
                exerciseOrder: cleanExercises.length + 1,
                sets: 3,
                repsMin: 8,
                repsMax: 12,
                weightKg: 0,
                restSeconds: 90,
                tempo: "2-0-1-0",
                note: "Thêm từ trang chi tiết bài tập"
              }
            ],
            customized: true
          }
        }
      }).unwrap();

      setScheduleMessage("Đã thêm bài tập vào ngày đã chọn.");
      showToast("Đã thêm bài tập vào lịch.");
      setTimeout(() => {
        setShowScheduleModal(false);
        setScheduleMessage("");
      }, 900);
    } catch (err) {
      setScheduleMessage("Không thể thêm bài tập. Hãy đăng nhập và tạo lộ trình trước.");
    }
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
        <div className="fixed left-1/2 top-[72px] -translate-x-1/2 z-[999999] bg-[var(--bg-secondary)]/90 backdrop-blur-sm border border-primary/30 text-[var(--text-color)] rounded-2xl px-4 py-2.5 flex items-center gap-2 shadow-lg animate-slide-down">
          <Sparkles size={14} className="text-primary shrink-0" />
          <span className="text-xs font-bold leading-none">{toastMessage}</span>
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
                <div className="flex flex-col gap-8 relative pl-4">
                  {exercise.steps.map((step, idx) => (
                    <div key={step.id || idx} className="flex gap-4 items-start relative">
                      {/* Vertical line connecting steps */}
                      {idx < exercise.steps.length - 1 && (
                        <div className="absolute left-[15px] top-8 bottom-0 w-[2px] bg-[var(--border-color)]" />
                      )}
                      
                      {/* Step Number Badge */}
                      <div className="w-8 h-8 rounded-full bg-[var(--bg-color)] border border-[var(--text-primary)] text-[var(--text-primary)] font-extrabold flex items-center justify-center shrink-0 z-10 text-sm shadow-md">
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
                <span className="font-semibold text-[var(--text-primary)] capitalize">{primaryMuscle}</span>
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
                onClick={openScheduleModal}
                className="w-full bg-[#ccff00] hover:bg-[#b5e600] text-black font-bold text-sm py-3 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-98 shadow-md shadow-[#ccff00]/10 cursor-pointer"
              >
                <Plus size={16} />
                Thêm vào lịch tập
              </button>
              
              <button
                onClick={toggleFavorite}
                className={`w-full border font-bold text-sm py-3 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer ${
                  isFavorite
                    ? "bg-rose-500 text-white border-rose-400 hover:bg-rose-600"
                    : "bg-transparent hover:bg-[var(--border-color)]/20 border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-color)]"
                }`}
              >
                <Heart size={16} fill={isFavorite ? "currentColor" : "none"} />
                {isFavorite ? "Đã yêu thích" : "Lưu vào yêu thích"}
              </button>
            </div>
            
          </div>

        </div>

      </div>

      {showScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
          <div className="w-full max-w-md bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-5 shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-[var(--border-color)] pb-3">
              <div>
                <h3 className="text-base font-extrabold flex items-center gap-2">
                  <Plus className="w-5 h-5 text-[#ccff00]" />
                  Thêm vào lịch tập
                </h3>
                <p className="text-xs text-[var(--text-muted)] mt-1 line-clamp-1">{exercise.name}</p>
              </div>
              <button
                onClick={() => setShowScheduleModal(false)}
                className="w-8 h-8 rounded-lg border border-[var(--border-color)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-color)] cursor-pointer"
                title="Đóng"
              >
                <X size={16} />
              </button>
            </div>

            <div className="py-4 flex flex-col gap-3">
              <div className="text-xs text-[var(--text-muted)] leading-relaxed bg-[var(--bg-color)] border border-[var(--border-color)] rounded-xl p-3">
                Chọn ngày muốn thêm bài. Thông số mặc định là 3 hiệp x 8-12 lần lặp, bạn có thể chỉnh lại trong trang Lộ trình.
              </div>

              {isFetchingPlan ? (
                <div className="py-6 text-center text-sm text-[var(--text-muted)]">Đang tải lịch tập...</div>
              ) : scheduleDays.length === 0 ? (
                <div className="py-6 text-center text-sm text-[var(--text-muted)]">
                  Bạn chưa có lộ trình. Hãy tạo lộ trình ở trang Lộ trình trước.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-64 overflow-y-auto pr-1">
                  {scheduleDays
                    .filter((day) => getLocalDateString(day.scheduledDate) >= getLocalDateString())
                    .map((day) => {
                      const date = new Date(day.scheduledDate);
                      const isSelected = selectedScheduleDayId === day.id;
                      const originalIndex = scheduleDays.findIndex((d) => d.id === day.id);
                      return (
                        <button
                          key={day.id}
                          onClick={() => setSelectedScheduleDayId(day.id)}
                          className={`text-left rounded-xl border p-3 transition cursor-pointer ${
                            isSelected
                              ? "bg-[#ccff00] text-black border-[#ccff00]"
                              : "bg-[var(--bg-color)] border-[var(--border-color)] text-[var(--text-color)] hover:border-[#ccff00]/50"
                          }`}
                        >
                          <span className="block text-[10px] font-black uppercase opacity-70">Ngày {originalIndex + 1}</span>
                          <span className="block text-xs font-bold line-clamp-1">{day.title}</span>
                          <span className="block text-[10px] opacity-70 mt-1">{date.toLocaleDateString("vi-VN")}</span>
                        </button>
                      );
                    })}
                </div>
              )}

              {scheduleMessage && (
                <div className="flex items-center gap-2 text-xs font-bold text-[#ccff00]">
                  <Check size={14} />
                  {scheduleMessage}
                </div>
              )}
            </div>

            <button
              onClick={handleAddExerciseToDay}
              disabled={!selectedScheduleDayId || isAddingToSchedule || isFetchingDayDetails}
              className="w-full h-11 rounded-xl bg-[#ccff00] text-black text-sm font-black hover:bg-[#b5e600] disabled:opacity-60 cursor-pointer"
            >
              {isAddingToSchedule || isFetchingDayDetails ? "Đang thêm..." : "Thêm bài tập"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
