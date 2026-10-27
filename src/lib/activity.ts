import "server-only";
import type { ObjectId } from "mongodb";
import { db } from "./db";
import { dayKey } from "./progress";

/** Every activity timestamp for a user: finished lessons and daily check-ins. */
export async function activityDates(userId: ObjectId): Promise<Date[]> {
  const d = await db();
  const [lessons, checkins] = await Promise.all([
    d.collection("lessonProgress").find({ userId }).project({ completedAt: 1 }).toArray(),
    d.collection("checkins").find({ userId }).project({ at: 1 }).toArray(),
  ]);
  return [...lessons.map((l) => l.completedAt as Date), ...checkins.map((c) => c.at as Date)];
}

/** Distinct calendar days (in the user's timezone) the user showed up. Never decreases. */
export function countDays(dates: Date[], tz: string): number {
  return new Set(dates.map((x) => dayKey(x, tz))).size;
}
