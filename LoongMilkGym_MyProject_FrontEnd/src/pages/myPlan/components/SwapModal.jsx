import { useState, useEffect } from "react";
import { Search, Dumbbell } from "lucide-react";
import { useGetExercisesQuery } from "@/services/exercise/exerciseApi";

// mapFocusAreaToMuscleSlugs: Chuyển đổi tên nhóm cơ từ tiếng Việt sang dạng slug để gọi API filter bài tập
const mapFocusAreaToMuscleSlugs = (focusArea) => {
  if (!focusArea) return "";
  const map = {
    "ngực": "nguc",
    "vai": "vai",
    "tay sau": "tay-sau",
    "lưng": "lung",
    "tay trước": "tay-truoc",
    "bắp chân": "bap-chan",
    "core": "core",
    "bụng": "core",
    "đùi trước": "dui-truoc",
    "mông": "mong",
    "đùi sau": "dui-sau",
    "lưng dưới": "lung-duoi",
    "toàn thân": ""
  };
  return focusArea
    .toLowerCase()
    .split(",")
    .map(s => s.trim())
    .map(s => map[s] || "")
    .filter(Boolean)
    .join(",");
};

// SwapModal: Component modal thay thế bài tập hoặc thêm bài tập mới vào ngày tập
export default function SwapModal({ 
  isOpen, 
  onClose, 
  swapTargetIndex, 
  dayDetails, 
  onSelectExercise 
}) {
  const [searchKeyword, setSearchKeyword] = useState("");

  useEffect(() => {
    if (isOpen) {
      setSearchKeyword("");
    }
  }, [isOpen]);

  const muscleFilter = mapFocusAreaToMuscleSlugs(dayDetails?.focusArea);
  const { data: exercisesRes } = useGetExercisesQuery({ 
    search: searchKeyword,
    muscle: muscleFilter,
    limit: 30
  }, { skip: !isOpen });

  const availableExercises = exercisesRes?.data?.data || [];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-[2px] flex items-center justify-center z-[999999] p-4">
      <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-[20px] p-4 w-full max-w-[360px] max-h-[60vh] flex flex-col gap-2.5 shadow-2xl overflow-hidden">
        <div className="flex justify-between items-center pb-2 border-b border-[var(--border-color)]">
          <h3 className="text-sm font-extrabold">
            {swapTargetIndex !== null ? "Thay thế bài tập" : "Thêm bài tập"}
          </h3>
          <button 
            onClick={onClose}
            className="text-[var(--text-muted)] hover:text-[var(--text-color)] text-sm font-bold border-0 bg-transparent cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="relative w-full mb-1">
          <input
            type="text"
            placeholder="Tìm nhanh bài tập..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            className="w-full bg-[var(--bg-color)] border border-[var(--border-color)] rounded-xl pl-8 pr-2.5 py-1.5 text-xs text-[var(--text-color)] outline-none h-8 box-border"
          />
          <Search 
            className="w-3.5 h-3.5 text-[var(--text-muted)] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
          />
        </div>

        <div className="text-[10px] text-[var(--text-muted)] font-semibold px-1">
          Nhóm cơ lọc: <span className="text-primary font-bold">{dayDetails?.focusArea || "Đa khớp"}</span>
        </div>
        <div className="text-[10px] text-[var(--text-muted)] leading-relaxed bg-[var(--bg-color)] border border-[var(--border-color)] rounded-xl p-2">
          Gợi ý: chọn 1-2 bài chính trước, thêm bài phụ sau. Nếu mới tập, ưu tiên mức Người mới và giữ 60-120 giây nghỉ giữa hiệp.
        </div>

        <div className="flex-1 overflow-y-auto pr-0.5 flex flex-col gap-1.5 no-scrollbar">
          {availableExercises.length === 0 ? (
            <div className="text-center py-6 text-xs text-[var(--text-muted)]">
              Không tìm thấy bài tập nào.
            </div>
          ) : (
            availableExercises.map((exercise) => (
              <div 
                key={exercise.id}
                className="flex justify-between items-center p-2 bg-[var(--bg-color)] border border-[var(--border-color)] rounded-xl hover:border-primary transition"
              >
                <div className="flex items-center gap-2">
                  {exercise.thumbnailUrl ? (
                    <img 
                      src={exercise.thumbnailUrl} 
                      alt={exercise.name} 
                      className="w-8 h-8 rounded-lg object-cover border border-[var(--border-color)]"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-lg bg-[var(--bg-secondary)] flex items-center justify-center border border-[var(--border-color)]">
                      <Dumbbell className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                    </div>
                  )}
                  <div className="max-w-[180px]">
                    <h4 className="text-xs font-bold truncate">{exercise.name}</h4>
                    <span className="text-[8px] text-[var(--text-muted)] capitalize">
                      {exercise.difficulty} • {exercise.exerciseType}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => onSelectExercise(exercise)}
                  className="px-2.5 py-1 bg-primary text-black rounded-lg text-[10px] font-black cursor-pointer hover:bg-primary-hover transition"
                >
                  {swapTargetIndex !== null ? "Chọn" : "Thêm"}
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
