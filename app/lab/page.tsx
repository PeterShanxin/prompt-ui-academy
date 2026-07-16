import type { Metadata } from "next";
import { PromptLab } from "../components/PromptLab";
import { NextStop } from "../components/NextStop";

export const metadata: Metadata = { title: "Prompt 实验室 - 界面话术", description: "实时比较模糊和精确 UI Prompt 对模拟界面的影响。" };

export default function LabPage() {
  return <><section className="page-hero lab-page-hero"><div><p className="section-kicker">PROMPT LAB</p><h1>别背模板，<br />直接观察因果</h1><p>编辑左侧 Prompt。右侧模拟界面会根据组件、尺寸、风格、状态和动效关键词即时改变。</p></div><aside className="lab-formula" aria-hidden="true"><span>目标</span><i>+</i><span>部件</span><i>+</i><span>约束</span><i>=</i><b>可控输出</b></aside></section><PromptLab /><NextStop eyebrow="完成一轮" title="回到课程地图继续复习" description="你的词典掌握进度会保留在当前设备，可以随时回来补齐。" href="/learn" label="查看学习进度" /></>;
}
