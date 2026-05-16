import { NextRequest, NextResponse } from "next/server";
import { getPosts, createPost, getPostCount } from "@/lib/data/posts";
import type { SortType } from "@/types";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const mbti = searchParams.get("mbti") || undefined;
  const major = searchParams.get("major") || undefined;
  const sort = (searchParams.get("sort") || "hot") as SortType;
  const limit = parseInt(searchParams.get("limit") || "50", 10);
  const offset = parseInt(searchParams.get("offset") || "0", 10);

  const [posts, total] = await Promise.all([
    getPosts({ mbti, major, sort, limit, offset }),
    getPostCount({ mbti, major }),
  ]);

  return NextResponse.json({ posts, total });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { identity, mbti, major, school, grade, content, scores } = body;

    if (!identity || !mbti || !major || !content) {
      return NextResponse.json(
        { error: "请填写所有必填信息" },
        { status: 400 }
      );
    }

    if (!scores || typeof scores !== "object") {
      return NextResponse.json(
        { error: "请填写体验指数" },
        { status: 400 }
      );
    }

    const post = await createPost({
      identity,
      mbti,
      major,
      school: school || undefined,
      grade: grade || undefined,
      content,
      scores,
    });

    return NextResponse.json(post, { status: 201 });
  } catch {
    return NextResponse.json({ error: "发布失败" }, { status: 500 });
  }
}
