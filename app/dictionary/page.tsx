import type { Metadata } from "next";
import { DictionaryPageView } from "../components/CoursePageViews";

export const metadata: Metadata = { title: "UI 视觉词典 - 界面话术", description: "通过真实视觉例子学习 Button、Modal、Toast、Tooltip 等 UI 名称。" };

export default function DictionaryPage() {
  return <DictionaryPageView />;
}
