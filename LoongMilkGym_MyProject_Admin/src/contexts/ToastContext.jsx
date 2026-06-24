import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from "react";
import Toast from "@/components/common/Toast";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const timerRef = useRef(null);

  const hideToast = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    setToast((prev) => ({ ...prev, show: false }));
  }, []);

  const showToast = useCallback((message, type = "success") => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    setToast({ show: true, message, type });
    timerRef.current = setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 3000);
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return (
    <ToastContext.Provider value={{ toast, showToast, hideToast }}>
      {children}
      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={hideToast}
      />
    </ToastContext.Provider>
  );
}

export function useToastContext() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToastContext must be used within ToastProvider");
  }
  return ctx;
}
