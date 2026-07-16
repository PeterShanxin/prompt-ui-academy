export type PreviewKind = "button" | "modal" | "toast" | "tooltip" | "tabs" | "accordion" | "toggle" | "skeleton";
export type Category = "all" | "navigation" | "input" | "overlay" | "feedback";

export type Term = {
  id: PreviewKind;
  cn: string;
  en: string;
  category: Exclude<Category, "all">;
  categoryLabel: string;
  description: string;
  prompt: string;
};

export const uiTerms: Term[] = [
  { id: "button", cn: "按钮", en: "Button", category: "input", categoryLabel: "输入与操作", description: "触发一个明确动作。主按钮承载页面最重要的下一步。", prompt: "一个高对比的蓝色 Primary Button，文字为‘继续’，包含 hover 与 focus 状态" },
  { id: "modal", cn: "模态对话框", en: "Modal Dialog", category: "overlay", categoryLabel: "浮层", description: "浮在页面上方并暂时阻断背景操作，适合需要用户确认的任务。", prompt: "在页面中央打开 Modal Dialog，并在背景加入半透明 Scrim" },
  { id: "toast", cn: "轻提示", en: "Toast / Snackbar", category: "feedback", categoryLabel: "反馈", description: "短暂出现的非阻断消息，告诉用户操作已经成功或失败。", prompt: "保存后在右下角显示 3 秒的成功 Toast，不打断当前任务" },
  { id: "tooltip", cn: "工具提示", en: "Tooltip", category: "overlay", categoryLabel: "浮层", description: "在悬停或键盘聚焦时，为图标或控件补充一小段说明。", prompt: "鼠标悬停问号图标时，在上方显示 Tooltip，延迟 300ms" },
  { id: "tabs", cn: "标签页", en: "Tabs", category: "navigation", categoryLabel: "导航", description: "在同一层级的内容视图之间切换，共享同一块内容区域。", prompt: "使用三项 Tabs 切换概览、活动与设置，当前项显示底部指示线" },
  { id: "accordion", cn: "手风琴", en: "Accordion / Disclosure", category: "navigation", categoryLabel: "导航", description: "通过展开和收起标题来管理纵向内容，常见于 FAQ。", prompt: "把常见问题做成单项展开的 Accordion，标题右侧使用旋转 Chevron" },
  { id: "toggle", cn: "切换开关", en: "Switch / Toggle", category: "input", categoryLabel: "输入与操作", description: "立即在开和关两个状态之间切换，适合独立设置。", prompt: "用 Switch 控制深色模式，打开时轨道变蓝并让圆点滑向右侧" },
  { id: "skeleton", cn: "骨架屏", en: "Skeleton Screen", category: "feedback", categoryLabel: "反馈", description: "在内容加载前保留大致结构，减少页面跳动和等待焦虑。", prompt: "数据加载时显示与最终卡片同尺寸的 Skeleton，并加入轻微 Shimmer" },
];

export const categories: { id: Category; label: string }[] = [
  { id: "all", label: "全部" },
  { id: "navigation", label: "导航" },
  { id: "input", label: "输入与操作" },
  { id: "overlay", label: "浮层" },
  { id: "feedback", label: "反馈" },
];

export const motions = [
  { id: "fade", cn: "淡入", en: "Fade in", note: "只改变透明度，安静、通用。", prompt: "以 240ms ease-out 淡入" },
  { id: "slide", cn: "上移淡入", en: "Slide up", note: "带方向感，适合内容进入。", prompt: "从下方 16px 上移并淡入" },
  { id: "scale", cn: "缩放进入", en: "Scale in", note: "强调元素从触发点出现。", prompt: "从 96% 缩放至 100%，同时淡入" },
  { id: "spring", cn: "弹簧回弹", en: "Spring", note: "带轻微过冲，活泼但不要滥用。", prompt: "使用 stiffness 260、damping 22 的轻微 Spring" },
  { id: "stagger", cn: "交错出现", en: "Stagger", note: "多个项目依次进入，建立阅读节奏。", prompt: "列表项每隔 70ms 依次上移淡入" },
];

export const quizQuestions: { preview: PreviewKind; question: string; options: string[]; answer: string; explanation: string }[] = [
  { preview: "tooltip", question: "聚焦图标后出现的这段小说明叫什么？", options: ["Tooltip", "Toast", "Modal"], answer: "Tooltip", explanation: "Tooltip 锚定在触发控件附近，只补充简短信息。" },
  { preview: "toast", question: "保存完成后短暂出现、不会阻断操作的是？", options: ["Dialog", "Toast", "Popover"], answer: "Toast", explanation: "Toast 通常自动消失，用来确认刚刚发生的操作。" },
  { preview: "modal", question: "中央窗口阻断背景操作，这个模式叫什么？", options: ["Modal", "Drawer", "Card"], answer: "Modal", explanation: "Modal 要求用户先处理当前任务，再回到背景内容。" },
  { preview: "skeleton", question: "内容加载前占住版式的灰色块叫什么？", options: ["Spinner", "Skeleton", "Placeholder"], answer: "Skeleton", explanation: "Skeleton 模拟最终布局，适合可预测的内容结构。" },
];

export const vaguePrompt = "做一个好看的登录框，要高级一点，有点动画。";
export const precisePrompt = "设计一个居中的登录 Modal Dialog，宽 420px，使用 16px 圆角和柔和阴影。包含带标签的邮箱、密码 Input，底部放一个全宽蓝色 Primary Button。Focus 状态使用 2px 蓝色 focus ring，错误状态显示红色辅助文字。打开时让 Scrim 在 180ms 内淡入，Modal 使用轻微 spring scale 动画。";

export const curriculum = [
  {
    id: "01",
    title: "认识界面语言",
    description: "先把“那个框”“右边那个东西”变成准确的组件名称。",
    color: "blue",
    lessons: [
      { title: "组件、模式与页面结构", time: "4 分钟", href: "/dictionary" },
      { title: "导航与输入控件", time: "6 分钟", href: "/dictionary" },
      { title: "浮层与反馈", time: "5 分钟", href: "/dictionary" },
    ],
  },
  {
    id: "02",
    title: "说清楚动效",
    description: "学会描述方向、持续时间、缓动和多个元素的节奏。",
    color: "coral",
    lessons: [
      { title: "进入与退出动效", time: "5 分钟", href: "/motion" },
      { title: "Duration 与 Easing", time: "6 分钟", href: "/motion" },
      { title: "Spring 与 Stagger", time: "7 分钟", href: "/motion" },
    ],
  },
  {
    id: "03",
    title: "写成可执行 Prompt",
    description: "把目标、组件、视觉、状态和动效组合成可控指令。",
    color: "yellow",
    lessons: [
      { title: "五段式 UI Prompt", time: "5 分钟", href: "/lab" },
      { title: "从模糊要求到精确约束", time: "8 分钟", href: "/lab" },
      { title: "小测与复盘", time: "4 分钟", href: "/quiz" },
    ],
  },
];
