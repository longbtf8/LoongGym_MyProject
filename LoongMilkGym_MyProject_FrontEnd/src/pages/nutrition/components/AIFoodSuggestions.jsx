import React, { useState, useEffect } from "react";
import { Sparkles, Plus, Loader2, Check } from "lucide-react";
import httpRequest from "@/services/api";

function AIFoodSuggestions({
  calRemaining,
  handleQuickAddFood,
}) {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState(null);
  const [error, setError] = useState("");
  const [addingId, setAddingId] = useState(null);

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    const cacheKey = `ai_food_suggestions_${today}`;
    const cachedData = localStorage.getItem(cacheKey);
    if (cachedData) {
      try {
        setSuggestions(JSON.parse(cachedData));
      } catch (e) {
        localStorage.removeItem(cacheKey);
      }
    }
  }, []);

  const fetchSuggestions = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await httpRequest.get("/ai/nutrition-suggestions");
      if (res.success && res.data) {
        setSuggestions(res.data.suggestions);
        const today = new Date().toISOString().split("T")[0];
        const cacheKey = `ai_food_suggestions_${today}`;
        
        // Clear old keys starting with ai_food_suggestions_
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith("ai_food_suggestions_") && key !== cacheKey) {
            localStorage.removeItem(key);
            i--; // Adjust index
          }
        }
        
        localStorage.setItem(cacheKey, JSON.stringify(res.data.suggestions));
      } else {
        setError("Không thể tải gợi ý từ AI.");
      }
    } catch (err) {
      console.error(err);
      setError("Không thể kết nối đến máy chủ AI.");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (item, index) => {
    try {
      setAddingId(index);
      await handleQuickAddFood(item);
    } finally {
      setAddingId(null);
    }
  };

  return (
    <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] p-6 rounded-[24px] flex flex-col gap-5 shadow-lg relative overflow-hidden transition-all duration-300">
      
      {/* Background glowing effects */}
      <div className="absolute top-0 right-0 w-36 h-36 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-[var(--border-color)] pb-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-primary/10 border border-primary/20 text-primary flex items-center justify-center">
              <Sparkles className="w-4 h-4 fill-primary" />
            </span>
            <span className="text-sm font-black uppercase text-[var(--text-color)] tracking-wider">
              Gợi ý bữa ăn thông minh từ AI
            </span>
          </div>
          <p className="text-[11px] text-[var(--text-muted)] font-semibold mt-0.5">
            Đề xuất dựa trên lượng calories và macronutrients còn thiếu của bạn hôm nay.
          </p>
        </div>

        {suggestions && (
          <button
            onClick={fetchSuggestions}
            disabled={loading}
            className="h-8 px-3 rounded-xl bg-primary/10 border border-primary/20 hover:bg-primary/20 text-primary text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
            Làm mới gợi ý
          </button>
        )}
      </div>

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-xs font-bold text-center">
          {error}
        </div>
      )}

      {!suggestions ? (
        <div className="flex flex-col items-center justify-center py-10 px-4 text-center gap-4 bg-[var(--bg-color)]/30 border border-[var(--border-color)] border-dashed rounded-2xl">
          <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-xl animate-pulse">
            💡
          </div>
          <div className="flex flex-col gap-1 max-w-sm">
            <h4 className="text-xs font-black text-[var(--text-color)]">
              Hôm nay bạn còn thiếu {Math.round(calRemaining)} kcal
            </h4>
            <p className="text-[10px] text-[var(--text-muted)] font-semibold">
              Nhấn nút bên dưới để AI phân tích lượng dinh dưỡng còn thiếu và gợi ý món ăn phù hợp với khẩu vị Việt Nam!
            </p>
          </div>
          <button
            onClick={fetchSuggestions}
            disabled={loading}
            className="h-10 px-6 rounded-xl bg-primary hover:bg-primary-hover text-black text-xs font-black shadow-lg shadow-primary/10 hover:shadow-primary/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-60 border-0"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Đang phân tích dinh dưỡng...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 fill-black" />
                Gợi ý món ăn ngay
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {suggestions.map((item, index) => (
            <div
              key={index}
              className="group bg-[var(--bg-color)] border border-[var(--border-color)] hover:border-primary/30 p-4 rounded-2xl flex flex-col justify-between gap-3 transition-all duration-300 hover:-translate-y-1 shadow-sm hover:shadow-md relative overflow-hidden"
            >
              {/* Highlight ribbon */}
              <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-primary/30 to-blue-500/30 group-hover:from-primary group-hover:to-blue-500 transition-all duration-300" />
              
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-start gap-1">
                  <h4 className="text-xs font-black text-[var(--text-color)] group-hover:text-primary transition-colors line-clamp-1 !m-0">
                    {item.name}
                  </h4>
                  <span className="text-[9px] bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-muted)] px-1.5 py-0.5 rounded-lg font-bold shrink-0">
                    {item.portion}
                  </span>
                </div>

                <p className="text-[10px] text-[var(--text-muted)] font-semibold leading-relaxed line-clamp-3">
                  {item.reason}
                </p>
              </div>

              <div className="flex flex-col gap-3 mt-1">
                {/* Macro breakdown */}
                <div className="grid grid-cols-4 gap-1.5 text-center">
                  <div className="bg-primary/5 border border-primary/10 rounded-lg py-1 flex flex-col">
                    <span className="text-[11px] font-black text-primary">{item.calories}</span>
                    <span className="text-[7px] font-black text-[var(--text-muted)] uppercase">Kcal</span>
                  </div>
                  <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-lg py-1 flex flex-col">
                    <span className="text-[11px] font-black text-emerald-500">{item.protein}g</span>
                    <span className="text-[7px] font-black text-[var(--text-muted)] uppercase">Pro</span>
                  </div>
                  <div className="bg-sky-500/5 border border-sky-500/10 rounded-lg py-1 flex flex-col">
                    <span className="text-[11px] font-black text-sky-500">{item.carbs}g</span>
                    <span className="text-[7px] font-black text-[var(--text-muted)] uppercase">Carb</span>
                  </div>
                  <div className="bg-amber-500/5 border border-amber-500/10 rounded-lg py-1 flex flex-col">
                    <span className="text-[11px] font-black text-amber-500">{item.fat}g</span>
                    <span className="text-[7px] font-black text-[var(--text-muted)] uppercase">Fat</span>
                  </div>
                </div>

                <button
                  onClick={() => handleAdd(item, index)}
                  disabled={addingId !== null}
                  className="w-full h-8 rounded-xl bg-primary text-black hover:bg-primary-hover active:scale-[0.98] transition text-[10px] font-black flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60 border-0"
                >
                  {addingId === index ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Plus className="w-3.5 h-3.5" />
                  )}
                  Thêm nhanh
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AIFoodSuggestions;
