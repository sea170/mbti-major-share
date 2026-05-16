"use client";

import { useState, useRef, useEffect } from "react";
import { MBTI_TYPES } from "@/types";
import type { MbtiType } from "@/types";

interface MBTISelectorProps {
  value: MbtiType | "";
  onChange: (value: MbtiType | "") => void;
}

export default function MBTISelector({ value, onChange }: MBTISelectorProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 bg-[var(--color-card)] border border-[var(--color-border)] rounded-md text-sm text-[var(--color-text)] hover:border-[var(--color-accent)] transition-colors duration-200 cursor-pointer min-w-[120px]"
      >
        <span className="font-[var(--font-display)] tracking-wider">
          {value || "MBTI"}
        </span>
        <svg
          className={`w-3.5 h-3.5 ml-auto text-[var(--color-text-secondary)] transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 z-50 bg-[var(--color-card)] border border-[var(--color-border)] rounded-md shadow-sm p-2 w-[280px]">
          {value && (
            <button
              onClick={() => {
                onChange("");
                setOpen(false);
              }}
              className="w-full text-left px-2 py-1.5 text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] hover:bg-[var(--color-accent-light)] rounded transition-colors duration-150 mb-1 cursor-pointer"
            >
              清除筛选
            </button>
          )}
          <div className="grid grid-cols-4 gap-1">
            {MBTI_TYPES.map((t) => (
              <button
                key={t}
                onClick={() => {
                  onChange(t);
                  setOpen(false);
                }}
                className={`px-2 py-1.5 text-xs font-[var(--font-display)] tracking-wider rounded transition-colors duration-150 cursor-pointer ${
                  value === t
                    ? "bg-[var(--color-accent)] text-white"
                    : "text-[var(--color-text)] hover:bg-[var(--color-accent-light)]"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
