"use client";

import { useState, useRef, useEffect } from "react";
import { searchMajors, MAJOR_DIRECTORY } from "@/lib/data/majors";

interface MajorSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export default function MajorSearch({ value, onChange }: MajorSearchProps) {
  const [inputValue, setInputValue] = useState(value);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const matchedMajors = inputValue.trim()
    ? searchMajors(inputValue, 12)
    : [];

  // Show popular categories when no input
  const showCategories = showSuggestions && !inputValue.trim();

  const handleSelect = (major: string) => {
    setInputValue(major);
    onChange(major);
    setShowSuggestions(false);
  };

  const handleClear = () => {
    setInputValue("");
    onChange("");
    setShowSuggestions(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      onChange(inputValue);
      setShowSuggestions(false);
    }
  };

  return (
    <div className="relative" ref={ref}>
      <div className="flex items-center gap-2 px-3 py-2 bg-[var(--color-card)] border border-[var(--color-border)] rounded-full focus-within:border-[var(--color-accent)] transition-colors duration-200">
        <svg
          className="w-3.5 h-3.5 text-[var(--color-text-secondary)] shrink-0"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        <input
          type="text"
          placeholder="搜索专业"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          onKeyDown={handleKeyDown}
          className="w-full min-w-0 bg-transparent text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-secondary)] outline-none"
        />
        {inputValue && (
          <button
            onClick={handleClear}
            className="shrink-0 text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors cursor-pointer"
          >
            <svg
              className="w-3.5 h-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {showSuggestions && (
        <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 z-50 bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl shadow-md w-[320px] max-h-[320px] overflow-y-auto">
          {inputValue.trim() ? (
            // Search results
            <div className="p-2">
              {matchedMajors.length === 0 ? (
                <div className="px-3 py-4 text-center">
                  <p className="text-xs text-[var(--color-text-secondary)]">
                    未找到「{inputValue}」相关专业
                  </p>
                  <p className="text-xs text-[var(--color-text-secondary)] mt-1 opacity-60">
                    按回车搜索帖子内容
                  </p>
                </div>
              ) : (
                <div className="space-y-0.5">
                  {matchedMajors.map((m) => (
                    <button
                      key={m}
                      onClick={() => handleSelect(m)}
                      className="w-full text-left px-3 py-2 text-xs text-[var(--color-text)] hover:bg-[var(--color-accent-light)] rounded-lg transition-colors duration-150 cursor-pointer"
                    >
                      {m}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            // Category browse
            <div className="p-3">
              <p className="text-xs text-[var(--color-text-secondary)] mb-2 px-1">
                热门专业
              </p>
              {MAJOR_DIRECTORY.slice(0, 6).map((cat) => (
                <div key={cat.name} className="mb-2">
                  <p className="text-xs text-[var(--color-accent)] font-medium px-1 mb-1">
                    {cat.name}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {cat.majors.slice(0, 8).map((m) => (
                      <button
                        key={m}
                        onClick={() => handleSelect(m)}
                        className="px-2 py-1 text-xs text-[var(--color-text)] bg-[var(--color-bg)] hover:bg-[var(--color-accent-light)] rounded-md transition-colors duration-150 cursor-pointer"
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
