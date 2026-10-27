import { TrendingDown } from "lucide-react";

/**
 * Month view of daily logs. Mint = a day without nicotine, amber = a use day (amber, not red: no shame colors).
 * The headline compares use-days this week vs last week, because the goal is "fewer", not "perfect".
 */
export function HabitCalendar({ logs, today }: { logs: Record<string, boolean>; today: string }) {
  const [y, m] = today.split("-").map(Number);
  const first = new Date(Date.UTC(y, m - 1, 1));
  const daysInMonth = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const lead = first.getUTCDay();
  const key = (d: number) => `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

  const dayMs = 86_400_000;
  const t = Date.parse(today + "T12:00:00Z");
  const iso = (ms: number) => new Date(ms).toISOString().slice(0, 10);
  const countUse = (from: number, to: number) => {
    let n = 0;
    for (let i = from; i < to; i++) if (logs[iso(t - i * dayMs)] === true) n++;
    return n;
  };
  const thisWeek = countUse(0, 7);
  const lastWeek = countUse(7, 14);

  return (
    <section className="card p-4">
      <div className="flex items-baseline justify-between">
        <p className="font-black">{first.toLocaleDateString("en-US", { month: "long", timeZone: "UTC" })}</p>
        <p className="flex items-center gap-1 text-xs font-bold text-ink-soft">
          {lastWeek > thisWeek && <TrendingDown size={14} className="text-grass-dark" aria-hidden="true" />}
          Use days: {thisWeek} this week · {lastWeek} last week
        </p>
      </div>
      <div className="mt-3 grid grid-cols-7 gap-1 text-center text-[11px] font-bold text-muted">
        {"SMTWTFS".split("").map((d, i) => (
          <span key={i}>{d}</span>
        ))}
        {Array.from({ length: lead }, (_, i) => (
          <span key={`l${i}`} />
        ))}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const k = key(i + 1);
          const v = logs[k];
          const isToday = k === today;
          return (
            <span
              key={k}
              className={`mx-auto flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                v === false ? "bg-grass text-white" : v === true ? "bg-sun text-ink" : k > today ? "text-line" : "text-ink-soft"
              } ${isToday ? "ring-2 ring-sky ring-offset-2" : ""}`}
            >
              {i + 1}
            </span>
          );
        })}
      </div>
      <div className="mt-3 flex items-center justify-center gap-4 text-[11px] font-semibold text-ink-soft">
        <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-grass" /> nicotine-free</span>
        <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-sun" /> used</span>
        <span>Goal: fewer, not perfect</span>
      </div>
    </section>
  );
}
