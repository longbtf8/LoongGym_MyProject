import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  Camera,
  Crop,
  Image as ImageIcon,
  Minus,
  Pencil,
  Plus,
  Upload,
  UserRound,
  X,
} from "lucide-react";

const PREVIEW_SIZE = 512;
const PREVIEW_BOX_SIZE = 360;

const loadImage = (src) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const getRenderedImageSize = (imageSize, zoom) => {
  if (!imageSize.width || !imageSize.height) {
    return {
      width: PREVIEW_BOX_SIZE * zoom,
      height: PREVIEW_BOX_SIZE * zoom,
    };
  }

  const aspectRatio = imageSize.width / imageSize.height;
  if (aspectRatio >= 1) {
    return {
      width: PREVIEW_BOX_SIZE * aspectRatio * zoom,
      height: PREVIEW_BOX_SIZE * zoom,
    };
  }

  return {
    width: PREVIEW_BOX_SIZE * zoom,
    height: (PREVIEW_BOX_SIZE / aspectRatio) * zoom,
  };
};

const clampPan = (pan, zoom, imageSize) => {
  const renderedImageSize = getRenderedImageSize(imageSize, zoom);
  const maxPanX = Math.max(0, (renderedImageSize.width - PREVIEW_BOX_SIZE) / 2);
  const maxPanY = Math.max(0, (renderedImageSize.height - PREVIEW_BOX_SIZE) / 2);
  return {
    x: clamp(pan.x, -maxPanX, maxPanX),
    y: clamp(pan.y, -maxPanY, maxPanY),
  };
};

const createAvatarFile = async (src, zoom, pan) => {
  const image = await loadImage(src);
  const canvas = document.createElement("canvas");
  canvas.width = PREVIEW_SIZE;
  canvas.height = PREVIEW_SIZE;

  const context = canvas.getContext("2d");
  const cropSize = Math.max(1, Math.min(image.naturalWidth, image.naturalHeight) / zoom);
  const panScale = cropSize / PREVIEW_BOX_SIZE;
  const sourceX = clamp(
    (image.naturalWidth - cropSize) / 2 - pan.x * panScale,
    0,
    image.naturalWidth - cropSize
  );
  const sourceY = clamp(
    (image.naturalHeight - cropSize) / 2 - pan.y * panScale,
    0,
    image.naturalHeight - cropSize
  );

  context.drawImage(
    image,
    sourceX,
    sourceY,
    cropSize,
    cropSize,
    0,
    0,
    PREVIEW_SIZE,
    PREVIEW_SIZE
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Không thể tạo ảnh xem trước."));
          return;
        }
        resolve(new File([blob], `avatar-${Date.now()}.png`, { type: "image/png" }));
      },
      "image/png",
      0.92
    );
  });
};

function AvatarPhotoModal({
  open,
  mode = "menu",
  currentAvatarUrl,
  fullName = "",
  suggestedImages = [],
  onClose,
  onSave,
  isSaving = false,
}) {
  const fileInputRef = useRef(null);
  const menuRef = useRef(null);
  const dragStateRef = useRef(null);
  const [activeMode, setActiveMode] = useState(mode);
  const [selectedUrl, setSelectedUrl] = useState("");
  const [objectUrl, setObjectUrl] = useState("");
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [cropPreview, setCropPreview] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isPreparing, setIsPreparing] = useState(false);
  const [showAllSuggested, setShowAllSuggested] = useState(false);

  const visibleSuggestedImages = (showAllSuggested ? suggestedImages : suggestedImages.slice(0, 6)).filter(Boolean);
  const previewUrl = objectUrl || selectedUrl;

  useEffect(() => {
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [objectUrl]);

  useEffect(() => {
    if (activeMode !== "menu") return undefined;

    const handlePointerDown = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [activeMode, onClose]);

  useEffect(() => {
    if (open && (activeMode === "viewer" || activeMode === "picker" || activeMode === "preview")) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [open, activeMode]);

  if (!open) return null;

  const clearObjectUrl = () => {
    if (objectUrl) {
      URL.revokeObjectURL(objectUrl);
      setObjectUrl("");
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    clearObjectUrl();
    setSelectedUrl("");
    setObjectUrl(URL.createObjectURL(file));
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setImageSize({ width: 0, height: 0 });
    setCropPreview(false);
    setErrorMessage("");
    setActiveMode("preview");
    event.target.value = "";
  };

  const handleSuggestedSelect = (url) => {
    clearObjectUrl();
    setSelectedUrl(url);
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setImageSize({ width: 0, height: 0 });
    setCropPreview(false);
    setErrorMessage("");
    setActiveMode("preview");
  };

  const handleEditCurrent = () => {
    if (!currentAvatarUrl) return;
    handleSuggestedSelect(currentAvatarUrl);
  };

  const handleZoomChange = (nextZoom) => {
    setZoom(nextZoom);
    setPan((currentPan) => clampPan(currentPan, nextZoom, imageSize));
  };

  const handlePreviewPointerDown = (event) => {
    if (!previewUrl) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragStateRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startPan: pan,
    };
  };

  const handlePreviewPointerMove = (event) => {
    const dragState = dragStateRef.current;
    if (!dragState || dragState.pointerId !== event.pointerId) return;

    const nextPan = {
      x: dragState.startPan.x + event.clientX - dragState.startX,
      y: dragState.startPan.y + event.clientY - dragState.startY,
    };
    setPan(clampPan(nextPan, zoom, imageSize));
  };

  const handlePreviewPointerUp = (event) => {
    const dragState = dragStateRef.current;
    if (!dragState || dragState.pointerId !== event.pointerId) return;
    dragStateRef.current = null;
    event.currentTarget.releasePointerCapture(event.pointerId);
  };

  const handleSave = async () => {
    if (!previewUrl || isSaving || isPreparing) return;

    try {
      setIsPreparing(true);
      setErrorMessage("");
      const avatarProfile = {
        zoom,
        pan,
        objectPosition: `${clamp(50 - (pan.x / PREVIEW_BOX_SIZE) * 50, 0, 100)}% ${clamp(50 - (pan.y / PREVIEW_BOX_SIZE) * 50, 0, 100)}%`,
      };
      if (objectUrl) {
        const avatarFile = await createAvatarFile(previewUrl, zoom, pan);
        await onSave(avatarFile, avatarProfile);
      } else {
        await onSave(null, avatarProfile, previewUrl);
      }
      clearObjectUrl();
      onClose();
    } catch (error) {
      console.error("Không thể lưu ảnh đại diện:", error);
      setErrorMessage("Không thể lưu ảnh đại diện. Vui lòng thử lại.");
    } finally {
      setIsPreparing(false);
    }
  };

  const renderHeader = (title) => (
    <div className="relative flex items-center justify-center border-b border-[var(--border-color)] px-5 py-4">
      <h3 className="m-0 text-lg sm:text-xl font-black text-[var(--text-color)]">
        {title}
      </h3>
      <button
        type="button"
        onClick={onClose}
        className="absolute right-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-[var(--border-color)]/45 text-[var(--text-muted)] transition-all hover:bg-[var(--border-color)] hover:text-[var(--text-color)]"
        title="Đóng"
      >
        <X className="h-5 w-5" />
      </button>
    </div>
  );

  const renderMenu = () => (
    <div
      ref={menuRef}
      className="absolute left-1/2 top-[calc(100%+12px)] z-[60] w-[260px] -translate-x-1/2 overflow-visible rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] shadow-xl"
    >
      <span className="absolute -top-2 left-1/2 h-4 w-4 -translate-x-1/2 rotate-45 rounded-[2px] border-l border-t border-[var(--border-color)] bg-[var(--bg-secondary)]" />
      <div className="relative flex flex-col p-2">
        <button
          type="button"
          onClick={() => setActiveMode("viewer")}
          className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-left text-sm font-bold text-[var(--text-color)] transition-all hover:bg-[var(--border-color)]/35"
        >
          <UserRound className="h-5 w-5 text-primary" />
          <span>Xem ảnh</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveMode("picker")}
          className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-left text-sm font-bold text-[var(--text-color)] transition-all hover:bg-[var(--border-color)]/35"
        >
          <ImageIcon className="h-5 w-5 text-primary" />
          <span>Chọn ảnh đại diện</span>
        </button>
      </div>
    </div>
  );

  const renderViewer = () => (
    <div
      className="fixed inset-0 z-[80] bg-black"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white transition-all hover:bg-white/25"
        title="Đóng"
      >
        <X className="h-6 w-6" />
      </button>
      <div className="flex h-full w-full items-center justify-center p-4 sm:p-10">
        {currentAvatarUrl ? (
          <img
            src={currentAvatarUrl}
            alt="Ảnh đại diện"
            className="max-h-[85vh] max-w-full object-contain rounded-3xl"
          />
        ) : (
          <div className="flex h-44 w-44 items-center justify-center rounded-full bg-[var(--bg-secondary)] border border-primary/20 text-primary text-6xl font-black capitalize select-none shadow-[0_0_30px_rgba(204,255,0,0.15)] animate-fade-in">
            {fullName ? fullName.trim().charAt(0).toUpperCase() : "?"}
          </div>
        )}
      </div>
    </div>
  );

  const renderPicker = () => (
    <div className="w-[min(720px,calc(100vw-24px))] overflow-hidden rounded-3xl border border-[var(--border-color)] bg-[var(--bg-secondary)] shadow-2xl">
      {renderHeader("Chọn ảnh đại diện")}
      <div className="flex max-h-[72vh] flex-col gap-6 overflow-y-auto p-5 sm:p-6">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
        <div className="grid grid-cols-[1fr_auto] gap-3">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary/12 px-5 py-4 text-sm font-black text-primary transition-all hover:bg-primary/18"
          >
            <Upload className="h-5 w-5" />
            <span>Tải ảnh lên</span>
          </button>
          {currentAvatarUrl && (
            <button
              type="button"
              onClick={handleEditCurrent}
              className="flex h-full min-w-14 items-center justify-center rounded-2xl bg-[var(--border-color)]/45 text-[var(--text-color)] transition-all hover:bg-[var(--border-color)]"
              title="Chỉnh sửa ảnh hiện tại"
            >
              <Pencil className="h-5 w-5" />
            </button>
          )}
        </div>

        <section className="flex flex-col gap-3">
          <h4 className="m-0 text-base font-black text-[var(--text-color)]">
            Ảnh gợi ý
          </h4>
          {visibleSuggestedImages.length > 0 ? (
            <>
              <div className="grid max-h-[min(42vh,360px)] grid-cols-3 gap-3 overflow-y-auto pr-1 sm:grid-cols-4 md:grid-cols-6">
                {visibleSuggestedImages.map((url) => (
                  <button
                    type="button"
                    key={url}
                    onClick={() => handleSuggestedSelect(url)}
                    className="aspect-square overflow-hidden rounded-2xl border border-[var(--border-color)] bg-black/10 transition-all hover:scale-[1.02] hover:border-primary"
                  >
                    <img
                      src={url}
                      alt="Ảnh gợi ý"
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
              {suggestedImages.length > visibleSuggestedImages.length && (
                <button
                  type="button"
                  onClick={() => setShowAllSuggested(true)}
                  className="rounded-2xl bg-[var(--border-color)]/45 px-5 py-3 text-sm font-black text-[var(--text-color)] transition-all hover:bg-[var(--border-color)]"
                >
                  Xem thêm
                </button>
              )}
            </>
          ) : (
            <div className="rounded-2xl border border-dashed border-[var(--border-color)] px-4 py-8 text-center text-sm font-semibold text-[var(--text-muted)]">
              Chưa có ảnh gợi ý từ bài viết.
            </div>
          )}
        </section>
      </div>
    </div>
  );

  const renderPreview = () => (
    <div className="w-[min(760px,calc(100vw-24px))] overflow-hidden rounded-3xl border border-[var(--border-color)] bg-[var(--bg-secondary)] shadow-2xl">
      {renderHeader("Chọn ảnh đại diện")}
      <div className="flex max-h-[76vh] flex-col items-center gap-6 overflow-y-auto p-5 sm:p-7">
        {errorMessage && (
          <div className="w-full rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm font-bold text-rose-500">
            {errorMessage}
          </div>
        )}

        <div className="relative flex w-full justify-center">
          <div
            className={`relative h-[min(72vw,360px)] w-[min(72vw,360px)] touch-none overflow-hidden bg-black/10 cursor-grab active:cursor-grabbing ${
              cropPreview ? "rounded-full" : ""
            }`}
            onPointerDown={handlePreviewPointerDown}
            onPointerMove={handlePreviewPointerMove}
            onPointerUp={handlePreviewPointerUp}
            onPointerCancel={handlePreviewPointerUp}
            title="Kéo ảnh để chỉnh góc"
          >
            {previewUrl && (
              <img
                src={previewUrl}
                alt="Xem trước ảnh đại diện"
                draggable="false"
                onLoad={(event) => {
                  const nextImageSize = {
                    width: event.currentTarget.naturalWidth,
                    height: event.currentTarget.naturalHeight,
                  };
                  setImageSize(nextImageSize);
                  setPan((currentPan) => clampPan(currentPan, zoom, nextImageSize));
                }}
                className="absolute left-1/2 top-1/2 max-w-none select-none"
                style={{
                  width: `${getRenderedImageSize(imageSize, zoom).width}px`,
                  height: `${getRenderedImageSize(imageSize, zoom).height}px`,
                  transform: `translate(calc(-50% + ${pan.x}px), calc(-50% + ${pan.y}px))`,
                }}
              />
            )}
            {!cropPreview && (
              <div className="pointer-events-none absolute inset-0">
                <div className="absolute inset-0 bg-[rgba(255,255,255,0.45)]" />
                <div className="absolute inset-0 rounded-full border border-white/80 shadow-[0_0_0_999px_rgba(255,255,255,0.42)]" />
                <div className="absolute left-1/3 top-0 h-full w-px bg-white/35" />
                <div className="absolute left-2/3 top-0 h-full w-px bg-white/35" />
                <div className="absolute left-0 top-1/3 h-px w-full bg-white/35" />
                <div className="absolute left-0 top-2/3 h-px w-full bg-white/35" />
              </div>
            )}
          </div>
        </div>

        <div className="flex w-full max-w-[560px] items-center gap-4">
          <Minus className="h-6 w-6 shrink-0 text-[var(--text-color)]" />
          <input
            type="range"
            min="1"
            max="3"
            step="0.05"
            value={zoom}
            onChange={(event) => handleZoomChange(Number(event.target.value))}
            className="h-2 flex-1 accent-primary"
            aria-label="Thu phóng"
          />
          <Plus className="h-7 w-7 shrink-0 text-[var(--text-color)]" />
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => setCropPreview((value) => !value)}
            className={`flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-black transition-all ${
              cropPreview
                ? "bg-primary/12 text-primary"
                : "bg-[var(--border-color)]/45 text-[var(--text-color)] hover:bg-[var(--border-color)]"
            }`}
          >
            <Crop className="h-5 w-5" />
            <span>Cắt ảnh</span>
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 rounded-2xl bg-[var(--border-color)]/45 px-5 py-3 text-sm font-black text-[var(--text-color)] transition-all hover:bg-[var(--border-color)]"
          >
            <Camera className="h-5 w-5" />
            <span>Đổi ảnh</span>
          </button>
        </div>
      </div>
      <div className="flex items-center justify-end gap-3 border-t border-[var(--border-color)] px-5 py-4">
        <button
          type="button"
          onClick={onClose}
          disabled={isSaving || isPreparing}
          className="rounded-2xl px-5 py-3 text-sm font-black text-[var(--text-color)] transition-all hover:bg-[var(--border-color)]/35 disabled:opacity-50"
        >
          Hủy
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving || isPreparing}
          className="rounded-2xl bg-primary px-7 py-3 text-sm font-black text-black transition-all hover:bg-primary/95 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSaving || isPreparing ? "Đang lưu..." : "Lưu"}
        </button>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );

  if (activeMode === "viewer") return createPortal(renderViewer(), document.body);
  if (activeMode === "menu") return renderMenu();

  return createPortal(
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/45 p-3 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      {activeMode === "picker" && renderPicker()}
      {activeMode === "preview" && renderPreview()}
    </div>,
    document.body
  );
}

export default AvatarPhotoModal;
