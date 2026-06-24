import { Link, useNavigate } from "react-router-dom";
import { Star, ShoppingCart } from "lucide-react";
import { useAddToCartMutation } from "@/services/store/storeApi";
import { useRequireAuth } from "@/hooks/useRequireAuth";

function ProductCard({ product }) {
  const navigate = useNavigate();
  const [addToCart, { isLoading }] = useAddToCartMutation();
  const { requireAuth } = useRequireAuth();

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!requireAuth()) return;
    try {
      await addToCart({ productId: product.id, quantity: 1 }).unwrap();
    } catch (err) {
      console.error("Lỗi thêm vào giỏ hàng:", err);
    }
  };

  const handleBuyNow = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!requireAuth()) return;
    try {
      await addToCart({ productId: product.id, quantity: 1 }).unwrap();
      navigate("/cart");
    } catch (err) {
      console.error("Lỗi mua ngay:", err);
    }
  };

  // Định dạng giá VNĐ
  const formatVND = (value) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    })
      .format(value)
      .replace("₫", "đ");
  };

  const metadata = product.metadata || {};
  const rating = metadata.rating || 5.0;

  return (
    <Link
      to={`/store/${product.slug}`}
      className="group flex flex-col bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-4 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 no-underline"
    >
      {/* Container ảnh sản phẩm */}
      <div className="relative aspect-square w-full rounded-xl bg-neutral-100/60 dark:bg-neutral-900/30 flex items-center justify-center overflow-hidden mb-4 border border-[var(--border-color)]">
        <img
          src={product.thumbnailUrl || "https://images.unsplash.com/photo-1579758629938-03607ccdbaba?q=80&w=400"}
          alt={product.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {product.status === "out_of_stock" && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px] flex items-center justify-center transition-all duration-300">
            <span className="bg-rose-500 text-white text-xs font-black uppercase tracking-widest px-3.5 py-1.5 rounded-full shadow-lg border border-rose-400/20">
              Hết hàng
            </span>
          </div>
        )}
      </div>

      {/* Thông tin sản phẩm */}
      <div className="flex-1 flex flex-col">
        {/* Thương hiệu & Đánh giá */}
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] uppercase tracking-wider font-extrabold text-[var(--text-muted)]">
            {metadata.brand || "LoongMilkGym"}
          </span>
          <div className="flex items-center gap-1">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            <span className="text-xs font-bold text-[var(--text-color)]">{rating}</span>
          </div>
        </div>

        {/* Tiêu đề */}
        <h3 className="text-sm sm:text-base font-extrabold text-[var(--text-color)] line-clamp-2 mb-2 leading-snug group-hover:text-primary transition-colors min-h-[2.5rem]">
          {product.title}
        </h3>

        {/* Giá cả */}
        <div className="mt-auto mb-4 flex items-baseline gap-2">
          <span className="text-base sm:text-lg font-black text-primary">
            {formatVND(Number(product.price))}
          </span>
          {metadata.originalPrice && (
            <span className="text-xs text-[var(--text-muted)] line-through">
              {formatVND(Number(metadata.originalPrice))}
            </span>
          )}
        </div>

        {/* Nút hành động */}
        <div className="grid grid-cols-2 gap-2">
          {product.status === "out_of_stock" ? (
            <button
              disabled
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
              className="col-span-2 py-2 px-1 bg-neutral-500/10 text-neutral-400 border border-neutral-500/20 font-extrabold text-xs sm:text-sm rounded-full flex items-center justify-center cursor-not-allowed"
            >
              Hết hàng
            </button>
          ) : (
            <>
              <button
                onClick={handleBuyNow}
                disabled={isLoading}
                className="py-2 px-1 bg-primary text-black font-extrabold text-xs sm:text-sm rounded-full flex items-center justify-center border border-primary hover:bg-primary-hover active:scale-95 transition-all duration-200 cursor-pointer shadow-md shadow-primary/10"
              >
                Mua ngay
              </button>
              <button
                onClick={handleAddToCart}
                disabled={isLoading}
                className="py-2 px-1 bg-[var(--bg-color)] text-[var(--text-color)] font-extrabold text-xs sm:text-sm rounded-full flex items-center justify-center gap-1 border border-[var(--border-color)] hover:bg-primary hover:text-black hover:border-primary active:scale-95 transition-all duration-200 cursor-pointer"
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                {isLoading ? "..." : "Thêm giỏ"}
              </button>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}

export default ProductCard;
