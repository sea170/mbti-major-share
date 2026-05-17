import { prisma } from "@/lib/prisma";

interface ParsedEvent {
  eventName: string;
  anonymousId: string;
  sessionId: string;
  properties: Record<string, unknown>;
}

function parseProps(raw: string | null): Record<string, unknown> {
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export async function saveEvent(event: {
  event_id: string;
  event_name: string;
  anonymous_id: string;
  session_id: string;
  timestamp: string;
  page: string;
  properties?: Record<string, unknown>;
}) {
  return prisma.analyticsEvent.create({
    data: {
      id: event.event_id,
      eventName: event.event_name,
      anonymousId: event.anonymous_id,
      sessionId: event.session_id,
      timestamp: new Date(event.timestamp),
      page: event.page,
      properties: event.properties ? JSON.stringify(event.properties) : null,
    },
  });
}

export async function getAnalyticsStats() {
  const rawEvents = await prisma.analyticsEvent.findMany({
    select: {
      eventName: true,
      anonymousId: true,
      sessionId: true,
      properties: true,
    },
  });

  const events: ParsedEvent[] = rawEvents.map((e) => ({
    eventName: e.eventName,
    anonymousId: e.anonymousId,
    sessionId: e.sessionId,
    properties: parseProps(e.properties),
  }));

  const counts: Record<string, number> = {};
  for (const e of events) {
    counts[e.eventName] = (counts[e.eventName] || 0) + 1;
  }

  // Helper
  const eventsOf = (name: string) => events.filter((e) => e.eventName === name);
  const uniqueUsersOf = (name: string) =>
    new Set(eventsOf(name).map((e) => e.anonymousId)).size;

  // ──────────────────────────────────────────────
  // 1. Core Overview
  // ──────────────────────────────────────────────
  const homeViewCount = counts["home_view"] || 0;
  const homeUv = uniqueUsersOf("home_view");
  const shareClickCount = counts["share_entry_click"] || 0;
  const publishPageViewCount = counts["publish_page_view"] || 0;
  const publishSuccessCount = counts["publish_success"] || 0;
  const publishCompletionRate =
    publishPageViewCount > 0
      ? Math.round((publishSuccessCount / publishPageViewCount) * 100)
      : 0;

  // ── Three-layer content quality metrics ──
  const publishSuccessEvents = eventsOf("publish_success");

  const publishableCount = publishSuccessEvents.filter((e) => {
    const p = e.properties;
    const contentLen =
      typeof p.content_length === "number" ? p.content_length : 0;
    const scoreCount =
      typeof p.score_count === "number" ? p.score_count : 0;
    return contentLen > 0 && scoreCount >= 3;
  }).length;

  const validCount = publishSuccessEvents.filter((e) => {
    const p = e.properties;
    const contentLen =
      typeof p.content_length === "number" ? p.content_length : 0;
    const scoreCount =
      typeof p.score_count === "number" ? p.score_count : 0;
    return contentLen >= 50 && scoreCount >= 3;
  }).length;

  const highQualityCount = publishSuccessEvents.filter((e) => {
    const p = e.properties;
    const contentLen =
      typeof p.content_length === "number" ? p.content_length : 0;
    const scoreCount =
      typeof p.score_count === "number" ? p.score_count : 0;
    if (contentLen < 150 || scoreCount < 3) return false;
    const postId = typeof p.post_id === "string" ? p.post_id : null;
    if (!postId) return false;

    const helpfulCount = events.filter(
      (ev) =>
        ev.eventName === "helpful_click" &&
        ev.properties.post_id === postId &&
        ev.properties.helpful === true
    ).length;

    const detailViews = events.filter(
      (ev) =>
        ev.eventName === "detail_read_complete" &&
        ev.properties.post_id === postId
    );
    const effectiveReads = detailViews.filter(
      (ev) => ev.properties.is_effective_read === true
    ).length;

    return helpfulCount >= 1 || effectiveReads >= 3;
  }).length;

  // ──────────────────────────────────────────────
  // 2. Content Consumption
  // ──────────────────────────────────────────────
  const postExposeCount = counts["post_card_expose"] || 0;
  const postClickCount = counts["post_card_click"] || 0;
  const postClickRate =
    postExposeCount > 0
      ? Math.round((postClickCount / postExposeCount) * 100)
      : 0;

  let netLikeCount = 0;
  for (const e of events) {
    if (e.eventName !== "like_click") continue;
    if (e.properties.like_status === "like") netLikeCount++;
    else if (e.properties.like_status === "unlike") netLikeCount--;
  }
  const likeClickCount = Math.max(0, netLikeCount);
  const likeIntentionRate =
    postClickCount > 0
      ? Math.round((likeClickCount / postClickCount) * 100)
      : 0;

  const homeLeaveEvents = eventsOf("home_leave");
  let avgActiveDuration = 0;
  if (homeLeaveEvents.length > 0) {
    const totalActive = homeLeaveEvents.reduce(
      (sum, e) => sum + ((e.properties.active_duration_ms as number) || 0),
      0
    );
    avgActiveDuration = Math.round(totalActive / homeLeaveEvents.length);
  }

  // MBTI filter usage rate
  const mbtiSelectEvents = eventsOf("mbti_filter_change").filter(
    (e) => e.properties.action === "select"
  );
  const mbtiFilterUv = new Set(
    mbtiSelectEvents.map((e) => e.anonymousId)
  ).size;
  const mbtiFilterRate =
    homeUv > 0 ? Math.round((mbtiFilterUv / homeUv) * 100) : 0;

  // Detail page reading
  const detailReadEvents = eventsOf("detail_read_complete");
  const effectiveReadCount = detailReadEvents.filter(
    (e) => e.properties.is_effective_read === true
  ).length;
  const effectiveReadRate =
    detailReadEvents.length > 0
      ? Math.round((effectiveReadCount / detailReadEvents.length) * 100)
      : 0;

  // ──────────────────────────────────────────────
  // 3. Content Supply Funnel
  // ──────────────────────────────────────────────
  const funnelSteps = {
    shareClick: counts["share_entry_click"] || 0,
    publishPageView: counts["publish_page_view"] || 0,
    publishTextStart: counts["publish_text_start"] || 0,
    publishSubmitClick: counts["publish_submit_click"] || 0,
    publishSuccess: counts["publish_success"] || 0,
  };

  const textStartRate =
    funnelSteps.publishPageView > 0
      ? Math.round(
          (funnelSteps.publishTextStart / funnelSteps.publishPageView) * 100
        )
      : 0;

  // Average word count & writing duration
  let totalContentLength = 0;
  let totalWritingMs = 0;
  let scoreFillTotal = 0;
  let scoreFillCount = 0;
  for (const e of publishSuccessEvents) {
    const p = e.properties;
    if (typeof p.content_length === "number")
      totalContentLength += p.content_length;
    if (typeof p.writing_duration_ms === "number")
      totalWritingMs += p.writing_duration_ms;
    if (typeof p.score_count === "number") {
      scoreFillTotal += p.score_count;
      scoreFillCount++;
    }
  }
  const avgWordCount =
    publishSuccessEvents.length > 0
      ? Math.round(totalContentLength / publishSuccessEvents.length)
      : 0;
  const avgWritingDuration =
    publishSuccessEvents.length > 0
      ? Math.round(totalWritingMs / publishSuccessEvents.length)
      : 0;
  const avgScoreFillRate =
    scoreFillCount > 0
      ? Math.round((scoreFillTotal / (scoreFillCount * 8)) * 100)
      : 0;

  // ──────────────────────────────────────────────
  // 4. Content Gap Analysis
  // ──────────────────────────────────────────────
  const searchEvents = eventsOf("search_major");
  const searchMajorCounts: Record<string, number> = {};
  const searchNoResultCounts: Record<string, number> = {};
  for (const e of searchEvents) {
    const keyword = (e.properties.keyword as string) || "";
    if (!keyword) continue;
    searchMajorCounts[keyword] = (searchMajorCounts[keyword] || 0) + 1;
    const rc = e.properties.result_count;
    if (typeof rc === "number" && rc === 0) {
      searchNoResultCounts[keyword] =
        (searchNoResultCounts[keyword] || 0) + 1;
    }
  }

  const totalSearchCount = searchEvents.length;
  const totalNoResultCount = Object.values(searchNoResultCounts).reduce(
    (a, b) => a + b,
    0
  );
  const noResultRate =
    totalSearchCount > 0
      ? Math.round((totalNoResultCount / totalSearchCount) * 100)
      : 0;

  const topSearchedMajors = Object.entries(searchMajorCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([major, count]) => ({ major, count }));

  const noResultMajors = Object.entries(searchNoResultCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([major, count]) => ({ major, count }));

  const highSearchLowContent = topSearchedMajors
    .filter((s) => searchNoResultCounts[s.major] > 0)
    .map((s) => ({
      major: s.major,
      searchCount: s.count,
      noResultCount: searchNoResultCounts[s.major] || 0,
    }));

  // MBTI × Major gap matrix
  const mbtiMajorGap: Record<string, Record<string, number>> = {};
  for (const e of searchEvents) {
    const keyword = (e.properties.keyword as string) || "";
    const mbti = (e.properties.mbti_filter as string) || null;
    if (!keyword || !mbti) continue;
    if (!mbtiMajorGap[mbti]) mbtiMajorGap[mbti] = {};
    mbtiMajorGap[mbti][keyword] = (mbtiMajorGap[mbti][keyword] || 0) + 1;
  }

  return {
    overview: {
      homeViewCount,
      homeUv,
      shareClickCount,
      publishPageViewCount,
      publishSuccessCount,
      publishCompletionRate,
      newExperienceCount: publishSuccessCount,
      publishableCount,
      validCount,
      highQualityCount,
    },
    consumption: {
      postExposeCount,
      postClickCount,
      postClickRate,
      likeIntentionRate,
      avgActiveDuration,
      mbtiFilterRate,
      mbtiFilterUv,
      detailReadCount: detailReadEvents.length,
      effectiveReadCount,
      effectiveReadRate,
    },
    funnel: {
      ...funnelSteps,
      textStartRate,
      avgWordCount,
      avgWritingDuration,
      avgScoreFillRate,
    },
    search: {
      totalSearchCount,
      noResultRate,
      topSearchedMajors,
      noResultMajors,
      highSearchLowContent,
      mbtiMajorGap,
    },
  };
}
