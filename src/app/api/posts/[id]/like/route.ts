import { NextRequest, NextResponse } from "next/server";
import { likePost, unlikePost } from "@/lib/data/posts";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const liked = body.liked !== false; // default true

  const post = liked ? await likePost(id) : await unlikePost(id);
  if (!post) {
    return NextResponse.json({ error: "帖子不存在" }, { status: 404 });
  }
  return NextResponse.json(post);
}
