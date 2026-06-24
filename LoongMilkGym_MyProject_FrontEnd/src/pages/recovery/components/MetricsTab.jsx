import React from "react";
import { Sparkles, Scale, Camera, Loader2, ArrowRight } from "lucide-react";
import CustomSelect from "@/components/common/CustomSelect";

const PHOTO_TYPE_OPTIONS = [
  { label: "Chụp phía trước (Front)", value: "front" },
  { label: "Chụp phía sau (Back)", value: "back" },
  { label: "Chụp góc nghiêng (Side)", value: "side" },
];

function MetricsTab({
  weightKg,
  setWeightKg,
  bodyFatPercent,
  setBodyFatPercent,
  muscleMassKg,
  setMuscleMassKg,
  waistCm,
  setWaistCm,
  chestCm,
  setChestCm,
  armCm,
  setArmCm,
  thighCm,
  setThighCm,
  metricsNotes,
  setMetricsNotes,
  photoType,
  setPhotoType,
  photoUrl,
  setPhotoUrl,
  localPhotoFile,
  setLocalPhotoFile,
  handleLogMetrics,
  handlePhotoUpload,
  isLoggingMetric,
  isUploadingPhoto,
}) {
  return (
    <div className="flex flex-col gap-6">
      {/* FORM LOG METRICS */}
      <form
        onSubmit={handleLogMetrics}
        className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-[32px] p-6 shadow-xl flex flex-col gap-6"
      >
        <div>
          <h3 className="text-base sm:text-lg font-black flex items-center gap-2">
            <Scale className="w-5 h-5 text-primary" />
            Số Đo Thành Phần Cơ Thể
          </h3>
          <p className="text-xs text-[var(--text-muted)] font-medium mt-0.5">
            Cập nhật các số đo để theo dõi sự thay đổi của cơ thể qua thời gian.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex flex-col gap-1.5 bg-[var(--bg-color)] border border-[var(--border-color)] p-3.5 rounded-xl">
            <span className="text-[10px] font-extrabold uppercase text-[var(--text-muted)] tracking-wider">Cân nặng (kg)</span>
            <input
              type="number"
              step="0.1"
              placeholder="Nhập cân nặng"
              value={weightKg}
              onChange={(e) => setWeightKg(e.target.value)}
              className="bg-[var(--bg-secondary)] border border-[var(--border-color)] focus:border-primary/65 rounded-lg px-3 py-2 text-xs font-bold outline-none text-[var(--text-color)] w-full"
            />
          </div>
          <div className="flex flex-col gap-1.5 bg-[var(--bg-color)] border border-[var(--border-color)] p-3.5 rounded-xl">
            <span className="text-[10px] font-extrabold uppercase text-[var(--text-muted)] tracking-wider">Tỉ lệ mỡ (%)</span>
            <input
              type="number"
              step="0.1"
              placeholder="Nhập tỉ lệ mỡ"
              value={bodyFatPercent}
              onChange={(e) => setBodyFatPercent(e.target.value)}
              className="bg-[var(--bg-secondary)] border border-[var(--border-color)] focus:border-primary/65 rounded-lg px-3 py-2 text-xs font-bold outline-none text-[var(--text-color)] w-full"
            />
          </div>
          <div className="flex flex-col gap-1.5 bg-[var(--bg-color)] border border-[var(--border-color)] p-3.5 rounded-xl">
            <span className="text-[10px] font-extrabold uppercase text-[var(--text-muted)] tracking-wider">Khối lượng cơ (kg)</span>
            <input
              type="number"
              step="0.1"
              placeholder="Nhập khối cơ"
              value={muscleMassKg}
              onChange={(e) => setMuscleMassKg(e.target.value)}
              className="bg-[var(--bg-secondary)] border border-[var(--border-color)] focus:border-primary/65 rounded-lg px-3 py-2 text-xs font-bold outline-none text-[var(--text-color)] w-full"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="flex flex-col gap-1.5 bg-[var(--bg-color)] border border-[var(--border-color)] p-3.5 rounded-xl">
            <span className="text-[10px] font-extrabold uppercase text-[var(--text-muted)] tracking-wider">Vòng ngực (cm)</span>
            <input
              type="number"
              placeholder="Nhập số đo"
              value={chestCm}
              onChange={(e) => setChestCm(e.target.value)}
              className="bg-[var(--bg-secondary)] border border-[var(--border-color)] focus:border-primary/65 rounded-lg px-3 py-2 text-xs font-bold outline-none text-[var(--text-color)] w-full"
            />
          </div>
          <div className="flex flex-col gap-1.5 bg-[var(--bg-color)] border border-[var(--border-color)] p-3.5 rounded-xl">
            <span className="text-[10px] font-extrabold uppercase text-[var(--text-muted)] tracking-wider">Vòng eo (cm)</span>
            <input
              type="number"
              placeholder="Nhập số đo"
              value={waistCm}
              onChange={(e) => setWaistCm(e.target.value)}
              className="bg-[var(--bg-secondary)] border border-[var(--border-color)] focus:border-primary/65 rounded-lg px-3 py-2 text-xs font-bold outline-none text-[var(--text-color)] w-full"
            />
          </div>
          <div className="flex flex-col gap-1.5 bg-[var(--bg-color)] border border-[var(--border-color)] p-3.5 rounded-xl">
            <span className="text-[10px] font-extrabold uppercase text-[var(--text-muted)] tracking-wider">Vòng bắp tay (cm)</span>
            <input
              type="number"
              placeholder="Nhập số đo"
              value={armCm}
              onChange={(e) => setArmCm(e.target.value)}
              className="bg-[var(--bg-secondary)] border border-[var(--border-color)] focus:border-primary/65 rounded-lg px-3 py-2 text-xs font-bold outline-none text-[var(--text-color)] w-full"
            />
          </div>
          <div className="flex flex-col gap-1.5 bg-[var(--bg-color)] border border-[var(--border-color)] p-3.5 rounded-xl">
            <span className="text-[10px] font-extrabold uppercase text-[var(--text-muted)] tracking-wider">Vòng đùi (cm)</span>
            <input
              type="number"
              placeholder="Nhập số đo"
              value={thighCm}
              onChange={(e) => setThighCm(e.target.value)}
              className="bg-[var(--bg-secondary)] border border-[var(--border-color)] focus:border-primary/65 rounded-lg px-3 py-2 text-xs font-bold outline-none text-[var(--text-color)] w-full"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2 bg-[var(--bg-color)] border border-[var(--border-color)] p-4 rounded-2xl">
          <label className="text-xs sm:text-sm font-extrabold text-[var(--text-color)]">Ghi chú số đo</label>
          <textarea
            rows="2"
            placeholder="Ghi chú thêm về trạng thái cân đo (ví dụ: Đo lúc sáng sớm ngủ dậy bụng đói...)"
            value={metricsNotes}
            onChange={(e) => setMetricsNotes(e.target.value)}
            className="bg-[var(--bg-secondary)] border border-[var(--border-color)] focus:border-primary/65 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-semibold outline-none text-[var(--text-color)] resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={isLoggingMetric}
          className="w-full py-3 bg-primary hover:bg-primary-hover text-black font-black uppercase tracking-wider rounded-2xl text-xs sm:text-sm border-0 cursor-pointer disabled:opacity-50 transition-all flex items-center justify-center gap-2"
        >
          {isLoggingMetric ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          Lưu Chỉ Số Cơ Thể
        </button>
      </form>

      {/* FORM UPLOAD PHOTO PROGRESS */}
      <form
        onSubmit={handlePhotoUpload}
        className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-[32px] p-6 shadow-xl flex flex-col gap-6"
      >
        <div>
          <h3 className="text-base sm:text-lg font-black flex items-center gap-2">
            <Camera className="w-5 h-5 text-primary" />
            Tải Ảnh Tiến Trình
          </h3>
          <p className="text-xs text-[var(--text-muted)] font-medium mt-0.5">
            Lưu trữ hình ảnh thể trạng để so sánh trực quan kết quả tập luyện.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-extrabold text-[var(--text-color)]">Góc chụp ảnh</label>
            <CustomSelect
              value={photoType}
              onChange={setPhotoType}
              options={PHOTO_TYPE_OPTIONS}
              placeholder="Chọn góc chụp"
              variant="form"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-extrabold text-[var(--text-color)]">Đường dẫn ảnh URL hoặc chọn file</label>
            <div className="flex flex-col gap-2">
              <input
                type="text"
                placeholder="Nhập đường dẫn URL ảnh (nếu có)"
                value={photoUrl}
                onChange={(e) => {
                  setPhotoUrl(e.target.value);
                  setLocalPhotoFile(null);
                }}
                className="bg-[var(--bg-color)] border border-[var(--border-color)] focus:border-primary/65 rounded-xl px-4 py-3 text-xs sm:text-sm font-semibold outline-none text-[var(--text-color)] w-full"
              />
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-[var(--text-muted)]">Hoặc chọn file ảnh:</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setLocalPhotoFile(e.target.files[0]);
                      setPhotoUrl("");
                    }
                  }}
                  className="text-xs text-[var(--text-muted)] file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 file:cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isUploadingPhoto}
          className="w-full py-3 bg-primary hover:bg-primary-hover text-black font-black uppercase tracking-wider rounded-2xl text-xs sm:text-sm border-0 cursor-pointer disabled:opacity-50 transition-all flex items-center justify-center gap-2"
        >
          {isUploadingPhoto ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          Tải Lên Ảnh Tiến Trình
        </button>
      </form>
    </div>
  );
}

export default MetricsTab;
