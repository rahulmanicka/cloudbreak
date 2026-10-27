import { ArrowRight, ChevronRight, Lock, Smartphone } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { BreakyAvatar } from "@/components/BreakyAvatar";
import { LESSONS } from "@/content/lessons";
import { quittingInfo } from "@/content/quitting";
import { db } from "@/lib/db";
import { dayKey, daysSince, moneySavedCents } from "@/lib/progress";
import { requireUser } from "@/lib/session";
import { DailyLog } from "./DailyLog";
import { HabitCalendar } from "./HabitCalendar";
import { StatTiles } from "./StatTiles";

// Layout mirrors the chosen mockup (design/A-duolingo-bright.png) top to bottom:
// hero lesson card → two stat tiles → daily check-in → coming-soon track → get real help → calendar.
// Breaky's sky lives on the profile page (/me).
export default async function Home() {
  const user = await requireUser();
  const d = await db();
  const today = dayKey(new Date(), user.tz);
  const [progress, checkins] = await Promise.all([
    d.collection("lessonProgress").find({ userId: user._id }).project({ lessonSlug: 1 }).toArray(),
    d.collection("checkins").find({ userId: user._id }).project({ day: 1, used: 1 }).sort({ day: -1 }).limit(62).toArray(),
  ]);
  const done = new Set(progress.map((p) => p.lessonSlug as string));
  const next = LESSONS.find((l) => !done.has(l.slug)) ?? null;
  const logs: Record<string, boolean> = {};
  for (const c of checkins) if (typeof c.used === "boolean") logs[c.day as string] = c.used;

  const q = quittingInfo(user.quitting);
  const days = user.quitDate ? daysSince(user.quitDate, user.tz) : null;
  const saved = user.quitDate && user.weeklySpendCents ? moneySavedCents(user.quitDate, user.weeklySpendCents, user.tz) : null;

  return (
    <div className="space-y-3.5 pb-6">
      {/* Hero: Today's lesson */}
      <section className="relative overflow-hidden rounded-[1.75rem] bg-[#ddf4ff] px-5 pb-5 pt-5">
        <p className="relative z-10 text-[15px] font-extrabold text-ink">{next ? "Today's lesson:" : "All done!"}</p>
        <h1 className="relative z-10 mt-1 max-w-[55%] text-[30px] font-black leading-[1.05] text-ink">
          {next ? next.title : "You finished every lesson"}
        </h1>
        <Link
          href={next ? `/learn/${next.slug}` : "/learn"}
          className="btn-pop relative z-10 mt-5 inline-flex items-center gap-2 rounded-full bg-brand px-7 py-3 text-xl font-black text-white"
        >
          {next ? "Start" : "Review"} <ArrowRight size={22} strokeWidth={3} />
        </Link>
        <Image
          src="/hero-breaky.webp"
          alt=""
          width={440}
          height={440}
          priority
          className="pointer-events-none absolute -right-6 bottom-0 h-[230px] w-[230px] object-contain mix-blend-multiply"
        />
      </section>

      <StatTiles days={days ?? 0} freeLabel={q.free} savedCents={saved ?? 0} weeklyCents={user.weeklySpendCents ?? 0} />
      {days == null && (
        <Link href="/onboarding" className="block rounded-2xl bg-sky-soft p-3 text-center text-sm font-bold text-sky-dark">
          Set your quit day to start counting
        </Link>
      )}

      <DailyLog used={today in logs ? logs[today] : null} item={q.item} />

      {/* Coming soon track */}
      <div className="flex items-center gap-3 rounded-[1.5rem] bg-[#f1f3f6] p-4">
        <Lock size={26} className="shrink-0 text-ink-soft" aria-hidden="true" />
        <div className="flex-1">
          <p className="text-sm font-bold text-ink-soft">Coming soon:</p>
          <p className="text-xl font-black text-ink-soft">Social media</p>
          <p className="text-xs font-semibold text-muted">Learn to handle triggers online.</p>
        </div>
        <Smartphone size={34} className="text-muted" aria-hidden="true" />
        <ChevronRight size={20} className="text-muted" aria-hidden="true" />
      </div>

      {/* Get real help */}
      <Link href="/help" className="flex items-center gap-3 rounded-[1.5rem] bg-[#e5f4ff] p-3 pr-4">
        <BreakyAvatar size={58} pose="wave" />
        <div className="flex-1">
          <p className="text-xl font-black text-ink">Get real help</p>
          <p className="text-sm font-semibold text-ink-soft">Resources, tips and support</p>
        </div>
        <ChevronRight size={22} className="text-brand" aria-hidden="true" />
      </Link>

      <HabitCalendar logs={logs} today={today} />
    </div>
  );
}
