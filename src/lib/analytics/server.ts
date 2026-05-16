import { prisma } from "@/lib/prisma";

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

export async function getEventCounts() {
  const events = await prisma.analyticsEvent.findMany({
    select: { eventName: true, anonymousId: true, properties: true },
  });

  const counts: Record<string, number> = {};
  for (const e of events) {
    counts[e.eventName] = (counts[e.eventName] || 0) + 1;
  }

  return { events, counts };
}

export async function getAnalyticsStats() {
  const events = await prisma.analyticsEvent.findMany({
    select: {
      eventName: true,
      anonymousId: true,
      sessionId: true,
      properties: true,
    },
  });

  const counts: Record<string, number> = {};
  const uniqueUsers = new Set<string>();
  const uniqueSessions = new Set<string>();

  for (const e of events) {
    counts[e.eventName] = (counts[e.eventName] || 0) + 1;
    uniqueUsers.add(e.anonymousId);
    uniqueSessions.add(e.sessionId);
  }

  // Core overview
  const homeViewCount = counts["home_view"] || 0;
  const homeUv = new Set(
    events.filter((e) => e.eventName === "home_view").map((e) => e.anonymousId)
  ).size;
  const shareClickCount = counts["share_entry_click"] || 0;
  const publishPageViewCount = counts["publish_page_view"] || 0;
  const publishSuccessCount = counts["publish_success"] || 0;
  const publishCompletionRate =
    publishPageViewCount > 0
      ? Math.round((publishSuccessCount / publishPageViewCount) * 100)
      : 0;

  // Content consumption
  const postExposeCount = counts["post_card_expose"] || 0;
  const postClickCount = counts["post_card_click"] || 0;
  const postClickRate =
    postExposeCount > 0
      ? Math.round((postClickCount / postExposeCount) * 100)
      : 0;
  // Count net likes: +1 for like, -1 for unlike
  let netLikeCount = 0;
  for (const e of events) {
    if (e.eventName !== "like_click") continue;
    const props = e.properties ? JSON.parse(e.properties as string) : {};
    if (props.like_status === "like") netLikeCount++;
    else if (props.like_status === "unlike") netLikeCount--;
  }
  const likeClickCount = Math.max(0, netLikeCount);
  const likeIntentionRate =
    postClickCount > 0
      ? Math.round((likeClickCount / postClickCount) * 100)
      : 0;

  // Average active duration from home_leave events
  const homeLeaveEvents = events.filter((e) => e.eventName === "home_leave");
  let avgActiveDuration = 0;
  if (homeLeaveEvents.length > 0) {
    const totalActive = homeLeaveEvents.reduce((sum, e) => {
      const props = e.properties ? JSON.parse(e.properties as string) : {};
      return sum + (props.active_duration_ms || 0);
    }, 0);
    avgActiveDuration = Math.round(totalActive / homeLeaveEvents.length);
  }

  // Content supply funnel
  const funnel = {
    shareClick: counts["share_entry_click"] || 0,
    publishPageView: counts["publish_page_view"] || 0,
    publishTextStart: counts["publish_text_start"] || 0,
    publishSubmitClick: counts["publish_submit_click"] || 0,
    publishSuccess: counts["publish_success"] || 0,
  };

  // Search analytics
  const searchEvents = events.filter((e) => e.eventName === "search_major");
  const searchMajorCounts: Record<string, number> = {};
  const searchNoResultCounts: Record<string, number> = {};
  for (const e of searchEvents) {
    const props = e.properties ? JSON.parse(e.properties as string) : {};
    const keyword = props.keyword || "";
    if (keyword) {
      searchMajorCounts[keyword] = (searchMajorCounts[keyword] || 0) + 1;
      if (props.result_count === 0) {
        searchNoResultCounts[keyword] =
          (searchNoResultCounts[keyword] || 0) + 1;
      }
    }
  }

  const topSearchedMajors = Object.entries(searchMajorCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([major, count]) => ({ major, count }));

  const noResultMajors = Object.entries(searchNoResultCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([major, count]) => ({ major, count }));

  // High search, low content
  const highSearchLowContent = topSearchedMajors
    .filter((s) => searchNoResultCounts[s.major] > 0)
    .map((s) => ({
      major: s.major,
      searchCount: s.count,
      noResultCount: searchNoResultCounts[s.major] || 0,
    }));

  return {
    overview: {
      homeViewCount,
      homeUv,
      shareClickCount,
      publishPageViewCount,
      publishSuccessCount,
      publishCompletionRate,
      newExperienceCount: publishSuccessCount,
    },
    consumption: {
      postExposeCount,
      postClickCount,
      postClickRate,
      likeIntentionRate,
      avgActiveDuration,
    },
    funnel,
    search: {
      topSearchedMajors,
      noResultMajors,
      highSearchLowContent,
    },
  };
}
