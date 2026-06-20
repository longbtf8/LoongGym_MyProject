import { useState } from "react";

export default function PostContent({ text }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const limit = 250;

  if (text.length <= limit) {
    return (
      <p className="text-sm font-semibold text-[var(--text-color)] leading-relaxed whitespace-pre-wrap">
        {text}
      </p>
    );
  }

  return (
    <p className="text-sm font-semibold text-[var(--text-color)] leading-relaxed whitespace-pre-wrap">
      {isExpanded ? text : `${text.slice(0, limit)}... `}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="text-primary hover:underline font-bold text-xs inline-block ml-1 cursor-pointer bg-transparent border-0 p-0"
      >
        {isExpanded ? "Thu gọn" : "Xem thêm"}
      </button>
    </p>
  );
}

