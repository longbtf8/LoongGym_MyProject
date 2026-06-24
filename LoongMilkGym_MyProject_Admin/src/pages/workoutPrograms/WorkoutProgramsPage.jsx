import React, { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import {
  useGetAdminWorkoutProgramsQuery,
  useGetWorkoutProgramFiltersQuery,
  useCreateWorkoutProgramMutation,
  useUpdateWorkoutProgramMutation,
  useDeleteWorkoutProgramMutation,
  useAddWorkoutProgramDayMutation,
  useUpdateWorkoutProgramDayMutation,
  useDeleteWorkoutProgramDayMutation,
  useAddWorkoutProgramExerciseMutation,
  useUpdateWorkoutProgramExerciseMutation,
  useDeleteWorkoutProgramExerciseMutation,
} from "@/services/admin/adminApi";
import useUrlFilters from "@/hooks/useUrlFilters";
import useToast from "@/hooks/useToast";
import { useConfirm } from "@/context/ConfirmContext";
import PageHeader from "@/components/common/PageHeader";
import Pagination from "@/components/common/Pagination";
import FilterToolbar from "@/components/common/FilterToolbar";

// Components
import ProgramStats from "./components/ProgramStats";
import ProgramCard from "./components/ProgramCard";
import ProgramDetailDrawer from "./components/ProgramDetailDrawer";
import ProgramFormModal from "./components/ProgramFormModal";
import DayFormModal from "./components/DayFormModal";
import ExerciseFormModal from "./components/ExerciseFormModal";

export default function WorkoutProgramsPage() {
  const confirm = useConfirm();
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
      limit: "5",
      search: "",
      goal: "",
      difficulty: "",
      published: "",
      sort: "newest",
      programId: "",
    },
  });

  const page = parseInt(params.page) || 1;
  const limit = parseInt(params.limit) || 5;
  const search = params.search || "";
  const goal = params.goal || "";
  const difficulty = params.difficulty || "";
  const published = params.published || "";
  const sort = params.sort || "newest";
  const urlProgramId = params.programId || "";

  const { showToast } = useToast();

  // State controls
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [isProgramModalOpen, setIsProgramModalOpen] = useState(false);

  const [selectedDay, setSelectedDay] = useState(null);
  const [isDayModalOpen, setIsDayModalOpen] = useState(false);
  const [activeProgramIdForDay, setActiveProgramIdForDay] = useState(null);

  const [selectedTemplateEx, setSelectedTemplateEx] = useState(null);
  const [isExModalOpen, setIsExModalOpen] = useState(false);
  const [activeDayIdForEx, setActiveDayIdForEx] = useState(null);
  const [activeProgramIdForEx, setActiveProgramIdForEx] = useState(null);

  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);
  const [drawerProgramId, setDrawerProgramId] = useState(null);

  // Queries
  const { data: programsData, isLoading: isProgramsLoading, refetch: refetchPrograms } = useGetAdminWorkoutProgramsQuery({
    page,
    limit,
    search,
    goal,
    difficulty,
    published,
    sort,
  });

  const { data: filtersData } = useGetWorkoutProgramFiltersQuery();

  // Mutations
  const [createProgram, { isLoading: isCreatingProgram }] = useCreateWorkoutProgramMutation();
  const [updateProgram, { isLoading: isUpdatingProgram }] = useUpdateWorkoutProgramMutation();
  const [deleteProgram] = useDeleteWorkoutProgramMutation();

  const [addDay, { isLoading: isAddingDay }] = useAddWorkoutProgramDayMutation();
  const [updateDay, { isLoading: isUpdatingDay }] = useUpdateWorkoutProgramDayMutation();
  const [deleteDay] = useDeleteWorkoutProgramDayMutation();

  const [addExercise, { isLoading: isAddingEx }] = useAddWorkoutProgramExerciseMutation();
  const [updateExercise, { isLoading: isUpdatingEx }] = useUpdateWorkoutProgramExerciseMutation();
  const [deleteExercise] = useDeleteWorkoutProgramExerciseMutation();

  const programsList = programsData?.data?.items || [];
  const pagination = programsData?.data?.pagination;

  // Auto-open drawer if programId is present in URL
  useEffect(() => {
    if (urlProgramId) {
      setDrawerProgramId(urlProgramId);
      setIsDetailDrawerOpen(true);
    } else {
      setIsDetailDrawerOpen(false);
      setDrawerProgramId(null);
    }
  }, [urlProgramId]);

  // Program general actions
  const handleOpenDetail = (id) => {
    updateQueryParam("programId", id);
  };

  const handleCloseDetail = () => {
    updateQueryParam("programId", "");
  };

  const handleOpenCreateProgram = () => {
    setSelectedProgram(null);
    setIsProgramModalOpen(true);
  };

  const handleOpenEditProgram = (prog) => {
    setSelectedProgram(prog);
    setIsProgramModalOpen(true);
  };

  const handleSaveProgram = async (formData) => {
    try {
      if (selectedProgram) {
        const res = await updateProgram({ id: selectedProgram.id, formData }).unwrap();
        if (res.success) {
          showToast("Cập nhật thông tin giáo án thành công!", "success");
          setIsProgramModalOpen(false);
          refetchPrograms();
        }
      } else {
        const res = await createProgram(formData).unwrap();
        if (res.success) {
          showToast("Tạo giáo án thành công!", "success");
          setIsProgramModalOpen(false);
          refetchPrograms();
        }
      }
    } catch (err) {
      showToast(err.data?.message || "Đã xảy ra lỗi khi lưu giáo án.", "error");
    }
  };

  const handleDeleteProgram = async (id) => {
    const accepted = await confirm({
      title: "Xóa giáo án",
      message: "Bạn có chắc chắn muốn xóa giáo án này không? Hành động này không thể hoàn tác.",
      confirmText: "Xóa",
      cancelText: "Hủy",
      type: "danger"
    });
    if (!accepted) return;
    try {
      const res = await deleteProgram(id).unwrap();
      if (res.success) {
        showToast("Xóa giáo án thành công!", "success");
        refetchPrograms();
      }
    } catch (err) {
      showToast(err.data?.message || "Không thể xóa giáo án.", "error");
    }
  };

  // Day Actions
  const handleOpenAddDay = (progId) => {
    setSelectedDay(null);
    setActiveProgramIdForDay(progId);
    setIsDayModalOpen(true);
  };

  const handleOpenEditDay = (day) => {
    setSelectedDay(day);
    setActiveProgramIdForDay(day.programId);
    setIsDayModalOpen(true);
  };

  const handleSaveDay = async (payload) => {
    try {
      if (selectedDay) {
        const res = await updateDay({
          id: activeProgramIdForDay,
          dayId: selectedDay.id,
          ...payload,
        }).unwrap();
        if (res.success) {
          showToast("Cập nhật ngày tập thành công!", "success");
          setIsDayModalOpen(false);
        }
      } else {
        const res = await addDay({
          id: activeProgramIdForDay,
          ...payload,
        }).unwrap();
        if (res.success) {
          showToast("Thêm ngày tập thành công!", "success");
          setIsDayModalOpen(false);
        }
      }
    } catch (err) {
      showToast(err.data?.message || "Lỗi khi lưu ngày tập.", "error");
    }
  };

  const handleDeleteDay = async (progId, dayId) => {
    const accepted = await confirm({
      title: "Xóa ngày tập",
      message: "Bạn có chắc chắn muốn xóa ngày tập này và toàn bộ bài tập bên trong?",
      confirmText: "Xóa ngày tập",
      cancelText: "Hủy",
      type: "danger"
    });
    if (!accepted) return;
    try {
      const res = await deleteDay({ id: progId, dayId }).unwrap();
      if (res.success) {
        showToast("Xóa ngày tập thành công!", "success");
      }
    } catch (err) {
      showToast(err.data?.message || "Không thể xóa ngày tập.", "error");
    }
  };

  // Exercise Actions
  const handleOpenAddExercise = (progId, dayId) => {
    setSelectedTemplateEx(null);
    setActiveProgramIdForEx(progId);
    setActiveDayIdForEx(dayId);
    setIsExModalOpen(true);
  };

  const handleOpenEditExercise = (progId, dayId, templateEx) => {
    setSelectedTemplateEx(templateEx);
    setActiveProgramIdForEx(progId);
    setActiveDayIdForEx(dayId);
    setIsExModalOpen(true);
  };

  const handleSaveExercise = async (payload) => {
    try {
      if (selectedTemplateEx) {
        const res = await updateExercise({
          id: activeProgramIdForEx,
          dayId: activeDayIdForEx,
          templateExerciseId: selectedTemplateEx.id,
          ...payload,
        }).unwrap();
        if (res.success) {
          showToast("Cập nhật bài tập thành công!", "success");
          setIsExModalOpen(false);
        }
      } else {
        const res = await addExercise({
          id: activeProgramIdForEx,
          dayId: activeDayIdForEx,
          ...payload,
        }).unwrap();
        if (res.success) {
          showToast("Thêm bài tập vào buổi tập thành công!", "success");
          setIsExModalOpen(false);
        }
      }
    } catch (err) {
      showToast(err.data?.message || "Lỗi khi lưu bài tập.", "error");
    }
  };

  const handleDeleteExercise = async (progId, dayId, templateExerciseId) => {
    const accepted = await confirm({
      title: "Xóa bài tập",
      message: "Bạn có chắc chắn muốn xóa bài tập này khỏi buổi tập?",
      confirmText: "Xóa bài tập",
      cancelText: "Hủy",
      type: "danger"
    });
    if (!accepted) return;
    try {
      const res = await deleteExercise({ id: progId, dayId, templateExerciseId }).unwrap();
      if (res.success) {
        showToast("Xóa bài tập thành công!", "success");
      }
    } catch (err) {
      showToast(err.data?.message || "Không thể xóa bài tập.", "error");
    }
  };

  // Filter toolbar configuration
  const goalOptions = (filtersData?.goals || []).map((g) => ({
    label: g === "muscle_gain" ? "Tăng cơ bắp" : g === "fat_loss" ? "Giảm mỡ" : g === "weight_gain" ? "Tăng cân" : g === "toning" ? "Giữ dáng" : g === "fitness" ? "Thể chất" : g === "maintenance" ? "Duy trì" : g === "hypertrophy" ? "Phì đại cơ" : g,
    value: g,
  }));

  const diffOptions = (filtersData?.difficulties || []).map((d) => ({
    label: d === "beginner" ? "Mới bắt đầu" : d === "intermediate" ? "Trung bình" : d === "advanced" ? "Nâng cao" : d,
    value: d,
  }));

  const filtersConfig = [
    {
      type: "select",
      value: goal,
      onChange: (val) => updateQueryParam("goal", val),
      options: [{ label: "Tất cả mục tiêu", value: "" }, ...goalOptions],
    },
    {
      type: "select",
      value: difficulty,
      onChange: (val) => updateQueryParam("difficulty", val),
      options: [{ label: "Tất cả độ khó", value: "" }, ...diffOptions],
    },
    {
      type: "select",
      value: published,
      onChange: (val) => updateQueryParam("published", val),
      options: [
        { label: "Tất cả trạng thái", value: "" },
        { label: "Đã xuất bản", value: "true" },
        { label: "Bản nháp", value: "false" },
      ],
    },
    {
      type: "select",
      value: sort,
      onChange: (val) => updateQueryParam("sort", val),
      options: [
        { label: "Mới nhất", value: "newest" },
        { label: "Giá tăng dần", value: "price_asc" },
        { label: "Giá giảm dần", value: "price_desc" },
      ],
    },
  ];

  const isFilterActive = !!(search || goal || difficulty || published);

  return (
    <>
      <div className="relative">
        <div className="space-y-6 animate-reactions-in">
          {/* Toast Alert */}
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <PageHeader
              title="Quản lý giáo án tập luyện"
              description="Thiết kế và quản lý lộ trình tập luyện, phân chia ngày và bài tập mẫu cho thành viên."
            />
            <button
              onClick={handleOpenCreateProgram}
              className="h-11 px-5 rounded-xl bg-[var(--color-primary)] text-black text-xs font-black hover:opacity-90 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Tạo giáo án</span>
            </button>
          </div>

          {/* Stats */}
          <ProgramStats summaryStats={programsData?.data?.stats} />

          {/* Filters Toolbar */}
          <FilterToolbar
            searchVal={searchVal}
            setSearchVal={setSearchVal}
            searchPlaceholder="Tìm kiếm tên giáo án, đường dẫn..."
            filters={filtersConfig}
            onRefresh={refetchPrograms}
            onClear={() => handleClearFilters(["limit"])}
            isFilterActive={isFilterActive}
          />

          {/* Cards Grid */}
          {isProgramsLoading ? (
            <div className="flex justify-center py-20 text-xs text-[var(--text-muted)]">
              Đang tải danh sách giáo án...
            </div>
          ) : programsList.length === 0 ? (
            <div className="border border-dashed border-[var(--border-color)]/60 rounded-3xl py-20 flex flex-col items-center justify-center text-[var(--text-muted)] gap-2 text-xs">
              <span>Không tìm thấy giáo án nào phù hợp với bộ lọc.</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {programsList.map((prog) => (
                <ProgramCard
                  key={prog.id}
                  program={prog}
                  onOpenDetail={handleOpenDetail}
                  onEdit={handleOpenEditProgram}
                  onDelete={handleDeleteProgram}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <Pagination
              pagination={pagination}
              currentPage={page}
              limit={limit}
              onPageChange={handlePageChange}
              label="giáo án"
            />
          )}
        </div>
      </div>

      {/* Program details side drawer */}
      <ProgramDetailDrawer
        programId={drawerProgramId}
        isOpen={isDetailDrawerOpen}
        onClose={handleCloseDetail}
        onEditDay={handleOpenEditDay}
        onDeleteDay={handleDeleteDay}
        onAddExercise={handleOpenAddExercise}
        onEditExercise={handleOpenEditExercise}
        onDeleteExercise={handleDeleteExercise}
        onAddDayClick={handleOpenAddDay}
        showToast={showToast}
      />

      {/* Create / Edit Program general form modal */}
      <ProgramFormModal
        isOpen={isProgramModalOpen}
        onClose={() => setIsProgramModalOpen(false)}
        onSave={handleSaveProgram}
        program={selectedProgram}
        filtersData={filtersData?.data}
        isLoading={isCreatingProgram || isUpdatingProgram}
      />

      {/* Day Form Modal */}
      <DayFormModal
        isOpen={isDayModalOpen}
        onClose={() => setIsDayModalOpen(false)}
        onSave={handleSaveDay}
        day={selectedDay}
        suggestedCycleDay={selectedProgram?.daysCount ? selectedProgram.daysCount + 1 : 1}
        isLoading={isAddingDay || isUpdatingDay}
      />

      {/* Exercise Form Modal */}
      <ExerciseFormModal
        isOpen={isExModalOpen}
        onClose={() => setIsExModalOpen(false)}
        onSave={handleSaveExercise}
        templateExercise={selectedTemplateEx}
        isLoading={isAddingEx || isUpdatingEx}
      />
    </>
  );
}
