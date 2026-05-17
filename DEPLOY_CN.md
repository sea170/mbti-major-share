# 国内访问部署说明

这份说明是给第一次部署的人看的，按顺序做，不要跳步骤。

目标：把项目部署到腾讯云 CloudBase 云托管，让大陆用户比访问 Vercel 更稳定。

当前项目不是纯静态网站。它包含：

- Next.js 页面
- `/api/posts`、`/api/analytics` 等服务端接口
- Prisma
- PostgreSQL 数据库

所以不要部署到“静态网站托管”，要部署到能运行 Node.js 服务的“云托管 / Cloud Run / 容器服务”。

## 一、你需要准备什么

部署人需要准备：

- 一个腾讯云账号
- 腾讯云账号已实名认证
- 可以打开腾讯云控制台
- 本机已经安装 Node.js 20 或 22
- 本机已经安装 Git
- 能访问这个 GitHub 仓库
- 一条真实的 `DATABASE_URL`

不要把数据库密码发到群里，也不要写进 Git 仓库。

`DATABASE_URL` 的格式如下，把 `<PASSWORD>` 替换成真实密码：

```text
postgresql://postgres.eybtbkgeurxomgefisgs:<PASSWORD>@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1&sslmode=require
```

## 二、先把代码拉到本地

如果本地还没有项目：

```bash
git clone https://github.com/sea170/mbti-major-share.git
cd mbti-major-share
```

如果本地已经有项目：

```bash
cd mbti-major-share
git pull origin main
```

确认当前代码是最新的：

```bash
git log --oneline -3
```

应该能看到类似这一条：

```text
feat: 准备生产部署与国内访问方案
```

## 三、安装依赖并本地构建

安装依赖：

```bash
npm install
```

本地构建：

```bash
npm run build
```

看到 `Compiled successfully` 或构建成功信息就可以继续。

如果这里失败，不要继续部署，先把报错截图发给项目同伴。

## 四、创建腾讯云 CloudBase 环境

打开腾讯云控制台，进入 CloudBase：

```text
https://console.cloud.tencent.com/tcb
```

如果还没有环境：

1. 点击创建环境。
2. 环境名称可以填：`mbti-major-share`
3. 地域优先选择靠近用户的地域。
4. 按腾讯云页面提示完成创建。

创建完成后，找到环境 ID。环境 ID 通常类似：

```text
mbti-major-share-xxxxx
```

后面的命令里会用到它。

## 五、登录 CloudBase CLI

在项目目录里执行：

```bash
npx -p @cloudbase/cli tcb login
```

执行后通常会打开浏览器。按页面提示登录腾讯云账号并授权。

登录成功后，终端会显示类似 `login success` 的信息。

如果没有自动打开浏览器：

1. 看终端里有没有登录链接。
2. 手动复制链接到浏览器打开。
3. 登录腾讯云并授权。

## 六、第一次部署到 CloudBase 云托管

推荐使用下面这个命令，把 `<ENV_ID>` 换成你的 CloudBase 环境 ID：

```bash
npx -p @cloudbase/cli tcb cloudrun deploy --env-id <ENV_ID> --serviceName mbti-major-share --port 3000 --source .
```

如果你不确定环境 ID，也可以先执行：

```bash
npx -p @cloudbase/cli tcb env list
```

然后从列表里复制环境 ID。

部署过程中如果让你确认，选择确认。

部署完成后，腾讯云会创建一个云托管服务，服务名是：

```text
mbti-major-share
```

## 七、配置环境变量 DATABASE_URL

部署服务创建好以后，需要在腾讯云控制台里配置环境变量。

进入：

```text
CloudBase 控制台 -> 你的环境 -> 云托管 -> mbti-major-share 服务 -> 配置 / 环境变量
```

新增环境变量：

```text
变量名：DATABASE_URL
变量值：postgresql://postgres.eybtbkgeurxomgefisgs:<PASSWORD>@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1&sslmode=require
```

注意：

- `<PASSWORD>` 必须替换成真实密码。
- 变量名必须是 `DATABASE_URL`，大小写不能错。
- 不要把真实密码提交到 GitHub。
- 配完环境变量后，通常需要重新部署或重启服务，让环境变量生效。

如果控制台提供“重新部署 / 重启 / 发布新版本”按钮，点一次。

也可以重新执行部署命令：

```bash
npx -p @cloudbase/cli tcb cloudrun deploy --env-id <ENV_ID> --serviceName mbti-major-share --port 3000 --source .
```

## 八、数据库表结构初始化

如果使用的是这个项目现在的 Supabase 数据库，表结构已经同步过，可以先跳过这一步。

如果换了一个全新的数据库，必须先同步 Prisma 表结构。

PowerShell 里执行：

```powershell
$env:DATABASE_URL="postgresql://postgres.eybtbkgeurxomgefisgs:<PASSWORD>@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres?connection_limit=1&sslmode=require"
npx prisma db push
```

macOS / Linux 终端执行：

```bash
DATABASE_URL="postgresql://postgres.eybtbkgeurxomgefisgs:<PASSWORD>@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres?connection_limit=1&sslmode=require" npx prisma db push
```

注意这里使用的是 `5432`，不是 `6543`。同步表结构更适合走 session pooler。

不要在生产环境运行：

```bash
npm run db:seed
```

这个命令是写入 mock 假数据用的。项目已经加了保护，只有显式设置 `ALLOW_MOCK_SEED=true` 才会执行，但生产环境仍然不要运行它。

## 九、拿到访问地址

部署完成后，在腾讯云控制台里找到云托管服务的访问地址。

通常路径是：

```text
CloudBase 控制台 -> 你的环境 -> 云托管 -> mbti-major-share -> 访问服务
```

打开地址后，检查：

1. 首页能打开。
2. 分享页能打开。
3. 首页没有报错。
4. 发布一条测试内容后，首页能看到新内容。

如果首页打开但没有内容，不一定是错误。新数据库可能是空的。

## 十、部署后的验收清单

部署人按下面清单确认：

- `npm run build` 本地通过。
- CloudBase 部署成功。
- CloudBase 服务环境变量里有 `DATABASE_URL`。
- `DATABASE_URL` 里没有 `<PASSWORD>` 占位符，已经替换成真实密码。
- 首页可以打开。
- `/share` 分享页可以打开。
- 可以发布一条测试内容。
- 发布后首页能看到内容。
- 腾讯云控制台日志里没有明显报错。

## 十一、常见问题

### 1. 首页能打开，但发布失败

优先检查 CloudBase 环境变量：

- 是否配置了 `DATABASE_URL`
- 变量名有没有拼错
- 密码有没有替换
- 修改环境变量后有没有重启或重新部署服务

### 2. 提示数据库表不存在

说明数据库没有初始化表结构。

执行：

```bash
npx prisma db push
```

执行时必须确保本机环境变量 `DATABASE_URL` 指向正确数据库。

### 3. 访问地址打不开

检查：

- CloudBase 服务是否部署成功
- 服务端口是否是 `3000`
- 是否部署到了“云托管”，不是“静态托管”
- 腾讯云控制台日志里是否有启动失败信息

### 4. CloudBase CLI 提示没有登录

重新登录：

```bash
npx -p @cloudbase/cli tcb login
```

### 5. 国内访问还是慢

当前方案只是把 Web 服务放到腾讯云，数据库仍然是 Supabase 海外节点。MVP 阶段可以先这样用。

如果后续要更稳定，需要把 PostgreSQL 也迁到国内数据库，例如腾讯云 PostgreSQL / TencentDB。

## 十二、项目里已经做好的部署适配

- `next.config.ts` 已开启 `output: "standalone"`。
- `Dockerfile` 已配置 Node 22 多阶段构建。
- `.dockerignore` 已排除本地环境变量和构建缓存。
- `.vercelignore` 已排除本地 `.env`。
- `prisma/schema.prisma` 已改为 PostgreSQL。
- `prisma/seed.ts` 已防止误写入 mock 数据。

## 十三、给部署人的一句话流程

如果只记最短流程，就是：

```bash
git pull origin main
npm install
npm run build
npx -p @cloudbase/cli tcb login
npx -p @cloudbase/cli tcb env list
npx -p @cloudbase/cli tcb cloudrun deploy --env-id <ENV_ID> --serviceName mbti-major-share --port 3000 --source .
```

然后去腾讯云控制台给云托管服务配置 `DATABASE_URL`，重启或重新部署服务，最后打开 CloudBase 访问地址验证。
