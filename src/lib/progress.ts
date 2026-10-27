// Streak + XP engine. Pure functions, no I/O, so they are easy to test.
// AI-assisted (Claude), reviewed by Rahul. See AI_DISCLOSURE.md.
import type { TrackProgress } from "./db";

const MS_PER_DAY = 86_400_000;

/** Calendar day (YYYY-MM-DD) for an instant, in the user's own timezone. */
export function dayKey(at: Date, tz: string): string {
  try {
    return new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit" }).format(at);
  } catch {
    return at.toISOString().slice(0, 10); // unknown tz string: fall back to UTC
  }
}

/** Whole calendar days between two YYYY-MM-DD keys (b - a). */
export function daysBetween(a: string, b: string): number {
  return Math.round((Date.parse(b + "T00:00:00Z") - Date.parse(a + "T00:00:00Z")) / MS_PER_DAY);
}

export function daysSince(start: Date, tz: string, now = new Date()): number {
  return Math.max(0, daysBetween(dayKey(start, tz), dayKey(now, tz)));
}

export function moneySavedCents(start: Date, weeklyCents: number, tz: string, now = new Date()): number {
  return Math.floor((daysSince(start, tz, now) * weeklyCents) / 7);
}

/**
 * Update a track's streak after the user finishes a lesson on `today`.
 * - Same day as last activity: streak unchanged (one lesson a day counts).
 * - Exactly the next day: streak + 1.
 * - Gap of 2+ days (or first ever): streak restarts at 1.
 * Relapsing does NOT touch this: the learning streak is separate from days vape-free.
 */
export function advanceStreak(prev: TrackProgress | undefined, today: string): TrackProgress {
  const p = prev ?? { streakCurrent: 0, streakLongest: 0, lastActiveDay: null };
  if (p.lastActiveDay === today) return p;
  const gap = p.lastActiveDay ? daysBetween(p.lastActiveDay, today) : Infinity;
  const current = gap === 1 ? p.streakCurrent + 1 : 1;
  return { streakCurrent: current, streakLongest: Math.max(p.streakLongest, current), lastActiveDay: today };
}

/** Streak to display: it reads 0 once a full day has been missed, even before the next lesson. */
export function displayStreak(p: TrackProgress | undefined, today: string): number {
  if (!p?.lastActiveDay) return 0;
  return daysBetween(p.lastActiveDay, today) <= 1 ? p.streakCurrent : 0;
}

/**
 * "Showed up" days for the last 7 calendar days (oldest first, today last).
 * Deliberately NOT a streak: missing a day never resets anything. Streaks make a single miss feel like
 * total failure, which is the exact "I slipped so I've ruined everything" thinking quitting has to undo.
 */
export function lastSevenDays(activity: Date[], tz: string, now = new Date()): { day: string; label: string; active: boolean }[] {
  const active = new Set(activity.map((d) => dayKey(d, tz)));
  const today = dayKey(now, tz);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(Date.parse(today + "T12:00:00Z") - (6 - i) * MS_PER_DAY);
    const key = d.toISOString().slice(0, 10);
    return { day: key, label: "SMTWTFS"[d.getUTCDay()], active: active.has(key) };
  });
}

export const XP = {
  lessonComplete: 10,
  perCorrectAnswer: 5,
  perfectBonus: 5,
} as const;

export function lessonXp(correct: number, total: number): number {
  return XP.lessonComplete + correct * XP.perCorrectAnswer + (total > 0 && correct === total ? XP.perfectBonus : 0);
}
