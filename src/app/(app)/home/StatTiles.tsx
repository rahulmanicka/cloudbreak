"use client";

import { useEffect, useState } from "react";
import { Icon3D } from "@/components/BreakyAvatar";

// Numbers count up from 0 on load (skipped for reduced motion), so the two headline stats feel like a reward.
function useCountUp(target: number, ms = 1100) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setN(target);
      return;
    }
    let raf = 0;
    const t0 = performance.now();
    const tick = (t: number) => {
      const k = Math.min(1, (t - t0) / ms);
      setN(Math.round(target * (1 - (1 - k) ** 3)));
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, ms]);
  return n;
}

const MILESTONES = [1, 3, 7, 14, 30, 60, 90, 180, 365];

export function StatTiles({ days, freeLabel, savedCents, weeklyCents }: {
  days: number;
  freeLabel: string;
  savedCents: number;
  weeklyCents: number;
}) {
  const shownDays = useCountUp(days);
  const shownDollars = useCountUp(Math.floor(savedCents / 100));
  const nextMilestone = MILESTONES.find((m) => m > days);
  const perDay = weeklyCents / 7 / 100;

  return (
    <section className="grid grid-cols-2 gap-3">
      <div className="relative overflow-hidden rounded-[1.5rem] bg-gradient-to-br from-[#e9fbd9] to-[#c8f0a8] p-4">
        <div className="absolute -right-5 -top-5 h-20 w-20 rounded-full bg-white/40" aria-hidden="true" />
        <Icon3D name="calendar" size={46} />
        <p className="mt-1.5 text-[15px] font-bold text-ink">Days {freeLabel}</p>
        <p className="text-[52px] font-black leading-none tabular-nums text-[#3a9a00]">{shownDays}</p>
        <p className="mt-2 inline-block rounded-full bg-white/70 px-2.5 py-1 text-[11px] font-extrabold text-[#2f7d00]">
          {nextMilestone ? `${nextMilestone - days} to go until ${nextMilestone}` : "Over a year!"}
        </p>
      </div>
      <div className="relative overflow-hidden rounded-[1.5rem] bg-gradient-to-br from-[#fff8dc] to-[#ffe49a] p-4">
        <div className="absolute -right-5 -top-5 h-20 w-20 rounded-full bg-white/40" aria-hidden="true" />
        <Icon3D name="coins" size={46} />
        <p className="mt-1.5 text-[15px] font-bold text-ink">Money saved</p>
        <p className="text-[52px] font-black leading-none tabular-nums text-[#e08a00]">${shownDollars}</p>
        <p className="mt-2 inline-block rounded-full bg-white/70 px-2.5 py-1 text-[11px] font-extrabold text-sun-dark">
          {perDay > 0 ? `+$${perDay.toFixed(2)} every day` : "Add your weekly spend"}
        </p>
      </div>
    </section>
  );
}
