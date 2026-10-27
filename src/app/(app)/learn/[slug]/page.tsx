import { notFound } from "next/navigation";
import { lessonBySlug } from "@/content/lessons";
import { requireUser } from "@/lib/session";
import { LessonPlayer } from "./LessonPlayer";

export default async function LessonPage({ params }: { params: Promise<{ slug: string }> }) {
  await requireUser();
  const lesson = lessonBySlug((await params).slug);
  if (!lesson) notFound();
  return <LessonPlayer lesson={lesson} />;
}
