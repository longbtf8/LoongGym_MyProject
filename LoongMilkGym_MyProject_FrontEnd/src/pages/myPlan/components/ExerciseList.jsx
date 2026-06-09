import { useState } from "react";
import { Link } from "react-router-dom";
import { Dumbbell, Info, RefreshCw, Trash2, Sparkles, Pencil, Save, X, Plus, Activity } from "lucide-react";

// ExerciseList: Component hiển thị danh sách bài tập chi tiết của ngày kèm theo tính năng Sửa, Xoá, Thay thế và Gợi ý bằng AI
export default function ExerciseList({
  dayDetails,
  exercises,
  isLoadingDetails,
  onOpenSwapModal,
  onRemoveExercise,
  onUpdateExerciseList,
  onShowAIModal
}) {
  const [editingIndex, setEditingIndex] = useState(null);
  const [editValues, setEditValues] = useState({ sets: 3, repsMax: 12, weightKg: 0 });

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
            <div className="flex justify-between items-start gap-2.5">
              <div className="flex gap-2">
                {ex.exercise?.thumbnailUrl ? (
                  <img 
                    src={ex.exercise.thumbnailUrl} 
                    alt={ex.exercise.name} 
                    className="w-9.5 h-9.5 rounded-lg object-cover border border-[var(--border-color)]"
                  />
                ) : (
                  <div className="w-9.5 h-9.5 rounded-lg object-cover border border-[var(--border-color)] flex items-center justify-center bg-[var(--bg-color)]">
                    <Dumbbell className="w-4 h-4 text-[var(--text-muted)]" />
                  </div>
                )}
                <div>
                  {ex.exercise?.slug ? (
                    <Link
                      to={`/exercises/${ex.exercise.slug}`}
                      className="hover:text-primary transition-colors font-extrabold flex items-center gap-0.5 text-xs text-[var(--text-color)]"
                      style={{ textDecoration: 'none' }}
                      title="Xem chi tiết bài tập"
                    >
                      <span>{ex.exercise?.name || "Bài tập"}</span>
                      <Info className="w-2.5 h-2.5 text-[var(--text-muted)] inline-block opacity-60 hover:opacity-100" />
                    </Link>
                  ) : (
                    <span className="font-extrabold flex items-center gap-0.5 text-xs text-[var(--text-color)]">
                      {ex.exercise?.name || "Bài tập"}
                    </span>
                  )}
                  <p className="text-[9px] text-[var(--text-muted)] mt-0.5">Cơ chủ đạo: {ex.exercise?.focusArea || "Đa khớp"}</p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                {!isEditing ? (
                  <>
                    <button 
                      onClick={() => startEditing(exIndex, ex)} 
                      className="flex items-center gap-1 px-2 py-1 bg-[var(--bg-color)] border border-[var(--border-color)] rounded-md text-[9px] font-bold cursor-pointer transition hover:border-primary text-[var(--text-color)]"
                    >
                      <Pencil className="w-2.5 h-2.5 text-primary" />
                      <span>Sửa</span>
                    </button>
                    <button 
                      onClick={() => onOpenSwapModal(exIndex)} 
                      className="flex items-center gap-1 px-1.5 py-1 bg-[var(--bg-color)] border border-[var(--border-color)] rounded-md text-[9px] font-bold cursor-pointer transition hover:border-primary text-[var(--text-color)]"
                    >
                      <RefreshCw className="w-2.5 h-2.5 text-primary" />
                      <span>Swap</span>
                    </button>
                    <button
                      onClick={() => onRemoveExercise(exIndex)}
                      className="w-6 h-6 flex items-center justify-center bg-[var(--bg-color)] border border-[var(--border-color)] rounded-md text-[var(--text-muted)] cursor-pointer transition hover:border-rose-400 hover:text-rose-400"
                      title="Xoá bài tập khỏi ngày này"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </>
                ) : (
                  <>
                    <button 
                      onClick={() => saveChanges(exIndex)} 
                      className="flex items-center gap-1 px-2.5 py-1 bg-primary text-black rounded-md text-[9px] font-extrabold cursor-pointer transition hover:bg-primary-hover"
                    >
                      <Save className="w-2.5 h-2.5" />
                      <span>Lưu</span>
                    </button>
                    <button 
                      onClick={cancelEditing} 
                      className="flex items-center gap-1 px-2 py-1 bg-[var(--bg-color)] border border-[var(--border-color)] rounded-md text-[9px] font-bold cursor-pointer transition hover:border-rose-400 text-rose-400"
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
                  disabled={!isEditing}
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
                  disabled={!isEditing}
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
                  disabled={!isEditing}
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
                <span className="text-[10px] text-[var(--text-muted)]">Nghỉ ({ex.restSeconds}s)</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-7 h-4 bg-[var(--border-color)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[var(--text-muted)] after:border-[var(--border-color)] after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-primary peer-checked:after:bg-black peer-checked:after:translate-x-3"></div>
                </label>
              </div>
              <button onClick={onShowAIModal} className="flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary border border-primary/20 rounded-md text-[9px] font-black cursor-pointer hover:bg-primary/20 transition">
                <Sparkles className="w-3 h-3" />
                <span>AI Form Analysis</span>
              </button>
            </div>
          </div>
        );
      })}

      <button onClick={() => onOpenSwapModal(null)} className="w-full border-2 border-dashed border-[var(--border-color)] bg-transparent rounded-2xl p-2.5 flex flex-col items-center justify-center gap-0.5 text-[var(--text-muted)] cursor-pointer transition-all hover:border-primary hover:text-[var(--text-color)]">
        <Plus className="w-4 h-4" />
        <span className="text-xs font-bold">Thêm bài tập mới</span>
      </button>
    </div>
  );
}
