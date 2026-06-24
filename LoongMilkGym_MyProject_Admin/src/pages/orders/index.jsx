import React from "react";
import { CheckCircle2, Clock, XCircle, Search } from "lucide-react";

export default function Orders() {
  const orders = [
    { id: "ORD-0891", customer: "Bùi Long", total: "1,850,000 đ", date: "Hôm nay, 14:32", status: "Đã hoàn thành" },
    { id: "ORD-0890", customer: "Nguyễn Văn A", total: "450,000 đ", date: "Hôm nay, 10:15", status: "Đang chờ xử lý" },
    { id: "ORD-0889", customer: "Trần Thị B", total: "1,040,000 đ", date: "Hôm qua, 18:45", status: "Đã hoàn thành" },
    { id: "ORD-0888", customer: "Lê Văn C", total: "150,000 đ", date: "21-06-2026", status: "Đã hủy" },
  ];

  return (
    <div className="space-y-6 animate-reactions-in">
      <div>
        <h2 className="text-2xl font-black tracking-tight text-[var(--text-color)]">Đơn hàng thanh toán</h2>
        <p className="text-xs sm:text-sm text-[var(--text-muted)] font-semibold mt-1">
          Theo dõi và phê duyệt trạng thái giao dịch mua hàng của các thành viên.
        </p>
      </div>

      {/* Orders table */}
      <div className="overflow-x-auto min-h-[300px] rounded-2xl border border-[var(--border-color)]/60 bg-[var(--bg-secondary)] shadow-lg">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-[var(--border-color)]/60 bg-[var(--border-color)]/20 text-xs font-bold text-[var(--text-muted)]">
              <th className="p-4">Mã đơn</th>
              <th className="p-4">Khách hàng</th>
              <th className="p-4">Tổng giá trị</th>
              <th className="p-4">Thời gian</th>
              <th className="p-4">Trạng thái</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-color)]/60 text-xs font-semibold text-[var(--text-color)]">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-[var(--border-color)]/10 transition-colors">
                <td className="p-4 font-black text-[var(--text-primary)]">{order.id}</td>
                <td className="p-4 font-black">{order.customer}</td>
                <td className="p-4 font-extrabold">{order.total}</td>
                <td className="p-4 text-[var(--text-muted)]">{order.date}</td>
                <td className="p-4">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-bold ${
                    order.status === "Đã hoàn thành" 
                      ? "bg-emerald-500/10 text-emerald-500" 
                      : order.status === "Đang chờ xử lý"
                      ? "bg-amber-500/10 text-amber-500"
                      : "bg-rose-500/10 text-rose-500"
                  }`}>
                    {order.status === "Đã hoàn thành" ? (
                      <CheckCircle2 className="w-3 h-3" />
                    ) : order.status === "Đang chờ xử lý" ? (
                      <Clock className="w-3 h-3" />
                    ) : (
                      <XCircle className="w-3 h-3" />
                    )}
                    {order.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
