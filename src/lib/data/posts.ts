import { prisma } from "@/lib/prisma";
import type { Post, PostScores, CreatePostInput, SortType, MbtiType } from "@/types";

function dbPostToPost(db: {
  id: string;
  identity: string;
  mbti: string;
  major: string;
  school: string | null;
  grade: string | null;
  content: string;
  scores: string;
  likeCount: number;
  createdAt: Date;
  updatedAt: Date;
}): Post {
  return {
    id: db.id,
    identity: db.identity as Post["identity"],
    mbti: db.mbti as MbtiType,
    major: db.major,
    school: db.school ?? undefined,
    grade: db.grade ?? undefined,
    content: db.content,
    scores: JSON.parse(db.scores) as PostScores,
    likeCount: db.likeCount,
    createdAt: db.createdAt.toISOString(),
    updatedAt: db.updatedAt.toISOString(),
  };
}

export async function getPosts(options: {
  mbti?: string;
  major?: string;
  sort?: SortType;
  limit?: number;
  offset?: number;
}): Promise<Post[]> {
  const { mbti, major, sort = "hot", limit = 50, offset = 0 } = options;

  const where: Record<string, unknown> = {};
  if (mbti) where.mbti = mbti;
  if (major) where.major = { contains: major };

  const orderBy =
    sort === "hot"
      ? { likeCount: "desc" as const }
      : { createdAt: "desc" as const };

  const rows = await prisma.post.findMany({
    where,
    orderBy,
    skip: offset,
    take: limit,
  });

  return rows.map(dbPostToPost);
}

export async function getPostById(id: string): Promise<Post | null> {
  const row = await prisma.post.findUnique({ where: { id } });
  if (!row) return null;
  return dbPostToPost(row);
}

export async function createPost(input: CreatePostInput): Promise<Post> {
  const row = await prisma.post.create({
    data: {
      identity: input.identity,
      mbti: input.mbti,
      major: input.major,
      school: input.school || null,
      grade: input.grade || null,
      content: input.content,
      scores: JSON.stringify(input.scores),
    },
  });
  return dbPostToPost(row);
}

export async function likePost(id: string): Promise<Post | null> {
  const row = await prisma.post.update({
    where: { id },
    data: { likeCount: { increment: 1 } },
  });
  return dbPostToPost(row);
}

export async function unlikePost(id: string): Promise<Post | null> {
  const row = await prisma.post.update({
    where: { id },
    data: { likeCount: { decrement: 1 } },
  });
  return dbPostToPost(row);
}

export async function getPostCount(filters?: {
  mbti?: string;
  major?: string;
}): Promise<number> {
  const where: Record<string, unknown> = {};
  if (filters?.mbti) where.mbti = filters.mbti;
  if (filters?.major) where.major = { contains: filters.major };
  return prisma.post.count({ where });
}

export async function getMajorStats(): Promise<
  { major: string; count: number }[]
> {
  const posts = await prisma.post.findMany({
    select: { major: true },
  });
  const map = new Map<string, number>();
  for (const p of posts) {
    map.set(p.major, (map.get(p.major) || 0) + 1);
  }
  return Array.from(map.entries())
    .map(([major, count]) => ({ major, count }))
    .sort((a, b) => b.count - a.count);
}

export async function getMbtiMajorMatrix(): Promise<
  Record<string, Record<string, number>>
> {
  const posts = await prisma.post.findMany({
    select: { mbti: true, major: true },
  });
  const matrix: Record<string, Record<string, number>> = {};
  for (const p of posts) {
    if (!matrix[p.mbti]) matrix[p.mbti] = {};
    matrix[p.mbti][p.major] = (matrix[p.mbti][p.major] || 0) + 1;
  }
  return matrix;
}

export async function getMajorScoreAverages(): Promise<
  { major: string; avgPressure: number; avgHappiness: number; avgMatch: number; count: number }[]
> {
  const posts = await prisma.post.findMany({
    select: { major: true, scores: true },
  });
  const map = new Map<
    string,
    { pressure: number; happiness: number; match: number; count: number }
  >();
  for (const p of posts) {
    const scores = JSON.parse(p.scores) as PostScores;
    const existing = map.get(p.major) || {
      pressure: 0,
      happiness: 0,
      match: 0,
      count: 0,
    };
    existing.pressure += scores.pressure;
    existing.happiness += scores.happiness;
    existing.match += scores.match;
    existing.count += 1;
    map.set(p.major, existing);
  }
  return Array.from(map.entries())
    .map(([major, v]) => ({
      major,
      avgPressure: Math.round((v.pressure / v.count) * 10) / 10,
      avgHappiness: Math.round((v.happiness / v.count) * 10) / 10,
      avgMatch: Math.round((v.match / v.count) * 10) / 10,
      count: v.count,
    }))
    .sort((a, b) => b.count - a.count);
}
