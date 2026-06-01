import React from "react";
import { Flame } from "lucide-react";

function PlaceholderSection({ title }) {
  return (
    <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-3xl p-12 text-center shadow-sm animate-slide-down">
      <div className="w-16 h-16 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center justify-center mx-auto mb-4 animate-pulse">
        <Flame className="w-8 h-8" />
      </div>
      <h3 className="text-xl font-extrabold text-[var(--text-color)] mb-2 m-0">
        Tính năng {title}
      </h3>
      <p className="text-sm text-[var(--text-muted)] max-w-sm mx-auto m-0 leading-relaxed font-medium">
        Hệ thống đang đồng bộ dữ liệu tập luyện của bạn. Tính năng {title} cao cấp sẽ sẵn sàng trong vài giây tới.
      </p>
    </div>
  );
}

export default PlaceholderSection;
