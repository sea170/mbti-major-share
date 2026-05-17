import { PrismaClient } from "@prisma/client";
import { MOCK_POSTS } from "../src/lib/data/mock";

const prisma = new PrismaClient();

async function main() {
  if (process.env.ALLOW_MOCK_SEED !== "true") {
    throw new Error(
      "Refusing to seed mock data. Set ALLOW_MOCK_SEED=true only for local demo data."
    );
  }

  await prisma.post.deleteMany();
  await prisma.analyticsEvent.deleteMany();

  for (const post of MOCK_POSTS) {
    await prisma.post.create({
      data: {
        id: post.id,
        identity: post.identity,
        mbti: post.mbti,
        major: post.major,
        school: post.school ?? null,
        grade: post.grade ?? null,
        content: post.content,
        scores: JSON.stringify(post.scores),
        likeCount: post.likeCount,
        createdAt: new Date(post.createdAt),
        updatedAt: new Date(post.updatedAt),
      },
    });
  }

  console.log(`Seeded ${MOCK_POSTS.length} posts.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
