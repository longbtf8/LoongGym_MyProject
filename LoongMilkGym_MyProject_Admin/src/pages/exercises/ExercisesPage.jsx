import React, { useState } from "react";
import {
  useGetExercisesListQuery,
  useGetExerciseDetailQuery,
  useGetMuscleGroupsQuery,
  useCreateExerciseMutation,
  useUpdateExerciseMutation,
  useDeleteExerciseMutation,
} from "@/services/admin/adminApi";
import useUrlFilters from "@/hooks/useUrlFilters";
import useToast from "@/hooks/useToast";
import PageHeader from "@/components/common/PageHeader";
import Pagination from "@/components/common/Pagination";
import FilterToolbar from "@/components/common/FilterToolbar";
import ExerciseFormModal, { DIFFICULTY_MAP } from "./components/ExerciseFormModal";
import { Plus, Edit2, Trash2, Video, Play, Check, AlertCircle, Dumbbell, RefreshCw, XCircle } from "lucide-react";

export default function ExercisesPage() {
  const {
    params,
    searchVal,
    setSearchVal,
    updateQueryParam,
    handleClearFilters,
    handlePageChange,
  } = useUrlFilters({
    defaultParams: {
      page: "1",
      limit: "10",
      difficulty: "",
      published: "",
      muscleGroupId: "",
      search: "",
    },
  });

  const page = parseInt(params.page) || 1;
  const limit = parseInt(params.limit) || 10;
  const difficulty = params.difficulty || "";
  const published = params.published || "";
  const muscleGroupId = params.muscleGroupId || "";
  const search = params.search || "";

  const { showToast } = useToast();
  const { data: muscleGroupsRes } = useGetMuscleGroupsQuery();
  const muscleGroups = muscleGroupsRes?.data || [];

  const { data: exercisesRes, isLoading, refetch } = useGetExercisesListQuery({
    page,
    limit,
    difficulty,
    published,
    muscleGroupId: muscleGroupId || undefined,
    search,
  });

  const [createExercise, { isLoading: isCreating }] = useCreateExerciseMutation();
  const [updateExercise, { isLoading: isUpdating }] = useUpdateExerciseMutation();
  const [deleteExercise, { isLoading: isDeleting }] = useDeleteExerciseMutation();

  const exercises = exercisesRes?.data?.items || [];
  const pagination = exercisesRes?.data?.pagination;

  // Form Modal States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedExerciseId, setSelectedExerciseId] = useState(null);

  const { data: exerciseDetailRes, isLoading: isLoadingDetail } = useGetExerciseDetailQuery(
    selectedExerciseId,
    { skip: !selectedExerciseId || !isFormOpen }
  );
  const exerciseForModal = selectedExerciseId ? exerciseDetailRes?.data : null;

  // Delete Confirmation States
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [exerciseToDelete, setExerciseToDelete] = useState(null);

  const handleOpenAddModal = () => {
    setSelectedExerciseId(null);
    setIsFormOpen(true);
  };

  const handleOpenEditModal = (ex) => {
    setSelectedExerciseId(ex.id);
    setIsFormOpen(true);
  };

  const handleOpenDeleteConfirm = (ex) => {
    setExerciseToDelete(ex);
    setIsDeleteConfirmOpen(true);
  };

  const handleSaveExercise = async (formData) => {
    try {
      if (selectedExerciseId) {
        const res = await updateExercise({ id: selectedExerciseId, formData }).unwrap();
        if (res.success) {
          showToast("Cập nhật bài tập thành công.", "success");
        }
      } else {
        // Create mode
        const res = await createExercise(formData).unwrap();
        if (res.success) {
          showToast("Thêm bài tập mới thành công.", "success");
        }
      }
      setIsFormOpen(false);
      setSelectedExerciseId(null);
      refetch();
    } catch (err) {
      const errMsg = err.data?.message || "Đã xảy ra lỗi khi lưu bài tập.";
      showToast(errMsg, "error");
    }
  };

  const handleConfirmDelete = async () => {
    if (!exerciseToDelete) return;
    try {
      const res = await deleteExercise(exerciseToDelete.id).unwrap();
      if (res.success) {
        showToast("Xóa bài tập thành công.", "success");
      }
      setIsDeleteConfirmOpen(false);
      setExerciseToDelete(null);
      refetch();
    } catch (err) {
      const errMsg = err.data?.message || "Không thể xóa bài tập này.";
      showToast(errMsg, "error");
    }
  };

  const filtersConfig = [
    {
      type: "select",
      value: muscleGroupId,
      onChange: (val) => updateQueryParam("muscleGroupId", val),
      placeholder: "Tất cả nhóm cơ",
      options: [
        { label: "Tất cả nhóm cơ", value: "" },
        ...muscleGroups.map((mg) => ({ label: mg.name, value: mg.id })),
      ],
    },
    {
      type: "select",
      value: difficulty,
      onChange: (val) => updateQueryParam("difficulty", val),
      options: [
        { label: "Tất cả độ khó", value: "" },
        { label: "Mới bắt đầu", value: "beginner" },
        { label: "Trung bình", value: "intermediate" },
        { label: "Nâng cao", value: "advanced" },
      ],
    },
    {
      type: "select",
      value: published,
      onChange: (val) => updateQueryParam("published", val),
      options: [
        { label: "Tất cả trạng thái", value: "" },
        { label: "Đang hoạt động", value: "true" },
        { label: "Đang ẩn", value: "false" },
      ],
    },
  ];

  const isFilterActive = !!(search || difficulty || published || muscleGroupId);

  return (
    <>
      <div className="space-y-6 animate-reactions-in relative">
        {/* Page Header with Action Button */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <PageHeader
            title="Quản lý Thư viện bài tập"
            description="Quản lý danh sách các bài tập mẫu, độ khó và liên kết hướng dẫn kỹ thuật trên YouTube."
          />
          <button
            onClick={handleOpenAddModal}
            className="h-11 px-5 rounded-xl bg-[var(--color-primary)] text-black text-xs font-black hover:opacity-90 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md select-none shrink-0 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            Thêm bài tập
          </button>
        </div>

        {/* Filters Toolbar */}
        <FilterToolbar
          searchVal={searchVal}
          setSearchVal={setSearchVal}
          searchPlaceholder="Tìm kiếm bài tập theo tên, slug..."
          filters={filtersConfig}
          onRefresh={refetch}
          onClear={() => handleClearFilters(["limit"])}
          isFilterActive={isFilterActive}
        />

        {/* Table Content */}
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)]/60 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[var(--border-color)]/60 text-[10px] font-black uppercase tracking-wider text-[var(--text-muted)] bg-[var(--border-color)]/10">
                  <th className="py-4 px-6">Bài tập</th>
                  <th className="py-4 px-6">Nhóm cơ</th>
                  <th className="py-4 px-6">Độ khó</th>
                  <th className="py-4 px-6">Hướng dẫn</th>
                  <th className="py-4 px-6">Trạng thái</th>
                  <th className="py-4 px-6 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)]/40 text-xs font-bold">
                {isLoading ? (
                  <tr>
                    <td colSpan="6" className="py-12 text-center text-[var(--text-muted)]">
                      <div className="flex items-center justify-center gap-2">
                        <RefreshCw className="w-4 h-4 animate-spin text-[var(--color-primary)]" />
                        <span>Đang tải danh sách bài tập...</span>
                      </div>
                    </td>
                  </tr>
                ) : exercises.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-16 text-center text-[var(--text-muted)] flex flex-col items-center justify-center gap-3">
                      <Dumbbell className="w-10 h-10 opacity-30 text-[var(--text-muted)]" />
                      <span className="font-extrabold text-sm">Không tìm thấy bài tập nào</span>
                      <p className="text-[10px] max-w-xs font-semibold">
                        Hãy thử điều chỉnh bộ lọc hoặc tạo thêm bài tập mới để làm phong phú thư viện mẫu.
                      </p>
                    </td>
                  </tr>
                ) : (
                  exercises.map((ex) => (
                    <tr key={ex.id} className="hover:bg-[var(--border-color)]/15 transition-colors group">
                      {/* Name, Slug & Thumbnail */}
                      <td className="py-4 px-6 max-w-[280px]">
                        <div className="flex gap-2.5 items-center">
                          {ex.thumbnailUrl ? (
                            <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 border border-[var(--border-color)]/60 bg-black/40">
                              <img
                                src={ex.thumbnailUrl}
                                alt={ex.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-[var(--border-color)]/30 flex items-center justify-center text-[var(--text-muted)] flex-shrink-0 border border-[var(--border-color)]/60">
                              <Dumbbell className="w-4 h-4 opacity-40" />
                            </div>
                          )}
                          <div className="flex flex-col gap-0.5 min-w-0">
                            <span className="font-black text-sm text-[var(--text-color)] group-hover:text-[var(--color-primary)] transition-colors truncate">
                              {ex.name}
                            </span>
                            <span className="text-[10px] text-[var(--text-muted)] font-mono select-all truncate">
                              {ex.slug}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <span className="text-[10px] font-bold text-[var(--text-muted)]">
                          {ex.primaryMuscle || "—"}
                        </span>
                      </td>

                      {/* Difficulty */}
                      <td className="py-4 px-6">
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                          ex.difficulty === "beginner"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : ex.difficulty === "intermediate"
                            ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                            : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                        }`}>
                          {DIFFICULTY_MAP[ex.difficulty] || ex.difficulty}
                        </span>
                      </td>

                      {/* YouTube Guide */}
                      <td className="py-4 px-6">
                        {ex.videoUrl ? (
                          <a
                            href={ex.videoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-500/25 hover:bg-rose-500/10 text-rose-500 hover:border-rose-500/40 text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer shadow-xs"
                          >
                            <Video className="w-3.5 h-3.5" />
                            <span>Xem Clip</span>
                          </a>
                        ) : (
                          <span className="text-[10px] font-bold text-[var(--text-muted)] italic">
                            Chưa cấu hình
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border ${
                          ex.isPublished
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : "bg-zinc-500/10 text-[var(--text-muted)] border-zinc-500/25"
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${ex.isPublished ? "bg-emerald-400 animate-pulse" : "bg-zinc-500"}`} />
                          {ex.isPublished ? "Đang hoạt động" : "Đang ẩn"}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEditModal(ex)}
                            className="p-2 rounded-xl border border-[var(--border-color)]/60 text-sky-400 hover:bg-sky-500/10 hover:border-sky-400/40 transition-all cursor-pointer"
                            title="Chỉnh sửa thông tin"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenDeleteConfirm(ex)}
                            className="p-2 rounded-xl border border-[var(--border-color)]/60 text-rose-400 hover:bg-rose-500/10 hover:border-rose-400/40 transition-all cursor-pointer"
                            title="Xóa bài tập khỏi thư viện"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <Pagination
              pagination={pagination}
              currentPage={page}
              limit={limit}
              onPageChange={handlePageChange}
              label="bài tập"
            />
          )}
        </div>
      </div>

      {/* Add / Edit Form Modal */}
      <ExerciseFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setSelectedExerciseId(null);
        }}
        onSave={handleSaveExercise}
        exercise={exerciseForModal}
        isLoading={isCreating || isUpdating || (selectedExerciseId && isLoadingDetail)}
      />

      {/* Delete Confirmation Modal */}
      {isDeleteConfirmOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)]/60 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl flex flex-col p-6 animate-reactions-in space-y-4">
            <div className="flex items-center gap-3 text-rose-500">
              <AlertCircle className="w-6 h-6 shrink-0" />
              <h3 className="text-sm sm:text-base font-black text-[var(--text-color)]">Xác nhận xóa bài tập</h3>
            </div>
            
            <p className="text-xs font-semibold text-[var(--text-muted)] leading-relaxed">
              Bạn có chắc chắn muốn xóa bài tập <span className="font-black text-[var(--text-color)]">"{exerciseToDelete?.name}"</span> khỏi thư viện hệ thống?
            </p>

            {exerciseToDelete?.useCount > 0 && (
              <div className="p-3 bg-amber-500/10 border border-amber-500/25 rounded-2xl flex gap-2">
                <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <span className="text-[10px] text-amber-500 font-bold leading-normal">
                  Cảnh báo: Bài tập này đang được sử dụng trong {exerciseToDelete.useCount} giáo án tập luyện. Bạn không được phép xóa bài tập này trừ khi loại bỏ khỏi toàn bộ giáo án liên quan trước.
                </span>
              </div>
            )}

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsDeleteConfirmOpen(false);
                  setExerciseToDelete(null);
                }}
                className="px-4 h-10 rounded-xl border border-[var(--border-color)] text-xs font-black text-[var(--text-color)] hover:bg-[var(--border-color)]/30 transition-all cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting || exerciseToDelete?.useCount > 0}
                className="px-5 h-10 rounded-xl bg-rose-500 text-white text-xs font-black hover:opacity-90 disabled:opacity-40 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
              >
                {isDeleting ? "Đang xóa..." : "Xóa bài tập"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
