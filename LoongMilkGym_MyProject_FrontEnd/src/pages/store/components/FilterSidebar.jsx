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

  const handlePriceChange = (e) => {
    setPriceRange([100000, Number(e.target.value)]);
  };

  const handleReset = () => {
    setSelectedCategory("");
    setPriceRange([100000, 2000000]);
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
            Dưới {formatVND(priceRange[1])}
          </span>
        </div>
        <input
          type="range"
          min="100000"
          max="2000000"
          step="50000"
          value={priceRange[1]}
          onChange={handlePriceChange}
          className="w-full accent-primary cursor-pointer mb-2"
        />
        <div className="flex justify-between text-[10px] font-bold text-[var(--text-muted)]">
          <span>{formatVND(100000)}</span>
          <span>{formatVND(2000000)}</span>
        </div>
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
