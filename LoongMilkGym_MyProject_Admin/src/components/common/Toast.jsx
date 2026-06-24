import React, { useEffect } from "react";
import { CheckCircle2, AlertCircle, AlertTriangle, Info } from "lucide-react";

export default function Toast({ show, message, type = "success", onClose }) {
  useEffect(() => {
    if (show && onClose) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show) return null;

  const getToastStyles = () => {
    switch (type) {
      case "success":
        return {
          bg: "bg-emerald-600 text-white border-emerald-400/50 ring-emerald-300/20",
          icon: <CheckCircle2 className="w-5 h-5 text-white" />,
        };
      case "error":
        return {
          bg: "bg-rose-600 text-white border-rose-400/50 ring-rose-300/20",
          icon: <AlertCircle className="w-5 h-5 text-white" />,
        };
      case "warning":
        return {
          bg: "bg-amber-500 text-white border-amber-300/50 ring-amber-200/20",
          icon: <AlertTriangle className="w-5 h-5 text-white" />,
        };
      default:
        return {
          bg: "bg-sky-600 text-white border-sky-400/50 ring-sky-300/20",
          icon: <Info className="w-5 h-5 text-white" />,
        };
    }
  };

  const styles = getToastStyles();

  return (
    <div
      className={`fixed top-16 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-3 px-5 py-3.5 rounded-2xl border shadow-2xl ring-2 animate-scale-up min-w-[280px] max-w-[90vw] ${styles.bg}`}
      role="alert"
    >
      {styles.icon}
      <span className="text-sm font-extrabold leading-snug">{message}</span>
    </div>
  );
}
