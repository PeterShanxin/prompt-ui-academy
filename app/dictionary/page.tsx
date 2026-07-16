import type { Metadata } from "next";
import { DictionaryView } from "../components/DictionaryView";
import { NextStop } from "../components/NextStop";

export const metadata: Metadata = { title: "UI 视觉词典 - 界面话术", description: "通过真实视觉例子学习 Button、Modal、Toast、Tooltip 等 UI 名称。" };

export default function DictionaryPage() {
  return <><section className="page-hero dictionary-page-hero"><div><p className="section-kicker">UI VISUAL DICTIONARY</p><h1>看到那个东西，<br />终于知道它叫什么</h1><p>按类别浏览或直接搜索。每张卡都给出准确名称、用途和一句可复用的 Prompt 描述。</p></div><aside className="dictionary-specimen" aria-hidden="true"><div><span>TOOLTIP</span><b>?</b></div><div><span>TOAST</span><b>✓ 已保存</b></div><div><span>SWITCH</span><i><em /></i></div></aside></section><DictionaryView /><NextStop eyebrow="下一站" title="让静态界面动起来" description="知道部件名称后，再学习 Fade、Slide、Spring 和 Stagger 的区别。" href="/motion" label="进入动效实验" /></>;
}
