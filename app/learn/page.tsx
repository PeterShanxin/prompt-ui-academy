import type { Metadata } from "next";
import { LearnPageView } from "../components/CoursePageViews";

export const metadata: Metadata = { title: "学习路径 - 界面话术", description: "三章互动课程，从认识 UI 部件到写出可执行 Prompt。" };

export default function LearnPage() {
  return <LearnPageView />;
}
