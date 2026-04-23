# 民宿管理系统

轻量级民宿内部管理系统，支持入住退房、布草库存管理、清洁任务跟踪和基础报表统计。

## 功能特性

- **房间管理**：实时查看7间房的状态（空闲/入住中/清洁中）
- **入住退房**：3次点击内完成退房，自动扣减布草库存
- **布草库存**：库存预警、手动调整数量和安全阈值
- **清洁任务**：清洁员标记完成，自动释放房间
- **周报表**：消耗统计、损耗分析、采购建议
- **权限控制**：简单密码保护（默认：`bnb2026`）

## 技术栈

- **前端**：React + Tailwind CSS（响应式设计，适配手机/电脑）
- **后端**：Next.js API Routes（Node.js Runtime）
- **数据存储**：JSON 文件（`data.json`），零数据库依赖

## 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 访问 http://localhost:3000
# 登录密码：bnb2026
```

## 部署到 Vercel

### 步骤 1：准备代码

确保代码已推送到 GitHub/GitLab/Bitbucket 仓库。

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin <your-repo-url>
git push -u origin main
```

### 步骤 2：Vercel 配置

1. 登录 [Vercel](https://vercel.com) 并点击 **Add New Project**
2. 导入你的 Git 仓库
3. **Framework Preset** 选择 `Next.js`
4. **Root Directory** 保持默认（`.`）

### 步骤 3：重要配置

进入项目 **Settings** → **Functions**：

- **Function Region**：选择离你最近的区域（如 `HKG1` 香港）
- **Node.js Version**：`20.x`

> ⚠️ **关键提示**：本系统使用文件系统写入 `data.json`，需要 Node.js Runtime。请勿使用静态导出（`output: 'export'`），否则 API 路由将无法工作。

### 步骤 4：部署

点击 **Deploy**，Vercel 会自动构建并部署。

### 步骤 5：数据持久化说明

Vercel 的 Serverless Functions 是无状态的，每次部署后文件系统会被重置。对于生产环境，建议：

1. **方案 A（推荐）**：使用 [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres) 或 [Neon](https://neon.tech) 替换 `data.json`
2. **方案 B**：使用 [Upstash Redis](https://upstash.com) 存储数据
3. **方案 C**：定期备份 `data.json` 到外部存储，并保留本地副本

对于7间房的小型民宿，**方案 C** 最简单：
- 每次更新后手动下载 `data.json` 备份
- 重新部署前上传备份文件

## 修改登录密码

编辑 `src/lib/auth.ts`：

```typescript
const PASSWORD = '你的新密码';
```

然后重新部署。

## 自定义房型/布草

编辑 `src/lib/data.ts` 中的 `getDefaultData()` 函数，或直接在 `data.json` 中修改：

- **房间**：修改 `rooms` 数组
- **布草**：修改 `linens` 数组，`standardUsage` 定义各房型标准用量
- **安全阈值**：修改 `threshold` 字段

## 项目结构

```
├── src/
│   ├── app/                  # Next.js App Router
│   │   ├── api/              # API Routes
│   │   │   ├── bookings/     # 入住登记
│   │   │   ├── cleaning/     # 清洁任务
│   │   │   ├── linens/       # 布草库存
│   │   │   ├── linen-usage/  # 使用记录
│   │   │   ├── reports/      # 报表
│   │   │   └── rooms/        # 房间/退房
│   │   ├── cleaning/         # 清洁任务页面
│   │   ├── inventory/        # 库存页面
│   │   ├── reports/          # 报表页面
│   │   ├── layout.tsx        # 根布局
│   │   └── page.tsx          # 首页（房间管理）
│   ├── components/           # 共享组件
│   │   ├── AuthGuard.tsx     # 登录保护
│   │   └── NavBar.tsx        # 导航栏
│   └── lib/
│       ├── auth.ts           # 认证逻辑
│       ├── data.ts           # 数据读写
│       └── types.ts          # TypeScript 类型
├── data.json                 # 数据文件
├── API.md                    # API 文档
└── README.md                 # 本文件
```

## 默认账号

- **密码**：`bnb2026`

## 许可证

MIT
