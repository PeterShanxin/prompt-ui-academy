<div align="center">
  <img src="./public/favicon.svg" width="72" height="72" alt="界面话术 logo" />
  <h1>界面话术 · Prompt UI Academy</h1>
  <p><strong>学会命名界面、描述动效，并写出 AI 真正能执行的 UI Prompt。</strong></p>
  <p>Learn to name interfaces, describe motion, and turn design intent into precise AI instructions.</p>

  <p>
    <a href="https://prompt-ui-academy.vercel.app"><strong>在线体验</strong></a>
    ·
    <a href="#本地开发">本地开发</a>
    ·
    <a href="CONTRIBUTING.md">参与贡献</a>
  </p>

  <p>
    <a href="https://github.com/PeterShanxin/prompt-ui-academy/actions/workflows/ci.yml"><img src="https://github.com/PeterShanxin/prompt-ui-academy/actions/workflows/ci.yml/badge.svg" alt="CI status" /></a>
    <a href="LICENSE"><img src="https://img.shields.io/github/license/PeterShanxin/prompt-ui-academy" alt="MIT license" /></a>
    <img src="https://img.shields.io/badge/Next.js-16-black" alt="Next.js 16" />
    <img src="https://img.shields.io/badge/TypeScript-strict-3178C6" alt="TypeScript strict" />
  </p>
</div>

## 这是什么

很多人知道自己想要什么感觉，却不知道如何把它说给 AI：

> “右边那个小开关，加一点丝滑动画，再做得高级一点。”

界面话术把这种模糊感觉拆成 AI 可以执行的共同语言。学习者会先认识 Button、Modal、Toast、Tooltip 等 UI 部件，再亲手比较 Fade、Slide、Spring、Stagger，最后在 Prompt 实验室中观察不同描述如何改变模拟输出。

整站支持简体中文与英文切换，语言偏好会保存在当前设备。

## 核心体验

| 页面 | 学习目标 | 互动方式 |
| --- | --- | --- |
| `/learn` | 建立完整学习路径 | 三章九节课程地图与进度 |
| `/dictionary` | 掌握高频 UI 名称 | 分类、搜索、视觉示例、标记掌握 |
| `/motion` | 说清楚动效参数 | 切换动效、调整时长与缓动 |
| `/quiz` | 检查是否真正会命名 | 四道情境题与即时解释 |
| `/lab` | 写出可控 UI Prompt | 模糊/精确 Prompt 实时对比 |

学习进度保存在浏览器本地，不需要账号。

## 设计原则

- **看见再命名** - 每个术语都配有可视化示例，而不是只有定义。
- **操作中理解** - 动效参数和 Prompt 结构可以实时调整、立即观察。
- **明确因果** - 让学习者看到“描述多一个约束，输出会发生什么变化”。
- **小步完成** - 独立子页面与明确的下一站，避免把整门课塞进一个长页面。
- **默认可访问** - 键盘焦点、语义结构、Reduced Motion 和响应式布局均为基础能力。

## 技术栈

- Next.js 16 + React 19
- TypeScript
- Tailwind CSS 4（通过 PostCSS）
- Vinext + Cloudflare Worker（ChatGPT Sites 构建）
- Vercel 原生 Next.js 构建

## 本地开发

要求 Node.js `>=22.13.0`。

```bash
git clone https://github.com/PeterShanxin/prompt-ui-academy.git
cd prompt-ui-academy
npm ci
npm run dev
```

常用检查：

```bash
npm run lint
npm run build:vercel
npm test
```

`npm test` 会验证 Vinext/Sites 构建产物；`npm run build:vercel` 验证原生 Next.js 部署路径。

## 项目结构

```text
app/
├── components/      # 共享学习组件与互动实验
├── dictionary/      # UI 视觉词典
├── lab/             # Prompt 实验室
├── learn/           # 课程地图
├── motion/          # 动效实验
├── quiz/            # 知识小测
└── lib/content.ts   # 课程、词条、动效与题库内容
```

更完整的技术说明见 [架构文档](docs/ARCHITECTURE.md)。

## 部署

项目同时维护两条经过验证的生产构建：

- ChatGPT Sites：`npm run build`
- Vercel：`npm run build:vercel`

Vercel 会读取仓库根目录的 `vercel.json` 并使用标准 Next.js 输出。

- Production: <https://prompt-ui-academy.vercel.app>
- Sites mirror: <https://prompt-ui-academy.petersx.chatgpt.site>

## 参与贡献

欢迎补充新的 UI 词条、动效案例、题目或 Prompt 对比。提交前请阅读 [CONTRIBUTING.md](CONTRIBUTING.md) 和 [行为准则](CODE_OF_CONDUCT.md)。安全问题请遵循 [SECURITY.md](SECURITY.md)，不要公开提交漏洞细节。

## 路线图

- 更完整的 UI 组件与交互模式词典
- Prompt 前后对照练习与分步提示
- 学习进度导出与跨设备同步
- 英文界面及双语课程内容
- 社区贡献的术语、题目与案例审核流程

## License

[MIT](LICENSE) © 2026 Shanxin Li
