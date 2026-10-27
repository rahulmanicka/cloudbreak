import { ChevronRight, LogOut } from "lucide-react";
import Link from "next/link";
import { logout } from "@/app/(auth)/actions";
import { SkyScene, skyStage } from "@/components/BreakySky";
import { quittingInfo } from "@/content/quitting";
import { activityDates, countDays } from "@/lib/activity";
import { db } from "@/lib/db";
import { dayKey } from "@/lib/progress";
import { requireUser } from "@/lib/session";
import { HabitCalendar } from "../home/HabitCalendar";
import { DeleteAccount, UsernameForm } from "./ProfileForms";
import { ShareBreaky } from "./ShareBreaky";

// Profile + settings: your Breaky on its full sky, sharing, your calendar, and account controls.
export default async function Me() {
  const user = await requireUser();
  const d = await db();
  const today = dayKey(new Date(), user.tz);
  const [lessons, checkins, activity] = await Promise.all([
    d.collection("lessonProgress").countDocuments({ userId: user._id }),
    d.collection("checkins").find({ userId: user._id }).project({ day: 1, used: 1 }).sort({ day: -1 }).limit(62).toArray(),
    activityDates(user._id),
  ]);
  const logs: Record<string, boolean> = {};
  for (const c of checkins) if (typeof c.used === "boolean") logs[c.day as string] = c.used;
  const days = countDays(activity, user.tz);
  const { index, stage, next, progress } = skyStage(days);
  const q = quittingInfo(user.quitting);

  return (
    <div className="space-y-4 pb-6">
      {/* Full-bleed sky: Breaky's home */}
      <section className="relative -mx-4 -mt-4">
        <SkyScene index={index} pose={index >= 3 ? "cheer" : "proud"} height={340} lift={40} breakySize={190} />
        <div className="absolute inset-x-0 top-4 px-5 text-white [text-shadow:0_1px_6px_rgb(20_27_52/0.35)]">
          <p className="text-[28px] font-black leading-none">{user.username}</p>
          <p className="mt-1 text-sm font-extrabold opacity-95">
            Level {index + 1} · {stage.name}
          </p>
        </div>
      </section>

      <section className="relative -mt-9 rounded-[1.75rem] bg-white p-4 text-center shadow-lg ring-1 ring-line">
        <div className="grid grid-cols-3 divide-x divide-line">
          <Stat value={days} label="days showing up" />
          <Stat value={user.xp} label="XP" />
          <Stat value={lessons} label="lessons done" />
        </div>
        {next ? (
          <div className="mx-auto mt-4 max-w-xs">
            <div className="h-2.5 overflow-hidden rounded-full bg-line">
              <div className="h-full rounded-full bg-sun" style={{ width: `${Math.round(progress * 100)}%` }} />
            </div>
            <p className="mt-1 text-xs font-semibold text-ink-soft">
              {next.min - days} more {next.min - days === 1 ? "day" : "days"} until {next.name.toLowerCase()}
            </p>
          </div>
        ) : (
          <p className="mt-3 text-sm font-semibold text-ink-soft">{stage.note}</p>
        )}
        <div className="mt-1 [&>button]:bg-sky-soft">
          <ShareBreaky />
        </div>
      </section>

      <HabitCalendar logs={logs} today={today} />

      <section className="card space-y-4 p-4">
        <h2 className="text-lg font-black">Settings</h2>
        <UsernameForm current={user.username} />
        <Link href="/onboarding" className="flex items-center gap-3 rounded-2xl bg-cloud p-3">
          <div className="flex-1">
            <p className="text-sm font-semibold text-ink-soft">Quit plan</p>
            <p className="font-bold">
              {q.label}
              {user.quitDate &&
                ` · since ${user.quitDate.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" })}`}
              {user.weeklySpendCents ? ` · $${Math.round(user.weeklySpendCents / 100)}/week` : ""}
            </p>
          </div>
          <span className="flex items-center text-sm font-bold text-sky-dark">
            Edit <ChevronRight size={18} />
          </span>
        </Link>
        <form action={logout}>
          <button className="btn-3d flex w-full items-center justify-center gap-2 rounded-2xl bg-white py-3 font-bold text-ink ring-1 ring-line">
            <LogOut size={18} /> Log out
          </button>
        </form>
      </section>

      <DeleteAccount />
    </div>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div className="px-1">
      <p className="text-[28px] font-black leading-none text-ink">{value}</p>
      <p className="mt-1 text-[11px] font-bold leading-tight text-ink-soft">{label}</p>
    </div>
  );
}
