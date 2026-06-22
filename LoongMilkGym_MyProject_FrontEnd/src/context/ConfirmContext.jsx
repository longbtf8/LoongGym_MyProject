import React, { createContext, useContext, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, HelpCircle, Info, CheckCircle2 } from "lucide-react";

const ConfirmContext = createContext(null);

export function ConfirmProvider({ children }) {
  const [modalState, setModalState] = useState({
    isOpen: false,
    title: "",
    message: "",
    confirmText: "Đồng ý",
    cancelText: "Hủy",
    type: "danger", // 'danger' | 'warning' | 'info' | 'success'
    resolve: null,
  });

  const confirm = useCallback(({ title, message, confirmText = "Đồng ý", cancelText = "Hủy", type = "danger" }) => {
    return new Promise((resolve) => {
      setModalState({
        isOpen: true,
        title,
        message,
        confirmText,
        cancelText,
        type,
        resolve,
      });
    });
  }, []);

  const handleConfirm = () => {
    if (modalState.resolve) {
      modalState.resolve(true);
    }
    setModalState((prev) => ({ ...prev, isOpen: false }));
  };

  const handleCancel = () => {
    if (modalState.resolve) {
      modalState.resolve(false);
    }
    setModalState((prev) => ({ ...prev, isOpen: false }));
  };

  // Helper to render icon based on type
  const renderIcon = () => {
    switch (modalState.type) {
      case "danger":
        return (
          <div className="w-12 h-12 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500 mb-4 border border-rose-500/20">
            <AlertTriangle className="w-6 h-6" />
          </div>
        );
      case "warning":
        return (
          <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 mb-4 border border-amber-500/20">
            <AlertTriangle className="w-6 h-6" />
          </div>
        );
      case "info":
        return (
          <div className="w-12 h-12 rounded-full bg-sky-500/10 flex items-center justify-center text-sky-500 mb-4 border border-sky-500/20">
            <Info className="w-6 h-6" />
          </div>
        );
      case "success":
        return (
          <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-4 border border-emerald-500/20">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        );
      default:
        return (
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4 border border-primary/20">
            <HelpCircle className="w-6 h-6" />
          </div>
        );
    }
  };

  // Helper to render confirm button class based on type
  const getConfirmButtonClass = () => {
    switch (modalState.type) {
      case "danger":
        return "flex-1 py-2.5 px-4 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-extrabold transition-all cursor-pointer shadow-md";
      case "warning":
        return "flex-1 py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-extrabold transition-all cursor-pointer shadow-md";
      case "info":
        return "flex-1 py-2.5 px-4 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-extrabold transition-all cursor-pointer shadow-md";
      case "success":
        return "flex-1 py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-extrabold transition-all cursor-pointer shadow-md";
      default:
        return "flex-1 py-2.5 px-4 rounded-xl bg-primary text-black hover:bg-primary-hover text-xs font-extrabold transition-all cursor-pointer shadow-md";
    }
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {modalState.isOpen && createPortal(
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[9999999] flex items-center justify-center p-4"
          onClick={handleCancel}
        >
          <div 
            className="bg-[var(--bg-secondary)] border border-[var(--border-color)]/80 max-w-sm w-full rounded-2xl p-6 shadow-2xl flex flex-col items-center text-center"
            onClick={(e) => e.stopPropagation()}
            style={{
              animation: "reactionsIn 0.2s cubic-bezier(0.34, 1.56, 0.64, 1) forwards"
            }}
          >
            {/* Icon */}
            {renderIcon()}

            {/* Content */}
            <h3 className="text-lg font-black text-[var(--text-color)]">
              {modalState.title}
            </h3>
            <p className="text-sm text-[var(--text-muted)] font-semibold mt-2 leading-relaxed">
              {modalState.message}
            </p>

            {/* Buttons */}
            <div className="flex gap-3 w-full mt-6">
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 py-2.5 px-4 rounded-xl border border-[var(--border-color)] text-xs font-bold text-[var(--text-color)] hover:bg-[var(--border-color)]/25 transition-all cursor-pointer"
              >
                {modalState.cancelText}
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className={getConfirmButtonClass()}
              >
                {modalState.confirmText}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error("useConfirm must be used within a ConfirmProvider");
  }
  return context;
}
