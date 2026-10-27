"use server";

import { db, users } from "@/lib/db";
import { advanceStreak, dayKey, lessonXp } from "@/lib/progress";
import { requireUser } from "@/lib/session";
import { lessonBySlug } from "@/content/lessons";

export interface CompleteResult {
  xpGained: number;
  streak: number;
  firstTime: boolean;
}

export async function completeLesson(slug: string, answers: number[]): Promise<CompleteResult> {
  const user = await requireUser();
  const lesson = lessonBySlug(slug);
  if (!lesson) throw new Error("Unknown lesson");

  // Score on the server: never trust a client-sent score.
  const correct = lesson.quiz.filter((q, i) => answers[i] === q.answer).length;
  const today = dayKey(new Date(), user.tz);
  const streak = advanceStreak(user.tracks?.[lesson.track], today);

  const res = await (await db()).collection("lessonProgress").updateOne(
    { userId: user._id, lessonSlug: slug },
    { $setOnInsert: { userId: user._id, lessonSlug: slug, track: lesson.track, score: correct, completedAt: new Date() } },
    { upsert: true },
  );
  const firstTime = res.upsertedCount === 1;
  const xpGained = firstTime ? lessonXp(correct, lesson.quiz.length) : 0; // replays don't farm XP

  await (await users()).updateOne(
    { _id: user._id },
    { $inc: { xp: xpGained }, $set: { [`tracks.${lesson.track}`]: streak } },
  );
  return { xpGained, streak: streak.streakCurrent, firstTime };
}
