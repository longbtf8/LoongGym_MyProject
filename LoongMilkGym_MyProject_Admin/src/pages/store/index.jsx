import React from "react";
import { Plus, Search, Tag, Box, AlertCircle } from "lucide-react";

export default function Store() {
  const products = [
    { id: 1, name: "Whey Protein Isolate 5lbs", price: "1,850,000 đ", stock: 24, status: "In Stock", sales: "148 bán" },
    { id: 2, name: "Creatine Monohydrate 300g", price: "450,000 đ", stock: 8, status: "Low Stock", sales: "320 bán" },
    { id: 3, name: "Bình lắc LoongMilkGym Premium", price: "150,000 đ", stock: 120, status: "In Stock", sales: "56 bán" },
    { id: 4, name: "Pre-Workout Power Boost", price: "890,000 đ", stock: 0, status: "Out of Stock", sales: "94 bán" },
  ];

  return (
    <div className="space-y-6 animate-reactions-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-[var(--text-color)]">Quản lý cửa hàng</h2>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] font-semibold mt-1">
            Cập nhật sản phẩm, thay đổi giá cả và kiểm tra số lượng tồn kho sản phẩm thực phẩm bổ sung, phụ kiện tập luyện.
          </p>
        </div>
        <button className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[var(--color-primary)] text-black hover:bg-[var(--color-primary-hover)] text-xs font-extrabold flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-primary/20 transition-all">
          <Plus className="w-4 h-4" /> Thêm sản phẩm
        </button>
      </div>

      {/* Product list table */}
      <div className="overflow-x-auto rounded-2xl border border-[var(--border-color)]/60 bg-[var(--bg-secondary)] shadow-lg">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-[var(--border-color)]/60 bg-[var(--border-color)]/20 text-xs font-bold text-[var(--text-muted)]">
              <th className="p-4">Tên sản phẩm</th>
              <th className="p-4">Đơn giá</th>
              <th className="p-4">Số lượng kho</th>
              <th className="p-4">Trạng thái</th>
              <th className="p-4">Đã bán</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-color)]/60 text-xs font-semibold text-[var(--text-color)]">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-[var(--border-color)]/10 transition-colors">
                <td className="p-4 font-black">{product.name}</td>
                <td className="p-4 text-[var(--text-primary)] font-extrabold">{product.price}</td>
                <td className="p-4 text-[var(--text-muted)]">{product.stock} hộp/chiếc</td>
                <td className="p-4">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-bold ${
                    product.status === "In Stock" 
                      ? "bg-emerald-500/10 text-emerald-500" 
                      : product.status === "Low Stock"
                      ? "bg-amber-500/10 text-amber-500"
                      : "bg-rose-500/10 text-rose-500"
                  }`}>
                    {product.status === "Low Stock" && <AlertCircle className="w-3 h-3" />}
                    {product.status}
                  </span>
                </td>
                <td className="p-4 text-[var(--text-muted)]">{product.sales}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
