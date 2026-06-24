import React, { useState, useEffect } from "react";
import { X, Calendar, DollarSign, Tag, Info, ShoppingCart, Award, Layers, Edit } from "lucide-react";
import { useGetProductDetailQuery } from "@/services/admin/adminApi";
import StatusBadge from "@/components/common/StatusBadge";
import PhotoZoomModal from "@/components/common/PhotoZoomModal";

export default function ProductDetailDrawer({
  productId,
  isOpen,
  onClose,
  onEdit,
  onStatusAction,
}) {
  const [activePreviewUrl, setActivePreviewUrl] = useState(null);
  const [isZoomOpen, setIsZoomOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setActivePreviewUrl(null);
      setIsZoomOpen(false);
    }
  }, [isOpen, productId]);

  const { data: response, isLoading, isError } = useGetProductDetailQuery(productId, {
    skip: !productId || !isOpen,
  });

  if (!isOpen) return null;

  const product = response?.data || null;

  const formatVND = (value) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    })
      .format(value)
      .replace("₫", "đ");
  };

  const getProductTypeLabel = (type) => {
    switch (type) {
      case "supplement": return "Dinh dưỡng";
      case "accessory": return "Phụ kiện";
      case "apparel": return "Trang phục";
      default: return type;
    }
  };

  const getStatusInfo = (status) => {
    switch (status) {
      case "active":
        return { label: "Đang bán", type: "success" };
      case "draft":
        return { label: "Bản nháp", type: "warning" };
      case "out_of_stock":
        return { label: "Hết hàng", type: "error" };
      case "archived":
        return { label: "Đã lưu trữ", type: "neutral" };
      default:
        return { label: status, type: "neutral" };
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const extraImages = (product?.assets || [])
    .filter(asset => asset.fileUrl && (asset.assetType === "image" || asset.fileUrl.match(/\.(jpeg|jpg|gif|png|webp)/i)))
    .map(asset => ({ mediaUrl: asset.fileUrl }));

  const allImages = product?.thumbnailUrl 
    ? [{ mediaUrl: product.thumbnailUrl }, ...extraImages]
    : extraImages;

  const mainImageUrl = activePreviewUrl || product?.thumbnailUrl || "https://images.unsplash.com/photo-1579758629938-03607ccdbaba?q=80&w=400";

  return (
    <div className="fixed inset-0 z-40 overflow-hidden text-[var(--text-color)]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-lg bg-[var(--bg-secondary)] border-l border-[var(--border-color)]/60 flex flex-col shadow-2xl relative animate-slide-in">
          {/* Header */}
          <div className="px-6 py-4 border-b border-[var(--border-color)]/60 flex items-center justify-between bg-black/10">
            <div>
              <h2 className="text-sm font-black uppercase tracking-wider">Chi tiết sản phẩm</h2>
              <p className="text-[10px] text-[var(--text-muted)] font-medium">Xem thông tin và thay đổi trạng thái sản phẩm</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-black/10 transition cursor-pointer text-[var(--text-muted)] hover:text-[var(--text-color)]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {isLoading ? (
              <div className="space-y-6 animate-pulse">
                <div className="w-full aspect-video bg-[var(--border-color)]/60 rounded-2xl" />
                <div className="h-6 w-3/4 bg-[var(--border-color)]/60 rounded" />
                <div className="h-4 w-1/4 bg-[var(--border-color)]/60 rounded" />
                <div className="space-y-3 pt-4">
                  <div className="h-4 w-full bg-[var(--border-color)]/40 rounded" />
                  <div className="h-4 w-full bg-[var(--border-color)]/40 rounded" />
                  <div className="h-4 w-5/6 bg-[var(--border-color)]/40 rounded" />
                </div>
              </div>
            ) : isError || !product ? (
              <div className="text-center py-12 space-y-3">
                <Info className="w-12 h-12 mx-auto text-rose-500" />
                <p className="text-xs font-black uppercase tracking-wider text-rose-400">Không thể tải thông tin sản phẩm.</p>
              </div>
            ) : (
              <>
                {/* Thumbnail Display */}
                <div className="space-y-3">
                  <div 
                    onClick={() => setIsZoomOpen(true)}
                    className="relative w-full h-72 rounded-2xl bg-black/20 border border-[var(--border-color)]/40 flex items-center justify-center overflow-hidden cursor-zoom-in hover:border-[var(--color-primary)]/40 transition-colors"
                  >
                    <img
                      src={mainImageUrl}
                      alt={product.title}
                      className="max-w-full max-h-full object-contain"
                    />
                    <div className="absolute top-3 right-3">
                      <StatusBadge
                        status={getStatusInfo(product.status).label}
                        type={getStatusInfo(product.status).type}
                      />
                    </div>
                  </div>

                  {/* Sub-images row */}
                  {allImages.length > 1 && (
                    <div className="flex flex-wrap gap-2 overflow-x-auto no-scrollbar py-0.5">
                      {allImages.map((img, idx) => {
                        const isSelected = img.mediaUrl === mainImageUrl;
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setActivePreviewUrl(img.mediaUrl)}
                            className={`w-14 h-14 rounded-xl overflow-hidden border-2 bg-black/10 transition-all cursor-pointer ${
                              isSelected 
                                ? "border-[var(--color-primary)] scale-95 shadow-md shadow-[#ccff00]/10" 
                                : "border-[var(--border-color)]/60 hover:border-[var(--text-color)]/40"
                            }`}
                          >
                            <img src={img.mediaUrl} alt={`Sub asset ${idx}`} className="w-full h-full object-cover" />
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Title and slug */}
                <div className="space-y-1">
                  <h1 className="text-lg font-black tracking-tight leading-snug">{product.title}</h1>
                  <p className="text-[10px] text-[var(--text-muted)] font-mono">
                    store/{product.slug}
                  </p>
                </div>

                {/* Grid attributes */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 rounded-xl bg-black/10 border border-[var(--border-color)]/40 space-y-1">
                    <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-[var(--text-muted)]">
                      <Layers className="w-3.5 h-3.5" />
                      <span>Danh mục</span>
                    </div>
                    <p className="text-xs font-black">{product.category?.name || "Chưa phân loại"}</p>
                  </div>

                  <div className="p-3 rounded-xl bg-black/10 border border-[var(--border-color)]/40 space-y-1">
                    <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-[var(--text-muted)]">
                      <Award className="w-3.5 h-3.5" />
                      <span>Thương hiệu</span>
                    </div>
                    <p className="text-xs font-black">{product.metadata?.brand || "Không có"}</p>
                  </div>

                  <div className="p-3 rounded-xl bg-black/10 border border-[var(--border-color)]/40 space-y-1 col-span-2">
                    <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-[var(--text-muted)]">
                      <ShoppingCart className="w-3.5 h-3.5" />
                      <span>Đơn hàng đã mua</span>
                    </div>
                    <p className="text-xs font-black">{product._count?.orderItems || 0} đơn hàng</p>
                  </div>
                </div>

                {/* Price Display */}
                <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 flex justify-between items-center">
                  <div className="space-y-0.5">
                    <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 tracking-wider">Giá bán hiện tại</span>
                    <p className="text-lg font-black text-emerald-600 dark:text-emerald-400">{formatVND(product.price)}</p>
                  </div>
                  {product.metadata?.originalPrice && (
                    <div className="text-right space-y-0.5">
                      <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider">Giá gốc</span>
                      <p className="text-xs text-[var(--text-muted)] line-through">
                        {formatVND(product.metadata.originalPrice)}
                      </p>
                    </div>
                  )}
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <h3 className="text-xs font-black uppercase text-[var(--text-muted)] tracking-wider flex items-center gap-1">
                    <Info className="w-3.5 h-3.5" />
                    Mô tả sản phẩm
                  </h3>
                  <div className="text-xs text-[var(--text-color)] bg-black/10 border border-[var(--border-color)]/40 p-4 rounded-xl leading-relaxed whitespace-pre-wrap">
                    {product.description || "Không có mô tả cho sản phẩm này."}
                  </div>
                </div>

                {/* Dates */}
                <div className="space-y-2 pt-2 border-t border-[var(--border-color)]/40">
                  <div className="flex items-center justify-between text-[10px] text-[var(--text-muted)]">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> Ngày tạo:
                    </span>
                    <span className="font-bold">{formatDate(product.createdAt)}</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-[var(--text-muted)]">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> Cập nhật cuối:
                    </span>
                    <span className="font-bold">{formatDate(product.updatedAt)}</span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Footer Actions */}
          {product && (
            <div className="p-4 border-t border-[var(--border-color)]/60 bg-black/10 flex gap-2">
              <button
                onClick={() => onEdit(product)}
                className="flex-1 py-2.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 text-xs font-black uppercase tracking-wider transition duration-200 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Edit className="w-3.5 h-3.5" />
                Chỉnh sửa
              </button>

              {/* Lifecycle Actions */}
              {product.status === "draft" && (
                <>
                  <button
                    onClick={() => onStatusAction("publish", product)}
                    className="flex-1 py-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 font-black text-xs uppercase tracking-wider transition duration-200 cursor-pointer"
                  >
                    Xuất bản
                  </button>
                  <button
                    onClick={() => onStatusAction("delete", product)}
                    className="py-2.5 px-4 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 border border-rose-500/25 transition duration-200 cursor-pointer text-xs font-black uppercase tracking-wider"
                  >
                    Xóa
                  </button>
                </>
              )}

              {product.status === "active" && (
                <>
                  <button
                    onClick={() => onStatusAction("out_of_stock", product)}
                    className="flex-1 py-2.5 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/20 font-black text-xs uppercase tracking-wider transition duration-200 cursor-pointer"
                  >
                    Hết hàng
                  </button>
                  <button
                    onClick={() => onStatusAction("unpublish", product)}
                    className="flex-1 py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 font-black text-xs uppercase tracking-wider transition duration-200 cursor-pointer"
                  >
                    Tạm ẩn
                  </button>
                  <button
                    onClick={() => onStatusAction("archive", product)}
                    className="py-2.5 px-4 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/20 transition duration-200 cursor-pointer text-xs font-black uppercase tracking-wider"
                  >
                    Lưu trữ
                  </button>
                </>
              )}

              {product.status === "out_of_stock" && (
                <>
                  <button
                    onClick={() => onStatusAction("publish", product)}
                    className="flex-1 py-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 font-black text-xs uppercase tracking-wider transition duration-200 cursor-pointer"
                  >
                    Đăng bán lại
                  </button>
                  <button
                    onClick={() => onStatusAction("unpublish", product)}
                    className="flex-1 py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 font-black text-xs uppercase tracking-wider transition duration-200 cursor-pointer"
                  >
                    Tạm ẩn
                  </button>
                  <button
                    onClick={() => onStatusAction("archive", product)}
                    className="py-2.5 px-4 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/20 transition duration-200 cursor-pointer text-xs font-black uppercase tracking-wider"
                  >
                    Lưu trữ
                  </button>
                </>
              )}

              {product.status === "archived" && (
                <>
                  <button
                    onClick={() => onStatusAction("restore", product)}
                    className="flex-1 py-2.5 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 border border-teal-500/20 font-black text-xs uppercase tracking-wider transition duration-200 cursor-pointer"
                  >
                    Khôi phục
                  </button>
                  <button
                    onClick={() => onStatusAction("delete", product)}
                    disabled={product._count?.orderItems > 0}
                    className="flex-1 py-2.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 border border-rose-500/25 font-black text-xs uppercase tracking-wider transition duration-200 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                    title={product._count?.orderItems > 0 ? "Không thể xóa sản phẩm đã có đơn hàng" : ""}
                  >
                    Xóa vĩnh viễn
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {isZoomOpen && allImages.length > 0 && (
        <PhotoZoomModal
          media={allImages}
          initialIndex={allImages.findIndex(img => img.mediaUrl === mainImageUrl) >= 0 ? allImages.findIndex(img => img.mediaUrl === mainImageUrl) : 0}
          onClose={() => setIsZoomOpen(false)}
        />
      )}
    </div>
  );
}
