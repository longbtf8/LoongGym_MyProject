import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { ZoomIn, ZoomOut, ChevronLeft, ChevronRight, X } from "lucide-react";

export default function PhotoZoomModal({ media, initialIndex, onClose }) {
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ pointerX: 0, pointerY: 0, panX: 0, panY: 0 });

  const activeMedia = media[activeIndex];

  const handleZoomIn = () => setZoom(z => Math.min(z + 0.25, 3));
  const handleZoomOut = () => {
    setZoom(z => {
      const next = Math.max(z - 0.25, 1);
      if (next <= 1) setPan({ x: 0, y: 0 });
      return next;
    });
  };
  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handlePrev = () => {
    setActiveIndex(i => (i - 1 + media.length) % media.length);
    handleReset();
  };

  const handleNext = () => {
    setActiveIndex(i => (i + 1) % media.length);
    handleReset();
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && media.length > 1) handlePrev();
      if (e.key === "ArrowRight" && media.length > 1) handleNext();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeIndex, media.length]);

  const handlePointerDown = (e) => {
    if (zoom <= 1) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDragging(true);
    dragStartRef.current = {
      pointerX: e.clientX,
      pointerY: e.clientY,
      panX: pan.x,
      panY: pan.y
    };
  };

  const handlePointerMove = (e) => {
    if (!isDragging || zoom <= 1) return;
    const dx = e.clientX - dragStartRef.current.pointerX;
    const dy = e.clientY - dragStartRef.current.pointerY;
    setPan({
      x: dragStartRef.current.panX + dx,
      y: dragStartRef.current.panY + dy
    });
  };

  const handlePointerEnd = (e) => {
    e.currentTarget.releasePointerCapture(e.pointerId);
    setIsDragging(false);
  };

  if (!activeMedia) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] bg-black/95 flex flex-col justify-between select-none">
      {/* Top Header */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-b from-black/60 to-transparent text-white z-10 shrink-0">
        <span className="text-xs font-black bg-black/40 px-3 py-1.5 rounded-full border border-white/15">
          Ảnh {activeIndex + 1} / {media.length}
        </span>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleZoomOut} 
            disabled={zoom <= 1}
            className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 transition-all text-white disabled:opacity-40 cursor-pointer"
            title="Thu nhỏ"
          >
            <ZoomOut className="w-4.5 h-4.5" />
          </button>
          <button 
            onClick={handleZoomIn} 
            disabled={zoom >= 3}
            className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 transition-all text-white disabled:opacity-40 cursor-pointer"
            title="Phóng to"
          >
            <ZoomIn className="w-4.5 h-4.5" />
          </button>
          {zoom > 1 && (
            <button 
              onClick={handleReset}
              className="px-3.5 py-1.5 rounded-full bg-[var(--color-primary)] text-white text-[10px] font-black uppercase tracking-wider cursor-pointer"
            >
              Reset Zoom
            </button>
          )}
          <button 
            onClick={onClose} 
            className="p-2.5 rounded-full bg-white/15 hover:bg-white/25 transition-all text-white cursor-pointer"
            title="Đóng"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>
      </div>

      {/* Main Image View */}
      <div className="flex-1 relative flex items-center justify-center overflow-hidden">
        {media.length > 1 && (
          <>
            <button 
              onClick={handlePrev}
              className="absolute left-6 p-3 rounded-full bg-black/40 hover:bg-black/60 border border-white/10 text-white z-10 cursor-pointer"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button 
              onClick={handleNext}
              className="absolute right-6 p-3 rounded-full bg-black/40 hover:bg-black/60 border border-white/10 text-white z-10 cursor-pointer"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}

        <div
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerEnd}
          onPointerCancel={handlePointerEnd}
          className={`flex items-center justify-center w-full h-full touch-none ${zoom > 1 ? (isDragging ? 'cursor-grabbing' : 'cursor-grab') : ''}`}
        >
          <img 
            src={activeMedia.mediaUrl} 
            alt="Zoom view"
            draggable={false}
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transition: isDragging ? 'none' : 'transform 0.15s ease-out'
            }}
            className="max-w-full max-h-full object-contain pointer-events-none select-none"
          />
        </div>
      </div>
    </div>,
    document.body
  );
}
