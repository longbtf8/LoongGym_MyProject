import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Flame, Plus, Play } from "lucide-react";
import { useGetExercisesQuery } from "@/services/exercise/exerciseApi";
import paths from "@/config/path";

// Mock fallbacks if database has no seeded exercises
const MOCK_POPULAR_EXERCISES = [
  {
    id: "bench-press",
    name: "Bench Press",
    slug: "bench-press",
    gifUrl: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=400",
    difficulty: "Medium",
    calories: 150,
    categoryName: "Ngực",
  },
  {
    id: "barbell-squat",
    name: "Barbell Squat",
    slug: "barbell-squat",
    gifUrl: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=400",
    difficulty: "Hard",
    calories: 220,
    categoryName: "Đùi",
  },
  {
    id: "deadlift",
    name: "Deadlift",
    slug: "deadlift",
    gifUrl: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=400",
    difficulty: "Hard",
    calories: 250,
    categoryName: "Toàn thân",
  },
  {
    id: "pull-up",
    name: "Pull Up",
    slug: "pull-up",
    gifUrl: "https://images.unsplash.com/photo-1598971639058-fab3c3109a00?q=80&w=400",
    difficulty: "Medium",
    calories: 180,
    categoryName: "Lưng",
  },
  {
    id: "arnold-press",
    name: "Arnold Press",
    slug: "arnold-press",
    gifUrl: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=400",
    difficulty: "Medium",
    calories: 120,
    categoryName: "Vai",
  },
  {
    id: "running",
    name: "Running",
    slug: "running",
    gifUrl: "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?q=80&w=400",
    difficulty: "Easy",
    calories: 300,
    categoryName: "Cardio",
  },
];

function PopularExercises() {
  const navigate = useNavigate();
  const { data: apiData, isLoading } = useGetExercisesQuery({ limit: 6 });

  // Map API data if exists, otherwise fallback
  const exercises = apiData?.data && apiData.data.length > 0 
    ? apiData.data.map(ex => ({
        id: ex.id,
        name: ex.name,
        slug: ex.slug,
        gifUrl: ex.gifUrl || "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=400",
        difficulty: ex.difficulty || "Medium",
        calories: ex.calories || 150,
        categoryName: ex.muscleGroups?.[0]?.muscleGroup?.name || "Thể lực",
      }))
    : MOCK_POPULAR_EXERCISES;

  return (
    <section className="w-full py-10">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-[var(--text-color)] m-0 leading-tight tracking-tight">
            Bài tập phổ biến
          </h2>
          <p className="text-sm text-[var(--text-muted)] mt-1.5 max-w-xl">
            Các bài tập cơ bản, chuẩn hướng dẫn từ các huấn luyện viên chuyên nghiệp giúp tối ưu hoá hiệu quả tập luyện.
          </p>
        </div>
        
        <Link 
          to={paths.exercises}
          className="inline-flex items-center gap-1.5 text-xs font-black tracking-wider uppercase text-[var(--text-primary)] hover:opacity-80 transition-all duration-200 no-underline whitespace-nowrap"
        >
          Xem tất cả
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* EXERCISE GRID */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, idx) => (
            <div key={idx} className="h-64 rounded-3xl bg-[var(--bg-secondary)] border border-[var(--border-color)] animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {exercises.slice(0, 6).map((ex) => (
            <div 
              key={ex.id}
              onClick={() => navigate(`/exercises/${ex.slug}`)}
              className="group relative flex flex-col justify-end aspect-[4/3] rounded-3xl overflow-hidden border border-[var(--border-color)] shadow-sm hover:shadow-md cursor-pointer transition-all duration-300"
            >
              {/* Background image & gradient overlay */}
              <img 
                src={ex.gifUrl} 
                alt={ex.name} 
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-black/10 transition-opacity duration-300 pointer-events-none" />

              {/* Tag/Category */}
              <div className="absolute top-4 left-4 z-10 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-widest bg-black/60 backdrop-blur-sm border border-white/10 text-white rounded-full">
                {ex.categoryName}
              </div>

              {/* Exercise Stats & Title (Bottom) */}
              <div className="relative z-10 p-5 flex items-end justify-between gap-4">
                <div className="flex flex-col">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-primary/95 flex items-center gap-1 mb-1">
                    <Flame className="w-3.5 h-3.5 fill-current" />
                    + {ex.calories} Kcal
                  </span>
                  <h3 className="text-lg font-black text-white m-0 tracking-tight leading-tight">
                    {ex.name}
                  </h3>
                </div>
                
                {/* Floating Plus/Action Button */}
                <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white group-hover:bg-primary group-hover:text-black group-hover:border-primary transition-all duration-300 shadow-lg">
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

    </section>
  );
}

export default PopularExercises;
