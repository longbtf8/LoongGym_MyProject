import { useState } from "react";
import { Link } from "react-router-dom";
import { Dumbbell, Info, RefreshCw, Trash2, Sparkles, Pencil, Save, X, Plus, Activity, Video, Play } from "lucide-react";

// ExerciseList: Component hiển thị danh sách bài tập chi tiết của ngày kèm theo tính năng Sửa, Xoá, Thay thế và Gợi ý bằng AI
export default function ExerciseList({
  dayDetails,
  exercises,
  isLoadingDetails,
  isPending,
  onOpenSwapModal,
  onRemoveExercise,
  onUpdateExerciseList,
  onShowAIModal
}) {
  const [editingIndex, setEditingIndex] = useState(null);
  const [editValues, setEditValues] = useState({ sets: 3, repsMax: 12, weightKg: 0 });
  const [guideExercise, setGuideExercise] = useState(null);

  const getYouTubeId = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  // startEditing: Kích hoạt chế độ chỉnh sửa thông số Sets/Reps/Weight cho bài tập ở vị trí index
  const startEditing = (index, exercise) => {
    setEditingIndex(index);
    setEditValues({
      sets: exercise.sets || 3,
      repsMax: exercise.repsMax || 12,
      weightKg: exercise.weightKg || 0
    });
  };

  // handleFieldChange: Cập nhật giá trị nhập của Sets, Reps hoặc Weight vào state tạm thời
  const handleFieldChange = (field, value) => {
    setEditValues((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  // saveChanges: Lưu thông số vừa chỉnh sửa vào danh sách bài tập và gửi lên cha để cập nhật
  const saveChanges = async (index) => {
    const updatedExercises = exercises.map((ex, idx) => {
      const baseEx = {
        id: ex.id || ex.exerciseId,
        exerciseId: ex.exerciseId,
        exerciseOrder: idx + 1,
        sets: ex.sets || 3,
        repsMin: ex.repsMin || 8,
        repsMax: ex.repsMax || 12,
        weightKg: ex.weightKg || 0,
        restSeconds: ex.restSeconds || 90,
        tempo: ex.tempo || "2-0-1-0",
        note: ex.note || "",
      };
      if (idx === index) {
        return {
          ...baseEx,
          sets: editValues.sets,
          repsMax: editValues.repsMax,
          weightKg: editValues.weightKg
        };
      }
      return baseEx;
    });

    await onUpdateExerciseList(updatedExercises);
    setEditingIndex(null);
  };

  const cancelEditing = () => {
    setEditingIndex(null);
  };

  if (isLoadingDetails) {
    return (
      <div className="flex flex-col items-center justify-center py-10 bg-[var(--bg-secondary)] rounded-3xl border border-[var(--border-color)]">
        <div className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (dayDetails?.day?.status === "rest") {
    return (
      <div 
        className="flex flex-col items-center justify-center bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-color)] text-center px-4"
        style={{ padding: '48px 20px', minHeight: '200px' }}
      >
        <Activity className="w-5 h-5 text-blue-400 mb-2" />
        <h3 className="text-xs font-bold mb-1">Ngày Nghỉ</h3>
        <p className="text-[10px] text-[var(--text-muted)] max-w-xs leading-relaxed">
          Cơ thể phục hồi trong lúc nghỉ ngơi. Hãy ngủ đủ giấc và ăn đủ chất nhé!
        </p>
      </div>
    );
  }

  if (exercises.length === 0) {
    return (
      <div 
        className="flex flex-col items-center justify-center bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-color)] text-center p-8 mb-4"
        style={{ minHeight: '220px' }}
      >
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-2.5">
          <Dumbbell className="w-5 h-5 text-primary animate-pulse" />
        </div>
        <h3 className="text-xs font-black mb-1">
          Chưa có bài tập nào
        </h3>
        <p className="text-[10px] text-[var(--text-muted)] max-w-sm leading-relaxed mb-4">
          Lộ trình này chưa thiết lập bài tập cho hôm nay. Bạn nên thêm từ 3 đến 6 bài tập (ưu tiên bài phức hợp đa khớp trước) để bắt đầu buổi tập của mình.
        </p>
        <button 
          onClick={() => onOpenSwapModal(null)} 
          className="px-3.5 py-1.5 bg-primary text-black rounded-lg text-[10px] font-black hover:bg-primary-hover flex items-center gap-1 cursor-pointer transition-all"
        >
          <Plus className="w-3 h-3" />
          <span>Thêm bài tập / Add Exercise</span>
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2.5">
      {exercises.map((ex, exIndex) => {
        const isEditing = editingIndex === exIndex;
        const currentSets = isEditing ? editValues.sets : ex.sets;
        const currentReps = isEditing ? editValues.repsMax : ex.repsMax;
        const currentWeight = isEditing ? editValues.weightKg : ex.weightKg;

        return (
          <div key={ex.id || exIndex} className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-3 flex flex-col gap-2 transition-all hover:border-[var(--border-color-hover)]">
            <div className="flex justify-between items-start gap-2.5 min-w-0">
              <div className="flex gap-2 min-w-0 flex-1">
                {ex.exercise?.thumbnailUrl ? (
                  <img 
                    src={ex.exercise.thumbnailUrl} 
                    alt={ex.exercise.name} 
                    className="w-9.5 h-9.5 rounded-lg object-cover border border-[var(--border-color)] shrink-0"
                  />
                ) : (
                  <div className="w-9.5 h-9.5 rounded-lg object-cover border border-[var(--border-color)] flex items-center justify-center bg-[var(--bg-color)] shrink-0">
                    <Dumbbell className="w-4 h-4 text-[var(--text-muted)]" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  {ex.exercise?.slug ? (
                    <Link
                      to={`/exercises/${ex.exercise.slug}`}
                      className="hover:text-primary transition-colors font-extrabold flex items-center gap-0.5 text-xs text-[var(--text-color)] w-full no-underline"
                      title="Xem chi tiết bài tập"
                    >
                      <span className="truncate">{ex.exercise?.name || "Bài tập"}</span>
                      <Info className="w-2.5 h-2.5 text-[var(--text-muted)] shrink-0 opacity-60 hover:opacity-100" />
                    </Link>
                  ) : (
                    <span className="font-extrabold flex items-center gap-0.5 text-xs text-[var(--text-color)] w-full truncate">
                      {ex.exercise?.name || "Bài tập"}
                    </span>
                  )}
                  <p className="text-[9px] text-[var(--text-muted)] mt-0.5 truncate">Cơ chủ đạo: {ex.exercise?.focusArea || "Đa khớp"}</p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {!isEditing ? (
                  <>
                    <button 
                      onClick={() => startEditing(exIndex, ex)} 
                      disabled={isPending}
                      className={`flex items-center gap-1 px-2 py-1 bg-[var(--bg-color)] border border-[var(--border-color)] rounded-md text-[9px] font-bold cursor-pointer transition hover:border-primary text-[var(--text-color)] ${isPending ? "opacity-50 pointer-events-none cursor-not-allowed" : ""}`}
                    >
                      <Pencil className="w-2.5 h-2.5 text-primary" />
                      <span>Sửa</span>
                    </button>
                    <button 
                      onClick={() => onOpenSwapModal(exIndex)} 
                      disabled={isPending}
                      className={`flex items-center gap-1 px-1.5 py-1 bg-[var(--bg-color)] border border-[var(--border-color)] rounded-md text-[9px] font-bold cursor-pointer transition hover:border-primary text-[var(--text-color)] ${isPending ? "opacity-50 pointer-events-none cursor-not-allowed" : ""}`}
                    >
                      <RefreshCw className="w-2.5 h-2.5 text-primary" />
                      <span>Swap</span>
                    </button>
                    <button
                      onClick={() => onRemoveExercise(exIndex)}
                      disabled={isPending}
                      className={`w-6 h-6 flex items-center justify-center bg-[var(--bg-color)] border border-[var(--border-color)] rounded-md text-[var(--text-muted)] cursor-pointer transition hover:border-rose-400 hover:text-rose-400 ${isPending ? "opacity-50 pointer-events-none cursor-not-allowed" : ""}`}
                      title="Xoá bài tập khỏi ngày này"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </>
                ) : (
                  <>
                    <button 
                      onClick={() => saveChanges(exIndex)} 
                      disabled={isPending}
                      className={`flex items-center gap-1 px-2.5 py-1 bg-primary text-black rounded-md text-[9px] font-extrabold cursor-pointer transition hover:bg-primary-hover ${isPending ? "opacity-50 pointer-events-none cursor-not-allowed" : ""}`}
                    >
                      <Save className="w-2.5 h-2.5" />
                      <span>Lưu</span>
                    </button>
                    <button 
                      onClick={cancelEditing} 
                      disabled={isPending}
                      className={`flex items-center gap-1 px-2 py-1 bg-[var(--bg-color)] border border-[var(--border-color)] rounded-md text-[9px] font-bold cursor-pointer transition hover:border-rose-400 text-rose-400 ${isPending ? "opacity-50 pointer-events-none cursor-not-allowed" : ""}`}
                    >
                      <X className="w-2.5 h-2.5" />
                      <span>Huỷ</span>
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className={`grid grid-cols-3 gap-1.5 p-1.5 rounded-xl border transition-all ${isEditing ? "bg-[var(--bg-color)] border-primary/40 shadow-sm" : "bg-[var(--bg-color)]/60 border-[var(--border-color)]"}`}>
              <div className="text-center flex flex-col items-center">
                <label className="block text-[8px] font-black text-[var(--text-muted)] uppercase mb-1">Sets</label>
                <input 
                  type="number"
                  value={currentSets}
                  disabled={isPending || !isEditing}
                  onChange={(e) => handleFieldChange("sets", parseInt(e.target.value) || 1)}
                  className={`w-full max-w-[65px] text-center text-xs font-black outline-none transition-all py-1 h-8 box-border ${
                    isEditing 
                      ? "bg-[var(--bg-secondary)] border-2 border-primary/70 rounded-lg text-primary focus:border-primary focus:ring-1 focus:ring-primary shadow-inner scale-105" 
                      : "bg-transparent border-0 text-[var(--text-color)] opacity-90 pointer-events-none"
                  }`}
                />
              </div>
              <div className="text-center flex flex-col items-center">
                <label className="block text-[8px] font-black text-[var(--text-muted)] uppercase mb-1">Reps</label>
                <input 
                  type="number"
                  value={currentReps}
                  disabled={isPending || !isEditing}
                  onChange={(e) => handleFieldChange("repsMax", parseInt(e.target.value) || 1)}
                  className={`w-full max-w-[65px] text-center text-xs font-black outline-none transition-all py-1 h-8 box-border ${
                    isEditing 
                      ? "bg-[var(--bg-secondary)] border-2 border-primary/70 rounded-lg text-primary focus:border-primary focus:ring-1 focus:ring-primary shadow-inner scale-105" 
                      : "bg-transparent border-0 text-[var(--text-color)] opacity-90 pointer-events-none"
                  }`}
                />
              </div>
              <div className="text-center flex flex-col items-center">
                <label className="block text-[8px] font-black text-[var(--text-muted)] uppercase mb-1">Weight (KG)</label>
                <input 
                  type="number"
                  value={currentWeight}
                  disabled={isPending || !isEditing}
                  step="0.5"
                  onChange={(e) => handleFieldChange("weightKg", parseFloat(e.target.value) || 0)}
                  className={`w-full max-w-[65px] text-center text-xs font-black outline-none transition-all py-1 h-8 box-border ${
                    isEditing 
                      ? "bg-[var(--bg-secondary)] border-2 border-primary/70 rounded-lg text-primary focus:border-primary focus:ring-1 focus:ring-primary shadow-inner scale-105" 
                      : "bg-transparent border-0 text-[var(--text-color)] opacity-90 pointer-events-none"
                  }`}
                />
              </div>
            </div>

            <div className="flex justify-between items-center text-[10px] border-t border-[var(--border-color)] pt-1.5">
              <div className="flex items-center gap-1.5">
                {ex.exercise?.videoUrl ? (
                  <button
                    type="button"
                    onClick={() => setGuideExercise(ex.exercise)}
                    className="flex items-center gap-1 text-[10px] font-black text-primary hover:text-primary/80 bg-transparent border-0 p-0 cursor-pointer"
                  >
                    <Video className="w-3.5 h-3.5 fill-primary/10 text-primary" />
                    <span>Video hướng dẫn</span>
                  </button>
                ) : (
                  <a
                    href={`https://www.youtube.com/results?search_query=hướng+dẫn+tập+${encodeURIComponent(ex.exercise?.name || "")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-[10px] font-black text-primary hover:text-primary/80 bg-transparent border-0 p-0 cursor-pointer no-underline"
                  >
                    <Video className="w-3.5 h-3.5 text-primary" />
                    <span>Video gợi ý</span>
                  </a>
                )}
              </div>
              <button onClick={onShowAIModal} disabled={isPending} className={`flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary border border-primary/20 rounded-md text-[9px] font-black cursor-pointer hover:bg-primary/20 transition ${isPending ? "opacity-50 pointer-events-none cursor-not-allowed" : ""}`}>
                <Sparkles className="w-3 h-3" />
                <span>AI Form Analysis</span>
              </button>
            </div>
          </div>
        );
      })}

      <button onClick={() => onOpenSwapModal(null)} disabled={isPending} className={`w-full border-2 border-dashed border-[var(--border-color)] bg-transparent rounded-2xl p-2.5 flex flex-col items-center justify-center gap-0.5 text-[var(--text-muted)] cursor-pointer transition-all hover:border-primary hover:text-[var(--text-color)] ${isPending ? "opacity-50 pointer-events-none cursor-not-allowed" : ""}`}>
        <Plus className="w-4 h-4" />
        <span className="text-xs font-bold">Thêm bài tập mới</span>
      </button>

      {/* Modal Video hướng dẫn */}
      {guideExercise && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] w-full max-w-lg rounded-3xl p-5 flex flex-col gap-4 shadow-2xl relative animate-scale-up">
            <div className="flex justify-between items-start gap-3">
              <div className="min-w-0">
                <span className="text-[10px] uppercase font-black tracking-wider text-primary">
                  Video hướng dẫn
                </span>
                <h3 className="font-extrabold text-base text-[var(--text-color)] truncate">
                  {guideExercise.name || "Bài tập"}
                </h3>
              </div>
              <button
                onClick={() => setGuideExercise(null)}
                className="p-1.5 hover:bg-[var(--bg-color)] rounded-lg text-[var(--text-muted)] hover:text-[var(--text-color)] border-0 bg-transparent cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="aspect-video w-full rounded-2xl overflow-hidden bg-[var(--bg-color)] border border-[var(--border-color)]">
              {getYouTubeId(guideExercise.videoUrl) ? (
                <iframe
                  src={`https://www.youtube.com/embed/${getYouTubeId(guideExercise.videoUrl)}?autoplay=1&rel=0`}
                  title={`Video hướng dẫn ${guideExercise.name || "bài tập"}`}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-3 p-6 text-center">
                  {guideExercise.thumbnailUrl && (
                    <img
                      src={guideExercise.thumbnailUrl}
                      alt={guideExercise.name || "Bài tập"}
                      className="absolute inset-0 w-full h-full object-cover opacity-20"
                    />
                  )}
                  <span className="relative text-xs text-[var(--text-muted)] font-bold">
                    Video này cần mở bằng trình phát bên ngoài.
                  </span>
                  <a
                    href={guideExercise.videoUrl}
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
      )}
    </div>
  );
}
