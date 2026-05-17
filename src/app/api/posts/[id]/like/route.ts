import { NextRequest, NextResponse } from "next/server";
import { likePost, unlikePost } from "@/lib/data/posts";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const liked = body.liked !== false;
  const anonymousId = body.anonymousId as string | undefined;

  if (!anonymousId) {
    return NextResponse.json(
      { error: "缺少用户标识" },
      { status: 400 }
    );
  }

  if (liked) {
    const { post, alreadyLiked } = await likePost(id, anonymousId);
    if (!post) {
      return NextResponse.json({ error: "帖子不存在" }, { status: 404 });
    }
    return NextResponse.json({ ...post, alreadyLiked });
  } else {
    const { post, alreadyUnliked } = await unlikePost(id, anonymousId);
    if (!post) {
      return NextResponse.json({ error: "帖子不存在" }, { status: 404 });
    }
    return NextResponse.json({ ...post, alreadyUnliked });
  }
}
