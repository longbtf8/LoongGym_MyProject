import React from "react";
import { Save, Settings2, Sliders } from "lucide-react";

export default function Settings() {
  return (
    <div className="space-y-6 animate-reactions-in max-w-4xl">
      <div>
        <h2 className="text-2xl font-black tracking-tight text-[var(--text-color)]">Cài đặt hệ thống</h2>
        <p className="text-xs sm:text-sm text-[var(--text-muted)] font-semibold mt-1">
          Cấu hình các tham số hệ thống chung, tắt bật tính năng và quản lý bảo mật.
        </p>
      </div>

      <div className="p-6 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)]/60 shadow-lg space-y-6">
        {/* API Settings */}
        <div>
          <h3 className="text-sm font-black text-[var(--text-color)] flex items-center gap-2 mb-3">
            <Settings2 className="w-4 h-4 text-[var(--text-primary)]" /> Cấu hình API & Hệ thống
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[var(--text-muted)]">API Base URL</label>
              <input
                type="text"
                defaultValue="http://localhost:3009/api"
                className="w-full px-4 py-2 rounded-xl bg-[var(--input-bg)] border border-transparent focus:border-[var(--input-focus-border)] text-xs font-bold outline-none text-[var(--text-color)] transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[var(--text-muted)]">Tên dịch vụ</label>
              <input
                type="text"
                defaultValue="LoongMilkGym Admin Panel"
                className="w-full px-4 py-2 rounded-xl bg-[var(--input-bg)] border border-transparent focus:border-[var(--input-focus-border)] text-xs font-bold outline-none text-[var(--text-color)] transition-all"
              />
            </div>
          </div>
        </div>

        {/* Feature toggles */}
        <div className="border-t border-[var(--border-color)]/60 pt-6">
          <h3 className="text-sm font-black text-[var(--text-color)] flex items-center gap-2 mb-3">
            <Sliders className="w-4 h-4 text-[var(--text-primary)]" /> Tắt bật tính năng vận hành
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-black text-[var(--text-color)]">Bật cổng thanh toán tự động</p>
                <p className="text-[10px] text-[var(--text-muted)] font-semibold mt-0.5">Xử lý hóa đơn qua ví điện tử/ngân hàng trực tuyến.</p>
              </div>
              <input type="checkbox" defaultChecked className="w-9 h-5 rounded-full bg-[var(--color-primary)] cursor-pointer" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-black text-[var(--text-color)]">Bật AI Coach Streaming</p>
                <p className="text-[10px] text-[var(--text-muted)] font-semibold mt-0.5">Cho phép người dùng tương tác dạng dòng chảy thời gian thực.</p>
              </div>
              <input type="checkbox" defaultChecked className="w-9 h-5 rounded-full bg-[var(--color-primary)] cursor-pointer" />
            </div>
          </div>
        </div>

        {/* Save button */}
        <div className="border-t border-[var(--border-color)]/60 pt-6 flex justify-end">
          <button className="px-4 py-2.5 rounded-xl bg-[var(--color-primary)] text-black hover:bg-[var(--color-primary-hover)] text-xs font-extrabold flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-primary/20 transition-all">
            <Save className="w-4 h-4" /> Lưu cấu hình
          </button>
        </div>
      </div>
    </div>
  );
}
