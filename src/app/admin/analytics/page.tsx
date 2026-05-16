"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface AnalyticsData {
  overview: {
    homeViewCount: number;
    homeUv: number;
    shareClickCount: number;
    publishPageViewCount: number;
    publishSuccessCount: number;
    publishCompletionRate: number;
    newExperienceCount: number;
  };
  consumption: {
    postExposeCount: number;
    postClickCount: number;
    postClickRate: number;
    likeIntentionRate: number;
    avgActiveDuration: number;
  };
  funnel: {
    shareClick: number;
    publishPageView: number;
    publishTextStart: number;
    publishSubmitClick: number;
    publishSuccess: number;
  };
  search: {
    topSearchedMajors: { major: string; count: number }[];
    noResultMajors: { major: string; count: number }[];
    highSearchLowContent: {
      major: string;
      searchCount: number;
      noResultCount: number;
    }[];
  };
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) return `${seconds}秒`;
  const minutes = Math.floor(seconds / 60);
  const remainSeconds = seconds % 60;
  return `${minutes}分${remainSeconds}秒`;
}

function formatFunnelStep(
  current: number,
  previous: number
): { rate: string; overall: string } {
  if (previous === 0) return { rate: "-", overall: "-" };
  const adjacentRate = Math.round((current / previous) * 100);
  return {
    rate: `${adjacentRate}%`,
    overall: "",
  };
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/analytics/stats")
      .then((r) => r.json())
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-[var(--color-border)] border-t-[var(--color-accent)] rounded-full animate-spin" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center">
        <p className="text-sm text-[var(--color-text-secondary)]">
          加载失败
        </p>
      </div>
    );
  }

  const funnelSteps = [
    { label: "分享按钮点击", count: data.funnel.shareClick },
    { label: "进入分享页", count: data.funnel.publishPageView },
    { label: "开始输入正文", count: data.funnel.publishTextStart },
    { label: "点击发布", count: data.funnel.publishSubmitClick },
    { label: "发布成功", count: data.funnel.publishSuccess },
  ];

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      {/* Header */}
      <header className="border-b border-[var(--color-border)] bg-[var(--color-bg)]/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-[1280px] mx-auto px-6 md:px-12 py-4 flex items-center justify-between">
          <div>
            <h1 className="font-[var(--font-display)] text-xl font-semibold text-[var(--color-text)] tracking-wide">
              数据看板
            </h1>
            <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
              /admin/analytics
            </p>
          </div>
          <Link
            href="/"
            className="text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] transition-colors duration-200"
          >
            返回首页
          </Link>
        </div>
      </header>

      <main className="max-w-[1280px] mx-auto px-6 md:px-12 py-8 space-y-10">
        {/* 1. Core Overview */}
        <section>
          <h2 className="text-sm font-medium text-[var(--color-text)] mb-4 flex items-center gap-2">
            <span className="w-1 h-4 bg-[var(--color-accent)] rounded-full inline-block" />
            核心概览
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            <MetricCard label="首页 PV" value={data.overview.homeViewCount} />
            <MetricCard label="首页 UV" value={data.overview.homeUv} />
            <MetricCard
              label="分享按钮点击"
              value={data.overview.shareClickCount}
            />
            <MetricCard
              label="发布页访问"
              value={data.overview.publishPageViewCount}
            />
            <MetricCard
              label="发布成功"
              value={data.overview.publishSuccessCount}
            />
            <MetricCard
              label="发布完成率"
              value={`${data.overview.publishCompletionRate}%`}
            />
            <MetricCard
              label="新增有效体验"
              value={data.overview.newExperienceCount}
            />
          </div>
        </section>

        {/* 2. Content Consumption */}
        <section>
          <h2 className="text-sm font-medium text-[var(--color-text)] mb-4 flex items-center gap-2">
            <span className="w-1 h-4 bg-[var(--color-accent)] rounded-full inline-block" />
            内容消费
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
            <MetricCard
              label="帖子曝光数"
              value={data.consumption.postExposeCount}
            />
            <MetricCard
              label="帖子点击数"
              value={data.consumption.postClickCount}
            />
            <MetricCard
              label="帖子点击率"
              value={`${data.consumption.postClickRate}%`}
            />
            <MetricCard
              label="点赞意向率"
              value={`${data.consumption.likeIntentionRate}%`}
            />
            <MetricCard
              label="平均有效停留"
              value={formatDuration(data.consumption.avgActiveDuration)}
            />
          </div>
        </section>

        {/* 3. Supply Funnel */}
        <section>
          <h2 className="text-sm font-medium text-[var(--color-text)] mb-4 flex items-center gap-2">
            <span className="w-1 h-4 bg-[var(--color-accent)] rounded-full inline-block" />
            内容供给漏斗
          </h2>
          <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg p-6">
            <div className="space-y-3">
              {funnelSteps.map((step, idx) => {
                const prev = idx > 0 ? funnelSteps[idx - 1].count : step.count;
                const { rate } = formatFunnelStep(step.count, prev);
                const maxCount = funnelSteps[0].count || 1;
                const barWidth = Math.max(
                  (step.count / maxCount) * 100,
                  step.count > 0 ? 8 : 2
                );

                return (
                  <div key={step.label} className="flex items-center gap-4">
                    <span className="w-28 text-xs text-[var(--color-text-secondary)] shrink-0 text-right">
                      {step.label}
                    </span>
                    <div className="flex-1 h-7 bg-[var(--color-bg)] rounded overflow-hidden relative">
                      <div
                        className="h-full bg-[var(--color-accent)]/20 rounded transition-all duration-500"
                        style={{ width: `${barWidth}%` }}
                      />
                      <span className="absolute inset-0 flex items-center px-2 text-xs text-[var(--color-text)]">
                        {step.count}
                      </span>
                    </div>
                    <span className="w-16 text-xs text-[var(--color-text-secondary)] text-right">
                      {idx > 0 ? rate : "100%"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 4. Content Gap Analysis */}
        <section>
          <h2 className="text-sm font-medium text-[var(--color-text)] mb-4 flex items-center gap-2">
            <span className="w-1 h-4 bg-[var(--color-accent)] rounded-full inline-block" />
            内容缺口分析
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Top searched majors */}
            <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg p-5">
              <h3 className="text-xs font-medium text-[var(--color-text)] mb-3">
                搜索最多的专业
              </h3>
              {data.search.topSearchedMajors.length === 0 ? (
                <p className="text-xs text-[var(--color-text-secondary)]">
                  暂无数据
                </p>
              ) : (
                <div className="space-y-2">
                  {data.search.topSearchedMajors.map((m, i) => (
                    <div
                      key={m.major}
                      className="flex items-center justify-between"
                    >
                      <span className="text-xs text-[var(--color-text)]">
                        <span className="text-[var(--color-text-secondary)] mr-1.5">
                          {i + 1}.
                        </span>
                        {m.major}
                      </span>
                      <span className="text-xs text-[var(--color-text-secondary)]">
                        {m.count}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* No result majors */}
            <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg p-5">
              <h3 className="text-xs font-medium text-[var(--color-text)] mb-3">
                搜索无结果专业
              </h3>
              {data.search.noResultMajors.length === 0 ? (
                <p className="text-xs text-[var(--color-text-secondary)]">
                  暂无数据
                </p>
              ) : (
                <div className="space-y-2">
                  {data.search.noResultMajors.map((m, i) => (
                    <div
                      key={m.major}
                      className="flex items-center justify-between"
                    >
                      <span className="text-xs text-[var(--color-text)]">
                        <span className="text-[var(--color-text-secondary)] mr-1.5">
                          {i + 1}.
                        </span>
                        {m.major}
                      </span>
                      <span className="text-xs text-red-400">{m.count} 次</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* High search low content */}
            <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg p-5">
              <h3 className="text-xs font-medium text-[var(--color-text)] mb-3">
                高搜索低内容专业
              </h3>
              {data.search.highSearchLowContent.length === 0 ? (
                <p className="text-xs text-[var(--color-text-secondary)]">
                  暂无数据
                </p>
              ) : (
                <div className="space-y-2">
                  {data.search.highSearchLowContent.map((m) => (
                    <div key={m.major} className="flex items-center justify-between">
                      <span className="text-xs text-[var(--color-text)]">
                        {m.major}
                      </span>
                      <span className="text-xs text-[var(--color-text-secondary)]">
                        搜索 {m.searchCount} / 无结果 {m.noResultCount}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Legend */}
        <section className="border-t border-[var(--color-border)] pt-6">
          <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
            <strong>指标说明：</strong>
            帖子点击率 = 帖子点击数 / 帖子曝光数 ·
            点赞意向率 = 点赞点击数 / 帖子点击数 ·
            发布完成率 = 发布成功数 / 发布页访问数 ·
            有效停留时长仅统计页面处于前台状态的时间
          </p>
        </section>
      </main>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg p-4">
      <p className="text-xs text-[var(--color-text-secondary)] mb-1">
        {label}
      </p>
      <p className="text-lg font-[var(--font-display)] font-semibold text-[var(--color-text)]">
        {value}
      </p>
    </div>
  );
}
