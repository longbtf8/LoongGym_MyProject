import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  Camera,
  Globe,
  Image as ImageIcon,
  Move,
  Trash2,
  Upload,
  X,
} from "lucide-react";

const DEFAULT_PROFILE = { x: 50, y: 50, zoom: 1, objectPosition: "50% 50%" };

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

export default function CoverPhotoModal({
  open,
  mode = "menu",
  currentCoverUrl,
  defaultCoverUrl,
  currentProfile,
  suggestedImages = [],
  isSaving = false,
  frameSize,
  onClose,
  onSave,
  onRemove,
}) {
  const menuRef = useRef(null);
  const fileInputRef = useRef(null);
  const previewFrameRef = useRef(null);
  const dragRef = useRef(null);
  const [activeMode, setActiveMode] = useState(mode);
  const [selectedUrl, setSelectedUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [objectUrl, setObjectUrl] = useState("");
  const [profile, setProfile] = useState(currentProfile || DEFAULT_PROFILE);
  const [showAllSuggested, setShowAllSuggested] = useState(false);

  const previewUrl = objectUrl || selectedUrl || currentCoverUrl || defaultCoverUrl;
  const hasCustomCover = Boolean(currentCoverUrl && currentCoverUrl !== defaultCoverUrl);
  const visibleSuggestedImages = showAllSuggested ? suggestedImages : suggestedImages.slice(0, 8);
  const modalWidth = frameSize?.width ? `${Math.round(frameSize.width)}px` : "min(980px,calc(100vw-24px))";
  const coverPreviewHeight = frameSize?.height ? `${Math.round(frameSize.height)}px` : undefined;

  useEffect(() => {
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [objectUrl]);

  useEffect(() => {
    if (activeMode !== "menu") return undefined;
    const handlePointerDown = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) onClose();
    };
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [activeMode, onClose]);

  useEffect(() => {
    if (!open) return;
    setActiveMode(mode);
    setProfile(currentProfile || DEFAULT_PROFILE);
  }, [open, mode, currentProfile]);

  if (!open) return null;

  const clearObjectUrl = () => {
    if (objectUrl) URL.revokeObjectURL(objectUrl);
    setObjectUrl("");
  };

  const chooseFile = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    clearObjectUrl();
    setSelectedFile(file);
    setSelectedUrl("");
    setObjectUrl(URL.createObjectURL(file));
    setProfile(DEFAULT_PROFILE);
    setActiveMode("position");
    event.target.value = "";
  };

  const chooseExisting = (url) => {
    clearObjectUrl();
    setSelectedFile(null);
    setSelectedUrl(url);
    setProfile(DEFAULT_PROFILE);
    setActiveMode("position");
  };

  const handlePointerDown = (event) => {
    event.currentTarget.setPointerCapture?.(event.pointerId);
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startProfile: profile,
    };
  };

  const handlePointerMove = (event) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const rect = previewFrameRef.current?.getBoundingClientRect();
    const frameWidth = rect?.width || frameSize?.width || 1;
    const frameHeight = rect?.height || frameSize?.height || 1;
    const nextX = clamp(drag.startProfile.x - ((event.clientX - drag.startX) / frameWidth) * 100, 0, 100);
    const nextY = clamp(drag.startProfile.y - ((event.clientY - drag.startY) / frameHeight) * 100, 0, 100);
    setProfile({
      ...drag.startProfile,
      x: nextX,
      y: nextY,
      objectPosition: `${nextX}% ${nextY}%`,
    });
  };

  const handlePointerUp = (event) => {
    if (dragRef.current?.pointerId === event.pointerId) {
      dragRef.current = null;
      event.currentTarget.releasePointerCapture?.(event.pointerId);
    }
  };

  const handleSave = async () => {
    try {
      await onSave({
        file: selectedFile,
        coverPhotoUrl: selectedUrl || (selectedFile ? null : currentCoverUrl),
        coverPhotoProfile: profile,
      });
      onClose();
    } catch {
      // Parent shows the toast; keep the modal open so the user can retry.
    }
  };

  const renderMenu = () => (
    <div
      ref={menuRef}
      className="absolute right-0 top-[calc(100%+8px)] z-[65] w-[min(340px,calc(100vw-32px))] overflow-visible rounded-3xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-2 shadow-2xl"
    >
      <span className="absolute -top-2 right-10 h-4 w-4 rotate-45 border-l border-t border-[var(--border-color)] bg-[var(--bg-secondary)]" />
      <button
        type="button"
        onClick={() => setActiveMode("picker")}
        className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-black text-[var(--text-color)] transition-all hover:bg-[var(--border-color)]/35"
      >
        <ImageIcon className="h-5 w-5" />
        Chọn ảnh bìa
      </button>
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-black text-[var(--text-color)] transition-all hover:bg-[var(--border-color)]/35"
      >
        <Upload className="h-5 w-5" />
        Tải ảnh lên
      </button>
      {hasCustomCover && (
        <>
          <button
            type="button"
            onClick={() => {
              setSelectedUrl(currentCoverUrl);
              setSelectedFile(null);
              setProfile(currentProfile || DEFAULT_PROFILE);
              setActiveMode("position");
            }}
            className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-black text-[var(--text-color)] transition-all hover:bg-[var(--border-color)]/35"
          >
            <Move className="h-5 w-5" />
            Đặt lại vị trí
          </button>
          <button
            type="button"
            onClick={() => setActiveMode("viewer")}
            className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-black text-[var(--text-color)] transition-all hover:bg-[var(--border-color)]/35"
          >
            <Camera className="h-5 w-5" />
            Xem ảnh bìa
          </button>
          <div className="my-1 h-px bg-[var(--border-color)]" />
          <button
            type="button"
            onClick={async () => {
              try {
                await onRemove();
                onClose();
              } catch {
                // Parent shows the toast; keep the menu open so the user can retry.
              }
            }}
            className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-black text-rose-500 transition-all hover:bg-rose-500/10"
          >
            <Trash2 className="h-5 w-5" />
            Gỡ
          </button>
        </>
      )}
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={chooseFile} />
    </div>
  );

  const shell = (title, children, footer = null) => createPortal(
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/55 p-3 backdrop-blur-sm">
      <div
        className="max-w-[calc(100vw-24px)] overflow-hidden rounded-3xl border border-[var(--border-color)] bg-[var(--bg-secondary)] shadow-2xl"
        style={{ width: modalWidth }}
      >
        <div className="relative flex items-center justify-center border-b border-[var(--border-color)] px-5 py-4">
          <h3 className="m-0 text-lg font-black text-[var(--text-color)]">{title}</h3>
          <button type="button" onClick={onClose} className="absolute right-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-[var(--border-color)]/45 text-[var(--text-muted)]">
            <X className="h-5 w-5" />
          </button>
        </div>
        {children}
        {footer}
      </div>
    </div>,
    document.body
  );

  if (activeMode === "menu") return renderMenu();

  if (activeMode === "viewer") {
    return createPortal(
      <div className="fixed inset-0 z-[80] bg-black">
        <button type="button" onClick={onClose} className="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/25">
          <X className="h-6 w-6" />
        </button>
        <div className="flex h-full w-full items-center justify-center p-4">
          <img src={currentCoverUrl || defaultCoverUrl} alt="Ảnh bìa" className="max-h-[86vh] max-w-full object-contain" />
        </div>
      </div>,
      document.body
    );
  }

  if (activeMode === "picker") {
    return shell(
      "Chọn ảnh bìa",
      <div className="flex max-h-[72vh] flex-col gap-6 overflow-y-auto p-5">
        <button type="button" onClick={() => fileInputRef.current?.click()} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary/12 px-5 py-4 text-sm font-black text-primary">
          <Upload className="h-5 w-5" />
          Tải ảnh lên
        </button>
        <section className="flex flex-col gap-3">
          <h4 className="m-0 text-base font-black text-[var(--text-color)]">Ảnh từ bài viết của bạn</h4>
          {visibleSuggestedImages.length ? (
            <>
              <div className="grid max-h-[min(42vh,360px)] grid-cols-2 gap-3 overflow-y-auto pr-1 sm:grid-cols-4">
                {visibleSuggestedImages.map((url) => (
                  <button key={url} type="button" onClick={() => chooseExisting(url)} className="aspect-video overflow-hidden rounded-2xl border border-[var(--border-color)] bg-black/10 hover:border-primary">
                    <img src={url} alt="Ảnh bìa gợi ý" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
              {suggestedImages.length > visibleSuggestedImages.length && (
                <button type="button" onClick={() => setShowAllSuggested(true)} className="rounded-2xl bg-[var(--border-color)]/45 px-5 py-3 text-sm font-black text-[var(--text-color)]">
                  Xem thêm
                </button>
              )}
            </>
          ) : (
            <div className="rounded-2xl border border-dashed border-[var(--border-color)] px-4 py-8 text-center text-sm font-semibold text-[var(--text-muted)]">
              Chưa có ảnh từ bài viết của bạn.
            </div>
          )}
        </section>
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={chooseFile} />
      </div>
    );
  }

  return shell(
    "Đặt lại vị trí ảnh bìa",
    <div className="p-0">
      <div className="flex items-center gap-2 bg-black/50 px-5 py-3 text-sm font-bold text-white">
        <Globe className="h-5 w-5" />
        Ảnh bìa của bạn hiển thị công khai.
      </div>
      <div
        ref={previewFrameRef}
        className="h-[260px] touch-none cursor-grab overflow-hidden bg-black active:cursor-grabbing sm:h-[360px]"
        style={coverPreviewHeight ? { height: coverPreviewHeight } : undefined}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <img
          src={previewUrl}
          alt="Xem trước ảnh bìa"
          draggable={false}
          className="h-full w-full select-none object-cover"
          style={{ objectPosition: profile.objectPosition || `${profile.x}% ${profile.y}%` }}
        />
      </div>
    </div>,
    <div className="flex items-center justify-end gap-3 border-t border-[var(--border-color)] px-5 py-4">
      <button type="button" onClick={onClose} disabled={isSaving} className="rounded-2xl px-5 py-3 text-sm font-black text-[var(--text-color)] hover:bg-[var(--border-color)]/35">
        Hủy
      </button>
      <button type="button" onClick={handleSave} disabled={isSaving} className="rounded-2xl bg-primary px-7 py-3 text-sm font-black text-black disabled:opacity-60">
        {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
      </button>
    </div>
  );
}
