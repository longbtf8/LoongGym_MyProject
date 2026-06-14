import React from "react";
import { ShieldAlert, PlusCircle, CheckCircle2, AlertCircle } from "lucide-react";

function InjuriesTab({
  bodyPart,
  setBodyPart,
  severity,
  setSeverity,
  painLevel,
  setPainLevel,
  injuryDesc,
  setInjuryDesc,
  startedAt,
  setStartedAt,
  handleLogInjury,
  handleResolveInjury,
  activeInjuries,
  isLoggingInjury,
  todayDateStr,
}) {
  return (
    <div className="flex flex-col gap-6">
      {/* FORM LOG INJURY */}
      <form
        onSubmit={handleLogInjury}
        className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-[32px] p-6 shadow-xl flex flex-col gap-6"
      >
        <div>
          <h3 className="text-base sm:text-lg font-black flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-primary" />
            Báo Cáo Chấn Thương
          </h3>
          <p className="text-xs text-[var(--text-muted)] font-medium mt-0.5">
            Ghi nhận chấn thương/đau mỏi khớp cơ để hệ thống tự động điều chỉnh lịch tập an toàn.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-extrabold text-[var(--text-color)]">Vị trí đau/chấn thương (ví dụ: Cổ tay, Khớp gối...)</label>
            <input
              type="text"
              placeholder="Nhập bộ phận cơ thể bị đau"
              value={bodyPart}
              onChange={(e) => setBodyPart(e.target.value)}
              className="bg-[var(--bg-color)] border border-[var(--border-color)] focus:border-primary/65 rounded-xl px-4 py-3 text-xs sm:text-sm font-semibold outline-none text-[var(--text-color)] w-full"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-extrabold text-[var(--text-color)]">Mức độ chấn thương</label>
            <select
              value={severity}
              onChange={(e) => setSeverity(e.target.value)}
              className="bg-[var(--bg-color)] border border-[var(--border-color)] focus:border-primary/65 rounded-xl px-4 py-3 text-xs sm:text-sm font-semibold outline-none text-[var(--text-color)]"
            >
              <option value="mild">Nhẹ (Căng cơ nhẹ, mỏi khớp)</option>
              <option value="moderate">Vừa (Đau khi chuyển động nhất định)</option>
              <option value="severe">Nặng (Đau nhói liên tục, hạn chế vận động)</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-3 bg-[var(--bg-color)] border border-[var(--border-color)] p-4 rounded-2xl">
          <div className="flex justify-between items-center">
            <label className="text-xs sm:text-sm font-extrabold text-[var(--text-color)]">Mức độ đau nhức (Pain Scale)</label>
            <span className="text-sm font-black text-red-500 bg-red-500/10 px-2.5 py-0.5 rounded-lg">
              {painLevel}/10
            </span>
          </div>
          <input
            type="range"
            min="1"
            max="10"
            step="1"
            value={painLevel}
            onChange={(e) => setPainLevel(Number(e.target.value))}
            className="w-full h-2 bg-neutral-200 dark:bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-red-500"
          />
          <div className="flex justify-between text-[10px] font-bold text-[var(--text-muted)]">
            <span>Đau nhẹ (1)</span>
            <span>Khó chịu (5)</span>
            <span>Rất dữ dội (10)</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-extrabold text-[var(--text-color)]">Ngày bắt đầu bị đau</label>
            <input
              type="date"
              value={startedAt}
              onChange={(e) => setStartedAt(e.target.value)}
              className="bg-[var(--bg-color)] border border-[var(--border-color)] focus:border-primary/65 rounded-xl px-4 py-3 text-xs sm:text-sm font-semibold outline-none text-[var(--text-color)] w-full"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-extrabold text-[var(--text-color)]">Mô tả chi tiết triệu chứng</label>
            <input
              type="text"
              placeholder="Đau tăng khi thực hiện động tác nào..."
              value={injuryDesc}
              onChange={(e) => setInjuryDesc(e.target.value)}
              className="bg-[var(--bg-color)] border border-[var(--border-color)] focus:border-primary/65 rounded-xl px-4 py-3 text-xs sm:text-sm font-semibold outline-none text-[var(--text-color)] w-full"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoggingInjury}
          className="w-full py-3 bg-red-500 hover:bg-red-600 text-black font-black uppercase tracking-wider rounded-2xl text-xs sm:text-sm border-0 cursor-pointer disabled:opacity-50 transition-all flex items-center justify-center gap-2"
        >
          <PlusCircle className="w-4.5 h-4.5" />
          Ghi Nhận Chấn Thương
        </button>
      </form>

      {/* ACTIVE INJURIES LIST */}
      <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-[32px] p-6 shadow-xl flex flex-col gap-4">
        <h3 className="text-base sm:text-lg font-black flex items-center gap-2">
          Danh sách chấn thương hiện tại
        </h3>
        
        {activeInjuries.length === 0 ? (
          <div className="text-center py-6 text-xs sm:text-sm text-[var(--text-muted)] font-semibold">
            🎉 Tuyệt vời! Hiện tại bạn không có chấn thương nào đang hoạt động.
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {activeInjuries.map((injury) => (
              <div
                key={injury.id}
                className="bg-[var(--bg-color)] border border-[var(--border-color)] rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div>
                  <h4 className="font-extrabold text-xs sm:text-sm text-red-500 uppercase">
                    Vùng: {injury.bodyPart}
                  </h4>
                  <p className="text-xs text-[var(--text-color)] font-semibold mt-1">
                    Độ đau: <span className="text-red-500 font-bold">{injury.painLevel}/10</span> | Mức độ: <span className="font-bold">{injury.severity === "mild" ? "Nhẹ" : injury.severity === "moderate" ? "Vừa" : "Nặng"}</span>
                  </p>
                  {injury.description && (
                    <p className="text-[11px] text-[var(--text-muted)] mt-1 italic">
                      Chi tiết: {injury.description}
                    </p>
                  )}
                  <p className="text-[10px] text-[var(--text-muted)] mt-1">
                    Bắt đầu: {new Date(injury.startedAt).toLocaleDateString("vi-VN")}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleResolveInjury(injury.id)}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-black text-[10px] font-black uppercase tracking-wider rounded-xl border-0 cursor-pointer flex items-center gap-1 transition-all"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Xác nhận khỏi đau
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default InjuriesTab;
