import React, { useState, useEffect } from "react";
import { ScanBarcode, CameraOff, X } from "lucide-react";
import { Html5Qrcode } from "html5-qrcode";

function BarcodeScannerModal({ onClose, onScanSuccess }) {
  const [manualBarcode, setManualBarcode] = useState("");
  const [cameraError, setCameraError] = useState("");

  useEffect(() => {
    let html5QrcodeScanner;
    
    const timer = setTimeout(() => {
      try {
        html5QrcodeScanner = new Html5Qrcode("barcode-reader-viewport");
        html5QrcodeScanner.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: (width, height) => {
              return { width: Math.round(width * 0.8), height: Math.round(height * 0.3) };
            },
            aspectRatio: 1.0
          },
          async (decodedText) => {
            if (html5QrcodeScanner && html5QrcodeScanner.isScanning) {
              await html5QrcodeScanner.stop().catch(() => {});
            }
            onScanSuccess(decodedText);
          },
          () => {}
        ).catch((err) => {
          console.warn("Camera start failed: ", err);
          setCameraError("Không thể truy cập camera. Bạn có thể tự nhập mã vạch bên dưới.");
        });
      } catch (err) {
        console.error("Scanner init failed: ", err);
        setCameraError("Lỗi khởi tạo camera.");
      }
    }, 300);

    return () => {
      clearTimeout(timer);
      if (html5QrcodeScanner && html5QrcodeScanner.isScanning) {
        html5QrcodeScanner.stop().catch(() => {});
      }
    };
  }, [onScanSuccess]);

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (manualBarcode.trim()) {
      onScanSuccess(manualBarcode.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-[2px] flex items-center justify-center z-[999999] p-4">
      <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-[24px] p-5 w-full max-w-[400px] flex flex-col gap-4 shadow-2xl relative">
        <div className="flex justify-between items-center">
          <h3 className="font-extrabold text-base text-[var(--text-color)] flex items-center gap-2 m-0">
            <ScanBarcode className="w-5 h-5 text-primary" /> Quét mã vạch thực phẩm
          </h3>
          <button
            onClick={onClose}
            type="button"
            className="p-1 hover:bg-[var(--bg-color)] rounded-lg text-[var(--text-muted)] cursor-pointer border-0 bg-transparent flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="relative w-full aspect-square bg-black rounded-2xl overflow-hidden flex flex-col items-center justify-center border border-[var(--border-color)]">
          {!cameraError ? (
            <>
              <div id="barcode-reader-viewport" className="w-full h-full" />
              <div className="absolute top-1/2 left-[10%] right-[10%] h-[2px] bg-red-500 shadow-md shadow-red-500/50 animate-pulse z-10" />
            </>
          ) : (
            <div className="p-6 text-center flex flex-col items-center gap-2">
              <CameraOff className="w-8 h-8 text-[var(--text-muted)]" />
              <span className="text-xs font-bold text-[var(--text-muted)]">{cameraError}</span>
            </div>
          )}
        </div>

        <form onSubmit={handleManualSubmit} className="flex flex-col gap-2 border-t border-[var(--border-color)] pt-3">
          <label className="text-[10px] uppercase font-black text-[var(--text-muted)] tracking-wider">
            Hoặc nhập mã vạch bằng tay
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="VD: 8934563138164"
              value={manualBarcode}
              onChange={(e) => setManualBarcode(e.target.value)}
              className="flex-1 h-9 bg-[var(--bg-color)] border border-[var(--border-color)] rounded-xl px-3 text-xs text-[var(--text-color)] outline-none focus:border-primary font-bold"
            />
            <button
              type="submit"
              className="h-9 px-4 bg-primary text-black rounded-xl text-xs font-black hover:bg-primary-hover active:scale-95 transition cursor-pointer border-0"
            >
              Tìm
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default BarcodeScannerModal;
