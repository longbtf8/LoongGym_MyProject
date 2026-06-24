import React, { useState, useMemo, useRef, useEffect } from "react";
import { Search, SlidersHorizontal, ChevronDown } from "lucide-react";
import { useGetProductsQuery } from "@/services/store/storeApi";
import FilterSidebar from "./components/FilterSidebar";
import ProductCard from "./components/ProductCard";
import Pagination from "@/pages/exercises/components/Pagination";

const SORT_OPTIONS = [
  { value: "newest", label: "Sắp xếp: Mới nhất" },
  { value: "price_asc", label: "Sắp xếp: Giá thấp → cao" },
  { value: "price_desc", label: "Sắp xếp: Giá cao → thấp" }
];

function Store() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [priceRange, setPriceRange] = useState(null);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [sortBy, setSortBy] = useState("newest");
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const [currentPage, setCurrentPage] = useState(1);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, priceRange, selectedBrands, search, sortBy]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch sản phẩm từ API (lấy tối đa 100 sản phẩm để lọc client)
  const {
    data: productsData,
    isLoading,
    error,
  } = useGetProductsQuery({ limit: 100 });
  const allProducts = productsData?.data?.data || [];

  const { minPrice, maxPrice } = useMemo(() => {
    const activeProducts = allProducts.filter(
      (p) => p.status === "active" || p.status === "out_of_stock"
    );
    if (activeProducts.length === 0) return { minPrice: 0, maxPrice: 2000000 };
    const prices = activeProducts.map((p) => Number(p.price));
    return {
      minPrice: Math.min(...prices),
      maxPrice: Math.max(...prices),
    };
  }, [allProducts]);

  const availableBrands = useMemo(() => {
    const brandsSet = new Set();
    allProducts.forEach((p) => {
      const brand = p.metadata?.brand;
      if (brand) {
        brandsSet.add(brand);
      }
    });
    return Array.from(brandsSet).sort();
  }, [allProducts]);

  // Lọc sản phẩm ở Client-side theo các tiêu chí bộ lọc
  const filteredProducts = useMemo(() => {
    let result = allProducts.filter(
      (p) => p.status === "active" || p.status === "out_of_stock",
    );

    // 1. Lọc theo danh mục
    if (selectedCategory) {
      result = result.filter((p) => p.category?.slug === selectedCategory);
    }

    // 2. Lọc theo khoảng giá
    if (priceRange) {
      result = result.filter(
        (p) =>
          Number(p.price) >= priceRange[0] && Number(p.price) <= priceRange[1],
      );
    }

    // 3. Lọc theo thương hiệu
    if (selectedBrands.length > 0) {
      result = result.filter((p) => {
        const brand = p.metadata?.brand;
        return selectedBrands.includes(brand);
      });
    }

    // 4. Lọc theo từ khoá tìm kiếm
    if (search.trim()) {
      const query = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(query) ||
          p.description?.toLowerCase().includes(query),
      );
    }

    // 5. Sắp xếp kết quả
    if (sortBy === "price_asc") {
      result.sort((a, b) => Number(a.price) - Number(b.price));
    } else if (sortBy === "price_desc") {
      result.sort((a, b) => Number(b.price) - Number(a.price));
    } else if (sortBy === "rating") {
      result.sort(
        (a, b) => (b.metadata?.rating || 0) - (a.metadata?.rating || 0),
      );
    } else {
      // Mới nhất (newest)
      result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    return result;
  }, [
    allProducts,
    selectedCategory,
    priceRange,
    selectedBrands,
    search,
    sortBy,
  ]);

  const totalPages = Math.ceil(filteredProducts.length / 12);

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * 12;
    return filteredProducts.slice(start, start + 12);
  }, [filteredProducts, currentPage]);

  return (
    <div className="min-h-screen bg-[var(--bg-color)] text-[var(--text-color)] pb-20 animate-fade-in">
      {/* Banner Cửa hàng */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-4 text-center">
        <h1 className="store-gradient-title text-3xl sm:text-4xl font-black tracking-tight mb-2">
          Cửa hàng LoongMilkGym
        </h1>
        <p className="text-sm sm:text-base text-[var(--text-muted)] max-w-xl mx-auto">
          Trang bị thực phẩm bổ sung dinh dưỡng chất lượng và phụ kiện tập luyện
          chuyên nghiệp cho lộ trình của bạn.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        {/* Thanh Tìm kiếm & Công cụ sắp xếp */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] p-3 rounded-xl mb-6 shadow-sm">
          {/* Ô tìm kiếm */}
          <div className="relative flex-1">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]/80 pointer-events-none" />
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm dinh dưỡng, tạ tay, thiết bị..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: "3.25rem" }}
              className="w-full h-10 bg-[var(--bg-color)] border border-[var(--border-color)] text-[var(--text-color)] rounded-lg text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-150"
            />
          </div>

          {/* Sắp xếp & Nút bộ lọc Mobile */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="lg:hidden flex items-center justify-center gap-1.5 h-10 px-4 bg-[var(--bg-color)] border border-[var(--border-color)] rounded-lg text-[var(--text-color)] text-xs font-semibold hover:border-primary active:scale-95 transition-all cursor-pointer whitespace-nowrap"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-primary" />
              <span>Bộ lọc</span>
            </button>

            <div className="relative shrink-0" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center justify-between h-10 px-4 bg-[var(--bg-color)] border border-[var(--border-color)] hover:border-primary text-[var(--text-color)] text-xs font-semibold rounded-lg cursor-pointer min-w-[170px] select-none transition-all"
              >
                <span>{SORT_OPTIONS.find(o => o.value === sortBy)?.label}</span>
                <ChevronDown className={`w-3.5 h-3.5 ml-2 text-[var(--text-muted)] transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-1.5 w-full min-w-[170px] bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg shadow-lg z-50 py-1 animate-fade-in">
                  {SORT_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        setSortBy(option.value);
                        setIsDropdownOpen(false);
                      }}
                      className={`flex items-center w-full text-left px-4 py-2.5 text-xs font-semibold transition-all hover:bg-[var(--border-color)]/25 ${
                        sortBy === option.value
                          ? "text-primary bg-[var(--border-color)]/10 font-bold"
                          : "text-[var(--text-color)]"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bố cục Trang chính (Sidebar + Grid) */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Sidebar Lọc trên Desktop */}
          <div className="hidden lg:block w-64 shrink-0">
            <FilterSidebar
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              priceRange={priceRange}
              setPriceRange={setPriceRange}
              selectedBrands={selectedBrands}
              setSelectedBrands={setSelectedBrands}
              availableBrands={availableBrands}
              minPrice={minPrice}
              maxPrice={maxPrice}
            />
          </div>

          {/* Drawer Lọc trên Mobile */}
          {showMobileFilters && (
            <div className="fixed inset-0 z-[60] lg:hidden">
              <div
                className="fixed inset-0 bg-black/60 backdrop-blur-xs animate-fade-in"
                onClick={() => setShowMobileFilters(false)}
              />
              <div className="fixed top-0 bottom-0 left-0 w-80 max-w-[85vw] bg-[var(--bg-secondary)] border-r border-[var(--border-color)] p-6 overflow-y-auto animate-slide-right z-[70]">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-base font-black text-[var(--text-color)]">
                    Bộ lọc tìm kiếm
                  </span>
                  <button
                    onClick={() => setShowMobileFilters(false)}
                    className="text-xs font-black text-primary border-0 bg-transparent cursor-pointer"
                  >
                    Đóng
                  </button>
                </div>
                <FilterSidebar
                  selectedCategory={selectedCategory}
                  setSelectedCategory={setSelectedCategory}
                  priceRange={priceRange}
                  setPriceRange={setPriceRange}
                  selectedBrands={selectedBrands}
                  setSelectedBrands={setSelectedBrands}
                  availableBrands={availableBrands}
                  minPrice={minPrice}
                  maxPrice={maxPrice}
                />
              </div>
            </div>
          )}

          {/* Grid sản phẩm */}
          <div className="flex-1 w-full">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-4 animate-pulse h-96"
                  >
                    <div className="aspect-square bg-[var(--border-color)] rounded-xl mb-4" />
                    <div className="h-4 bg-[var(--border-color)] rounded w-1/3 mb-2" />
                    <div className="h-6 bg-[var(--border-color)] rounded w-3/4 mb-4" />
                    <div className="h-5 bg-[var(--border-color)] rounded w-1/2 mb-6" />
                    <div className="h-10 bg-[var(--border-color)] rounded-full w-full" />
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-12 bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-color)]">
                <p className="text-sm font-bold text-red-500">
                  Đã xảy ra lỗi khi tải danh sách sản phẩm.
                </p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-20 bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-color)]">
                <p className="text-base font-extrabold text-[var(--text-color)] mb-2">
                  Không tìm thấy sản phẩm nào
                </p>
                <p className="text-xs text-[var(--text-muted)]">
                  Hãy thử điều chỉnh lại bộ lọc hoặc từ khoá tìm kiếm của bạn.
                </p>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
                  {paginatedProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* Pagination Controls */}
                <Pagination
                  page={currentPage}
                  setPage={setCurrentPage}
                  totalPages={totalPages}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Store;
