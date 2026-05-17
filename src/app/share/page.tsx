"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MBTI_TYPES } from "@/types";
import type { MbtiType, Identity, PostScores } from "@/types";
import ScoreInput from "@/components/ScoreInput";
import MajorSelector from "@/components/MajorSelector";
import Toast from "@/components/Toast";
import { CORE_SCORE_KEYS } from "@/types";
import {
  trackEvent,
  initAnalytics,
  DurationTracker,
  WritingTracker,
} from "@/lib/analytics/client";

export default function SharePage() {
  const router = useRouter();
  const [identity, setIdentity] = useState<Identity | "">("");
  const [mbti, setMbti] = useState<MbtiType | "">("");
  const [major, setMajor] = useState("");
  const [school, setSchool] = useState("");
  const [grade, setGrade] = useState("");
  const [content, setContent] = useState("");
  const [scores, setScores] = useState<Partial<PostScores>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const durationRef = useRef<DurationTracker | null>(null);
  const writingRef = useRef<WritingTracker | null>(null);
  const firstInputTimeRef = useRef<number | null>(null);
  const pageLoadTimeRef = useRef<number>(Date.now());
  const textStartedRef = useRef(false);
  const submittingRef = useRef(false);

  useEffect(() => {
    initAnalytics();
    trackEvent("share_entry_click", "/share", {
      from_page: document.referrer || "direct",
    });
    trackEvent("publish_page_view", "/share", {
      from_page: document.referrer || "direct",
      referrer: document.referrer,
    });

    durationRef.current = new DurationTracker();
    writingRef.current = new WritingTracker();

    return () => {
      if (!submitted) {
        const filledRequired =
          (identity ? 1 : 0) +
          (mbti ? 1 : 0) +
          (major ? 1 : 0) +
          (content ? 1 : 0);

        let exitStage = "no_input";
        if (content.length > 0) exitStage = "text_started";
        if (filledRequired >= 3) exitStage = "basic_info_filled";
        if (Object.values(scores).some((v) => v && v > 0))
          exitStage = "score_selected";

        trackEvent("publish_exit", "/share", {
          content_length: content.length,
          score_count: Object.values(scores).filter((v) => v && v > 0).length,
          filled_required_count: filledRequired,
          exit_stage: exitStage,
          publish_page_duration_ms: durationRef.current?.getTotalMs() || 0,
          writing_duration_ms: writingRef.current?.getTotalMs() || 0,
          time_to_first_input_ms: firstInputTimeRef.current
            ? firstInputTimeRef.current - pageLoadTimeRef.current
            : null,
        });
      }

      durationRef.current?.destroy();
      writingRef.current?.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleContentChange = (value: string) => {
    setContent(value);

    if (!textStartedRef.current && value.length > 0) {
      textStartedRef.current = true;
      firstInputTimeRef.current = Date.now();
      trackEvent("publish_text_start", "/share", {
        time_to_first_input_ms: Date.now() - pageLoadTimeRef.current,
      });
    }

    writingRef.current?.onInput();
  };

  const handleScoreChange = (newScores: Partial<PostScores>) => {
    setScores(newScores);
    const count = Object.values(newScores).filter((v) => v && v > 0).length;
    trackEvent("publish_score_select", "/share", {
      selected_score_count: count,
    });
  };

  const handleFieldFill = (fieldName: string, hasValue: boolean) => {
    trackEvent("publish_basic_info_fill", "/share", {
      field_name: fieldName,
      has_value: hasValue,
    });
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!identity) newErrors.identity = "请选择身份";
    if (!mbti) newErrors.mbti = "请选择 MBTI";
    if (!major.trim()) newErrors.major = "请填写专业";
    if (!content.trim()) newErrors.content = "请填写体验内容";

    const coreScoresFilled = CORE_SCORE_KEYS.every(
      (key) => scores[key] && scores[key]! > 0
    );
    if (!coreScoresFilled) newErrors.scores = "请填写核心体验指数";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submittingRef.current || submitted) return;
    if (!validate()) return;

    submittingRef.current = true;
    setSubmitting(true);

    const payload = {
      identity,
      mbti,
      major: major.trim(),
      school: school.trim() || undefined,
      grade: grade.trim() || undefined,
      content: content.trim(),
      scores,
    };

    trackEvent("publish_submit_click", "/share", {
      content_length: content.length,
      score_count: Object.values(scores).filter((v) => v && v > 0).length,
      has_identity: !!identity,
      has_mbti: !!mbti,
      has_major: !!major,
      publish_page_duration_ms: durationRef.current?.getTotalMs() || 0,
      writing_duration_ms: writingRef.current?.getTotalMs() || 0,
      time_to_first_input_ms: firstInputTimeRef.current
        ? firstInputTimeRef.current - pageLoadTimeRef.current
        : null,
    });

    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const post = await res.json();
        setSubmitted(true);

        writingRef.current?.destroy();
        durationRef.current?.destroy();

        trackEvent("publish_success", "/share", {
          post_id: post.id,
          identity,
          mbti,
          major,
          content_length: content.length,
          score_count: Object.values(scores).filter((v) => v && v > 0).length,
          publish_page_duration_ms: durationRef.current?.getTotalMs() || 0,
          writing_duration_ms: writingRef.current?.getTotalMs() || 0,
        });

        setShowToast(true);
        setTimeout(() => router.push("/"), 2000);
      } else {
        const data = await res.json();
        submittingRef.current = false;
        setErrors({ submit: data.error || "发布失败" });
      }
    } catch {
      submittingRef.current = false;
      setErrors({ submit: "网络错误，请重试" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      {/* Toast */}
      {showToast && (
        <Toast message="发布成功！" onClose={() => setShowToast(false)} />
      )}

      {/* Header */}
      <header className="border-b border-[var(--color-border)] bg-[var(--color-bg)]/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-[1280px] mx-auto px-6 md:px-12 py-4 flex items-center justify-between">
          <Link href="/" className="group">
            <h1 className="font-[var(--font-display)] text-xl md:text-2xl font-semibold text-[var(--color-text)] tracking-wide group-hover:text-[var(--color-accent)] transition-colors duration-200">
              MBTI 选专业
            </h1>
          </Link>
          <Link
            href="/"
            className="text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] transition-colors duration-200"
          >
            返回首页
          </Link>
        </div>
      </header>

      {/* Form */}
      <main className="max-w-[680px] mx-auto px-6 md:px-12 py-12">
        <div className="mb-8">
          <h2 className="font-[var(--font-display)] text-xl md:text-2xl font-semibold text-[var(--color-text)] mb-2">
            分享你的专业体验
          </h2>
          <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
            写给学弟学妹，也写给曾经迷茫的自己
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Identity */}
          <div>
            <label className="block text-sm text-[var(--color-text)] mb-2">
              身份 <span className="text-[var(--color-accent)]">*</span>
            </label>
            <div className="flex gap-3">
              {(["学长", "学姐"] as const).map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => {
                    setIdentity(opt);
                    handleFieldFill("identity", true);
                  }}
                  className={`px-6 py-2.5 rounded-md text-sm transition-all duration-200 cursor-pointer ${
                    identity === opt
                      ? "bg-[var(--color-accent)] text-white"
                      : "bg-[var(--color-card)] border border-[var(--color-border)] text-[var(--color-text)] hover:border-[var(--color-accent)]"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
            {errors.identity && (
              <p className="text-xs text-red-500 mt-1">{errors.identity}</p>
            )}
          </div>

          {/* MBTI */}
          <div>
            <label className="block text-sm text-[var(--color-text)] mb-2">
              MBTI <span className="text-[var(--color-accent)]">*</span>
            </label>
            <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
              {MBTI_TYPES.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => {
                    setMbti(t);
                    handleFieldFill("mbti", true);
                  }}
                  className={`px-2 py-2 rounded-md text-xs font-[var(--font-display)] tracking-wider transition-all duration-200 cursor-pointer ${
                    mbti === t
                      ? "bg-[var(--color-accent)] text-white"
                      : "bg-[var(--color-card)] border border-[var(--color-border)] text-[var(--color-text)] hover:border-[var(--color-accent)]"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
            {errors.mbti && (
              <p className="text-xs text-red-500 mt-1">{errors.mbti}</p>
            )}
          </div>

          {/* Major */}
          <div>
            <label className="block text-sm text-[var(--color-text)] mb-2">
              专业 <span className="text-[var(--color-accent)]">*</span>
            </label>
            <MajorSelector
              value={major}
              onChange={(val) => {
                setMajor(val);
                handleFieldFill("major", !!val);
              }}
            />
            {errors.major && (
              <p className="text-xs text-red-500 mt-1">{errors.major}</p>
            )}
          </div>

          {/* School & Grade */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-[var(--color-text)] mb-2">
                学校{" "}
                <span className="text-xs text-[var(--color-text-secondary)]">
                  （选填）
                </span>
              </label>
              <input
                type="text"
                placeholder="例如：北京大学"
                value={school}
                onChange={(e) => {
                  setSchool(e.target.value);
                  handleFieldFill("school", !!e.target.value);
                }}
                className="w-full px-3 py-2.5 bg-[var(--color-card)] border border-[var(--color-border)] rounded-md text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-secondary)] focus:border-[var(--color-accent)] outline-none transition-colors duration-200"
              />
            </div>
            <div>
              <label className="block text-sm text-[var(--color-text)] mb-2">
                年级{" "}
                <span className="text-xs text-[var(--color-text-secondary)]">
                  （选填）
                </span>
              </label>
              <input
                type="text"
                placeholder="例如：大三"
                value={grade}
                onChange={(e) => {
                  setGrade(e.target.value);
                  handleFieldFill("grade", !!e.target.value);
                }}
                className="w-full px-3 py-2.5 bg-[var(--color-card)] border border-[var(--color-border)] rounded-md text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-secondary)] focus:border-[var(--color-accent)] outline-none transition-colors duration-200"
              />
            </div>
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm text-[var(--color-text)] mb-2">
              你的真实体验 <span className="text-[var(--color-accent)]">*</span>
            </label>
            <textarea
              placeholder="不需要写得正式。你可以写选择这个专业前的期待，也可以写真正学了之后的落差、喜欢、痛苦、后悔或庆幸。只要是真实经历，就可能帮到后来的人。"
              value={content}
              onChange={(e) => handleContentChange(e.target.value)}
              rows={8}
              className="w-full px-4 py-3 bg-[var(--color-card)] border border-[var(--color-border)] rounded-md text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-secondary)] focus:border-[var(--color-accent)] outline-none transition-colors duration-200 resize-none leading-relaxed"
            />
            <div className="flex items-center justify-between mt-1">
              {errors.content && (
                <p className="text-xs text-red-500">{errors.content}</p>
              )}
              <span className="text-xs text-[var(--color-text-secondary)] ml-auto">
                {content.length} 字
              </span>
            </div>
          </div>

          {/* Scores */}
          <div>
            <label className="block text-sm text-[var(--color-text)] mb-4">
              体验指数{" "}
              <span className="text-xs text-[var(--color-text-secondary)]">
                （核心四项必填）
              </span>
            </label>
            <ScoreInput scores={scores} onChange={handleScoreChange} />
            {errors.scores && (
              <p className="text-xs text-red-500 mt-2">{errors.scores}</p>
            )}
          </div>

          {/* Submit error */}
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-md px-4 py-3">
              <p className="text-sm text-red-600">{errors.submit}</p>
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-[var(--color-accent)] text-white text-sm rounded-md hover:bg-[var(--color-accent-hover)] disabled:opacity-50 transition-colors duration-200 cursor-pointer"
          >
            {submitting ? "发布中…" : "发布体验"}
          </button>

          <p className="text-xs text-[var(--color-text-secondary)] text-center">
            发布后将匿名展示，不会暴露你的任何个人信息
          </p>
        </form>
      </main>
    </div>
  );
}
