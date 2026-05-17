"use client";

import type { Post } from "@/types";
import { CORE_SCORE_KEYS, SCORE_LABELS } from "@/types";
import ScoreBar from "./ScoreBar";
import { formatDate } from "@/lib/utils";

interface PostCardProps {
  post: Post;
  onLike?: (id: string, liked: boolean) => void;
  onClick?: (id: string) => void;
  rank?: number;
}

export default function PostCard({ post, onLike, onClick, rank }: PostCardProps) {
  const liked = post.liked ?? false;

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    onLike?.(post.id, !liked);
  };

  const handleCardClick = () => {
    onClick?.(post.id);
  };

  return (
    <article
      onClick={handleCardClick}
      className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm cursor-pointer flex flex-col h-[380px]"
      data-post-id={post.id}
      data-rank={rank}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-[var(--color-accent)] bg-[var(--color-accent-light)] px-2 py-0.5 rounded">
            {post.identity}
          </span>
          <span className="text-xs font-[var(--font-display)] font-semibold text-[var(--color-text)] tracking-wider">
            {post.mbti}
          </span>
        </div>
        <span className="text-xs text-[var(--color-text-secondary)]">
          {formatDate(post.createdAt)}
        </span>
      </div>

      {/* Major & School */}
      <div className="mb-2 shrink-0">
        <h3 className="text-sm font-medium text-[var(--color-text)]">
          {post.major}
        </h3>
        {post.school && (
          <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
            {post.school}
            {post.grade ? ` · ${post.grade}` : ""}
          </p>
        )}
      </div>

      {/* Content preview - 5 lines max with ellipsis */}
      <p className="content-clamp text-sm text-[var(--color-text)] leading-relaxed mb-4 flex-1 min-h-0">
        {post.content}
      </p>

      {/* Scores */}
      <div className="space-y-1.5 mb-4 shrink-0">
        {CORE_SCORE_KEYS.map((key) => (
          <ScoreBar
            key={key}
            label={SCORE_LABELS[key]}
            value={post.scores[key] ?? 0}
          />
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-[var(--color-border)] shrink-0">
        <button
          onClick={handleLike}
          className={`flex items-center gap-1.5 text-xs transition-all duration-200 cursor-pointer ${
            liked
              ? "text-[var(--color-accent)]"
              : "text-[var(--color-text-secondary)] hover:text-[var(--color-accent)]"
          }`}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill={liked ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
          <span>{post.likeCount}</span>
        </button>
        <span className="text-xs text-[var(--color-text-secondary)] italic opacity-60">
          点击查看详情
        </span>
      </div>
    </article>
  );
}
