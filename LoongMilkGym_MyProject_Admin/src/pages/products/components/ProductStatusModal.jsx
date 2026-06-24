import React from "react";
import { AlertTriangle, CheckCircle, HelpCircle, Trash2, Archive, RotateCcw } from "lucide-react";

export default function ProductStatusModal({
  isOpen,
  onClose,
  onConfirm,
  actionType,
  productName,
  isLoading,
}) {
  if (!isOpen) return null;

  const config = {
    publish: {
      title: "Xuất bản sản phẩm?",
      description: `Sản phẩm "${productName}" sẽ được công khai và hiển thị trong cửa hàng. Khách hàng có thể tìm kiếm và mua sản phẩm này.`,
      confirmText: "Xuất bản",
      confirmClass: "bg-emerald-500 hover:bg-emerald-600 text-black font-extrabold shadow-md shadow-emerald-500/10",
      icon: CheckCircle,
      iconClass: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
    },
    unpublish: {
      title: "Chuyển về bản nháp?",
      description: `Sản phẩm "${productName}" sẽ bị ẩn khỏi cửa hàng. Khách hàng sẽ không thể nhìn thấy hoặc mua sản phẩm này nữa.`,
      confirmText: "Đưa về nháp",
      confirmClass: "bg-amber-500 hover:bg-amber-600 text-black font-extrabold shadow-md shadow-amber-500/10",
      icon: AlertTriangle,
      iconClass: "text-amber-500 bg-amber-500/10 border-amber-500/20",
    },
    out_of_stock: {
      title: "Đánh dấu hết hàng?",
      description: `Sản phẩm "${productName}" sẽ được chuyển sang trạng thái Hết hàng và tạm ẩn khỏi cửa hàng.`,
      confirmText: "Đánh dấu hết hàng",
      confirmClass: "bg-orange-500 hover:bg-orange-600 text-black font-extrabold shadow-md shadow-orange-500/10",
      icon: AlertTriangle,
      iconClass: "text-orange-500 bg-orange-500/10 border-orange-500/20",
    },
    archive: {
      title: "Lưu trữ sản phẩm?",
      description: `Sản phẩm "${productName}" sẽ được lưu trữ. Sản phẩm này sẽ không hiển thị trên cửa hàng, nhưng dữ liệu và lịch sử đơn hàng của nó vẫn được bảo toàn.`,
      confirmText: "Lưu trữ",
      confirmClass: "bg-neutral-500 hover:bg-neutral-600 text-white font-extrabold shadow-md shadow-neutral-500/10",
      icon: Archive,
      iconClass: "text-neutral-500 bg-neutral-500/10 border-neutral-500/20",
    },
    restore: {
      title: "Khôi phục sản phẩm?",
      description: `Sản phẩm "${productName}" sẽ được khôi phục về trạng thái Bản nháp. Bạn có thể chỉnh sửa hoặc xuất bản lại sau.`,
      confirmText: "Khôi phục",
      confirmClass: "bg-emerald-500 hover:bg-emerald-600 text-black font-extrabold shadow-md shadow-emerald-500/10",
      icon: RotateCcw,
      iconClass: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
    },
    delete: {
      title: "Xoá vĩnh viễn",
      description: `Bạn có chắc chắn muốn xóa vĩnh viễn sản phẩm "${productName}"? Hành động này không thể khôi phục và hình ảnh liên quan sẽ bị xóa khỏi Cloudinary.`,
      confirmText: "Xoá vĩnh viễn",
      confirmClass: "bg-rose-500 hover:bg-rose-600 text-white font-extrabold shadow-md shadow-rose-500/10",
      icon: Trash2,
      iconClass: "text-rose-500 bg-rose-500/10 border-rose-500/20",
    },
  };

  const activeConfig = config[actionType] || {
    title: "Xác nhận hành động?",
    description: "Bạn có chắc chắn muốn thực hiện hành động này?",
    confirmText: "Xác nhận",
    confirmClass: "bg-emerald-500 hover:bg-emerald-600 text-black font-extrabold",
    icon: HelpCircle,
    iconClass: "text-blue-500 bg-blue-500/10 border-blue-500/20",
  };

  const Icon = activeConfig.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-[var(--bg-secondary)] border border-[var(--border-color)]/60 p-6 shadow-2xl animate-reactions-in text-[var(--text-color)]">
        <div className="flex flex-col items-center text-center">
          <div className={`mb-4 p-3 rounded-full border ${activeConfig.iconClass}`}>
            <Icon className="w-6 h-6" />
          </div>

          <h3 className="mb-2 text-lg font-black tracking-tight">{activeConfig.title}</h3>
          <p className="mb-6 text-xs text-[var(--text-muted)] leading-relaxed px-2">
            {activeConfig.description}
          </p>

          <div className="flex w-full gap-3">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 py-2.5 rounded-xl border border-[var(--border-color)] text-xs font-black uppercase tracking-wider hover:bg-black/10 transition duration-200 cursor-pointer text-[var(--text-muted)]"
            >
              Hủy
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition duration-200 cursor-pointer ${activeConfig.confirmClass} disabled:opacity-50`}
            >
              {isLoading ? "Đang xử lý..." : activeConfig.confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
