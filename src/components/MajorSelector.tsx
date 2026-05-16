"use client";

import { useState, useRef, useEffect } from "react";
import { searchMajors } from "@/lib/data/majors";

interface MajorSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const POPULAR_MAJORS = [
  "计算机科学与技术", "软件工程", "人工智能", "数据科学与大数据技术",
  "金融学", "经济学", "会计学", "工商管理",
  "临床医学", "口腔医学", "护理学",
  "法学", "知识产权",
  "汉语言文学", "新闻学", "传播学", "英语",
  "数学与应用数学", "物理学", "化学",
  "心理学", "教育学", "学前教育",
  "电气工程及其自动化", "电子信息工程", "通信工程",
  "土木工程", "建筑学", "城乡规划",
  "机械工程", "车辆工程",
  "视觉传达设计", "环境设计",
];

export default function MajorSelector({ value, onChange }: MajorSelectorProps) {
  const [searchText, setSearchText] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setShowDropdown(false);
        setSearchText("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const results = searchText.trim() ? searchMajors(searchText, 10) : [];

  const handleSelect = (major: string) => {
    onChange(major);
    setSearchText("");
    setShowDropdown(false);
  };

  const handleClear = () => {
    onChange("");
    setSearchText("");
  };

  return (
    <div ref={ref}>
      {/* Selected value display */}
      {value ? (
        <div className="flex items-center gap-2 px-3 py-2.5 bg-[var(--color-card)] border border-[var(--color-accent)] rounded-md">
          <span className="flex-1 text-sm text-[var(--color-text)]">
            {value}
          </span>
          <button
            type="button"
            onClick={handleClear}
            className="shrink-0 text-[var(--color-text-secondary)] hover:text-[var(--color-text)] cursor-pointer"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      ) : (
        /* Search input */
        <div className="relative">
          <input
            type="text"
            placeholder="输入关键词检索专业"
            value={searchText}
            onChange={(e) => {
              setSearchText(e.target.value);
              setShowDropdown(true);
            }}
            onFocus={() => setShowDropdown(true)}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                setShowDropdown(false);
                setSearchText("");
              }
            }}
            className="w-full px-3 py-2.5 bg-[var(--color-card)] border border-[var(--color-border)] rounded-md text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-secondary)] focus:border-[var(--color-accent)] outline-none transition-colors duration-200"
          />

          {showDropdown && (
            <div className="absolute left-0 right-0 top-full mt-1 z-50 bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg shadow-md max-h-[280px] overflow-y-auto">
              {searchText.trim() ? (
                results.length > 0 ? (
                  <div className="py-1">
                    {results.map((m) => (
                      <button
                        key={m}
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => handleSelect(m)}
                        className="w-full text-left px-4 py-2 text-sm text-[var(--color-text)] hover:bg-[var(--color-accent-light)] transition-colors duration-100 cursor-pointer"
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="px-4 py-6 text-center">
                    <p className="text-sm text-[var(--color-text-secondary)]">
                      未找到「{searchText}」相关专业
                    </p>
                  </div>
                )
              ) : (
                <div className="py-2">
                  <p className="px-4 pb-2 text-xs text-[var(--color-text-secondary)]">
                    热门专业
                  </p>
                  {POPULAR_MAJORS.map((m) => (
                    <button
                      key={m}
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => handleSelect(m)}
                      className="w-full text-left px-4 py-2 text-sm text-[var(--color-text)] hover:bg-[var(--color-accent-light)] transition-colors duration-100 cursor-pointer"
                    >
                      {m}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
