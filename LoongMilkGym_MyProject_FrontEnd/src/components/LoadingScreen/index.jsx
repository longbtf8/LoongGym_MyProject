import React from "react";

/**
 * Component LoadingScreen cao cấp với hiệu ứng xoay Neon Gradient
 * Dùng làm fallback cho React Suspense khi tải lazy-load các trang.
 */
function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[var(--bg-color)] transition-all duration-300">
      
      {/* Container vòng xoay neon */}
      <div className="relative w-20 h-20 flex items-center justify-center">
        
        {/* Glow ở nền */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-primary to-[#00f5d4] opacity-20 blur-md animate-pulse" />
        
        {/* Vòng xoay ngoài */}
        <div className="w-16 h-16 rounded-full border-4 border-transparent border-t-primary border-r-[#00f5d4] animate-spin" />
        
        {/* Vòng xoay trong nghịch hướng */}
        <div className="absolute w-10 h-10 rounded-full border-4 border-transparent border-b-primary border-l-[#00f5d4] animate-spin-reverse" />
      </div>

      {/* Label thương hiệu chuyển màu */}
      <h2 className="mt-6 text-lg font-black tracking-widest uppercase m-0 flex items-center">
        <span className="text-primary">Loong</span>
        <span className="text-[var(--text-color)]">Milk</span>
        <span className="text-[#00f5d4]">Gym</span>
      </h2>
      
      <p className="mt-2 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] animate-pulse">
        Đang tải trang...
      </p>

      {/* Tách style inline cho spin-reverse nếu cần thiết */}
      <style>{`
        @keyframes spin-reverse {
          0% { transform: rotate(360deg); }
          100% { transform: rotate(0deg); }
        }
        .animate-spin-reverse {
          animation: spin-reverse 1s linear infinite;
        }
      `}</style>
    </div>
  );
}

export default LoadingScreen;
