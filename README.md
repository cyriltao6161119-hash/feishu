# 三德子 - 飞书接收服务

## Vercel 部署步骤

### 1. 创建 GitHub 仓库（手动）
- 打开 https://github.com/new
- 仓库名：`feishu`
- 不要勾选任何初始化选项
- 点击 Create repository

### 2. 本地初始化（运行一次）
在 `d:\Claudecode-tao\feishu\` 目录打开 Git Bash，运行：

```bash
git init
git add .
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/cyriltao6161119-hash/feishu.git
git push -u origin main
```

### 3. Vercel 部署
- 打开 https://vercel.com/new
- 点击 "Import Git Repository"
- 选择 `feishu` 仓库
- Framework Preset: Other
- 点击 Deploy

### 4. 获取访问地址
部署完成后，Vercel 会给你一个地址，例如：
`https://feishu.vercel.app`

把这个地址发给我，我来配置飞书的事件订阅。

---

## 本地运行（开发用）

```bash
node receiver.js
```
