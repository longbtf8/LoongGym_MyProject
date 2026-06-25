import { Sparkles, Loader2, Check, X, CalendarDays, Dumbbell } from "lucide-react";

function ActionCard({
  recommendation,
  actionProcessingId,
  handleExecuteAction,
  handleRejectAction,
}) {
  if (!recommendation) return null;
  const { id, recommendationType, title, payload, status } = recommendation;
  const isPending = status === "pending";
  const isApplied = status === "applied";
  const isTrainingPlanAction = recommendationType === "generate_training_plan" || recommendationType === "update_training_plan";
  const planDays = Array.isArray(payload?.days) ? payload.days : [];
  const trainingDays = planDays.filter((day) => day.status !== "rest");
  const previewDays = planDays.slice(0, 7);

  return (
    <div className="mt-4 p-4 rounded-2xl border bg-[var(--bg-secondary)] border-[var(--border-color)] shadow-sm animate-slide-down">
      <div className="flex items-center gap-2 mb-2 text-primary font-bold text-xs sm:text-sm">
        <Sparkles className="w-4.5 h-4.5 text-primary" />
        <span>ĐỀ XUẤT TỪ AI: {title || "Lịch tập mới"}</span>
      </div>

      <div className="text-xs text-[var(--text-color)] font-semibold leading-relaxed mb-4">
        {recommendationType === "reschedule" && (
          <div className="flex flex-col gap-1">
            <span className="text-[var(--text-muted)]">Hành động: Sắp xếp lại lịch tập</span>
            <span>Đổi lịch tập buổi tập sang ngày: <strong className="text-primary">{new Date(payload.toDate).toLocaleDateString("vi-VN")}</strong></span>
          </div>
        )}
        {recommendationType === "skip_day" && (
          <div className="flex flex-col gap-1">
            <span className="text-[var(--text-muted)]">Hành động: Bỏ qua ngày tập</span>
            <span>Lý do: <em className="italic">"{payload.reason || "AI khuyên nghỉ ngơi"}"</em></span>
          </div>
        )}
        {recommendationType === "swap_exercise" && (
          <div className="flex flex-col gap-1">
            <span className="text-[var(--text-muted)]">Hành động: Đổi bài tập</span>
            <span>Thay thế bài tập trong buổi tập bằng bài tập mới.</span>
          </div>
        )}
        {recommendationType === "adjust_volume" && (
          <div className="flex flex-col gap-1">
            <span className="text-[var(--text-muted)]">Hành động: Điều chỉnh mức tạ / sets / reps</span>
            <span>Cập nhật bài tập: {payload.sets} sets x {payload.reps} reps ({payload.weightKg} kg).</span>
          </div>
        )}
        {recommendationType === "nutrition_adjust" && (
          <div className="flex flex-col gap-1">
            <span className="text-[var(--text-muted)]">Hành động: Điều chỉnh calories & macros mục tiêu</span>
            <div className="grid grid-cols-2 gap-2 mt-1 bg-[var(--bg-color)] p-2.5 rounded-xl border border-[var(--border-color)]">
              <span>Calories: <strong>{payload.calories} kcal</strong></span>
              <span>Protein: <strong>{payload.protein}g</strong></span>
              <span>Carbs: <strong>{payload.carbs}g</strong></span>
              <span>Fat: <strong>{payload.fat}g</strong></span>
            </div>
          </div>
        )}
        {isTrainingPlanAction && (
          <div className="flex flex-col gap-3">
            <span className="text-[var(--text-muted)]">
              {recommendationType === "generate_training_plan"
                ? "Thay toàn bộ lịch hiện tại bằng mẫu tuần mới"
                : "Cập nhật các ngày tập sắp tới"}
            </span>

            <div className="grid grid-cols-2 gap-2">
              <div className="bg-[var(--bg-color)] p-2.5 rounded-xl border border-[var(--border-color)] flex items-center gap-2">
                <CalendarDays className="w-3.5 h-3.5 text-primary shrink-0" />
                <span>{payload?.durationWeeks || Math.ceil(planDays.length / 7) || 1} tuần</span>
              </div>
              <div className="bg-[var(--bg-color)] p-2.5 rounded-xl border border-[var(--border-color)] flex items-center gap-2">
                <Dumbbell className="w-3.5 h-3.5 text-primary shrink-0" />
                <span>{payload?.daysPerWeek || trainingDays.length || 0} buổi/tuần</span>
              </div>
            </div>

            <div className="bg-[var(--bg-color)] rounded-xl border border-[var(--border-color)] overflow-hidden">
              {previewDays.map((day, index) => {
                const exerciseCount = Array.isArray(day.exercises) ? day.exercises.length : 0;
                const formatShortDate = (dateStr) => {
                  if (!dateStr) return "Chưa chọn ngày";
                  const parts = dateStr.split("-");
                  if (parts.length === 3) {
                    return `${parts[2]}/${parts[1]}`;
                  }
                  return dateStr;
                };

                return (
                  <div key={`${day.date}-${index}`} className="px-3 py-2 border-b last:border-b-0 border-[var(--border-color)] flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <span className="block text-[11px] font-black text-[var(--text-color)] truncate">{day.title || "Buổi tập"}</span>
                      <span className="block text-[10px] text-[var(--text-muted)]">{formatShortDate(day.date)} {day.focusArea ? `• ${day.focusArea}` : ""}</span>
                    </div>
                    <span className="shrink-0 text-[10px] font-bold text-primary">
                      {day.status === "rest" ? "Nghỉ" : `${exerciseCount} bài`}
                    </span>
                  </div>
                );
              })}
              {planDays.length > previewDays.length && (
                <div className="px-3 py-2 text-[10px] text-[var(--text-muted)] font-bold">
                  Còn {planDays.length - previewDays.length} ngày khác trong mẫu lịch.
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        {isPending ? (
          <>
            <button
              onClick={() => handleExecuteAction(id)}
              disabled={actionProcessingId !== null}
              className="flex-1 py-2 rounded-xl text-xs font-bold bg-primary text-black hover:bg-primary-hover flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 border-0"
            >
              {actionProcessingId === id ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Check className="w-3.5 h-3.5" />
              )}
              Đồng ý
            </button>
            <button
              onClick={() => handleRejectAction(id)}
              disabled={actionProcessingId !== null}
              className="flex-1 py-2 rounded-xl text-xs font-bold bg-neutral-200 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200 hover:bg-neutral-300 dark:hover:bg-neutral-700 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 border-0"
            >
              <X className="w-3.5 h-3.5" />
              Từ chối
            </button>
          </>
        ) : isApplied ? (
          <div className="w-full py-2 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5">
            <Check className="w-4 h-4" />
            Đã áp dụng thay đổi thành công
          </div>
        ) : (
          <div className="w-full py-2 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5">
            <X className="w-4 h-4" />
            Đã từ chối gợi ý này
          </div>
        )}
      </div>
    </div>
  );
}

export default ActionCard;
