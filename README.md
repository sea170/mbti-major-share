# MBTI 选专业

用 MBTI 找到更像你的学长学姐，看看他们真实的专业体验。

一个面向高中生、准大学生、转专业的 MBTI × 专业真实体验分享平台。用户可以通过 MBTI 和专业筛选，阅读匿名学长学姐的真实专业体验，降低选专业前的信息差。

## 技术栈

- **框架：** Next.js 15 (App Router)
- **语言：** TypeScript
- **样式：** Tailwind CSS v4
- **数据库：** SQLite + Prisma ORM
- **字体：** Noto Serif SC / Cormorant Garamond / LXGW WenKai

## 功能特性

### 首页

- MBTI 16 型筛选
- 专业搜索（教育部本科专业目录匹配）
- 最热 / 最新排序
- 帖子卡片展示（身份、MBTI、专业、学校、日期、正文摘要、体验指数、点赞）
- 点赞 / 取消点赞
- 点击卡片查看详情弹窗

### 分享页

- 身份选择（学长 / 学姐）
- MBTI 选择
- 专业选择（目录选择，仅可选标准化专业）
- 学校、年级（选填）
- 正文自由文本
- 8 项体验指数（1-5 分）
- 发布成功提示

### 数据看板 `/admin/analytics`

- 核心概览（PV、UV、发布完成率等）
- 内容消费分析（曝光、点击率、点赞意向率、停留时长）
- 内容供给漏斗（5 步转化可视化）
- 内容缺口分析（搜索最多 / 无结果 / 高搜索低内容专业）

### 匿名埋点

- `anonymous_id`（localStorage 持久化）
- `session_id`（sessionStorage 会话级）
- 16 个行为事件完整实现
- 页面有效停留时间（排除后台）
- 书写时间统计（10 秒空闲暂停）
- 首次输入耗时
- 滚动深度
- 卡片曝光去重（IntersectionObserver）

## 快速开始

```bash
# 安装依赖
npm install

# 初始化数据库
npx prisma db push

# 填充种子数据
npx tsx prisma/seed.ts

# 启动开发服务器
npm run dev
```

访问 `http://localhost:3000`

数据看板：`http://localhost:3000/admin/analytics`

## 项目结构

```
src/
├── app/
│   ├── page.tsx                    # 首页
│   ├── share/page.tsx              # 分享页
│   ├── admin/analytics/page.tsx    # 数据看板
│   ├── api/
│   │   ├── posts/route.ts          # 帖子 CRUD
│   │   ├── posts/[id]/like/route.ts # 点赞 API
│   │   ├── analytics/route.ts      # 埋点上报
│   │   └── analytics/stats/route.ts # 看板数据
│   ├── globals.css                 # 全局样式
│   └── layout.tsx                  # 根布局
├── components/                     # UI 组件
├── lib/
│   ├── analytics/                  # 埋点客户端 + 服务端
│   ├── data/                       # 数据访问层 + 专业目录
│   └── utils.ts                    # 工具函数
├── types/                          # TypeScript 类型定义
prisma/
├── schema.prisma                   # 数据模型
└── seed.ts                         # 种子数据
```

## 设计风格

- 米白背景 + 低饱和度配色
- 极简留白、杂志排版风格
- Noto Serif SC + Cormorant Garamond 字体
- 细边框、小圆角、微上浮动效
- 最大宽度 1280px

## 贡献者

- **Seanema** — 前端开发（UI 设计、组件实现、交互逻辑、样式系统）
- **Mario Anthony** — 后端开发（API 设计、数据库模型、数据接口）

> 后端部分将持续完善中。

## License

MIT
