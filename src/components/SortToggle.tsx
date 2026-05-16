"use client";

import type { SortType } from "@/types";

interface SortToggleProps {
  value: SortType;
  onChange: (value: SortType) => void;
}

export default function SortToggle({ value, onChange }: SortToggleProps) {
  return (
    <div className="flex items-center bg-[var(--color-card)] border border-[var(--color-border)] rounded-md overflow-hidden">
      <button
        onClick={() => onChange("hot")}
        className={`px-3 py-1.5 text-xs transition-colors duration-200 cursor-pointer ${
          value === "hot"
            ? "bg-[var(--color-accent)] text-white"
            : "text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
        }`}
      >
        最热
      </button>
      <button
        onClick={() => onChange("latest")}
        className={`px-3 py-1.5 text-xs transition-colors duration-200 cursor-pointer ${
          value === "latest"
            ? "bg-[var(--color-accent)] text-white"
            : "text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
        }`}
      >
        最新
      </button>
    </div>
  );
}
