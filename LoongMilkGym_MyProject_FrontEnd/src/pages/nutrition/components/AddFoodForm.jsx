import React from "react";
import { Utensils, ScanBarcode, Search, Sparkles, Plus } from "lucide-react";

function AddFoodForm({
  isManual,
  setIsManual,
  setSelectedFood,
  setSearchTerm,
  handleAddFoodItem,
  setIsScanning,
  searchTerm,
  selectedFood,
  searchResults,
  handleSelectLibraryFood,
  getFoodUnit,
  manualName,
  setManualName,
  manualCalories,
  setManualCalories,
  manualProtein,
  setManualProtein,
  manualCarbs,
  setManualCarbs,
  manualFat,
  setManualFat,
  quantityG,
  setQuantityG,
  previewData,
  isAddingItem,
}) {
  return (
    <div className="lg:col-span-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] p-5 rounded-2xl flex flex-col gap-4 shadow-sm">
      <div className="flex justify-between items-center border-b border-[var(--border-color)] pb-3">
        <span className="text-xs font-black uppercase text-[var(--text-color)] tracking-wider flex items-center gap-1.5">
          <Utensils className="w-4 h-4 text-primary" />
          Ghi nhận ăn uống
        </span>
        <button
          type="button"
          onClick={() => {
            setIsManual(!isManual);
            setSelectedFood(null);
            setSearchTerm("");
          }}
          className="text-[10px] font-extrabold text-primary hover:text-primary-hover bg-transparent border-0 p-0 cursor-pointer"
        >
          {isManual ? "🔍 Tìm món thư viện" : "✍️ Nhập tay thủ công"}
        </button>
      </div>

      <form onSubmit={handleAddFoodItem} className="flex flex-col gap-3.5">
        {!isManual ? (
          /* Search Food from Library + Barcode trigger */
          <div className="flex flex-col gap-1.5 relative">
            <div className="flex justify-between items-center">
              <label className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider">
                Tìm kiếm món ăn trong thư viện
              </label>
              <button
                type="button"
                onClick={() => setIsScanning(true)}
                className="text-[10px] text-primary hover:text-primary-hover font-black flex items-center gap-1 bg-transparent border-0 p-0 cursor-pointer"
              >
                <ScanBarcode className="w-3.5 h-3.5 text-primary" /> Quét mã vạch
              </button>
            </div>
            <div className="relative">
              <input
                type="text"
                placeholder="Gõ tìm kiếm (vd: ức gà, Milo, sữa chua...)"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  if (selectedFood && e.target.value !== selectedFood.name) {
                    setSelectedFood(null);
                  }
                }}
                className="w-full h-10 bg-[var(--bg-color)] border border-[var(--border-color)] rounded-xl pl-9 pr-4 text-xs text-[var(--text-color)] outline-none focus:border-primary font-bold"
              />
              <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3 top-3" />
            </div>

            {/* Visual Selected Food Card */}
            {selectedFood && (
              <div className="flex items-center gap-3 p-3 bg-[var(--bg-color)] border border-primary/20 rounded-xl relative mt-2 shadow-inner">
                {selectedFood.imageUrl ? (
                  <img
                    src={selectedFood.imageUrl}
                    alt={selectedFood.name}
                    className="w-12 h-12 object-contain rounded-lg bg-white border border-[var(--border-color)] p-0.5 shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] text-lg shrink-0">
                    🥗
                  </div>
                )}
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-xs font-black text-[var(--text-color)] truncate">{selectedFood.name}</span>
                  {selectedFood.brand && (
                    <span className="text-[9px] text-[var(--text-muted)] font-extrabold truncate">{selectedFood.brand}</span>
                  )}
                  <span className="text-[10px] text-primary font-black mt-0.5">
                    {selectedFood.calories} kcal / {selectedFood.servingSizeG || 100}{getFoodUnit(selectedFood)}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedFood(null);
                    setSearchTerm("");
                  }}
                  className="text-[9px] text-red-500 hover:text-red-400 font-black bg-transparent border-0 cursor-pointer p-1.5 active:scale-95 transition"
                >
                  Hủy chọn
                </button>
              </div>
            )}

            {/* Autocomplete Results Box */}
            {searchTerm.trim().length >= 2 && !selectedFood && (
              <div className="absolute left-0 right-0 top-[62px] z-[120] bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl shadow-2xl p-1.5 flex flex-col gap-0.5 max-h-48 overflow-y-auto">
                {searchResults.length === 0 ? (
                  <span className="p-3 text-[10px] text-[var(--text-muted)] italic font-bold text-center">
                    Không tìm thấy món ăn nào. Nhấp "Nhập tay thủ công" ở góc trên.
                  </span>
                ) : (
                  searchResults.map((food) => (
                    <button
                      key={food.id}
                      type="button"
                      onClick={() => handleSelectLibraryFood(food)}
                      className="w-full px-2.5 py-1.5 text-left text-xs font-bold rounded-lg hover:bg-[var(--bg-color)] border-0 bg-transparent text-[var(--text-color)] cursor-pointer flex justify-between items-center transition-all gap-2"
                    >
                      <div className="flex items-center gap-2 truncate pr-2">
                        {food.imageUrl ? (
                          <img
                            src={food.imageUrl}
                            alt={food.name}
                            className="w-6 h-6 object-contain rounded-md bg-white border border-[var(--border-color)] p-0.5 shrink-0"
                          />
                        ) : (
                          <div className="w-6 h-6 flex items-center justify-center rounded-md bg-[var(--bg-color)] border border-[var(--border-color)] text-[10px] shrink-0">
                            🥗
                          </div>
                        )}
                        <span className="truncate">{food.name}</span>
                      </div>
                      <span className="text-[9px] text-[var(--text-muted)] shrink-0 font-extrabold flex items-center gap-1">
                        {food.calories} kcal / {food.servingSizeG}{getFoodUnit(food)}
                      </span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        ) : (
          /* Manual Custom Form Inputs */
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider">
                Tên món ăn tự nhập
              </label>
              <input
                type="text"
                placeholder="Ví dụ: Phở bò đặc biệt, Bún chả..."
                value={manualName}
                onChange={(e) => setManualName(e.target.value)}
                className="w-full h-10 bg-[var(--bg-color)] border border-[var(--border-color)] rounded-xl px-3 text-xs text-[var(--text-color)] outline-none focus:border-primary font-bold"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider">
                  Calories (kcal)
                </label>
                <input
                  type="number"
                  placeholder="Calo"
                  value={manualCalories}
                  onChange={(e) => setManualCalories(e.target.value)}
                  className="w-full h-10 bg-[var(--bg-color)] border border-[var(--border-color)] rounded-xl px-3 text-xs text-[var(--text-color)] outline-none focus:border-primary text-center font-bold"
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider">
                  Protein (g)
                </label>
                <input
                  type="number"
                  placeholder="Protein"
                  value={manualProtein}
                  onChange={(e) => setManualProtein(e.target.value)}
                  className="w-full h-10 bg-[var(--bg-color)] border border-[var(--border-color)] rounded-xl px-3 text-xs text-[var(--text-color)] outline-none focus:border-primary text-center font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider">
                  Carbs (g)
                </label>
                <input
                  type="number"
                  placeholder="Tinh bột"
                  value={manualCarbs}
                  onChange={(e) => setManualCarbs(e.target.value)}
                  className="w-full h-10 bg-[var(--bg-color)] border border-[var(--border-color)] rounded-xl px-3 text-xs text-[var(--text-color)] outline-none focus:border-primary text-center font-bold"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider">
                  Fat (g)
                </label>
                <input
                  type="number"
                  placeholder="Chất béo"
                  value={manualFat}
                  onChange={(e) => setManualFat(e.target.value)}
                  className="w-full h-10 bg-[var(--bg-color)] border border-[var(--border-color)] rounded-xl px-3 text-xs text-[var(--text-color)] outline-none focus:border-primary text-center font-bold"
                />
              </div>
            </div>
          </div>
        )}

        {/* Quantity in grams/ml input */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider">
            {selectedFood && getFoodUnit(selectedFood) === "ml"
              ? "Thể tích đã uống (ml)"
              : "Khối lượng đã ăn (g)"}
          </label>
          <input
            type="number"
            placeholder={selectedFood && getFoodUnit(selectedFood) === "ml" ? "Điền số ml (vd: 330)" : "Điền số gram (vd: 100)"}
            value={quantityG}
            onChange={(e) => setQuantityG(e.target.value)}
            className="w-full h-10 bg-[var(--bg-color)] border border-[var(--border-color)] rounded-xl px-3 text-xs text-[var(--text-color)] outline-none focus:border-primary text-center font-bold"
            required
          />
        </div>

        {/* Dynamic preview block */}
        {previewData && (
          <div className="p-3 bg-[var(--bg-color)] border border-primary/20 rounded-xl flex items-center justify-between text-[10px] font-black">
            <span className="text-primary flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 fill-primary" />
              Ước tính ({quantityG}{selectedFood ? getFoodUnit(selectedFood) : "g"}):
            </span>
            <span>{previewData.calories} kcal</span>
            <span>P: {previewData.protein}g</span>
            <span>C: {previewData.carbs}g</span>
            <span>F: {previewData.fat}g</span>
          </div>
        )}

        <button
          type="submit"
          disabled={isAddingItem || (!isManual && !selectedFood)}
          className="w-full h-10 bg-primary text-black rounded-xl text-xs font-black flex items-center justify-center gap-2 hover:bg-primary-hover active:scale-[0.98] transition cursor-pointer shadow-md shadow-primary/5 mt-1 disabled:opacity-55 border-0"
        >
          <Plus className="w-4 h-4" />
          {isAddingItem ? "Đang lưu..." : "Thêm món vào nhật ký"}
        </button>
      </form>
    </div>
  );
}

export default AddFoodForm;
