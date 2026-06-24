import React, { useState } from "react";
import { AlertCircle, Edit, Trash2, Eye, MoreVertical, CheckCircle, FileEdit, AlertTriangle, Archive, RotateCcw } from "lucide-react";
import StatusBadge from "@/components/common/StatusBadge";

export default function ProductsTable({
  products,
  isLoading,
  onOpenDetail,
  onEdit,
  onStatusAction,
  search,
}) {
  const [openDropdownId, setOpenDropdownId] = useState(null);

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

  const getProductTypeClass = (type) => {
    switch (type) {
      case "supplement": return "bg-blue-500/10 text-blue-400 border border-blue-500/20";
      case "accessory": return "bg-purple-500/10 text-purple-400 border border-purple-500/20";
      case "apparel": return "bg-pink-500/10 text-pink-400 border border-pink-500/20";
      default: return "bg-slate-500/10 text-slate-400 border border-slate-500/20";
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
    return new Date(dateStr).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const toggleDropdown = (e, id) => {
    e.stopPropagation();
    setOpenDropdownId(openDropdownId === id ? null : id);
  };

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleOutsideClick = () => setOpenDropdownId(null);
    document.addEventListener("click", handleOutsideClick);
    return () => document.removeEventListener("click", handleOutsideClick);
  }, []);

  return (
    <div className="overflow-x-auto min-h-[300px] text-[var(--text-color)]">
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="border-b border-[var(--border-color)] bg-black/10">
            <th className="p-4 text-[10px] font-black uppercase text-[var(--text-muted)] tracking-wider">Sản phẩm</th>
            <th className="p-4 text-[10px] font-black uppercase text-[var(--text-muted)] tracking-wider">Danh mục</th>
            <th className="p-4 text-[10px] font-black uppercase text-[var(--text-muted)] tracking-wider">Thương hiệu</th>
            <th className="p-4 text-[10px] font-black uppercase text-[var(--text-muted)] tracking-wider">Giá bán</th>
            <th className="p-4 text-[10px] font-black uppercase text-[var(--text-muted)] tracking-wider">Trạng thái</th>
            <th className="p-4 text-[10px] font-black uppercase text-[var(--text-muted)] tracking-wider text-center">Đơn hàng</th>
            <th className="p-4 text-[10px] font-black uppercase text-[var(--text-muted)] tracking-wider">Cập nhật</th>
            <th className="p-4 text-[10px] font-black uppercase text-[var(--text-muted)] tracking-wider text-center">Hành động</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--border-color)]/40">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, idx) => (
              <tr key={idx} className="animate-pulse">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-[var(--border-color)]/60 rounded-xl" />
                    <div className="space-y-1.5 flex-1">
                      <div className="h-4 w-32 bg-[var(--border-color)]/60 rounded" />
                      <div className="h-3 w-16 bg-[var(--border-color)]/40 rounded" />
                    </div>
                  </div>
                </td>
                <td className="p-4"><div className="h-4 w-20 bg-[var(--border-color)]/60 rounded" /></td>
                <td className="p-4"><div className="h-4 w-20 bg-[var(--border-color)]/40 rounded" /></td>
                <td className="p-4"><div className="h-4 w-24 bg-[var(--border-color)]/60 rounded" /></td>
                <td className="p-4"><div className="h-5 w-16 bg-[var(--border-color)]/60 rounded-full" /></td>
                <td className="p-4 text-center"><div className="h-4 w-8 bg-[var(--border-color)]/60 rounded mx-auto" /></td>
                <td className="p-4"><div className="h-4 w-16 bg-[var(--border-color)]/60 rounded" /></td>
                <td className="p-4 text-center"><div className="h-8 w-8 bg-[var(--border-color)]/60 rounded-full mx-auto" /></td>
              </tr>
            ))
          ) : products.length === 0 ? (
            <tr>
              <td colSpan={8} className="p-12 text-center">
                <div className="flex flex-col items-center justify-center gap-3 text-[var(--text-muted)]">
                  <AlertCircle className="w-12 h-12 text-[var(--text-muted)]/60" />
                  <p className="text-xs font-black uppercase tracking-wider">
                    {search ? "Không tìm thấy sản phẩm phù hợp." : "Chưa có sản phẩm nào được tạo."}
                  </p>
                </div>
              </td>
            </tr>
          ) : (
            products.map((product) => {
              const statusInfo = getStatusInfo(product.status);
              const orderCount = product._count?.orderItems || 0;

              return (
                <tr
                  key={product.id}
                  className={`hover:bg-black/10 transition-colors group cursor-pointer ${
                    product.status === "archived" ? "opacity-50 grayscale" : ""
                  }`}
                  onClick={() => onOpenDetail(product.id)}
                >
                  {/* Thumbnail & Title */}
                  <td className="p-4 max-w-[240px]">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-black/20 overflow-hidden border border-[var(--border-color)]/40 flex-shrink-0">
                        <img
                          src={product.thumbnailUrl || "https://images.unsplash.com/photo-1579758629938-03607ccdbaba?q=80&w=400"}
                          alt={product.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className={`text-xs font-extrabold truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors ${
                          product.status === "archived" ? "line-through text-[var(--text-muted)]" : ""
                        }`}>
                          {product.title}
                        </p>
                        <p className="text-[9px] text-[var(--text-muted)] truncate font-mono mt-0.5">
                          {product.slug}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="p-4 text-xs font-extrabold">
                    {product.category?.name || <span className="text-[var(--text-muted)] font-normal italic">Chưa chọn</span>}
                  </td>

                  {/* Brand */}
                  <td className="p-4 text-xs font-extrabold text-[var(--text-muted)]">
                    {product.metadata?.brand || "LoongMilkGym"}
                  </td>

                  {/* Price */}
                  <td className="p-4 text-xs font-black text-emerald-600 dark:text-emerald-400">
                    {formatVND(product.price)}
                  </td>

                  {/* Status */}
                  <td className="p-4">
                    <StatusBadge status={statusInfo.label} type={statusInfo.type} />
                  </td>

                  {/* Orders count */}
                  <td className="p-4 text-center text-xs font-black">
                    {orderCount}
                  </td>

                  {/* Updated At */}
                  <td className="p-4 text-xs text-[var(--text-muted)] font-medium">
                    {formatDate(product.updatedAt)}
                  </td>

                  {/* Actions Menu */}
                  <td className="p-4 text-center relative" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={(e) => toggleDropdown(e, product.id)}
                      className="p-1.5 rounded-xl hover:bg-black/10 text-[var(--text-muted)] hover:text-[var(--text-color)] transition cursor-pointer"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {/* Dropdown Menu */}
                    {openDropdownId === product.id && (
                      <div className="absolute right-4 mt-1 w-44 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)]/60 shadow-2xl z-30 py-2 text-left animate-reactions-in">
                        <button
                          onClick={() => {
                            setOpenDropdownId(null);
                            onOpenDetail(product.id);
                          }}
                          className="w-full px-4 py-2 hover:bg-black/10 flex items-center gap-2 text-xs font-bold text-[var(--text-color)] cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Xem chi tiết
                        </button>
                        <button
                          onClick={() => {
                            setOpenDropdownId(null);
                            onEdit(product);
                          }}
                          className="w-full px-4 py-2 hover:bg-black/10 flex items-center gap-2 text-xs font-bold text-[var(--text-color)] cursor-pointer"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          Chỉnh sửa
                        </button>

                        <div className="border-t border-[var(--border-color)]/40 my-1" />

                        {/* Quick Lifecycle Controls */}
                        {product.status === "draft" && (
                          <>
                            <button
                              onClick={() => {
                                setOpenDropdownId(null);
                                onStatusAction("publish", product);
                              }}
                              className="w-full px-4 py-2 hover:bg-emerald-500/10 flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 cursor-pointer"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                              Xuất bản
                            </button>
                            <button
                              onClick={() => {
                                setOpenDropdownId(null);
                                onStatusAction("out_of_stock", product);
                              }}
                              className="w-full px-4 py-2 hover:bg-orange-500/10 flex items-center gap-2 text-xs font-bold text-orange-500 cursor-pointer"
                            >
                              <AlertTriangle className="w-3.5 h-3.5" />
                              Báo hết hàng
                            </button>
                            <button
                              onClick={() => {
                                setOpenDropdownId(null);
                                onStatusAction("delete", product);
                              }}
                              className="w-full px-4 py-2 hover:bg-rose-500/10 flex items-center gap-2 text-xs font-bold text-rose-500 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              Xóa vĩnh viễn
                            </button>
                          </>
                        )}

                        {product.status === "active" && (
                          <>
                            <button
                              onClick={() => {
                                setOpenDropdownId(null);
                                onStatusAction("out_of_stock", product);
                              }}
                              className="w-full px-4 py-2 hover:bg-orange-500/10 flex items-center gap-2 text-xs font-bold text-orange-500 cursor-pointer"
                            >
                              <AlertTriangle className="w-3.5 h-3.5" />
                              Báo hết hàng
                            </button>
                            <button
                              onClick={() => {
                                setOpenDropdownId(null);
                                onStatusAction("unpublish", product);
                              }}
                              className="w-full px-4 py-2 hover:bg-amber-500/10 flex items-center gap-2 text-xs font-bold text-amber-500 cursor-pointer"
                            >
                              <FileEdit className="w-3.5 h-3.5" />
                              Tạm ẩn (Nháp)
                            </button>
                            <button
                              onClick={() => {
                                setOpenDropdownId(null);
                                onStatusAction("archive", product);
                              }}
                              className="w-full px-4 py-2 hover:bg-neutral-500/15 flex items-center gap-2 text-xs font-bold text-neutral-400 cursor-pointer"
                            >
                              <Archive className="w-3.5 h-3.5" />
                              Lưu trữ
                            </button>
                          </>
                        )}

                        {product.status === "out_of_stock" && (
                          <>
                            <button
                              onClick={() => {
                                setOpenDropdownId(null);
                                onStatusAction("publish", product);
                              }}
                              className="w-full px-4 py-2 hover:bg-emerald-500/10 flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 cursor-pointer"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                              Đăng bán lại
                            </button>
                            <button
                              onClick={() => {
                                setOpenDropdownId(null);
                                onStatusAction("unpublish", product);
                              }}
                              className="w-full px-4 py-2 hover:bg-amber-500/10 flex items-center gap-2 text-xs font-bold text-amber-500 cursor-pointer"
                            >
                              <FileEdit className="w-3.5 h-3.5" />
                              Tạm ẩn (Nháp)
                            </button>
                            <button
                              onClick={() => {
                                setOpenDropdownId(null);
                                onStatusAction("archive", product);
                              }}
                              className="w-full px-4 py-2 hover:bg-neutral-500/15 flex items-center gap-2 text-xs font-bold text-neutral-400 cursor-pointer"
                            >
                              <Archive className="w-3.5 h-3.5" />
                              Lưu trữ
                            </button>
                          </>
                        )}

                        {product.status === "archived" && (
                          <>
                            <button
                              onClick={() => {
                                setOpenDropdownId(null);
                                onStatusAction("restore", product);
                              }}
                              className="w-full px-4 py-2 hover:bg-emerald-500/10 flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 cursor-pointer"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              Khôi phục
                            </button>
                            <button
                              onClick={() => {
                                setOpenDropdownId(null);
                                onStatusAction("delete", product);
                              }}
                              disabled={orderCount > 0}
                              className="w-full px-4 py-2 hover:bg-rose-500/10 flex items-center gap-2 text-xs font-bold text-rose-500 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                              title={orderCount > 0 ? "Không thể xóa sản phẩm đã có đơn hàng" : ""}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              Xóa vĩnh viễn
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
