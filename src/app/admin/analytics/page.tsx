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
    publishableCount: number;
    validCount: number;
    highQualityCount: number;
  };
  consumption: {
    postExposeCount: number;
    postClickCount: number;
    postClickRate: number;
    likeIntentionRate: number;
    avgActiveDuration: number;
    mbtiFilterRate: number;
    mbtiFilterUv: number;
    detailReadCount: number;
    effectiveReadCount: number;
    effectiveReadRate: number;
  };
  funnel: {
    shareClick: number;
    publishPageView: number;
    publishTextStart: number;
    publishSubmitClick: number;
    publishSuccess: number;
    textStartRate: number;
    avgWordCount: number;
    avgWritingDuration: number;
    avgScoreFillRate: number;
  };
  search: {
    totalSearchCount: number;
    noResultRate: number;
    topSearchedMajors: { major: string; count: number }[];
    noResultMajors: { major: string; count: number }[];
    highSearchLowContent: {
      major: string;
      searchCount: number;
      noResultCount: number;
    }[];
    mbtiMajorGap: Record<string, Record<string, number>>;
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
): string {
  if (previous === 0) return "-";
  return `${Math.round((current / previous) * 100)}%`;
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchData = () => {
    fetch("/api/analytics/stats")
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLastUpdated(new Date());
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
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

  const mbtiEntries = Object.entries(data.search.mbtiMajorGap)
    .sort(([, a], [, b]) => {
      const sumA = Object.values(a).reduce((s, v) => s + v, 0);
      const sumB = Object.values(b).reduce((s, v) => s + v, 0);
      return sumB - sumA;
    })
    .slice(0, 8);

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
              {lastUpdated
                ? `更新于 ${lastUpdated.toLocaleTimeString("zh-CN")} · 每 15 秒自动刷新`
                : "加载中…"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchData}
              className="text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] transition-colors duration-200 cursor-pointer"
            >
              刷新
            </button>
            <Link
              href="/"
              className="text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] transition-colors duration-200"
            >
              返回首页
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-[1280px] mx-auto px-6 md:px-12 py-8 space-y-10">
        {/* 1. Core Overview */}
        <section>
          <SectionHeader title="核心概览" />
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
            <MetricCard label="首页 PV" value={data.overview.homeViewCount} />
            <MetricCard label="首页 UV" value={data.overview.homeUv} />
            <MetricCard
              label="分享按钮点击"
              value={data.overview.shareClickCount}
            />
            <MetricCard
              label="发布成功"
              value={data.overview.publishSuccessCount}
            />
            <MetricCard
              label="发布完成率"
              value={`${data.overview.publishCompletionRate}%`}
              highlight
            />
          </div>

          {/* Content quality tiers */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
            <QualityCard
              label="可发布体验"
              count={data.overview.publishableCount}
              desc="正文 + MBTI + 专业 + 身份 + ≥3 个指数"
              color="var(--color-text-secondary)"
            />
            <QualityCard
              label="基础有效体验 ★"
              count={data.overview.validCount}
              desc="可发布 + 正文 ≥50 字"
              color="var(--color-accent)"
            />
            <QualityCard
              label="高质量体验"
              count={data.overview.highQualityCount}
              desc="有效 + 正文 ≥150 字 + 用户反馈信号"
              color="#b8860b"
            />
          </div>
        </section>

        {/* 2. Content Consumption */}
        <section>
          <SectionHeader title="内容消费" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
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
              highlight
            />
            <MetricCard
              label="点赞意向率"
              value={`${data.consumption.likeIntentionRate}%`}
            />
            <MetricCard
              label="平均有效停留"
              value={formatDuration(data.consumption.avgActiveDuration)}
            />
            <MetricCard
              label="MBTI 筛选使用率"
              value={`${data.consumption.mbtiFilterRate}%`}
              highlight
              sub={`${data.consumption.mbtiFilterUv} / ${data.overview.homeUv} UV`}
            />
          </div>

          {/* Detail reading */}
          <div className="mt-4 grid grid-cols-3 gap-3">
            <MetricCard
              label="详情页阅读次数"
              value={data.consumption.detailReadCount}
            />
            <MetricCard
              label="有效阅读次数"
              value={data.consumption.effectiveReadCount}
              sub="停留 ≥15s 或滚动 ≥60%"
            />
            <MetricCard
              label="有效阅读率"
              value={`${data.consumption.effectiveReadRate}%`}
              highlight
            />
          </div>
        </section>

        {/* 3. Content Supply Funnel */}
        <section>
          <SectionHeader title="内容供给漏斗" />
          <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg p-6">
            <div className="space-y-3">
              {funnelSteps.map((step, idx) => {
                const prev = idx > 0 ? funnelSteps[idx - 1].count : step.count;
                const rate = idx > 0 ? formatFunnelStep(step.count, prev) : "100%";
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
                      {rate}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Supply quality metrics */}
            <div className="mt-6 pt-4 border-t border-[var(--color-border)] grid grid-cols-2 md:grid-cols-5 gap-3">
              <MetricCard
                label="正文开始率"
                value={`${data.funnel.textStartRate}%`}
                highlight
              />
              <MetricCard
                label="平均正文字数"
                value={data.funnel.avgWordCount}
                sub="字"
              />
              <MetricCard
                label="平均书写时长"
                value={formatDuration(data.funnel.avgWritingDuration)}
              />
              <MetricCard
                label="体验指数填写率"
                value={`${data.funnel.avgScoreFillRate}%`}
                sub="平均填写 8 项中的比例"
              />
              <MetricCard
                label="搜索无结果率"
                value={`${data.search.noResultRate}%`}
                highlight
                sub={`${data.search.totalSearchCount} 次搜索`}
              />
            </div>
          </div>
        </section>

        {/* 4. Content Gap Analysis */}
        <section>
          <SectionHeader title="内容缺口分析" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                    <div
                      key={m.major}
                      className="flex items-center justify-between"
                    >
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

        {/* 5. MBTI × Major Gap */}
        <section>
          <SectionHeader title="MBTI × 专业搜索缺口" />
          <p className="text-xs text-[var(--color-text-secondary)] mb-4">
            用户在特定 MBTI 筛选下搜索的专业，用于识别内容供需缺口
          </p>
          {mbtiEntries.length === 0 ? (
            <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg p-6 text-center">
              <p className="text-xs text-[var(--color-text-secondary)]">
                暂无数据
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {mbtiEntries.map(([mbti, majors]) => {
                const sortedMajors = Object.entries(majors)
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 5);
                return (
                  <div
                    key={mbti}
                    className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg p-4"
                  >
                    <p className="text-sm font-[var(--font-display)] font-semibold text-[var(--color-text)] tracking-wider mb-2">
                      {mbti}
                    </p>
                    <div className="space-y-1.5">
                      {sortedMajors.map(([major, count]) => (
                        <div
                          key={major}
                          className="flex items-center justify-between"
                        >
                          <span className="text-xs text-[var(--color-text)] truncate mr-2">
                            {major}
                          </span>
                          <span className="text-xs text-[var(--color-text-secondary)] shrink-0">
                            {count}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Legend */}
        <section className="border-t border-[var(--color-border)] pt-6">
          <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
            <strong>指标说明：</strong>
            帖子点击率 = 帖子点击数 / 帖子曝光数 ·
            点赞意向率 = 点赞点击数 / 帖子点击数 ·
            发布完成率 = 发布成功数 / 发布页访问数 ·
            正文开始率 = 开始输入数 / 发布页访问数 ·
            MBTI 筛选使用率 = 使用 MBTI 筛选的 UV / 首页 UV ·
            有效阅读率 = 有效阅读次数 / 详情页阅读次数 ·
            有效阅读 = 停留 ≥15s 或滚动 ≥60% ·
            有效停留时长仅统计页面处于前台状态的时间
          </p>
          <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed mt-2">
            <strong>内容质量分层：</strong>
            可发布体验 = 正文 + MBTI + 专业 + 身份 + ≥3 个体验指数 ·
            基础有效体验 = 可发布 + 正文 ≥50 字 ·
            高质量体验 = 有效 + 正文 ≥150 字 + (有帮助反馈 或 有效阅读 ≥3 次)
          </p>
        </section>
      </main>
    </div>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <h2 className="text-sm font-medium text-[var(--color-text)] mb-4 flex items-center gap-2">
      <span className="w-1 h-4 bg-[var(--color-accent)] rounded-full inline-block" />
      {title}
    </h2>
  );
}

function MetricCard({
  label,
  value,
  highlight,
  sub,
}: {
  label: string;
  value: string | number;
  highlight?: boolean;
  sub?: string;
}) {
  return (
    <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg p-4">
      <p className="text-xs text-[var(--color-text-secondary)] mb-1">
        {label}
      </p>
      <p
        className={`text-lg font-[var(--font-display)] font-semibold ${
          highlight ? "text-[var(--color-accent)]" : "text-[var(--color-text)]"
        }`}
      >
        {value}
      </p>
      {sub && (
        <p className="text-xs text-[var(--color-text-secondary)] mt-0.5 opacity-70">
          {sub}
        </p>
      )}
    </div>
  );
}

function QualityCard({
  label,
  count,
  desc,
  color,
}: {
  label: string;
  count: number;
  desc: string;
  color: string;
}) {
  return (
    <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg p-4">
      <div className="flex items-baseline justify-between mb-1">
        <p className="text-xs text-[var(--color-text-secondary)]">{label}</p>
        <p
          className="text-2xl font-[var(--font-display)] font-semibold"
          style={{ color }}
        >
          {count}
        </p>
      </div>
      <p className="text-xs text-[var(--color-text-secondary)] opacity-70 leading-relaxed">
        {desc}
      </p>
    </div>
  );
}
