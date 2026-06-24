import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Star, Heart, ShoppingCart, ShieldCheck, CheckCircle, XCircle } from "lucide-react";
import { useAddToCartMutation } from "@/services/store/storeApi";
import { useRequireAuth } from "@/hooks/useRequireAuth";

function ProductInfo({ product }) {
  const navigate = useNavigate();
  const [addToCart, { isLoading }] = useAddToCartMutation();
  const { requireAuth } = useRequireAuth();
  
  const metadata = product?.metadata || {};
  const rating = metadata.rating || 5.0;
  const reviewsCount = metadata.reviewsCount || 0;
  const flavors = metadata.flavors || [];
  const sizes = metadata.sizes || [];
  const keyStats = metadata.keyStats || [];

  const [selectedFlavor, setSelectedFlavor] = useState(flavors[0] || "");
  const [selectedSize, setSelectedSize] = useState(sizes[0] || "");
  const [quantity, setQuantity] = useState(1);
  const [isLiked, setIsLiked] = useState(false);

  const formatVND = (value) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    })
      .format(value)
      .replace("₫", "đ");
  };

  const handleQuantityChange = (type) => {
    if (type === "dec" && quantity > 1) {
      setQuantity(quantity - 1);
    } else if (type === "inc") {
      setQuantity(quantity + 1);
    }
  };

  const handleAddToCart = async () => {
    if (!requireAuth()) return;
    try {
      await addToCart({
        productId: product.id,
        quantity,
      }).unwrap();
      // Thêm thành công có thể hiển thị thông báo phản hồi
    } catch (err) {
      console.error("Lỗi khi thêm vào giỏ:", err);
    }
  };

  const handleBuyNow = async () => {
    if (!requireAuth()) return;
    try {
      await addToCart({
        productId: product.id,
        quantity,
      }).unwrap();
      navigate("/cart");
    } catch (err) {
      console.error("Lỗi mua ngay:", err);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Category Breadcrumb */}
      <div className="text-xs font-bold text-[var(--text-muted)] tracking-wider uppercase">
        {product?.category?.name || "Cửa hàng"} / {product?.productType === "supplement" ? "Dinh dưỡng" : "Thể thao"}
      </div>

      {/* Tiêu đề & Đánh giá */}
      <div>
        <h1 className="text-2xl sm:text-4xl font-black text-[var(--text-color)] tracking-tight leading-tight mb-3">
          {product?.title}
        </h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 bg-amber-400/10 px-2 py-1 rounded-lg">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span className="text-sm font-black text-amber-500">{rating}</span>
          </div>
          <span className="text-xs font-bold text-[var(--text-muted)] hover:underline cursor-pointer">
            ({reviewsCount} đánh giá từ hội viên)
          </span>
        </div>
      </div>

      {/* Giá cả & Trạng thái tồn kho */}
      <div className="flex items-center gap-4 border-b border-[var(--border-color)] pb-5">
        <div className="flex items-baseline gap-3">
          <span className="text-2xl sm:text-3xl font-black text-primary">
            {formatVND(Number(product?.price))}
          </span>
          {metadata.originalPrice && (
            <span className="text-sm sm:text-base text-[var(--text-muted)] line-through">
              {formatVND(Number(metadata.originalPrice))}
            </span>
          )}
        </div>
        {product?.status === "out_of_stock" ? (
          <span className="px-3 py-1 rounded-full text-[10px] font-black tracking-wider uppercase bg-rose-500/10 text-rose-500 border border-rose-500/20 flex items-center gap-1">
            <XCircle className="w-3 h-3" />
            Hết hàng
          </span>
        ) : (
          <span className="px-3 py-1 rounded-full text-[10px] font-black tracking-wider uppercase bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            Còn hàng
          </span>
        )}
      </div>

      {/* Mô tả */}
      <p className="text-sm text-[var(--text-muted)] leading-relaxed m-0">
        {product?.description || "Sản phẩm chất lượng cao chính hãng phục vụ cho nhu cầu rèn luyện hình thể vượt trội."}
      </p>

      {/* Key Stats (ví dụ: Protein, BCAAs, Gluten-Free) */}
      {keyStats.length > 0 && (
        <div className="flex flex-wrap gap-x-6 gap-y-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-4 justify-start">
          {keyStats.map((stat, idx) => (
            <div key={idx} className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-[var(--text-muted)]">
                {stat.label}:
              </span>
              <span className="text-sm font-black text-[var(--text-color)]">
                {stat.value}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Chọn Hương vị */}
      {flavors.length > 0 && (
        <div>
          <span className="block text-xs font-black uppercase tracking-wider text-[var(--text-color)] mb-3">
            Chọn Hương vị / Màu sắc
          </span>
          <div className="flex flex-wrap gap-2.5">
            {flavors.map((flavor) => (
              <button
                key={flavor}
                onClick={() => setSelectedFlavor(flavor)}
                className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-xl border transition-all duration-200 cursor-pointer ${
                  selectedFlavor === flavor
                    ? "bg-[var(--bg-color)] border-primary text-primary shadow-sm shadow-primary/5"
                    : "bg-[var(--bg-secondary)] border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-color)]"
                }`}
              >
                {flavor}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Chọn Kích thước / Trọng lượng */}
      {sizes.length > 0 && (
        <div>
          <span className="block text-xs font-black uppercase tracking-wider text-[var(--text-color)] mb-3">
            Chọn Phân loại / Kích thước
          </span>
          <div className="flex flex-wrap gap-2.5">
            {sizes.map((size) => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-xl border transition-all duration-200 cursor-pointer ${
                  selectedSize === size
                    ? "bg-[var(--bg-color)] border-primary text-primary shadow-sm shadow-primary/5"
                    : "bg-[var(--bg-secondary)] border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-color)]"
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Điều chỉnh số lượng & Nút thao tác */}
      <div className="border-t border-[var(--border-color)] pt-6 flex flex-col gap-4">
        <div className="flex items-center gap-4">
          {/* Bộ chọn số lượng */}
          <div className="flex items-center bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl p-1">
            <button
              onClick={() => handleQuantityChange("dec")}
              disabled={product?.status === "out_of_stock"}
              className="w-8 h-8 flex items-center justify-center text-lg font-bold border-0 bg-transparent text-[var(--text-color)] hover:text-primary transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
            >
              −
            </button>
            <span className="w-10 text-center font-extrabold text-sm sm:text-base">
              {product?.status === "out_of_stock" ? 0 : quantity}
            </span>
            <button
              onClick={() => handleQuantityChange("inc")}
              disabled={product?.status === "out_of_stock"}
              className="w-8 h-8 flex items-center justify-center text-lg font-bold border-0 bg-transparent text-[var(--text-color)] hover:text-primary transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
            >
              +
            </button>
          </div>

          {/* Nút yêu thích */}
          <button
            onClick={() => setIsLiked(!isLiked)}
            className={`w-11 h-11 flex items-center justify-center rounded-xl border transition-colors cursor-pointer ${
              isLiked
                ? "bg-red-500/10 border-red-500/20 text-red-500"
                : "bg-[var(--bg-secondary)] border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-color)]"
            }`}
            aria-label="Thêm vào danh sách yêu thích"
          >
            <Heart className={`w-5 h-5 ${isLiked ? "fill-red-500" : ""}`} />
          </button>
        </div>

        {/* Nút Thêm vào giỏ & Mua ngay */}
        <div className="flex flex-col sm:flex-row gap-3 mt-2">
          {product?.status === "out_of_stock" ? (
            <button
              disabled
              className="flex-1 py-3 px-6 bg-neutral-500/10 text-neutral-400 border border-neutral-500/20 font-extrabold text-sm sm:text-base rounded-xl flex items-center justify-center gap-2 cursor-not-allowed"
            >
              Hết hàng
            </button>
          ) : (
            <>
              <button
                onClick={handleAddToCart}
                disabled={isLoading}
                className="flex-1 py-3 px-6 bg-primary text-black font-extrabold text-sm sm:text-base rounded-xl flex items-center justify-center gap-2 border border-primary hover:bg-primary-hover transition-all duration-200 cursor-pointer shadow-md shadow-primary/10 active:scale-98"
              >
                <ShoppingCart className="w-5 h-5" />
                {isLoading ? "Đang xử lý..." : "Thêm vào giỏ hàng"}
              </button>
              <button
                onClick={handleBuyNow}
                className="flex-1 py-3 px-6 bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 hover:opacity-90 font-extrabold text-sm sm:text-base rounded-xl border border-transparent transition-all cursor-pointer active:scale-98"
              >
                Mua ngay
              </button>
            </>
          )}
        </div>
      </div>

      {/* Cam kết của shop */}
      <div className="border-t border-[var(--border-color)] pt-5 flex items-center gap-3 text-xs font-bold text-[var(--text-muted)]">
        <ShieldCheck className="w-5 h-5 text-emerald-500" />
        Cam kết sản phẩm chính hãng 100% - Hoàn tiền nếu phát hiện hàng giả
      </div>
    </div>
  );
}

export default ProductInfo;
