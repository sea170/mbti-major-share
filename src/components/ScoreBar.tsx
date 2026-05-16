"use client";

interface ScoreBarProps {
  label: string;
  value: number;
  max?: number;
}

export default function ScoreBar({ label, value, max = 5 }: ScoreBarProps) {
  const pct = Math.round((value / max) * 100);
  return (
    <div className="flex items-center gap-3">
      <span className="w-20 text-xs text-[var(--color-text-secondary)] shrink-0 text-right">
        {label}
      </span>
      <div className="flex-1 h-1.5 bg-[var(--color-border)] rounded-full overflow-hidden">
        <div
          className="h-full bg-[var(--color-accent)] rounded-full transition-all duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-6 text-xs text-[var(--color-text-secondary)] text-right font-[var(--font-display)]">
        {value}
      </span>
    </div>
  );
}
