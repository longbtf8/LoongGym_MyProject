import React from "react";

export default function StatusBadge({ status, type = "success" }) {
  const styles = {
    success: "bg-emerald-500/10 text-emerald-500",
    warning: "bg-amber-500/10 text-amber-500",
    error: "bg-rose-500/10 text-rose-500",
    info: "bg-blue-500/10 text-blue-500",
    neutral: "bg-gray-500/10 text-gray-500",
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${styles[type] || styles.neutral}`}>
      {status}
    </span>
  );
}
