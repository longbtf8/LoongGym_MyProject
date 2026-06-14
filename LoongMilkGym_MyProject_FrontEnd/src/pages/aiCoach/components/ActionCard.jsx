import React from "react";
import { Sparkles, Loader2, Check, X } from "lucide-react";

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

  return (
    <div className="mt-4 p-4 rounded-2xl border bg-[var(--bg-secondary)] border-[var(--border-color)] shadow-sm animate-slide-down">
      <div className="flex items-center gap-2 mb-2 text-primary font-bold text-xs sm:text-sm">
        <Sparkles className="w-4.5 h-4.5 text-primary" />
        <span>GỢI Ý HÀNH ĐỘNG: {title || "Đề xuất thông minh"}</span>
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
            Đã áp dụng đổi lịch/thông số thành công
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
