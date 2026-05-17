"use client";

import { v4 as uuidv4 } from "uuid";

const ANON_ID_KEY = "mbti_anonymous_id";
const SESSION_ID_KEY = "mbti_session_id";

function getAnonymousId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem(ANON_ID_KEY);
  if (!id) {
    id = uuidv4();
    localStorage.setItem(ANON_ID_KEY, id);
  }
  return id;
}

function getSessionId(): string {
  if (typeof window === "undefined") return "";
  let id = sessionStorage.getItem(SESSION_ID_KEY);
  if (!id) {
    id = uuidv4();
    sessionStorage.setItem(SESSION_ID_KEY, id);
  }
  return id;
}

export function initAnalytics(): {
  anonymousId: string;
  sessionId: string;
} {
  return {
    anonymousId: getAnonymousId(),
    sessionId: getSessionId(),
  };
}

export function trackEvent(
  eventName: string,
  page: string,
  properties?: Record<string, unknown>
): void {
  if (typeof window === "undefined") return;

  const { anonymousId, sessionId } = initAnalytics();

  const payload = {
    event_id: uuidv4(),
    event_name: eventName,
    anonymous_id: anonymousId,
    session_id: sessionId,
    timestamp: new Date().toISOString(),
    page,
    properties: properties || {},
  };

  try {
    if (navigator.sendBeacon) {
      navigator.sendBeacon(
        "/api/analytics",
        new Blob([JSON.stringify(payload)], {
          type: "application/json",
        })
      );
    } else {
      fetch("/api/analytics", {
        method: "POST",
        body: JSON.stringify(payload),
        headers: { "Content-Type": "application/json" },
        keepalive: true,
      }).catch(() => {});
    }
  } catch {
    // Silently fail
  }
}

// --- Duration tracking helpers ---

export class DurationTracker {
  private startTime: number;
  private activeMs: number = 0;
  private lastResume: number;
  private paused: boolean = false;
  private onVisibilityChange: () => void;

  constructor() {
    this.startTime = Date.now();
    this.lastResume = Date.now();

    this.onVisibilityChange = () => {
      if (document.hidden) {
        this.pause();
      } else {
        this.resume();
      }
    };
    document.addEventListener("visibilitychange", this.onVisibilityChange);
  }

  pause() {
    if (!this.paused) {
      this.activeMs += Date.now() - this.lastResume;
      this.paused = true;
    }
  }

  resume() {
    if (this.paused) {
      this.lastResume = Date.now();
      this.paused = false;
    }
  }

  getTotalMs(): number {
    return Date.now() - this.startTime;
  }

  getActiveMs(): number {
    if (this.paused) return this.activeMs;
    return this.activeMs + (Date.now() - this.lastResume);
  }

  destroy() {
    this.pause();
    document.removeEventListener("visibilitychange", this.onVisibilityChange);
  }
}

export class WritingTracker {
  private totalMs: number = 0;
  private lastInputTime: number | null = null;
  private timeoutId: ReturnType<typeof setTimeout> | null = null;
  private readonly idleThreshold = 10000; // 10 seconds

  onInput() {
    const now = Date.now();
    if (this.lastInputTime === null) {
      this.lastInputTime = now;
    }
    if (this.timeoutId) clearTimeout(this.timeoutId);
    this.timeoutId = setTimeout(() => {
      if (this.lastInputTime !== null) {
        this.totalMs += Date.now() - this.lastInputTime;
        this.lastInputTime = null;
      }
    }, this.idleThreshold);
  }

  getTotalMs(): number {
    let total = this.totalMs;
    if (this.lastInputTime !== null) {
      total += Date.now() - this.lastInputTime;
    }
    return total;
  }

  destroy() {
    if (this.timeoutId) clearTimeout(this.timeoutId);
    if (this.lastInputTime !== null) {
      this.totalMs += Date.now() - this.lastInputTime;
      this.lastInputTime = null;
    }
  }
}

export class ScrollDepthTracker {
  private maxDepth: number = 0;
  private target: Element | Window;

  constructor(target?: Element) {
    this.target = target || window;
    this.handleScroll = this.handleScroll.bind(this);
    this.target.addEventListener("scroll", this.handleScroll, {
      passive: true,
    } as AddEventListenerOptions);
  }

  private handleScroll() {
    let scrollTop: number;
    let docHeight: number;

    if (this.target === window) {
      scrollTop = window.scrollY;
      docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
    } else {
      const el = this.target as Element;
      scrollTop = el.scrollTop;
      docHeight = el.scrollHeight - el.clientHeight;
    }

    if (docHeight > 0) {
      const depth = Math.round((scrollTop / docHeight) * 100);
      if (depth > this.maxDepth) this.maxDepth = depth;
    }
  }

  getMaxDepth(): number {
    return this.maxDepth;
  }

  destroy() {
    this.target.removeEventListener("scroll", this.handleScroll);
  }
}
