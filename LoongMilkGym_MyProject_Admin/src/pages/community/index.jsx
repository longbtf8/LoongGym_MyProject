import React from "react";
import { ShieldAlert, Trash2, CheckCircle2 } from "lucide-react";

export default function Community() {
  const flags = [
    { id: 1, author: "Nguyễn Văn A", content: "Bài đăng quảng cáo sản phẩm ngoài, vi phạm quy định", type: "Spam", status: "Chờ duyệt" },
    { id: 2, author: "Trần Thị B", content: "Bình luận xúc phạm người dùng khác trong chuỗi thảo luận", type: "Ngôn từ độc hại", status: "Chờ duyệt" },
  ];

  return (
    <div className="space-y-6 animate-reactions-in">
      <div>
        <h2 className="text-2xl font-black tracking-tight text-[var(--text-color)]">Kiểm duyệt cộng đồng</h2>
        <p className="text-xs sm:text-sm text-[var(--text-muted)] font-semibold mt-1">
          Duyệt tin đăng, xử lý các bài đăng bị báo cáo và giữ môi trường thảo luận của LoongMilkGym lành mạnh.
        </p>
      </div>

      <div className="space-y-4">
        {flags.map((flag) => (
          <div key={flag.id} className="p-5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)]/60 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-[var(--text-color)]">{flag.author}</span>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-500 flex items-center gap-1">
                  <ShieldAlert className="w-3 h-3" /> {flag.type}
                </span>
              </div>
              <p className="text-xs text-[var(--text-muted)] font-semibold italic">"{flag.content}"</p>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <button className="flex-1 sm:flex-none px-3.5 py-1.5 rounded-xl border border-[var(--border-color)] text-[var(--text-color)] hover:bg-[var(--border-color)]/30 text-[10px] font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Bỏ qua
              </button>
              <button className="flex-1 sm:flex-none px-3.5 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all shadow-md">
                <Trash2 className="w-3.5 h-3.5" /> Gỡ bỏ
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
