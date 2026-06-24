import React from "react";

export default function LoadingScreen() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-[var(--bg-color)]">
      <div className="w-10 h-10 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}
