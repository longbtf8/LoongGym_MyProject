import React, { useState, useEffect } from "react";
import { X, Search, Plus, Sparkles, AlertCircle } from "lucide-react";
import { useGetAdminExercisesQuery } from "@/services/admin/adminApi";
import useToast from "@/hooks/useToast";

export default function ExerciseFormModal({
  isOpen,
  onClose,
  onSave,
  templateExercise = null,
  isLoading = false,
}) {
  const { showToast } = useToast();
  const [isNewExercise, setIsNewExercise] = useState(false);
  const [updateExerciseDetails, setUpdateExerciseDetails] = useState(false);

  // General exercise library info
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedExerciseId, setSelectedExerciseId] = useState("");
  const [exerciseName, setExerciseName] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");

  // Template exercise specific parameters
  const [sets, setSets] = useState("3");
  const [repsMin, setRepsMin] = useState("8");
  const [repsMax, setRepsMax] = useState("12");
  const [weightKg, setWeightKg] = useState("0");
  const [restSeconds, setRestSeconds] = useState("90");
  const [tempo, setTempo] = useState("2-0-1-0");
  const [note, setNote] = useState("");

  // Get exercises with debounce search
  const [debouncedSearch, setDebouncedSearch] = useState("");
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const { data: exercisesRes } = useGetAdminExercisesQuery(
    { search: debouncedSearch },
    { skip: !isOpen || isNewExercise }
  );
  const exerciseLibrary = exercisesRes?.data || [];

  useEffect(() => {
    if (templateExercise) {
      // Edit mode
      setIsNewExercise(false);
      setUpdateExerciseDetails(false);
      setSelectedExerciseId(templateExercise.exerciseId || "");
      setExerciseName(templateExercise.exercise?.name || "");
      setYoutubeUrl(templateExercise.exercise?.videoUrl || "");
      setSearchQuery(templateExercise.exercise?.name || "");

      // Parameters
      setSets(templateExercise.sets ? templateExercise.sets.toString() : "");
      setRepsMin(templateExercise.repsMin ? templateExercise.repsMin.toString() : "");
      setRepsMax(templateExercise.repsMax ? templateExercise.repsMax.toString() : "");
      setWeightKg(templateExercise.weightKg ? templateExercise.weightKg.toString() : "");
      setRestSeconds(templateExercise.restSeconds ? templateExercise.restSeconds.toString() : "");
      setTempo(templateExercise.tempo || "2-0-1-0");
      setNote(templateExercise.note || "");
    } else {
      // Create mode
      setIsNewExercise(false);
      setUpdateExerciseDetails(false);
      setSelectedExerciseId("");
      setExerciseName("");
      setYoutubeUrl("");
      setSearchQuery("");

      // Parameters
      setSets("3");
      setRepsMin("8");
      setRepsMax("12");
      setWeightKg("0");
      setRestSeconds("90");
      setTempo("2-0-1-0");
      setNote("");
    }
  }, [templateExercise, isOpen]);

  if (!isOpen) return null;

  const handleSelectExercise = (ex) => {
    setSelectedExerciseId(ex.id);
    setExerciseName(ex.name);
    setYoutubeUrl(ex.videoUrl || "");
    setSearchQuery(ex.name);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (isNewExercise && !exerciseName.trim()) {
      showToast("Vui lòng nhập tên bài tập mới!", "error");
      return;
    }
    if (!isNewExercise && !selectedExerciseId) {
      showToast("Vui lòng chọn một bài tập từ danh sách!", "error");
      return;
    }

    const payload = {
      sets: sets ? parseInt(sets) : null,
      repsMin: repsMin ? parseInt(repsMin) : null,
      repsMax: repsMax ? parseInt(repsMax) : null,
      weightKg: weightKg ? parseFloat(weightKg) : null,
      restSeconds: restSeconds ? parseInt(restSeconds) : null,
      tempo: tempo || null,
      note: note || "",
    };

    if (isNewExercise) {
      payload.exerciseId = null;
      payload.name = exerciseName.trim();
      payload.videoUrl = youtubeUrl.trim();
    } else {
      payload.exerciseId = selectedExerciseId;
      // Only send name and videoUrl if they are being updated
      if (updateExerciseDetails) {
        payload.name = exerciseName.trim();
        payload.videoUrl = youtubeUrl.trim();
      }
    }

    onSave(payload);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      {/* Modal Card */}
      <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)]/60 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] animate-reactions-in">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[var(--border-color)]/60 flex items-center justify-between">
          <h2 className="text-sm sm:text-base font-black text-[var(--text-color)]">
            {templateExercise ? "Chỉnh sửa bài tập" : "Thêm bài tập vào ngày tập"}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[var(--text-muted)] hover:bg-[var(--border-color)]/30 hover:text-[var(--text-color)] transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
          {/* Section 1: Exercise Selection / Creation */}
          <div className="space-y-4 p-4 rounded-2xl bg-[var(--bg-color)]/50 border border-[var(--border-color)]/40">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-[var(--text-muted)]">
                Lựa chọn bài tập
              </span>

              {/* Mode Toggle switch */}
              {!templateExercise && (
                <button
                  type="button"
                  onClick={() => {
                    setIsNewExercise(!isNewExercise);
                    setSelectedExerciseId("");
                    setExerciseName("");
                    setYoutubeUrl("");
                    setSearchQuery("");
                  }}
                  className="text-[10px] font-black uppercase text-[var(--color-primary)] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  {isNewExercise ? "Chọn từ thư viện" : "Tạo bài tập mới"}
                </button>
              )}
            </div>

            {isNewExercise ? (
              <div className="space-y-3">
                <div className="p-3 bg-amber-500/10 border border-amber-500/25 rounded-xl flex gap-2 text-[10px] text-amber-400 font-bold">
                  <Sparkles className="w-4 h-4 shrink-0" />
                  <span>Bài tập mới sẽ được lưu vào thư viện chung để tái sử dụng.</span>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[var(--text-muted)]">Tên bài tập <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={exerciseName}
                    onChange={(e) => setExerciseName(e.target.value)}
                    className="w-full h-10 rounded-xl bg-[var(--bg-color)] border border-[var(--border-color)]/60 px-4 text-xs font-bold focus:border-[var(--color-primary)] outline-none transition-all text-[var(--text-color)]"
                    placeholder="Ví dụ: Bench Press với tạ đơn"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[var(--text-muted)]">Link YouTube Video hướng dẫn</label>
                  <input
                    type="text"
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    className="w-full h-10 rounded-xl bg-[var(--bg-color)] border border-[var(--border-color)]/60 px-4 text-xs font-bold focus:border-[var(--color-primary)] outline-none transition-all text-[var(--text-color)]"
                    placeholder="Ví dụ: https://www.youtube.com/watch?v=..."
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Search existing */}
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      if (selectedExerciseId) {
                        setSelectedExerciseId("");
                        setExerciseName("");
                        setYoutubeUrl("");
                      }
                    }}
                    className="w-full h-10 pl-10 pr-4 rounded-xl bg-[var(--bg-color)] border border-[var(--border-color)]/60 text-xs font-bold focus:border-[var(--color-primary)] outline-none transition-all text-[var(--text-color)]"
                    placeholder="Tìm kiếm bài tập trong thư viện..."
                  />
                </div>

                {/* Dropdown search results list */}
                {searchQuery && !selectedExerciseId && exerciseLibrary.length > 0 && (
                  <div className="max-h-40 overflow-y-auto border border-[var(--border-color)]/60 rounded-xl divide-y divide-[var(--border-color)]/40 bg-[var(--bg-color)] shadow-inner">
                    {exerciseLibrary.map((ex) => (
                      <button
                        key={ex.id}
                        type="button"
                        onClick={() => handleSelectExercise(ex)}
                        className="w-full text-left px-4 py-2.5 hover:bg-[var(--border-color)]/25 text-xs font-bold transition-all cursor-pointer text-[var(--text-color)]"
                      >
                        {ex.name}
                        {ex.videoUrl && <span className="ml-2 text-[10px] text-sky-400">(Có video)</span>}
                      </button>
                    ))}
                  </div>
                )}

                {/* Selected Exercise detail indicator */}
                {selectedExerciseId && (
                  <div className="p-3.5 rounded-xl border border-[var(--color-primary)]/20 bg-[var(--color-primary)]/[0.03] flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-black text-[var(--text-color)]">{exerciseName}</h4>
                      <p className="text-[10px] font-bold text-[var(--text-muted)] mt-1">
                        {youtubeUrl ? `Video: ${youtubeUrl.substring(0, 45)}...` : "Chưa có video hướng dẫn"}
                      </p>
                    </div>

                    {/* Enable editing selected details */}
                    <label className="flex items-center gap-2 text-[10px] font-bold text-[var(--text-muted)] cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={updateExerciseDetails}
                        onChange={(e) => setUpdateExerciseDetails(e.target.checked)}
                        className="rounded accent-[var(--color-primary)]"
                      />
                      <span>Sửa tên/video</span>
                    </label>
                  </div>
                )}

                {/* Show edit inputs if checkbox checked */}
                {selectedExerciseId && updateExerciseDetails && (
                  <div className="space-y-3 p-3 rounded-xl border border-[var(--border-color)]/40 bg-[var(--bg-secondary)] animate-reactions-in">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-[var(--text-muted)]">Tên bài tập</label>
                      <input
                        type="text"
                        required
                        value={exerciseName}
                        onChange={(e) => setExerciseName(e.target.value)}
                        className="w-full h-10 rounded-xl bg-[var(--bg-color)] border border-[var(--border-color)]/60 px-4 text-xs font-bold focus:border-[var(--color-primary)] outline-none transition-all text-[var(--text-color)]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-[var(--text-muted)]">Link YouTube Video hướng dẫn</label>
                      <input
                        type="text"
                        value={youtubeUrl}
                        onChange={(e) => setYoutubeUrl(e.target.value)}
                        className="w-full h-10 rounded-xl bg-[var(--bg-color)] border border-[var(--border-color)]/60 px-4 text-xs font-bold focus:border-[var(--color-primary)] outline-none transition-all text-[var(--text-color)]"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Section 2: Parameters */}
          <div className="space-y-4">
            <span className="text-xs font-black uppercase tracking-wider text-[var(--text-muted)]">
              Thông số thiết lập hiệp tập
            </span>

            <div className="grid grid-cols-2 gap-4">
              {/* Sets */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[var(--text-muted)]">Số hiệp (Sets)</label>
                <input
                  type="number"
                  min="1"
                  value={sets}
                  onChange={(e) => setSets(e.target.value)}
                  className="w-full h-10 rounded-xl bg-[var(--bg-color)] border border-[var(--border-color)]/60 px-4 text-xs font-bold focus:border-[var(--color-primary)] outline-none transition-all text-[var(--text-color)]"
                  placeholder="Ví dụ: 3"
                />
              </div>

              {/* Weight */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[var(--text-muted)]">Mức tạ mặc định (kg)</label>
                <input
                  type="number"
                  min="0"
                  value={weightKg}
                  onChange={(e) => setWeightKg(e.target.value)}
                  className="w-full h-10 rounded-xl bg-[var(--bg-color)] border border-[var(--border-color)]/60 px-4 text-xs font-bold focus:border-[var(--color-primary)] outline-none transition-all text-[var(--text-color)]"
                  placeholder="Nhập 0 nếu tạ bodyweight"
                />
              </div>

              {/* Reps Min */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[var(--text-muted)]">Số Reps tối thiểu</label>
                <input
                  type="number"
                  min="1"
                  value={repsMin}
                  onChange={(e) => setRepsMin(e.target.value)}
                  className="w-full h-10 rounded-xl bg-[var(--bg-color)] border border-[var(--border-color)]/60 px-4 text-xs font-bold focus:border-[var(--color-primary)] outline-none transition-all text-[var(--text-color)]"
                  placeholder="Ví dụ: 8"
                />
              </div>

              {/* Reps Max */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[var(--text-muted)]">Số Reps tối đa</label>
                <input
                  type="number"
                  min="1"
                  value={repsMax}
                  onChange={(e) => setRepsMax(e.target.value)}
                  className="w-full h-10 rounded-xl bg-[var(--bg-color)] border border-[var(--border-color)]/60 px-4 text-xs font-bold focus:border-[var(--color-primary)] outline-none transition-all text-[var(--text-color)]"
                  placeholder="Ví dụ: 12"
                />
              </div>

              {/* Rest Seconds */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[var(--text-muted)]">Thời gian nghỉ (Giây)</label>
                <input
                  type="number"
                  min="0"
                  value={restSeconds}
                  onChange={(e) => setRestSeconds(e.target.value)}
                  className="w-full h-10 rounded-xl bg-[var(--bg-color)] border border-[var(--border-color)]/60 px-4 text-xs font-bold focus:border-[var(--color-primary)] outline-none transition-all text-[var(--text-color)]"
                  placeholder="Ví dụ: 90"
                />
              </div>

              {/* Tempo */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[var(--text-muted)]">Nhịp độ tập (Tempo)</label>
                <input
                  type="text"
                  value={tempo}
                  onChange={(e) => setTempo(e.target.value)}
                  className="w-full h-10 rounded-xl bg-[var(--bg-color)] border border-[var(--border-color)]/60 px-4 text-xs font-bold focus:border-[var(--color-primary)] outline-none transition-all text-[var(--text-color)]"
                  placeholder="Ví dụ: 2-0-1-0"
                />
              </div>

              {/* Note */}
              <div className="space-y-1 col-span-2">
                <label className="text-[10px] font-bold text-[var(--text-muted)]">Lưu ý / Hướng dẫn tập buổi này</label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows="2"
                  className="w-full rounded-xl bg-[var(--bg-color)] border border-[var(--border-color)]/60 p-3 text-xs font-bold focus:border-[var(--color-primary)] outline-none transition-all text-[var(--text-color)] resize-none"
                  placeholder="Ví dụ: Giữ chặt bả vai, đẩy tạ chậm rãi..."
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-[var(--border-color)]/60 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 h-11 rounded-xl border border-[var(--border-color)] text-xs font-black text-[var(--text-color)] hover:bg-[var(--border-color)]/30 transition-all cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 h-11 rounded-xl bg-[var(--color-primary)] text-black text-xs font-black hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              {isLoading ? "Đang lưu..." : templateExercise ? "Lưu thay đổi" : "Thêm bài tập"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
