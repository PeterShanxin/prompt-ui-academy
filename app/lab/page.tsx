import type { Metadata } from "next";
import { LabPageView } from "../components/CoursePageViews";

export const metadata: Metadata = { title: "Prompt 实验室 - 界面话术", description: "实时比较模糊和精确 UI Prompt 对模拟界面的影响。" };

export default function LabPage() {
  return <LabPageView />;
}
