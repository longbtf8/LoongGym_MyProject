import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import FilterSidebar from "./components/FilterSidebar";
import ExerciseCard from "./components/ExerciseCard";
import SortDropdown from "./components/SortDropdown";
import Pagination from "./components/Pagination";
import { useExerciseFilters } from "./hooks/useExerciseFilters";
import { useGetExercisesQuery, useGetMuscleGroupsQuery, useGetEquipmentQuery } from "@/services/exercise/exerciseApi";
import { Info, RotateCcw, Search, SlidersHorizontal } from "lucide-react";

export default function Exercises() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const {
    searchTerm,
    setSearchTerm,
    page,
    setPage,
    sort,
    setSort,
    difficulty,
    setDifficulty,
    selectedMuscles,
    selectedEquipment,
    toggleEquipment,
    resetFilters
  } = useExerciseFilters();

  // Gọi các API lấy dữ liệu bổ trợ để render thanh trượt nhóm cơ & bottom sheet trên mobile
  const { data: muscleGroupsData } = useGetMuscleGroupsQuery();
  const { data: equipmentData, isLoading: loadingEquipment } = useGetEquipmentQuery();
  
  const muscleGroups = muscleGroupsData?.data || [];
  const equipmentList = equipmentData?.data || [];

  const difficulties = [
    { label: "Người mới", value: "beginner" },
    { label: "Trung bình", value: "intermediate" },
    { label: "Nâng cao", value: "advanced" }
  ];

  // Gọi API chính lấy danh sách bài tập dựa trên bộ lọc
  const { data: exercisesData, isLoading, isFetching, error } = useGetExercisesQuery({
    search: searchTerm || undefined,
    difficulty: difficulty || undefined,
    muscle: selectedMuscles.length > 0 ? selectedMuscles.join(",") : undefined,
    equipment: selectedEquipment.length > 0 ? selectedEquipment.join(",") : undefined,
    sort,
    page,
    limit: 8 // Đổi thành 8 hoặc số chẵn để grid 2 cột trên mobile chia đều không bị lẻ dòng cuối
  });

  const exercises = exercisesData?.data?.data || [];
  const pagination = exercisesData?.data?.pagination || { total: 0, page: 1, limit: 8, totalPages: 1 };

  // Xử lý click chọn nhanh Nhóm cơ trên thanh trượt ngang Mobile
  const handleMuscleChipClick = (slug) => {
    setSearchParams((prev) => {
      if (!slug) {
        prev.delete("muscle");
      } else {
        prev.set("muscle", slug);
      }
      prev.set("page", "1"); // reset về trang 1
      return prev;
    });
  };

  return (
    <div className="min-h-screen bg-[var(--bg-color)] text-[var(--text-color)] py-6 sm:py-8 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto flex flex-col gap-6 sm:gap-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[var(--border-color)] pb-4 sm:pb-6">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-[var(--text-color)]">
              Bài tập đề xuất
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-muted)]">
              Khám phá các bài tập phù hợp với mục tiêu của bạn.
            </p>
          </div>
          <div className="self-end md:self-auto flex items-center justify-between w-full md:w-auto gap-4">
            {/* Trên Mobile/Tablet (dưới lg): Nút mở bộ lọc Bottom Sheet */}
            <div className="lg:hidden flex items-center gap-2 w-full">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Tìm kiếm bài tập..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full h-10 bg-[var(--input-bg)] border border-[var(--border-color)] text-[var(--text-color)] rounded-xl pl-9 pr-3 text-xs focus:outline-none focus:ring-2 focus:ring-[var(--input-focus-border)] focus:border-[var(--input-focus-border)] placeholder-[var(--text-muted)]/60"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]/70" size={14} />
              </div>
              <button
                onClick={() => setIsMobileFilterOpen(true)}
                className="w-10 h-10 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-color)] hover:border-[#ccff00]/40 transition-colors flex items-center justify-center shrink-0 cursor-pointer"
                title="Mở bộ lọc chi tiết"
              >
                <SlidersHorizontal size={16} />
              </button>
            </div>
            
            <SortDropdown sort={sort} setSort={setSort} />
          </div>
        </div>

        {/* Thanh trượt ngang Nhóm cơ - Chỉ hiển thị trên Mobile (dưới lg) */}
        <div className="lg:hidden -mx-4 px-4 overflow-x-auto flex gap-2 py-1.5 no-scrollbar select-none">
          <button
            onClick={() => handleMuscleChipClick("")}
            className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap border transition-all cursor-pointer ${
              selectedMuscles.length === 0
                ? "bg-[#ccff00] text-black border-[#ccff00] shadow-md shadow-[#ccff00]/10"
                : "bg-[var(--bg-secondary)] text-[var(--text-color)] border-[var(--border-color)] hover:border-[#ccff00]/20"
            }`}
          >
            Tất cả
          </button>
          {muscleGroups.map((mg) => {
            const isActive = selectedMuscles.includes(mg.slug);
            return (
              <button
                key={mg.id}
                onClick={() => handleMuscleChipClick(mg.slug)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap border transition-all cursor-pointer ${
                  isActive
                    ? "bg-[#ccff00] text-black border-[#ccff00] shadow-md shadow-[#ccff00]/10"
                    : "bg-[var(--bg-secondary)] text-[var(--text-color)] border-[var(--border-color)] hover:border-[#ccff00]/20"
                }`}
              >
                {mg.name}
              </button>
            );
          })}
        </div>

        {/* Content Layout */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* Sidebar Bộ lọc - Chỉ hiển thị trên Desktop (lg) */}
          <div className="hidden lg:block">
            <FilterSidebar
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              difficulty={difficulty}
              setDifficulty={setDifficulty}
              selectedMuscles={selectedMuscles}
              toggleMuscle={(slug) => {
                setSearchParams((prev) => {
                  let current = prev.get("muscle") ? prev.get("muscle").split(",").filter(Boolean) : [];
                  if (current.includes(slug)) {
                    current = current.filter((s) => s !== slug);
                  } else {
                    current.push(slug);
                  }
                  if (current.length > 0) prev.set("muscle", current.join(","));
                  else prev.delete("muscle");
                  prev.set("page", "1");
                  return prev;
                });
              }}
              selectedEquipment={selectedEquipment}
              toggleEquipment={toggleEquipment}
              resetFilters={resetFilters}
            />
          </div>

          {/* Grid bài tập chính */}
          <main className="flex-1 w-full">
            {isLoading || isFetching ? (
              // Trạng thái tải bài tập (Skeleton Grid) có chiều cao tối thiểu để khóa vị trí phân trang
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 min-h-[850px] sm:min-h-[1300px] lg:min-h-[1100px]">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl sm:rounded-2xl overflow-hidden animate-pulse">
                    <div className="aspect-video w-full bg-[var(--border-color)]/30"></div>
                    <div className="p-3 sm:p-5 flex flex-col gap-3">
                      <div className="h-5 bg-[var(--border-color)]/30 rounded w-3/4"></div>
                      <div className="h-4 bg-[var(--border-color)]/30 rounded w-full hidden sm:block"></div>
                      <div className="h-7 bg-[var(--border-color)]/30 rounded w-1/3 mt-2 self-end"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              // Màn hình báo lỗi
              <div className="flex flex-col items-center justify-center py-16 px-4 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl text-center min-h-[850px] sm:min-h-[1300px] lg:min-h-[1100px]">
                <Info className="text-rose-500 mb-4" size={40} />
                <p className="text-lg font-bold text-[var(--text-color)] mb-2">Đã có lỗi xảy ra</p>
                <p className="text-sm text-[var(--text-muted)] mb-4">Không thể lấy thông tin bài tập từ server.</p>
                <button
                  onClick={resetFilters}
                  className="bg-[#ccff00] text-black font-bold text-sm px-4 py-2 rounded-lg flex items-center gap-2 cursor-pointer"
                >
                  <RotateCcw size={15} />
                  Thử lại
                </button>
              </div>
            ) : exercises.length === 0 ? (
              // Trạng thái tìm kiếm không có kết quả
              <div className="flex flex-col items-center justify-center py-20 px-4 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl text-center min-h-[850px] sm:min-h-[1300px] lg:min-h-[1100px]">
                <Info className="text-[#ccff00] mb-4" size={40} />
                <p className="text-lg font-bold text-[var(--text-color)] mb-2">Không tìm thấy bài tập nào</p>
                <p className="text-sm text-[var(--text-muted)] mb-6 max-w-md">
                  Không có bài tập nào phù hợp với bộ lọc của bạn. Hãy thử xóa bớt tiêu chí lọc hoặc làm mới tìm kiếm.
                </p>
                <button
                  onClick={resetFilters}
                  className="bg-[#ccff00] hover:bg-[#b5e600] text-black font-bold text-sm px-5 py-2.5 rounded-lg flex items-center gap-2 transition-all active:scale-95 shadow-md shadow-[#ccff00]/10 cursor-pointer"
                >
                  <RotateCcw size={15} />
                  Làm mới bộ lọc
                </button>
              </div>
            ) : (
              // Grid bài tập hiển thị (Có min-h đảm bảo vị trí phân trang không đổi)
              <div className="flex flex-col justify-between min-h-[850px] sm:min-h-[1300px] lg:min-h-[1100px]">
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
                  {exercises.map((exercise) => (
                    <ExerciseCard key={exercise.id} exercise={exercise} />
                  ))}
                </div>
                
                {/* Phân trang (Cố định vị trí nhờ min-h của grid chứa ở trên) */}
                <Pagination
                  page={page}
                  setPage={setPage}
                  totalPages={pagination.totalPages}
                />
              </div>
            )}
          </main>
        </div>

      </div>

      {/* Bottom Sheet Drawer cho bộ lọc nâng cao trên Mobile */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop mờ phía sau */}
          <div
            onClick={() => setIsMobileFilterOpen(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
          ></div>
          
          {/* Panel trượt kéo dài từ chân màn hình lên */}
          <div className="absolute bottom-0 left-0 right-0 max-h-[82vh] bg-[var(--bg-color)] border-t border-[var(--border-color)] rounded-t-3xl p-6 overflow-y-auto flex flex-col gap-6 shadow-2xl animate-slide-up transition-colors duration-300">
            <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
              <h3 className="text-lg font-bold text-[var(--text-color)]">Bộ lọc nâng cao</h3>
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="text-sm font-semibold text-[var(--text-muted)] hover:text-[var(--text-color)] cursor-pointer"
              >
                Đóng
              </button>
            </div>

            {/* Thiết bị */}
            <div className="flex flex-col gap-3">
              <h4 className="text-xs font-extrabold text-[var(--text-muted)] uppercase tracking-wider">Thiết bị</h4>
              {loadingEquipment ? (
                <div className="h-10 bg-[var(--border-color)]/25 animate-pulse rounded"></div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {equipmentList.map((eq) => {
                    const isChecked = selectedEquipment.includes(eq.slug);
                    return (
                      <label
                        key={eq.id}
                        className="flex items-center gap-3 text-sm text-[var(--text-muted)] hover:text-[var(--text-color)] cursor-pointer select-none"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleEquipment(eq.slug)}
                          className="w-4 h-4 rounded border-[var(--border-color)] bg-[var(--input-bg)] accent-[#ccff00] text-black cursor-pointer focus:ring-0"
                        />
                        <span>{eq.name}</span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Cấp độ */}
            <div className="flex flex-col gap-3">
              <h4 className="text-xs font-extrabold text-[var(--text-muted)] uppercase tracking-wider">Cấp độ</h4>
              <div className="flex flex-wrap gap-2">
                {difficulties.map((diff) => {
                  const isActive = difficulty === diff.value;
                  return (
                    <button
                      key={diff.value}
                      onClick={() => {
                        if (difficulty === diff.value) setDifficulty("");
                        else setDifficulty(diff.value);
                      }}
                      className={`px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                        isActive
                          ? "bg-[#ccff00] text-black shadow-md shadow-[#ccff00]/10 scale-105"
                          : "bg-[var(--input-bg)] text-[var(--text-muted)] hover:text-[var(--text-color)] border border-[var(--border-color)]"
                      }`}
                    >
                      {diff.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Cụm Action Buttons dưới đáy Bottom Sheet */}
            <div className="grid grid-cols-2 gap-4 border-t border-[var(--border-color)] pt-4 mt-auto">
              <button
                onClick={() => {
                  resetFilters();
                  setIsMobileFilterOpen(false);
                }}
                className="py-3 rounded-xl border border-[var(--border-color)] text-xs font-bold text-[var(--text-color)] hover:bg-[var(--bg-secondary)] transition-colors cursor-pointer"
              >
                Xóa tất cả
              </button>
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="py-3 rounded-xl bg-[#ccff00] text-black text-xs font-bold hover:bg-[#b5e600] transition-colors cursor-pointer"
              >
                Áp dụng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
