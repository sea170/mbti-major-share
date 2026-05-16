export default function EmptyState({ message }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <svg
        className="w-12 h-12 text-[var(--color-border)] mb-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
      >
        <path d="M9 12h.01M15 12h.01M12 16h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <p className="text-sm text-[var(--color-text-secondary)]">
        {message || "暂无相关内容"}
      </p>
      <p className="text-xs text-[var(--color-text-secondary)] mt-1 opacity-70">
        试试其他筛选条件，或者成为第一个分享的人
      </p>
    </div>
  );
}
