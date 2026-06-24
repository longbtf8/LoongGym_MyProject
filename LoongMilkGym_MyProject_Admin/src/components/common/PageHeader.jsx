import React from "react";

export default function PageHeader({ title, description, actions }) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h2 className="text-2xl font-black tracking-tight text-[var(--text-color)]">{title}</h2>
        {description && (
          <p className="text-xs sm:text-sm text-[var(--text-muted)] font-semibold mt-1">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="w-full sm:w-auto flex gap-3">{actions}</div>}
    </div>
  );
}
