import type { Metadata } from "next";
import { QuizPageView } from "../components/CoursePageViews";

export const metadata: Metadata = { title: "UI 名称小测 - 界面话术", description: "用四道互动题检查你能否准确识别常用 UI 部件。" };

export default function QuizPage() {
  return <QuizPageView />;
}
