"use client";

import Link from "next/link";

export default function Header() {
  return (
    <header className="border-b border-[var(--color-border)] bg-[var(--color-bg)]/80 backdrop-blur-sm sticky top-0 z-40">
      <div className="max-w-[1280px] mx-auto px-6 md:px-12 py-4 flex items-center justify-between">
        <Link href="/" className="group">
          <h1 className="font-[var(--font-display)] text-xl md:text-2xl font-semibold text-[var(--color-text)] tracking-wide group-hover:text-[var(--color-accent)] transition-colors duration-200">
            MBTI 选专业
          </h1>
        </Link>
        <Link
          href="/share"
          className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-accent)] text-white text-xs rounded-md hover:bg-[var(--color-accent-hover)] transition-colors duration-200"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
          分享我的体验
        </Link>
      </div>
    </header>
  );
}
