import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { AlertCircle, CheckCircle2, Trash2, ShoppingBag, ArrowLeft, Ticket, ShieldCheck } from "lucide-react";
import {
  useGetCartQuery,
  useUpdateCartItemMutation,
  useRemoveItemFromCartMutation,
} from "@/services/store/storeApi";
import { useAuth } from "@/hooks/useAuth";

function Cart() {
  const { isLoggedIn } = useAuth();
  const { data: cartData, isLoading } = useGetCartQuery(undefined, { skip: !isLoggedIn });
  const [updateCartItem] = useUpdateCartItemMutation();
  const [removeItem] = useRemoveItemFromCartMutation();

  const [promoCode, setPromoCode] = useState("");
  const [discount, setDiscount] = useState(0); // Số tiền giảm giá
  const [isPromoApplied, setIsPromoApplied] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const toastTimerRef = useRef(null);

  const cart = cartData?.data;
  const items = cart?.items || [];
  const summary = cart?.summary || { totalPrice: 0, totalQuantity: 0 };

  const formatVND = (value) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    })
      .format(value)
      .replace("₫", "đ");
  };

  const showToast = (message, type = "success") => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }

    setToast({ show: true, message, type });
    toastTimerRef.current = setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, 3000);
  };

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  const handleQuantityUpdate = async (item, newQty) => {
    try {
      if (newQty < 1) {
        await removeItem(item.id).unwrap();
        showToast("Đã xoá sản phẩm khỏi giỏ hàng.");
        return;
      }

      await updateCartItem({ id: item.id, quantity: newQty }).unwrap();
    } catch (err) {
      console.error("Lỗi cập nhật số lượng:", err);
      showToast("Không thể cập nhật giỏ hàng lúc này.", "error");
    }
  };

  const handleQuantityInputCommit = (item, rawValue) => {
    const trimmedValue = String(rawValue).trim();
    if (trimmedValue === "") {
      return item.quantity;
    }

    const nextQuantity = Number.parseInt(trimmedValue, 10);
    if (!Number.isFinite(nextQuantity)) {
      showToast("Số lượng không hợp lệ.", "error");
      return item.quantity;
    }

    if (nextQuantity < 0) {
      showToast("Số lượng không được nhỏ hơn 0.", "error");
      return item.quantity;
    }

    handleQuantityUpdate(item, nextQuantity);
    return nextQuantity;
  };

  const handleRemoveItem = async (itemId) => {
    try {
      await removeItem(itemId).unwrap();
      showToast("Đã xoá sản phẩm khỏi giỏ hàng.");
    } catch (err) {
      console.error("Lỗi xóa sản phẩm:", err);
      showToast("Không thể xoá sản phẩm lúc này.", "error");
    }
  };

  const handleApplyPromo = () => {
    if (promoCode.trim().toUpperCase() === "GYMLIFE10") {
      setDiscount(summary.totalPrice * 0.1); // Giảm 10%
      setIsPromoApplied(true);
      showToast("Đã áp dụng mã giảm giá 10%.");
    } else {
      showToast("Mã giảm giá không hợp lệ. Thử mã GYMLIFE10.", "error");
    }
  };

  const handleCheckout = () => {
    showToast("Thanh toán thành công. Tính năng đặt hàng đang được hoàn thiện.");
  };

  const finalTotal = Math.max(0, summary.totalPrice - discount);

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[var(--bg-color)] text-[var(--text-color)] pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-color)] tracking-tight mb-8">
            Giỏ hàng của bạn
          </h1>
          <div className="text-center py-20 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-3xl max-w-xl mx-auto">
            <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <h2 className="text-lg sm:text-xl font-black text-[var(--text-color)] mb-2">
              Bạn chưa đăng nhập
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] mb-6">
              Vui lòng đăng nhập để lưu sản phẩm vào giỏ hàng và tiến hành thanh toán.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-black font-extrabold text-sm rounded-full no-underline hover:bg-primary-hover active:scale-95 transition-all shadow-md shadow-primary/10"
              >
                Đăng nhập ngay
              </Link>
              <Link
                to="/store"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--bg-color)] text-[var(--text-color)] border border-[var(--border-color)] font-extrabold text-sm rounded-full no-underline hover:bg-[var(--bg-secondary)] active:scale-95 transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                Khám phá cửa hàng
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--bg-color)] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-[var(--border-color)] rounded w-1/4 mb-10" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 flex flex-col gap-4">
                {[1, 2].map((i) => (
                  <div key={i} className="h-28 bg-[var(--border-color)] rounded-2xl" />
                ))}
              </div>
              <div className="h-80 bg-[var(--border-color)] rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-color)] text-[var(--text-color)] pb-20">
      {toast.show && (
        <div className={`fixed left-1/2 top-[72px] -translate-x-1/2 z-[999999] flex max-w-[calc(100vw-2rem)] items-center gap-2 rounded-2xl border px-4 py-2.5 shadow-lg backdrop-blur-sm animate-slide-down ${
          toast.type === "error"
            ? "border-red-300/30 bg-rose-500/10 text-rose-500 dark:text-rose-400 dark:bg-rose-950/20"
            : "border-primary/30 bg-[var(--bg-secondary)] text-[var(--text-color)]"
        }`}>
          {toast.type === "error" ? (
            <AlertCircle className="w-4 h-4 shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-primary" />
          )}
          <span className="text-xs font-bold leading-none">{toast.message}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-color)] tracking-tight mb-8">
          Giỏ hàng của bạn
        </h1>

        {items.length === 0 ? (
          <div className="text-center py-20 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-3xl max-w-xl mx-auto">
            <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <h2 className="text-lg sm:text-xl font-black text-[var(--text-color)] mb-2">
              Giỏ hàng đang trống
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] mb-6">
              Bạn chưa thêm sản phẩm nào vào giỏ hàng. Hãy khám phá cửa hàng của chúng tôi.
            </p>
            <Link
              to="/store"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-black font-extrabold text-sm rounded-full no-underline hover:bg-primary-hover active:scale-95 transition-all shadow-md shadow-primary/10"
            >
              <ArrowLeft className="w-4 h-4" />
              Tiếp tục mua sắm
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Danh sách sản phẩm (Bên trái) */}
            <div className="lg:col-span-2 flex flex-col gap-4">
              {items.map((item) => {
                const product = item.product || {};
                const metadata = product.metadata || {};
                // Mock các thuộc tính variant để hiển thị đẹp
                const flavor = metadata.flavors?.[0] || "Mặc định";
                const size = metadata.sizes?.[0] || "Tiêu chuẩn";

                return (
                  <div
                    key={item.id}
                    className="flex gap-4 p-4 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl relative"
                  >
                    {/* Ảnh sản phẩm */}
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-neutral-100/60 dark:bg-neutral-900/30 flex items-center justify-center shrink-0 overflow-hidden border border-[var(--border-color)]">
                      <img
                        src={product.thumbnailUrl || "https://images.unsplash.com/photo-1579758629938-03607ccdbaba?q=80&w=200"}
                        alt={product.title}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Chi tiết sản phẩm */}
                    <div className="flex-1 flex flex-col min-w-0 pr-8">
                      <h3 className="text-sm sm:text-base font-extrabold text-[var(--text-color)] truncate mb-1">
                        <Link
                          to={`/store/${product.slug}`}
                          className="no-underline text-[var(--text-color)] hover:text-primary transition-colors"
                        >
                          {product.title}
                        </Link>
                      </h3>
                      <p className="text-xs text-[var(--text-muted)] font-bold mb-3 flex flex-wrap gap-x-3 gap-y-1">
                        <span>Hương vị: {flavor}</span>
                        <span>Phân loại: {size}</span>
                      </p>

                      <div className="flex items-center justify-between mt-auto">
                        {/* Giá tiền */}
                        <span className="text-sm sm:text-base font-black text-primary">
                          {formatVND(Number(item.unitPrice))}
                        </span>

                        {/* Bộ chọn số lượng */}
                        <div className="flex items-center bg-[var(--bg-color)] border border-[var(--border-color)] rounded-lg p-0.5">
                          <button
                            onClick={() => handleQuantityUpdate(item, item.quantity - 1)}
                            className="w-7 h-7 flex items-center justify-center text-sm font-bold border-0 bg-transparent text-[var(--text-color)] hover:text-primary cursor-pointer"
                          >
                            −
                          </button>
                          <input
                            key={`${item.id}-${item.quantity}`}
                            type="number"
                            min="0"
                            inputMode="numeric"
                            defaultValue={item.quantity}
                            onChange={(e) => {
                              const typedQuantity = Number.parseInt(e.target.value, 10);
                              if (Number.isFinite(typedQuantity) && typedQuantity < 0) {
                                showToast("Số lượng không được nhỏ hơn 0.", "error");
                                e.target.value = item.quantity;
                              }
                            }}
                            onBlur={(e) => {
                              const committedQuantity = handleQuantityInputCommit(item, e.target.value);
                              if (committedQuantity !== undefined) {
                                e.target.value = committedQuantity;
                              }
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.currentTarget.blur();
                              }
                            }}
                            aria-label={`Số lượng ${product.title}`}
                            className="w-12 h-7 bg-transparent text-center font-extrabold text-xs sm:text-sm text-[var(--text-color)] border-0 outline-none focus:bg-[var(--bg-secondary)] rounded-md [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                          <button
                            onClick={() => handleQuantityUpdate(item, item.quantity + 1)}
                            className="w-7 h-7 flex items-center justify-center text-sm font-bold border-0 bg-transparent text-[var(--text-color)] hover:text-primary cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Nút xóa sản phẩm */}
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="absolute top-4 right-4 text-[var(--text-muted)] hover:text-red-500 bg-transparent border-0 cursor-pointer p-1 transition-colors"
                      aria-label="Xóa sản phẩm"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}

              <Link
                to="/store"
                className="inline-flex items-center gap-2 text-xs sm:text-sm font-extrabold text-primary no-underline hover:underline mt-2 self-start"
              >
                <ArrowLeft className="w-4 h-4" />
                Tiếp tục mua thêm sản phẩm khác
              </Link>
            </div>

            {/* Bảng tính hóa đơn & Summary (Bên phải) */}
            <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-3xl p-6 flex flex-col gap-6">
              <h2 className="text-base sm:text-lg font-black text-[var(--text-color)] m-0 pb-3 border-b border-[var(--border-color)]">
                Tóm tắt đơn hàng
              </h2>

              {/* Chi tiết giá tiền */}
              <div className="flex flex-col gap-3 text-xs sm:text-sm font-bold text-[var(--text-muted)]">
                <div className="flex justify-between">
                  <span>Tạm tính ({summary.totalQuantity} món)</span>
                  <span className="text-[var(--text-color)] font-extrabold">
                    {formatVND(summary.totalPrice)}
                  </span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-red-500">
                    <span>Giảm giá</span>
                    <span>-{formatVND(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Phí giao hàng</span>
                  <span className="text-emerald-500 font-extrabold">Miễn phí</span>
                </div>
                <div className="flex justify-between">
                  <span>Thuế VAT</span>
                  <span>Đã bao gồm</span>
                </div>
              </div>

              {/* Nhập mã giảm giá */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Ticket className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                  <input
                    type="text"
                    placeholder="Mã giảm giá"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl bg-[var(--bg-color)] border border-[var(--border-color)] text-[var(--text-color)] focus:outline-none focus:border-primary"
                  />
                </div>
                <button
                  onClick={handleApplyPromo}
                  className="px-4 py-2 bg-[var(--bg-color)] hover:bg-primary hover:text-black border border-[var(--border-color)] rounded-xl font-bold text-xs sm:text-sm text-[var(--text-color)] transition-all cursor-pointer"
                >
                  Áp dụng
                </button>
              </div>
              {isPromoApplied && (
                <p className="text-[10px] font-black text-emerald-500 m-0">
                  Đã áp dụng mã giảm giá 10%.
                </p>
              )}

              {/* Tổng cộng */}
              <div className="flex justify-between items-baseline pt-4 border-t border-[var(--border-color)]">
                <span className="text-sm sm:text-base font-black text-[var(--text-color)]">
                  Tổng thanh toán
                </span>
                <span className="text-lg sm:text-xl font-black text-primary">
                  {formatVND(finalTotal)}
                </span>
              </div>

              {/* Nút thanh toán */}
              <button
                onClick={handleCheckout}
                className="w-full py-3 bg-primary text-black font-extrabold text-sm sm:text-base rounded-full border border-primary hover:bg-primary-hover active:scale-98 transition-all cursor-pointer shadow-md shadow-primary/10"
              >
                Tiến hành thanh toán
              </button>

              <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-[var(--text-muted)] mt-1">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                Mọi thông tin giao dịch được bảo mật tuyệt đối.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Cart;
