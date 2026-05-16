"use client";

import { SCORE_LABELS, CORE_SCORE_KEYS } from "@/types";
import type { PostScores } from "@/types";

interface ScoreInputProps {
  scores: Partial<PostScores>;
  onChange: (scores: Partial<PostScores>) => void;
}

const ALL_SCORE_KEYS = Object.keys(SCORE_LABELS) as (keyof PostScores)[];

export default function ScoreInput({ scores, onChange }: ScoreInputProps) {
  const handleClick = (key: keyof PostScores, value: number) => {
    onChange({ ...scores, [key]: value });
  };

  return (
    <div className="space-y-4">
      {ALL_SCORE_KEYS.map((key) => {
        const current = scores[key] || 0;
        const isCore = CORE_SCORE_KEYS.includes(key);
        return (
          <div key={key} className="flex items-center gap-4">
            <span
              className={`w-24 text-sm shrink-0 ${
                isCore
                  ? "text-[var(--color-text)]"
                  : "text-[var(--color-text-secondary)]"
              }`}
            >
              {SCORE_LABELS[key]}
              {isCore && <span className="text-[var(--color-accent)] ml-0.5">*</span>}
            </span>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => handleClick(key, v)}
                  className={`w-8 h-8 rounded-md text-xs font-[var(--font-display)] transition-all duration-150 cursor-pointer ${
                    current === v
                      ? "bg-[var(--color-accent)] text-white"
                      : "bg-[var(--color-card)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-accent)]"
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
            {current > 0 && (
              <span className="text-xs text-[var(--color-text-secondary)]">
                {current}/5
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
