"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { dayKey } from "@/lib/progress";
import { requireUser } from "@/lib/session";

async function checkins() {
  const col = (await db()).collection("checkins");
  await col.createIndex({ userId: 1, day: 1 }, { unique: true });
  return col;
}

/**
 * Daily log, Flow-style: "Did you use today?" Yes or no, no judgment. The goal isn't a perfect record;
 * it's fewer use-days over time (e.g. 3 a week down to 2). Re-tapping changes today's answer.
 */
export async function logToday(used: boolean) {
  const user = await requireUser();
  const day = dayKey(new Date(), user.tz);
  await (await checkins()).updateOne({ userId: user._id, day }, { $set: { used, at: new Date() } }, { upsert: true });
  revalidatePath("/home");
}

/** Optional: how strong cravings are today (1 = barely, 5 = really hard). */
export async function checkIn(level: number) {
  const user = await requireUser();
  if (!Number.isInteger(level) || level < 1 || level > 5) return;
  const day = dayKey(new Date(), user.tz);
  await (await checkins()).updateOne({ userId: user._id, day }, { $set: { level, at: new Date() } }, { upsert: true });
  revalidatePath("/home");
}

/**
 * Opt-in public link to the user's Breaky. The share page shows ONLY Breaky's sky, the level, and the count of days shown up.
 * No username, no quit date, no check-in data, so a shared link can't identify or expose a teen.
 */
export async function shareTree(): Promise<string> {
  const user = await requireUser();
  let id = (user as { shareId?: string }).shareId;
  if (!id) {
    id = randomBytes(8).toString("base64url");
    await (await db()).collection("users").updateOne({ _id: user._id }, { $set: { shareId: id } });
  }
  return `/t/${id}`;
}
