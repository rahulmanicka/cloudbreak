"use client";

import { useOptimistic, useTransition } from "react";
import { Breaky, type BreakyPose } from "@/components/BreakyAvatar";
import { logToday } from "./actions";

const REACTION: Record<"none" | "no" | "yes", { pose: BreakyPose; line: string }> = {
  none: { pose: "think", line: "Quick one, no judgment either way." },
  no: { pose: "proud", line: "Look at you! That's a day for you, not the craving." },
  yes: { pose: "hug", line: "Thanks for being honest. One day doesn't undo you. Tomorrow's a new page." },
};

export function DailyLog({ used, item }: { used: boolean | null; item: string }) {
  const [state, setState] = useOptimistic<boolean | null>(used);
  const [, start] = useTransition();
  const r = REACTION[state === null ? "none" : state ? "yes" : "no"];

  function pick(v: boolean) {
    start(async () => {
      setState(v);
      await logToday(v);
    });
  }

  return (
    <section className="card relative overflow-hidden p-4">
      <div className="flex items-center gap-3">
        <Breaky size={84} pose={r.pose} className="-my-2 shrink-0" />
        <div className="flex-1">
          <p className="text-[11px] font-bold uppercase tracking-wider text-sky-dark">Daily check-in</p>
          <h2 className="text-xl font-black leading-tight">Did you use {item} today?</h2>
          <p className="mt-0.5 text-sm text-ink-soft">{r.line}</p>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <button
          onClick={() => pick(false)}
          className={`btn-3d rounded-2xl px-3 py-3 font-bold transition ${state === false ? "bg-grass text-white" : "bg-grass-soft text-grass-dark"}`}
        >
          Not today
        </button>
        <button
          onClick={() => pick(true)}
          className={`btn-3d rounded-2xl px-3 py-3 font-bold transition ${state === true ? "bg-sun text-ink" : "bg-sun-soft text-sun-dark"}`}
        >
          Yes, I did
        </button>
      </div>
    </section>
  );
}
