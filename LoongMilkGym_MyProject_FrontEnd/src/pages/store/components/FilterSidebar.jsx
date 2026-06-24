import React from "react";
import { useGetProductCategoriesQuery } from "@/services/store/storeApi";

function FilterSidebar({
  selectedCategory,
  setSelectedCategory,
  priceRange,
  setPriceRange,
  selectedBrands,
  setSelectedBrands,
  availableBrands = [],
  minPrice = 0,
  maxPrice = 2000000,
}) {
  const { data: categoriesData } = useGetProductCategoriesQuery();
  const categories = categoriesData?.data || [];

  const handleBrandChange = (brand) => {
    if (selectedBrands.includes(brand)) {
      setSelectedBrands(selectedBrands.filter((b) => b !== brand));
    } else {
      setSelectedBrands([...selectedBrands, brand]);
    }
  };

  const formatVND = (value) => {
    return new Intl.NumberFormat("vi-VN").format(value) + "đ";
  };

  const isFilterActive = priceRange !== null;
  const currentMaxPrice = isFilterActive ? priceRange[1] : maxPrice;

  const handlePriceChange = (e) => {
    setPriceRange([minPrice, Number(e.target.value)]);
  };

  const handleReset = () => {
    setSelectedCategory("");
    setPriceRange(null);
    setSelectedBrands([]);
  };

  return (
    <div className="flex flex-col gap-6 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-5 md:sticky md:top-20">
      {/* Categories */}
      <div>
        <h4 className="text-sm font-black uppercase tracking-wider text-[var(--text-color)] mb-3">
          Danh mục
        </h4>
        <div className="flex flex-col gap-1">
          <button
            onClick={() => setSelectedCategory("")}
            className={`w-full text-left px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all duration-200 border-0 cursor-pointer ${
              selectedCategory === ""
                ? "bg-primary text-black font-black"
                : "bg-transparent text-[var(--text-muted)] hover:bg-[var(--border-color)]/25 hover:text-[var(--text-color)]"
            }`}
          >
            Tất cả
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.slug)}
              className={`w-full text-left px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all duration-200 border-0 cursor-pointer ${
                selectedCategory === cat.slug
                  ? "bg-primary text-black font-black"
                  : "bg-transparent text-[var(--text-muted)] hover:bg-[var(--border-color)]/25 hover:text-[var(--text-color)]"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Price Slider */}
      <div className="border-t border-[var(--border-color)] pt-5">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-black uppercase tracking-wider text-[var(--text-color)] m-0">
            Giá bán
          </h4>
          <span className="text-xs font-bold text-primary">
            {isFilterActive ? `Dưới ${formatVND(currentMaxPrice)}` : "Tất cả mức giá"}
          </span>
        </div>
        <input
          type="range"
          min={minPrice}
          max={maxPrice}
          step={Math.max(10000, Math.floor((maxPrice - minPrice) / 50))}
          value={currentMaxPrice}
          onChange={handlePriceChange}
          className="w-full accent-primary cursor-pointer mb-2"
        />
        <div className="flex justify-between text-[10px] font-bold text-[var(--text-muted)]">
          <span>{formatVND(minPrice)}</span>
          <span>{formatVND(maxPrice)}</span>
        </div>

        {/* Quick price select chips */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          {[
            { value: 500000 },
            { value: 1000000 },
            { value: 2000000 },
            { value: 5000000 },
          ].map((chip) => {
            const isActive = isFilterActive && priceRange[1] === chip.value;
            return (
              <button
                key={chip.value}
                type="button"
                onClick={() => setPriceRange([minPrice, chip.value])}
                className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "bg-primary/10 border-primary text-primary"
                    : "bg-[var(--bg-color)] border-[var(--border-color)]/60 text-[var(--text-muted)] hover:text-[var(--text-color)] hover:border-[var(--text-muted)]"
                }`}
              >
                Dưới {formatVND(chip.value)}
              </button>
            );
          })}
        </div>

        {isFilterActive && (
          <button
            onClick={() => setPriceRange(null)}
            className="mt-3.5 text-left text-[10px] font-black uppercase tracking-wider text-rose-500 hover:text-rose-400 transition cursor-pointer border-0 bg-transparent p-0 flex items-center gap-1"
          >
            × Xem tất cả mức giá
          </button>
        )}
      </div>

      {/* Brands */}
      <div className="border-t border-[var(--border-color)] pt-5">
        <h4 className="text-sm font-black uppercase tracking-wider text-[var(--text-color)] mb-3">
          Thương hiệu
        </h4>
        <div className="flex flex-col gap-2.5 max-h-48 overflow-y-auto pr-1">
          {availableBrands.map((brand) => (
            <label
              key={brand}
              className="flex items-center gap-3 text-xs sm:text-sm font-bold text-[var(--text-muted)] hover:text-[var(--text-color)] cursor-pointer select-none"
            >
              <input
                type="checkbox"
                checked={selectedBrands.includes(brand)}
                onChange={() => handleBrandChange(brand)}
                className="w-4 h-4 rounded border-[var(--border-color)] text-primary focus:ring-primary accent-primary cursor-pointer"
              />
              {brand}
            </label>
          ))}
        </div>
      </div>

      {/* Reset Button */}
      <button
        onClick={handleReset}
        className="w-full py-2 bg-transparent text-[var(--text-muted)] hover:text-[var(--text-color)] font-bold text-xs sm:text-sm border border-[var(--border-color)] hover:border-[var(--text-muted)] rounded-xl transition-colors duration-200 cursor-pointer"
      >
        Xoá bộ lọc
      </button>
    </div>
  );
}

export default FilterSidebar;
