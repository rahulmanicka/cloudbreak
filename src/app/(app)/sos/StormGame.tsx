"use client";

import { RotateCcw } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Breaky } from "@/components/BreakyAvatar";

// "Clear the storm": a ~60-second distraction while a craving passes (lesson 2: "play a game on your phone").
// Tap storm clouds to pop them; every pop clears the sky toward Breaky's sunny stage. Client-only: nothing is
// saved or sent anywhere. Framed as a distraction, never as a reward hit (lesson 1 teaches that dopamine is the hook).
const ROUND_SECONDS = 60;
const CLOUD_COUNT = 12;

interface Cloud {
  id: number;
  top: number; // % of panel height
  left: number; // % resting position, used when reduced motion turns the drift off
  width: number; // px
  duration: number; // s per pass across the panel
  delay: number; // s (negative, so clouds start spread out)
  popped: boolean;
}

function makeClouds(): Cloud[] {
  return Array.from({ length: CLOUD_COUNT }, (_, i) => ({
    id: i,
    top: 6 + ((i * 37) % 62) + Math.random() * 6,
    left: (i * 29) % 78,
    width: 74 + Math.round(Math.random() * 40),
    duration: 9 + Math.random() * 7,
    delay: -Math.random() * 14,
    popped: false,
  }));
}

function CloudShape({ fill }: { fill: string }) {
  return (
    <svg viewBox="0 0 100 55" className="h-auto w-full" aria-hidden="true">
      <path d="M22 50h58a18 18 0 0 0 2-35.9A24 24 0 0 0 36 12a16 16 0 0 0-14 38z" fill={fill} />
    </svg>
  );
}

function Burst() {
  // A ring and four sparkles, removed after the animation.
  return (
    <span className="cb-burst pointer-events-none absolute inset-0 flex items-center justify-center" aria-hidden="true">
      <span className="absolute h-14 w-14 rounded-full border-4 border-white/90" />
      {[0, 90, 180, 270].map((deg) => (
        <svg key={deg} viewBox="0 0 10 10" className="absolute h-4 w-4" style={{ transform: `rotate(${deg}deg) translateY(-30px)` }}>
          <path d="M5 0l1.2 3.8L10 5 6.2 6.2 5 10 3.8 6.2 0 5l3.8-1.2z" fill="#ffe066" />
        </svg>
      ))}
    </span>
  );
}

type Phase = "idle" | "playing" | "done";

export function StormGame() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [clouds, setClouds] = useState<Cloud[]>(() => makeClouds());
  const [left, setLeft] = useState(ROUND_SECONDS);
  const [bursts, setBursts] = useState<{ id: number; x: number; y: number; w: number }[]>([]);
  const timers = useRef<number[]>([]);
  const panel = useRef<HTMLDivElement>(null);

  const popped = clouds.filter((c) => c.popped).length;
  const cleared = phase === "done" ? 1 : popped / CLOUD_COUNT;

  // One steady clock per round (a per-tick timeout would restart on every pop and stall during fast tapping).
  useEffect(() => {
    if (phase !== "playing") return;
    const t = window.setInterval(() => setLeft((s) => Math.max(0, s - 1)), 1000);
    return () => window.clearInterval(t);
  }, [phase]);

  useEffect(() => {
    if (phase === "playing" && (left <= 0 || popped === CLOUD_COUNT)) setPhase("done");
  }, [phase, left, popped]);

  useEffect(() => () => timers.current.forEach(window.clearTimeout), []);

  const start = useCallback(() => {
    setClouds(makeClouds());
    setLeft(ROUND_SECONDS);
    setBursts([]);
    setPhase("playing");
  }, []);

  function pop(id: number, el: HTMLElement) {
    if (phase !== "playing") return;
    // Where the cloud is right now (it's mid-drift), so the burst appears on the spot.
    const box = el.getBoundingClientRect();
    const p = panel.current?.getBoundingClientRect();
    const scale = p && panel.current ? p.width / panel.current.offsetWidth || 1 : 1; // DeviceFrame scales the app
    const at = { id, x: (box.left - (p?.left ?? 0)) / scale, y: (box.top - (p?.top ?? 0)) / scale, w: box.width / scale };
    setClouds((cs) => cs.map((c) => (c.id === id ? { ...c, popped: true } : c)));
    setBursts((b) => [...b, at]);
    timers.current.push(window.setTimeout(() => setBursts((b) => b.filter((x) => x.id !== id)), 600));
  }

  const pose = phase === "done" ? "cheer" : cleared >= 0.5 ? "proud" : "calm";
  const cloudFill = cleared < 0.34 ? "#4b5470" : cleared < 0.67 ? "#7d8aa3" : "#aebbd0";

  return (
    <section
      aria-label="Clear the storm"
      data-game="clear-the-storm"
      data-phase={phase}
      className="overflow-hidden rounded-[1.5rem] bg-white text-left ring-1 ring-line"
    >
      <div className="flex items-baseline justify-between gap-2 px-4 pb-2 pt-3">
        <div>
          <h2 className="text-xl font-black">Clear the storm</h2>
          <p className="text-sm text-ink-soft">A quick distraction while the craving passes.</p>
        </div>
        {phase === "playing" && (
          <p className="shrink-0 text-right text-xs font-extrabold tabular-nums text-sky-dark" aria-live="polite">
            {left}s
          </p>
        )}
      </div>

      <div ref={panel} className="relative h-72 touch-manipulation select-none overflow-hidden">
        {/* Sky layers: stormy base, blue fades in with each pop, sun appears past halfway */}
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg,#6b7590 0%,#a3abbd 100%)" }} />
        <div
          className="absolute inset-0 transition-opacity duration-500"
          style={{ background: "linear-gradient(180deg,#1cb0f6 0%,#c9f0ff 100%)", opacity: cleared }}
        />
        <div
          className="absolute right-5 top-4 h-16 w-16 rounded-full transition-all duration-700"
          style={{
            background: "radial-gradient(circle,#ffe066 55%,#ffb020 100%)",
            boxShadow: "0 0 40px 14px rgb(255 214 102 / 0.55)",
            opacity: cleared >= 0.5 ? 1 : 0,
            transform: `translateY(${cleared >= 0.5 ? 0 : 30}px)`,
          }}
          aria-hidden="true"
        />

        {phase === "playing" &&
          clouds.map((c) =>
            c.popped ? null : (
              <button
                key={c.id}
                data-cloud={c.id}
                aria-label="Pop cloud"
                onPointerDown={(e) => {
                  e.preventDefault();
                  pop(c.id, e.currentTarget);
                }}
                onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && pop(c.id, e.currentTarget)}
                className="cb-cloud-drift absolute cursor-pointer p-1 drop-shadow-md transition-transform active:scale-90"
                style={{ top: `${c.top}%`, left: `${c.left}%`, width: c.width, animationDuration: `${c.duration}s`, animationDelay: `${c.delay}s` }}
              >
                <CloudShape fill={cloudFill} />
              </button>
            ),
          )}

        {bursts.map((b) => (
          <span key={b.id} className="pointer-events-none absolute" style={{ left: b.x, top: b.y, width: b.w, height: b.w * 0.6 }}>
            <Burst />
          </span>
        ))}

        {phase !== "playing" && (
          <div className="absolute inset-0 flex flex-col items-center justify-end pb-4 text-center">
            {phase === "idle" && (
              <div className="absolute inset-x-0 top-3 flex justify-around opacity-90" aria-hidden="true">
                <div className="w-28"><CloudShape fill="#4b5470" /></div>
                <div className="w-24 pt-6"><CloudShape fill="#4b5470" /></div>
              </div>
            )}
            <Breaky key={pose} size={phase === "done" ? 130 : 110} pose={pose} className="cb-grow mix-blend-normal! drop-shadow-lg" />
            {phase === "done" ? (
              <>
                <p className="mt-1 text-xl font-black text-ink" data-storm-cleared aria-live="polite">
                  Storm cleared. How&apos;s the craving now?
                </p>
                <button
                  onClick={start}
                  aria-label="Play Clear the storm again"
                  className="btn-pop mt-3 inline-flex items-center gap-2 rounded-full bg-brand px-6 py-2.5 font-black text-white"
                >
                  <RotateCcw size={18} strokeWidth={3} /> Play again
                </button>
              </>
            ) : (
              <button
                onClick={start}
                aria-label="Start Clear the storm"
                className="btn-pop mt-2 rounded-full bg-brand px-7 py-3 text-lg font-black text-white"
              >
                Play
              </button>
            )}
          </div>
        )}

        {phase === "playing" && (
          <div className="pointer-events-none absolute inset-x-0 bottom-1 flex justify-center">
            <Breaky key={pose} size={92} pose={pose} className="cb-grow mix-blend-normal! drop-shadow-lg" />
          </div>
        )}
      </div>
    </section>
  );
}
