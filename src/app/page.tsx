"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Header from "@/components/Header";
import PostCard from "@/components/PostCard";
import PostDetailModal from "@/components/PostDetailModal";
import MBTISelector from "@/components/MBTISelector";
import MajorSearch from "@/components/MajorSearch";
import SortToggle from "@/components/SortToggle";
import EmptyState from "@/components/EmptyState";
import type { Post, MbtiType, SortType } from "@/types";
import {
  trackEvent,
  initAnalytics,
  DurationTracker,
  ScrollDepthTracker,
} from "@/lib/analytics/client";

export default function HomePage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [mbti, setMbti] = useState<MbtiType | "">("");
  const [major, setMajor] = useState("");
  const [sort, setSort] = useState<SortType>("hot");
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  const anonymousIdRef = useRef<string>("");
  const durationRef = useRef<DurationTracker | null>(null);
  const scrollRef = useRef<ScrollDepthTracker | null>(null);
  const exposeSetRef = useRef<Set<string>>(new Set());
  const postClickCountRef = useRef(0);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const hasSearchedRef = useRef(false);
  const hasMbtiFilterRef = useRef(false);

  useEffect(() => {
    const { anonymousId } = initAnalytics();
    anonymousIdRef.current = anonymousId;
    trackEvent("home_view", "/");

    durationRef.current = new DurationTracker();
    scrollRef.current = new ScrollDepthTracker();

    return () => {
      if (durationRef.current) {
        durationRef.current.destroy();
        trackEvent("home_leave", "/", {
          duration_ms: durationRef.current.getTotalMs(),
          active_duration_ms: durationRef.current.getActiveMs(),
          max_scroll_depth: scrollRef.current ? scrollRef.current.getMaxDepth() : 0,
          post_expose_count: exposeSetRef.current.size,
          post_click_count: postClickCountRef.current,
          has_search: hasSearchedRef.current,
          has_mbti_filter: hasMbtiFilterRef.current,
          leave_to: "close",
        });
      }
      if (scrollRef.current) scrollRef.current.destroy();
    };
  }, []);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (mbti) params.set("mbti", mbti);
    if (major) params.set("major", major);
    params.set("sort", sort);
    params.set("anonymousId", anonymousIdRef.current);

    try {
      const res = await fetch(`/api/posts?${params}`);
      const data = await res.json();
      const fetchedPosts = data.posts || [];
      setPosts(fetchedPosts);

      // Track search with actual result count
      if (major) {
        trackEvent("search_major", "/", {
          keyword: major,
          result_count: fetchedPosts.length,
          mbti_filter: mbti || null,
        });
      }
    } catch {
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, [mbti, major, sort]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target as HTMLElement;
            const postId = el.dataset.postId;
            const rankStr = el.dataset.rank;
            if (postId && !exposeSetRef.current.has(postId)) {
              exposeSetRef.current.add(postId);
              const post = posts.find((p) => p.id === postId);
              trackEvent("post_card_expose", "/", {
                post_id: postId,
                mbti: post ? post.mbti : undefined,
                major: post ? post.major : undefined,
                identity: post ? post.identity : undefined,
                rank: rankStr ? Number(rankStr) : undefined,
                sort_type: sort,
              });
            }
          }
        });
      },
      { threshold: 0.3 }
    );

    const cards = document.querySelectorAll("[data-post-id]");
    cards.forEach((card) => {
      if (observerRef.current) observerRef.current.observe(card);
    });

    return () => {
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, [posts, sort]);

  const handleMbtiChange = (value: MbtiType | "") => {
    setMbti(value);
    if (value) hasMbtiFilterRef.current = true;
    trackEvent("mbti_filter_change", "/", {
      mbti: value,
      action: value ? "select" : "clear",
    });
  };

  const handleMajorChange = (value: string) => {
    setMajor(value);
    if (value) hasSearchedRef.current = true;
  };

  const handleSortChange = (value: SortType) => {
    setSort(value);
    trackEvent("sort_change", "/", { sort_type: value });
  };

  const handleLike = (postId: string, liked: boolean) => {
    const post = posts.find((p) => p.id === postId);
    trackEvent("like_click", "/", {
      post_id: postId,
      mbti: post ? post.mbti : undefined,
      major: post ? post.major : undefined,
      like_status: liked ? "like" : "unlike",
      is_login: false,
    });

    // Optimistic update
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? {
              ...p,
              liked,
              likeCount: p.likeCount + (liked ? 1 : -1),
            }
          : p
      )
    );

    // Sync selectedPost
    setSelectedPost((prev) =>
      prev && prev.id === postId
        ? {
            ...prev,
            liked,
            likeCount: prev.likeCount + (liked ? 1 : -1),
          }
        : prev
    );

    fetch(`/api/posts/${postId}/like`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ liked, anonymousId: anonymousIdRef.current }),
    }).catch(() => {});
  };

  const handleCardClick = (postId: string) => {
    postClickCountRef.current++;
    const post = posts.find((p) => p.id === postId);
    trackEvent("post_card_click", "/", {
      post_id: postId,
      mbti: post ? post.mbti : undefined,
      major: post ? post.major : undefined,
      identity: post ? post.identity : undefined,
    });
    if (post) setSelectedPost(post);
  };

  const handleCloseModal = () => {
    setSelectedPost(null);
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <Header />

      <section className="max-w-[1280px] mx-auto px-6 md:px-12 pt-12 pb-8">
        <div className="max-w-2xl">
          <h2 className="font-[var(--font-display)] text-2xl md:text-3xl font-semibold text-[var(--color-text)] leading-tight mb-3">
            用 MBTI 找到更像你的学长学姐
          </h2>
          <p className="text-sm md:text-base text-[var(--color-text-secondary)] leading-relaxed">
            看看他们真实的专业体验
          </p>
        </div>
      </section>

      <section className="max-w-[1280px] mx-auto px-6 md:px-12 pb-6">
        <div className="flex flex-wrap items-center gap-3">
          <MBTISelector value={mbti} onChange={handleMbtiChange} />
          <div className="w-48 md:w-64">
            <MajorSearch value={major} onChange={handleMajorChange} />
          </div>
          <div className="ml-auto">
            <SortToggle value={sort} onChange={handleSortChange} />
          </div>
        </div>
      </section>

      <section className="max-w-[1280px] mx-auto px-6 md:px-12 pb-20">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-5 h-5 border-2 border-[var(--color-border)] border-t-[var(--color-accent)] rounded-full animate-spin" />
          </div>
        ) : posts.length === 0 ? (
          <EmptyState
            message={
              mbti || major
                ? "没有找到匹配的内容，试试其他筛选条件"
                : "还没有人分享体验，成为第一个吧"
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {posts.map((post, idx) => (
              <PostCard
                key={post.id}
                post={post}
                rank={idx + 1}
                onLike={handleLike}
                onClick={handleCardClick}
              />
            ))}
          </div>
        )}
      </section>

      {/* Detail Modal */}
      {selectedPost && (
        <PostDetailModal
          post={selectedPost}
          onClose={handleCloseModal}
          onLike={handleLike}
          liked={selectedPost.liked ?? false}
          likeCount={selectedPost.likeCount}
        />
      )}

      <footer className="border-t border-[var(--color-border)] py-8">
        <div className="max-w-[1280px] mx-auto px-6 md:px-12 text-center">
          <p className="text-xs text-[var(--color-text-secondary)]">
            MBTI 选专业 · 用真实体验降低选专业前的信息差
          </p>
          <p className="text-xs text-[var(--color-text-secondary)] mt-1 opacity-60">
            MBTI 不是答案，只是一个了解自己的入口
          </p>
        </div>
      </footer>
    </div>
  );
}
