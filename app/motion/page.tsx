import type { Metadata } from "next";
import { MotionPageView } from "../components/CoursePageViews";

export const metadata: Metadata = { title: "动效实验 - 界面话术", description: "实时体验 Fade、Slide、Scale、Spring 和 Stagger 动效参数。" };

export default function MotionPage() {
  return <MotionPageView />;
}
