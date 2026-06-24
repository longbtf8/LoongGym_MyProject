import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  X, Calendar, Plus, Trash2, Edit2, Play, Eye, EyeOff, Tag, Layers, ArrowLeftRight, CheckCircle2, ChevronRight, Dumbbell
} from "lucide-react";
import { useGetAdminWorkoutProgramDetailQuery, useUpdateWorkoutProgramStatusMutation } from "@/services/admin/adminApi";
import { GOAL_MAP, DIFFICULTY_MAP } from "./ProgramCard";

export default function ProgramDetailDrawer({
  programId,
  isOpen,
  onClose,
  onEditDay,
  onDeleteDay,
  onAddExercise,
  onEditExercise,
  onDeleteExercise,
  onAddDayClick,
  showToast,
}) {
  const navigate = useNavigate();
  const { data: detailRes, isLoading: isDetailLoading, refetch } = useGetAdminWorkoutProgramDetailQuery(
    programId,
    { skip: !programId || !isOpen }
  );

  const [updateStatus, { isLoading: isUpdatingStatus }] = useUpdateWorkoutProgramStatusMutation();

  const program = detailRes?.data;
  const days = program?.days || [];

  const activeDaysCount = days.filter(day => {
    const title = `${day.title || ""} ${day.focusArea || ""}`.toLowerCase();
    const hasExercises = day.templates?.[0]?.exercises?.length > 0;
    const isRest = !hasExercises || /nghỉ|nghi|rest|phục hồi|phuc hoi|mobility/.test(title);
    return !isRest;
  }).length;

  const handleTogglePublish = async () => {
    if (!program) return;
    const action = program.isPublished ? "unpublish" : "publish";
    try {
      const res = await updateStatus({ id: program.id, action }).unwrap();
      if (res.success) {
        showToast(res.message || "Cập nhật trạng thái thành công!", "success");
        refetch();
      }
    } catch (err) {
      showToast(err.data?.message || "Không thể cập nhật trạng thái.", "error");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-full max-w-3xl bg-[var(--bg-secondary)] border-l border-[var(--border-color)]/60 shadow-2xl z-40 flex flex-col h-full animate-drawer-in">
      {/* Header */}
      <div className="h-16 px-6 border-b border-[var(--border-color)]/60 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Dumbbell className="w-5 h-5 text-[var(--color-primary)]" />
          <h2 className="text-sm sm:text-base font-black text-[var(--text-color)] truncate max-w-[400px]">
            {program?.title || "Đang tải..."}
          </h2>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-[var(--text-muted)] hover:bg-[var(--border-color)]/30 hover:text-[var(--text-color)] transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {isDetailLoading ? (
        <div className="flex-1 flex items-center justify-center text-xs text-[var(--text-muted)]">
          Đang tải chi tiết giáo án...
        </div>
      ) : !program ? (
        <div className="flex-1 flex items-center justify-center text-xs text-rose-500">
          Không tìm thấy thông tin giáo án.
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col">
          {/* Cover image & General Info */}
          <div className="relative aspect-[21/9] w-full bg-[var(--border-color)]/20 overflow-hidden border-b border-[var(--border-color)]/60">
            {program.coverImageUrl ? (
              <img
                src={program.coverImageUrl}
                alt={program.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-neutral-800 to-neutral-900 text-[var(--text-muted)]">
                <Dumbbell className="w-10 h-10 opacity-30" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex items-end p-6">
              <div className="space-y-1.5">
                <div className="flex flex-wrap gap-2">
                  <span className="px-2 py-0.5 rounded bg-[var(--color-primary)]/20 border border-[var(--color-primary)]/40 text-[9px] font-black text-[var(--color-primary)]">
                    {GOAL_MAP[program.goal] || program.goal || "Chưa chọn mục tiêu"}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-blue-500/20 border border-blue-500/40 text-[9px] font-black text-blue-400">
                    {DIFFICULTY_MAP[program.difficulty] || program.difficulty || "Chưa chọn độ khó"}
                  </span>
                </div>
                <h3 className="text-sm sm:text-base font-black text-white">{program.title}</h3>
              </div>
            </div>
          </div>

          <div className="p-6 flex-1 space-y-6">
            {/* Description & Publish Status Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start p-4 rounded-2xl bg-[var(--bg-color)] border border-[var(--border-color)]/60">
              <div className="flex-1 space-y-1">
                <span className="text-[10px] font-black uppercase text-[var(--text-muted)]">Mô tả giáo án</span>
                <p className="text-xs text-[var(--text-color)] leading-relaxed font-semibold">
                  {program.description || "Chưa có mô tả cho giáo án này."}
                </p>
              </div>

              <div className="w-full sm:w-auto shrink-0 flex flex-col gap-2">
                <button
                  onClick={handleTogglePublish}
                  disabled={isUpdatingStatus}
                  className={`w-full h-10 px-4 rounded-xl text-xs font-black flex items-center justify-center gap-2 cursor-pointer transition-all ${
                    program.isPublished
                      ? "bg-rose-500/10 border border-rose-500/30 text-rose-500 hover:bg-rose-500/20"
                      : "bg-[var(--color-primary)] text-black hover:opacity-90 shadow-md"
                  }`}
                >
                  {program.isPublished ? (
                    <>
                      <EyeOff className="w-4 h-4" />
                      <span>Hủy xuất bản</span>
                    </>
                  ) : (
                    <>
                      <Eye className="w-4 h-4" />
                      <span>Xuất bản giáo án</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Days Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4.5 h-4.5 text-[var(--color-primary)]" />
                  <span className="text-xs font-black uppercase tracking-wider text-[var(--text-color)]">
                    Lịch trình ngày tập ({activeDaysCount} ngày tập)
                  </span>
                </div>
                <button
                  onClick={() => onAddDayClick(program.id)}
                  className="px-3 h-8 bg-[var(--color-primary)]/10 hover:bg-[var(--color-primary)]/20 border border-[var(--color-primary)]/30 rounded-lg text-[10px] font-black uppercase text-[var(--text-primary)] flex items-center gap-1 transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Thêm ngày</span>
                </button>
              </div>

              {days.length === 0 ? (
                <div className="py-12 border border-dashed border-[var(--border-color)]/60 rounded-2xl flex flex-col items-center justify-center text-[var(--text-muted)] gap-2 text-xs">
                  <Calendar className="w-8 h-8 opacity-30" />
                  <span>Giáo án chưa được thiết lập ngày tập nào.</span>
                </div>
              ) : (
                <div className="space-y-4">
                  {days.map((day) => {
                    const template = day.templates?.[0];
                    const exercises = template?.exercises || [];

                    return (
                      <div
                        key={day.id}
                        className="border border-[var(--border-color)]/60 rounded-2xl overflow-hidden bg-[var(--bg-color)]/45"
                      >
                        {/* Day Header */}
                        <div className="p-4 bg-[var(--border-color)]/25 flex items-center justify-between gap-4 border-b border-[var(--border-color)]/60">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 rounded bg-[var(--color-primary)]/25 text-[9px] font-black uppercase text-[var(--text-primary)]">
                                Ngày {day.cycleDay}
                              </span>
                              <h4 className="text-xs font-black text-[var(--text-color)]">{day.title}</h4>
                            </div>
                            {day.focusArea && (
                              <p className="text-[10px] text-[var(--text-muted)] mt-1 font-bold">
                                Nhóm cơ: {day.focusArea}
                              </p>
                            )}
                          </div>

                          {/* Day Actions */}
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => onAddExercise(program.id, day.id)}
                              className="p-1.5 rounded-lg text-emerald-400 hover:bg-emerald-500/10 transition-all cursor-pointer"
                              title="Thêm bài tập"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => onEditDay(day)}
                              className="p-1.5 rounded-lg text-sky-400 hover:bg-sky-500/10 transition-all cursor-pointer"
                              title="Sửa ngày"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => onDeleteDay(program.id, day.id)}
                              className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-all cursor-pointer"
                              title="Xóa ngày"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Exercises List for this Day */}
                        <div className="divide-y divide-[var(--border-color)]/40">
                          {exercises.length === 0 ? (
                            <div className="p-4 text-center text-[10px] text-[var(--text-muted)] font-bold">
                              Chưa có bài tập nào trong buổi này.
                            </div>
                          ) : (
                            exercises.map((templateEx) => (
                              <div
                                key={templateEx.id}
                                className="p-4 flex items-start justify-between gap-4 hover:bg-[var(--border-color)]/20 transition-all group"
                              >
                                <div className="space-y-1 flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-black text-[var(--text-muted)]">
                                      #{templateEx.exerciseOrder}
                                    </span>
                                    <h5 
                                      onClick={() => {
                                        if (templateEx.exercise?.name) {
                                          navigate(`/exercises?search=${encodeURIComponent(templateEx.exercise.name)}`);
                                        }
                                      }}
                                      className="text-xs font-bold text-[var(--text-color)] truncate cursor-pointer hover:underline hover:text-[var(--color-primary)]"
                                    >
                                      {templateEx.exercise?.name}
                                    </h5>
                                  </div>

                                  {/* Specs parameters line */}
                                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] font-bold text-[var(--text-muted)] pt-1">
                                    {templateEx.sets && <span>Hiệp: {templateEx.sets}</span>}
                                    {templateEx.repsMin && (
                                      <span>
                                        Reps: {templateEx.repsMin}
                                        {templateEx.repsMax ? ` - ${templateEx.repsMax}` : ""}
                                      </span>
                                    )}
                                    {templateEx.weightKg > 0 && <span>Tạ: {templateEx.weightKg}kg</span>}
                                    {templateEx.restSeconds && <span>Nghỉ: {templateEx.restSeconds}s</span>}
                                    {templateEx.tempo && <span>Tempo: {templateEx.tempo}</span>}
                                  </div>

                                  {templateEx.note && (
                                    <p className="text-[10px] font-semibold text-amber-500 italic mt-1 leading-snug">
                                      Lưu ý: {templateEx.note}
                                    </p>
                                  )}
                                </div>

                                {/* Exercise Actions */}
                                <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button
                                    onClick={() => onDeleteExercise(program.id, day.id, templateEx.id)}
                                    className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-all cursor-pointer"
                                    title="Xóa bài tập khỏi buổi"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
