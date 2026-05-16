export const MBTI_TYPES = [
  "INTJ", "INTP", "ENTJ", "ENTP",
  "INFJ", "INFP", "ENFJ", "ENFP",
  "ISTJ", "ISFJ", "ESTJ", "ESFJ",
  "ISTP", "ISFP", "ESTP", "ESFP",
] as const;

export type MbtiType = (typeof MBTI_TYPES)[number];

export type Identity = "学长" | "学姐";

export interface PostScores {
  pressure: number;       // 压力指数
  happiness: number;      // 幸福感
  match: number;          // 专业匹配感
  regret: number;         // 后悔程度
  difficulty?: number;    // 课程难度
  selfStudy?: number;     // 自学要求
  achievement?: number;   // 成就感
  careerConfidence?: number; // 就业信心
}

export interface Post {
  id: string;
  identity: Identity;
  mbti: MbtiType;
  major: string;
  school?: string;
  grade?: string;
  content: string;
  scores: PostScores;
  likeCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePostInput {
  identity: Identity;
  mbti: MbtiType;
  major: string;
  school?: string;
  grade?: string;
  content: string;
  scores: PostScores;
}

export interface AnalyticsEvent {
  eventId: string;
  eventName: string;
  anonymousId: string;
  sessionId: string;
  timestamp: string;
  page: string;
  properties?: Record<string, unknown>;
}

export type SortType = "hot" | "latest";

export const SCORE_LABELS: Record<keyof PostScores, string> = {
  pressure: "压力指数",
  happiness: "幸福感",
  match: "专业匹配感",
  regret: "后悔程度",
  difficulty: "课程难度",
  selfStudy: "自学要求",
  achievement: "成就感",
  careerConfidence: "就业信心",
};

export const CORE_SCORE_KEYS: (keyof PostScores)[] = [
  "pressure", "happiness", "match", "regret",
];
