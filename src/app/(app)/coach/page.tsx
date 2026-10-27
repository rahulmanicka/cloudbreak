import { ChevronRight, History, Trash2 } from "lucide-react";
import Link from "next/link";
import { Breaky } from "@/components/BreakyAvatar";
import { dayKey } from "@/lib/progress";
import { requireUser } from "@/lib/session";
import { deleteCoachDay, listCoachDays, loadCoachDay } from "./actions";
import { CoachChat } from "./CoachChat";

function dayLabel(day: string, today: string): string {
  const diff = Math.round((Date.parse(today) - Date.parse(day)) / 86_400_000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  return new Date(day + "T12:00:00Z").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", timeZone: "UTC" });
}

export default async function CoachPage({ searchParams }: { searchParams: Promise<{ day?: string; history?: string }> }) {
  const user = await requireUser();
  const sp = await searchParams;
  const today = dayKey(new Date(), user.tz);
  const day = sp.day && /^\d{4}-\d{2}-\d{2}$/.test(sp.day) ? sp.day : today;
  const isToday = day === today;
  const [turns, days] = await Promise.all([loadCoachDay(day), listCoachDays()]);

  if (sp.history) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-black">Your check-ins</h1>
          <Link href="/coach" className="text-sm font-bold text-sky-dark">
            Back to today
          </Link>
        </div>
        <p className="text-sm text-ink-soft">One conversation per day. Delete any day whenever you want.</p>
        {days.length === 0 && <p className="py-8 text-center text-ink-soft">No check-ins yet.</p>}
        <ul className="space-y-2">
          {days.map((d) => (
            <li key={d.day} className="card flex items-center gap-3 p-3">
              <Link href={`/coach?day=${d.day}`} className="min-w-0 flex-1">
                <p className="font-bold">{dayLabel(d.day, today)}</p>
                <p className="truncate text-sm text-ink-soft">{d.preview}</p>
              </Link>
              <form action={deleteCoachDay.bind(null, d.day)}>
                <button aria-label={`Delete ${dayLabel(d.day, today)}`} className="rounded-full p-2 text-muted hover:bg-coral-soft hover:text-coral">
                  <Trash2 size={16} />
                </button>
              </form>
              <ChevronRight size={18} className="text-muted" aria-hidden="true" />
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div className="flex min-h-[75dvh] flex-col">
      <div className="mb-4 flex items-center gap-3">
        <Breaky size={82} pose="wave" />
        <div className="flex-1">
          <h1 className="text-xl font-black leading-tight">{isToday ? "Check in with Breaky" : dayLabel(day, today)}</h1>
          <p className="text-xs font-medium text-ink-soft">AI coach, not a person · saved by day, delete anytime</p>
        </div>
        <Link href="/coach?history=1" className="flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-sm font-semibold text-ink-soft ring-1 ring-line hover:text-sky-dark">
          <History size={16} aria-hidden="true" /> History
        </Link>
      </div>

      {/* key: remount when switching days so the chat state matches the selected day */}
      <CoachChat key={day} initial={turns.map((t) => ({ role: t.role, content: t.content }))} readOnly={!isToday} />

      {!isToday && (
        <Link href="/coach" className="mt-6 text-center text-sm font-bold text-sky-dark">
          Go to today&apos;s check-in
        </Link>
      )}
      <p className="mt-3 text-center text-[11px] text-ink-soft">
        Breaky can be wrong. For medical questions, talk to a doctor. In danger? Call or text 988.
      </p>
    </div>
  );
}
