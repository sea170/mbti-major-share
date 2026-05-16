"use client";

import { useEffect, useState } from "react";

interface ToastProps {
  message: string;
  duration?: number;
  onClose: () => void;
}

export default function Toast({ message, duration = 2000, onClose }: ToastProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300);
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div
      className="fixed top-6 left-1/2 z-[100] pointer-events-none"
      style={{
        transform: `translateX(-50%) translateY(${visible ? "0" : "-100%"})`,
        opacity: visible ? 1 : 0,
        transition: "all 300ms ease",
      }}
    >
      <div className="flex items-center gap-2 px-5 py-3 bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg shadow-md">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--color-accent)"
          strokeWidth="2"
        >
          <path d="M20 6 9 17l-5-5" />
        </svg>
        <span className="text-sm text-[var(--color-text)] whitespace-nowrap">
          {message}
        </span>
      </div>
    </div>
  );
}
