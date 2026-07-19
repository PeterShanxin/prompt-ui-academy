import type { LessonId } from "./learning-progress";

export type PreviewKind = "button" | "modal" | "toast" | "tooltip" | "tabs" | "accordion" | "toggle" | "skeleton";
export type Category = "all" | "navigation" | "input" | "overlay" | "feedback";

export type Term = {
  id: PreviewKind;
  cn: string;
  en: string;
  category: Exclude<Category, "all">;
  categoryLabel: string;
  categoryLabelEn: string;
  description: string;
  descriptionEn: string;
  prompt: string;
  promptEn: string;
};

export type CurriculumLesson = {
  id: LessonId;
  title: string;
  titleEn: string;
  time: string;
  timeEn: string;
  href: string;
};

type CurriculumModule = {
  id: string;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  color: string;
  lessons: CurriculumLesson[];
};

export const uiTerms: Term[] = [
  { id: "button", cn: "按钮", en: "Button", category: "input", categoryLabel: "输入与操作", categoryLabelEn: "Input & action", description: "触发一个明确动作。主按钮承载页面最重要的下一步。", descriptionEn: "Triggers a clear action. A primary button carries the most important next step on the page.", prompt: "一个高对比的蓝色 Primary Button，文字为‘继续’，包含 hover 与 focus 状态", promptEn: "A high-contrast blue Primary Button labeled ‘Continue’, including hover and focus states" },
  { id: "modal", cn: "模态对话框", en: "Modal Dialog", category: "overlay", categoryLabel: "浮层", categoryLabelEn: "Overlay", description: "浮在页面上方并暂时阻断背景操作，适合需要用户确认的任务。", descriptionEn: "Floats above the page and temporarily blocks background interaction, ideal for tasks that need confirmation.", prompt: "在页面中央打开 Modal Dialog，并在背景加入半透明 Scrim", promptEn: "Open a Modal Dialog in the center of the page with a translucent Scrim behind it" },
  { id: "toast", cn: "轻提示", en: "Toast / Snackbar", category: "feedback", categoryLabel: "反馈", categoryLabelEn: "Feedback", description: "短暂出现的非阻断消息，告诉用户操作已经成功或失败。", descriptionEn: "A brief, non-blocking message that tells the user whether an action succeeded or failed.", prompt: "保存后在右下角显示 3 秒的成功 Toast，不打断当前任务", promptEn: "After saving, show a success Toast in the bottom-right for 3 seconds without interrupting the task" },
  { id: "tooltip", cn: "工具提示", en: "Tooltip", category: "overlay", categoryLabel: "浮层", categoryLabelEn: "Overlay", description: "在悬停或键盘聚焦时，为图标或控件补充一小段说明。", descriptionEn: "Adds a short explanation to an icon or control on hover or keyboard focus.", prompt: "鼠标悬停问号图标时，在上方显示 Tooltip，延迟 300ms", promptEn: "On hover over the question-mark icon, show a Tooltip above it after a 300ms delay" },
  { id: "tabs", cn: "标签页", en: "Tabs", category: "navigation", categoryLabel: "导航", categoryLabelEn: "Navigation", description: "在同一层级的内容视图之间切换，共享同一块内容区域。", descriptionEn: "Switches between content views at the same hierarchy level within one shared content area.", prompt: "使用三项 Tabs 切换概览、活动与设置，当前项显示底部指示线", promptEn: "Use three Tabs for Overview, Activity, and Settings, with an underline on the active tab" },
  { id: "accordion", cn: "手风琴", en: "Accordion / Disclosure", category: "navigation", categoryLabel: "导航", categoryLabelEn: "Navigation", description: "通过展开和收起标题来管理纵向内容，常见于 FAQ。", descriptionEn: "Manages vertical content by expanding and collapsing headings, commonly used for FAQs.", prompt: "把常见问题做成单项展开的 Accordion，标题右侧使用旋转 Chevron", promptEn: "Turn the FAQ into a single-open Accordion with a rotating Chevron on the right of each heading" },
  { id: "toggle", cn: "切换开关", en: "Switch / Toggle", category: "input", categoryLabel: "输入与操作", categoryLabelEn: "Input & action", description: "立即在开和关两个状态之间切换，适合独立设置。", descriptionEn: "Immediately switches between on and off states, suitable for independent settings.", prompt: "用 Switch 控制深色模式，打开时轨道变蓝并让圆点滑向右侧", promptEn: "Use a Switch for dark mode; when on, turn the track blue and slide the thumb to the right" },
  { id: "skeleton", cn: "骨架屏", en: "Skeleton Screen", category: "feedback", categoryLabel: "反馈", categoryLabelEn: "Feedback", description: "在内容加载前保留大致结构，减少页面跳动和等待焦虑。", descriptionEn: "Preserves the approximate layout before content loads, reducing layout shift and waiting anxiety.", prompt: "数据加载时显示与最终卡片同尺寸的 Skeleton，并加入轻微 Shimmer", promptEn: "While data loads, show a Skeleton matching the final card size with a subtle Shimmer" },
];

export const categories: { id: Category; label: string; labelEn: string }[] = [
  { id: "all", label: "全部", labelEn: "All" },
  { id: "navigation", label: "导航", labelEn: "Navigation" },
  { id: "input", label: "输入与操作", labelEn: "Input & action" },
  { id: "overlay", label: "浮层", labelEn: "Overlay" },
  { id: "feedback", label: "反馈", labelEn: "Feedback" },
];

export const motions = [
  { id: "fade", cn: "淡入", en: "Fade in", note: "只改变透明度，安静、通用。", noteEn: "Changes opacity only. Quiet and versatile.", prompt: "以 240ms ease-out 淡入", promptEn: "Fade in over 240ms with ease-out" },
  { id: "slide", cn: "上移淡入", en: "Slide up", note: "带方向感，适合内容进入。", noteEn: "Adds direction, making it suitable for incoming content.", prompt: "从下方 16px 上移并淡入", promptEn: "Move up 16px from below while fading in" },
  { id: "scale", cn: "缩放进入", en: "Scale in", note: "强调元素从触发点出现。", noteEn: "Emphasizes that an element emerges from its trigger point.", prompt: "从 96% 缩放至 100%，同时淡入", promptEn: "Scale from 96% to 100% while fading in" },
  { id: "spring", cn: "弹簧回弹", en: "Spring", note: "带轻微过冲，活泼但不要滥用。", noteEn: "A slight overshoot feels lively, but should be used sparingly.", prompt: "使用 stiffness 260、damping 22 的轻微 Spring", promptEn: "Use a subtle Spring with stiffness 260 and damping 22" },
  { id: "stagger", cn: "交错出现", en: "Stagger", note: "多个项目依次进入，建立阅读节奏。", noteEn: "Brings multiple items in sequentially to create reading rhythm.", prompt: "列表项每隔 70ms 依次上移淡入", promptEn: "Stagger list items by 70ms, moving each one up while fading in" },
];

export const quizQuestions: { preview: PreviewKind; question: string; questionEn: string; options: string[]; answer: string; explanation: string; explanationEn: string }[] = [
  { preview: "tooltip", question: "聚焦图标后出现的这段小说明叫什么？", questionEn: "What is the short explanation that appears after focusing an icon called?", options: ["Tooltip", "Toast", "Modal"], answer: "Tooltip", explanation: "Tooltip 锚定在触发控件附近，只补充简短信息。", explanationEn: "A Tooltip is anchored near its trigger and adds only brief supporting information." },
  { preview: "toast", question: "保存完成后短暂出现、不会阻断操作的是？", questionEn: "What briefly appears after saving without blocking the user?", options: ["Dialog", "Toast", "Popover"], answer: "Toast", explanation: "Toast 通常自动消失，用来确认刚刚发生的操作。", explanationEn: "A Toast usually disappears automatically and confirms a recent action." },
  { preview: "modal", question: "中央窗口阻断背景操作，这个模式叫什么？", questionEn: "What is the centered window that blocks background interaction called?", options: ["Modal", "Drawer", "Card"], answer: "Modal", explanation: "Modal 要求用户先处理当前任务，再回到背景内容。", explanationEn: "A Modal asks the user to resolve the current task before returning to the background." },
  { preview: "skeleton", question: "内容加载前占住版式的灰色块叫什么？", questionEn: "What are the gray blocks that hold the layout before content loads called?", options: ["Spinner", "Skeleton", "Placeholder"], answer: "Skeleton", explanation: "Skeleton 模拟最终布局，适合可预测的内容结构。", explanationEn: "A Skeleton mirrors the final layout and works well for predictable content structures." },
];

export const vaguePrompt = "做一个好看的登录框，要高级一点，有点动画。";
export const precisePrompt = "设计一个居中的登录 Modal Dialog，宽 420px，使用 16px 圆角和柔和阴影。包含带标签的邮箱、密码 Input，底部放一个全宽蓝色 Primary Button。Focus 状态使用 2px 蓝色 focus ring，错误状态显示红色辅助文字。打开时让 Scrim 在 180ms 内淡入，Modal 使用轻微 spring scale 动画。";
export const vaguePromptEn = "Make a nice-looking login box. It should feel premium and have some animation.";
export const precisePromptEn = "Design a centered login Modal Dialog, 420px wide, with a 16px border radius and soft shadow. Include labeled email and password Inputs, plus a full-width blue Primary Button at the bottom. Use a 2px blue focus ring for the Focus state and red helper text for errors. On open, fade the Scrim in over 180ms and animate the Modal with a subtle spring scale.";

export const curriculum: CurriculumModule[] = [
  {
    id: "01",
    title: "认识界面语言",
    titleEn: "Learn interface language",
    description: "先把“那个框”“右边那个东西”变成准确的组件名称。",
    descriptionEn: "Turn ‘that box’ and ‘the thing on the right’ into precise component names.",
    color: "blue",
    lessons: [
      { id: "ui-components-patterns-structure", title: "组件、模式与页面结构", titleEn: "Components, patterns, and page structure", time: "4 分钟", timeEn: "4 min", href: "/dictionary#ui-components-patterns-structure" },
      { id: "ui-navigation-inputs", title: "导航与输入控件", titleEn: "Navigation and input controls", time: "6 分钟", timeEn: "6 min", href: "/dictionary#ui-navigation-inputs" },
      { id: "ui-overlays-feedback", title: "浮层与反馈", titleEn: "Overlays and feedback", time: "5 分钟", timeEn: "5 min", href: "/dictionary#ui-overlays-feedback" },
    ],
  },
  {
    id: "02",
    title: "说清楚动效",
    titleEn: "Describe motion clearly",
    description: "学会描述方向、持续时间、缓动和多个元素的节奏。",
    descriptionEn: "Learn to specify direction, duration, easing, and rhythm across multiple elements.",
    color: "coral",
    lessons: [
      { id: "motion-enter-exit", title: "进入与退出动效", titleEn: "Enter and exit motion", time: "5 分钟", timeEn: "5 min", href: "/motion#motion-enter-exit" },
      { id: "motion-duration-easing", title: "Duration 与 Easing", titleEn: "Duration and easing", time: "6 分钟", timeEn: "6 min", href: "/motion#motion-duration-easing" },
      { id: "motion-spring-stagger", title: "Spring 与 Stagger", titleEn: "Spring and stagger", time: "7 分钟", timeEn: "7 min", href: "/motion#motion-spring-stagger" },
    ],
  },
  {
    id: "03",
    title: "写成可执行 Prompt",
    titleEn: "Write an actionable prompt",
    description: "把目标、组件、视觉、状态和动效组合成可控指令。",
    descriptionEn: "Combine the goal, components, visuals, states, and motion into a controllable instruction.",
    color: "yellow",
    lessons: [
      { id: "prompt-five-part", title: "五段式 UI Prompt", titleEn: "The five-part UI prompt", time: "5 分钟", timeEn: "5 min", href: "/lab#prompt-five-part" },
      { id: "prompt-vague-to-precise", title: "从模糊要求到精确约束", titleEn: "From vague requests to precise constraints", time: "8 分钟", timeEn: "8 min", href: "/lab#prompt-vague-to-precise" },
      { id: "prompt-quiz-review", title: "小测与复盘", titleEn: "Quiz and review", time: "4 分钟", timeEn: "4 min", href: "/quiz#prompt-quiz-review" },
    ],
  },
];
