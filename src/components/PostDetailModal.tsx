"use client";

import { useEffect, useRef } from "react";
import type { Post } from "@/types";
import { SCORE_LABELS } from "@/types";
import ScoreBar from "./ScoreBar";
import { formatDate } from "@/lib/utils";

interface PostDetailModalProps {
  post: Post;
  onClose: () => void;
  onLike?: (id: string, liked: boolean) => void;
  liked?: boolean;
  likeCount?: number;
}

export default function PostDetailModal({
  post,
  onClose,
  onLike,
  liked = false,
  likeCount,
}: PostDetailModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const currentLikes = likeCount ?? post.likeCount;

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEsc);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  const allScoreKeys = Object.keys(SCORE_LABELS) as (keyof typeof post.scores)[];

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8"
      style={{ backgroundColor: "rgba(31, 27, 24, 0.4)", backdropFilter: "blur(2px)" }}
    >
      <article
        className="relative w-full max-w-[640px] max-h-[85vh] overflow-y-auto bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg shadow-lg"
        style={{ animation: "modalIn 200ms ease-out" }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg)] transition-colors duration-150 cursor-pointer z-10"
          aria-label="关闭"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>

        <div className="p-6 md:p-8">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <span className="text-sm font-medium text-[var(--color-accent)] bg-[var(--color-accent-light)] px-2.5 py-1 rounded">
                {post.identity}
              </span>
              <span className="text-sm font-[var(--font-display)] font-semibold text-[var(--color-text)] tracking-wider">
                {post.mbti}
              </span>
            </div>
            <span className="text-xs text-[var(--color-text-secondary)]">
              {formatDate(post.createdAt)}
            </span>
          </div>

          {/* Major & School */}
          <div className="mb-5">
            <h2 className="text-lg font-medium text-[var(--color-text)]">
              {post.major}
            </h2>
            {post.school && (
              <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                {post.school}
                {post.grade ? ` · ${post.grade}` : ""}
              </p>
            )}
          </div>

          {/* Divider */}
          <div className="h-px bg-[var(--color-border)] mb-5" />

          {/* Full content */}
          <div className="mb-6">
            <p className="text-sm text-[var(--color-text)] leading-[1.8] whitespace-pre-wrap">
              {post.content}
            </p>
          </div>

          {/* Divider */}
          <div className="h-px bg-[var(--color-border)] mb-5" />

          {/* All scores */}
          <div className="mb-6">
            <h3 className="text-xs font-medium text-[var(--color-text)] mb-3 tracking-wide">
              体验指数
            </h3>
            <div className="space-y-2">
              {allScoreKeys.map((key) => {
                const val = post.scores[key];
                if (val === undefined) return null;
                return (
                  <ScoreBar
                    key={key}
                    label={SCORE_LABELS[key]}
                    value={val}
                  />
                );
              })}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-[var(--color-border)]">
            <button
              onClick={() => onLike?.(post.id, !liked)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-all duration-200 cursor-pointer ${
                liked
                  ? "text-[var(--color-accent)] bg-[var(--color-accent-light)]"
                  : "text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] hover:bg-[var(--color-accent-light)]"
              }`}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill={liked ? "currentColor" : "none"}
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
              <span>{currentLikes}</span>
            </button>
            <span className="text-xs text-[var(--color-text-secondary)]">
              {post.identity} · {post.mbti} · {post.major}
            </span>
          </div>
        </div>
      </article>

      <style jsx>{`
        @keyframes modalIn {
          from {
            opacity: 0;
            transform: translateY(12px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
}
