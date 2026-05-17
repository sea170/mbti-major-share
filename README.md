# MBTI 选专业

一个面向准大学生、转专业学生和专业探索人群的匿名经验分享平台。用户可以按 MBTI 和专业筛选真实经历，也可以匿名发布自己的专业体验。

## 功能

- 按 MBTI 类型筛选经验
- 按专业关键词搜索
- 热门 / 最新排序
- 匿名发布专业体验
- 体验评分：压力、快乐、匹配度、后悔度等维度
- 点赞与取消点赞
- 内容详情弹窗
- `/admin/analytics` 数据看板
- 匿名访问与行为埋点

## 技术栈

- Next.js 15 App Router
- React 19
- TypeScript
- Tailwind CSS v4
- Prisma ORM
- PostgreSQL
- Docker / Next.js standalone output

## 本地开发

安装依赖：

```bash
npm install
```

创建 `.env`：

```bash
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=require"
```

同步数据库结构：

```bash
npx prisma db push
```

启动开发服务：

```bash
npm run dev
```

访问：

```text
http://localhost:3000
```

## 数据库

项目使用 PostgreSQL。Prisma schema 位于：

```text
prisma/schema.prisma
```

注意：`prisma/seed.ts` 是本地演示数据脚本，默认禁止运行。只有显式设置 `ALLOW_MOCK_SEED=true` 时才会写入 mock 数据。

```bash
ALLOW_MOCK_SEED=true npm run db:seed
```

生产环境不要运行 seed。

## 部署

项目已适配 Node 容器部署：

- `next.config.ts` 启用 `output: "standalone"`
- `Dockerfile` 使用 Node 22 Alpine 多阶段构建
- 服务端口为 `3000`

生产环境必须配置：

```text
DATABASE_URL
```

如果使用 Supabase Transaction Pooler，连接串建议包含：

```text
?pgbouncer=true&connection_limit=1&sslmode=require
```

国内访问优先选择国内云厂商的 Node 容器服务或云托管服务。Vercel 可作为海外演示环境，但不建议作为面向中国大陆用户的主要生产入口。

## 常用命令

```bash
npm run dev
npm run build
npm run start
npm run prod
npm run db:push
npm run db:studio
```

## 目录结构

```text
src/
  app/
    page.tsx
    share/page.tsx
    admin/analytics/page.tsx
    api/
  components/
  lib/
    analytics/
    data/
  types/
prisma/
  schema.prisma
  seed.ts
```

## License

MIT
