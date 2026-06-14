import React from "react";
import { Trash2 } from "lucide-react";

function LoggedFoodsList({
  nutritionData,
  getFoodUnit,
  handleDeleteItem,
}) {
  return (
    <div className="lg:col-span-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] p-5 rounded-2xl flex flex-col gap-4 shadow-sm min-h-[300px]">
      <div className="flex justify-between items-center border-b border-[var(--border-color)] pb-3">
        <span className="text-xs font-black uppercase text-[var(--text-color)] tracking-wider">
          Món đã ăn hôm nay
        </span>
        <span className="text-[10px] bg-primary/10 border border-primary/20 text-primary px-2 py-0.5 rounded-lg font-black uppercase">
          {nutritionData?.mealLogs?.[0]?.items?.length || 0} món
        </span>
      </div>

      <div className="flex flex-col gap-3 max-h-[360px] overflow-y-auto pr-1 no-scrollbar animate-slide-down">
        {!nutritionData?.mealLogs?.[0]?.items || nutritionData.mealLogs[0].items.length === 0 ? (
          <span className="text-xs text-[var(--text-muted)] italic font-bold py-10 text-center">
            Bạn chưa log món ăn nào hôm nay.
          </span>
        ) : (
          nutritionData.mealLogs[0].items.map((item) => (
            <div
              key={item.id}
              className="flex justify-between items-center p-3 bg-[var(--bg-color)] border border-[var(--border-color)] rounded-xl"
            >
              <div className="flex-1 min-w-0 pr-2">
                <h4 className="font-extrabold text-xs text-[var(--text-color)] truncate !m-0">
                  {item.customFoodName || item.foodItem?.name || "Món ăn"}
                </h4>
                <div className="text-[9px] text-[var(--text-muted)] font-semibold mt-1 flex flex-wrap gap-x-2 gap-y-0.5">
                  <span>{item.quantityG}{getFoodUnit(item.foodItem)}</span>
                  <span>•</span>
                  <span>{item.calories} kcal</span>
                  <span>•</span>
                  <span>P: {item.proteinG}g</span>
                  <span>•</span>
                  <span>C: {item.carbsG}g</span>
                  <span>•</span>
                  <span>F: {item.fatG}g</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleDeleteItem(item.id)}
                className="p-1.5 hover:bg-red-500/10 hover:text-red-500 rounded-lg text-[var(--text-muted)] cursor-pointer transition border-0 bg-transparent shrink-0 flex items-center justify-center"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default LoggedFoodsList;
