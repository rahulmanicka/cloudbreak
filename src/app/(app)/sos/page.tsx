"use client";

import { Check, ChevronRight, Phone } from "lucide-react";
import { useEffect, useState } from "react";
import { Breaky, Icon3D } from "@/components/BreakyAvatar";
import { StormGame } from "./StormGame";

const TOTAL = 5 * 60;

// Coping steps paraphrased from Smokefree Teen, "Deal With Vape Cravings" (NCI).
const STEPS = [
  { icon: "lungs", tint: "bg-sky-soft", title: "Breathe in 4… out 6", body: "Slow, steady breaths help your body calm down." },
  { icon: "water", tint: "bg-sun-soft", title: "Drink cold water", body: "It can help interrupt the craving and reset your mind.", checkable: true },
  { icon: "chat", tint: "bg-grass-soft", title: "Text a friend", body: "Reach out to someone you trust. You're not alone." },
];

export default function SosPage() {
  const [left, setLeft] = useState(TOTAL);
  const [running, setRunning] = useState(false);
  const [drank, setDrank] = useState(false); // tap-to-check only; nothing is saved

  useEffect(() => {
    if (!running || left <= 0) return;
    const t = setTimeout(() => setLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [running, left]);

  const pct = 1 - left / TOTAL;
  const done = left <= 0;
  const mm = Math.floor(left / 60);
  const ss = String(left % 60).padStart(2, "0");
  const R = 44;
  const C = 2 * Math.PI * R;

  return (
    <div className="relative -mx-4 -mt-4 min-h-app overflow-hidden px-4 pt-6">
      {/* generated sky backdrop */}
      <div className="pointer-events-none absolute inset-0 bg-[url('/sky-bg.webp')] bg-cover bg-bottom opacity-90" aria-hidden="true" />
      <div className="relative space-y-4 text-center">
        <div>
          <h1 className="text-4xl font-black">SOS</h1>
          <p className="mt-1 font-semibold text-ink-soft">{done ? "You rode it out. That's huge." : "Take a breath. You've got this."}</p>
        </div>

        <button
          onClick={() => (done ? (setLeft(TOTAL), setRunning(false)) : setRunning((r) => !r))}
          className="relative mx-auto block h-72 w-72"
          aria-label={done ? "Restart timer" : running ? "Pause timer" : "Start 5-minute timer"}
        >
          <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full -rotate-90">
            <circle cx="50" cy="50" r={R} fill="rgba(255,255,255,0.75)" stroke="#e6e9f2" strokeWidth="7" />
            <circle
              cx="50"
              cy="50"
              r={R}
              fill="none"
              stroke={done ? "#10b39b" : "#4fb3f6"}
              strokeWidth="7"
              strokeLinecap="round"
              strokeDasharray={C}
              strokeDashoffset={C * (running || done ? 1 - pct : 0.0001)}
              className="transition-[stroke-dashoffset] duration-1000 ease-linear"
            />
          </svg>
          <span className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-6xl font-black tabular-nums">
              {mm}:{ss}
            </span>
            <span className={running && !done ? "animate-[pulse_8s_ease-in-out_infinite]" : ""}>
              <Breaky size={118} pose={done ? "cheer" : "calm"} />
            </span>
            <span className="-mt-1 text-xs font-bold text-sky-dark">
              {done ? "Tap to restart" : running ? "Breathe with Breaky" : "Tap to start"}
            </span>
          </span>
        </button>

        <StormGame />

        <ul className="space-y-2.5 text-left">
          {STEPS.map((s) =>
            "checkable" in s ? (
              <li key={s.title}>
                <button
                  onClick={() => setDrank((v) => !v)}
                  aria-pressed={drank}
                  aria-label={drank ? "Drank cold water, checked" : "Check off: drink cold water"}
                  className={`flex w-full items-center gap-3 rounded-[1.25rem] p-3 text-left transition ${drank ? "bg-grass-soft" : s.tint}`}
                >
                  <Icon3D name={s.icon} size={52} />
                  <div className="flex-1">
                    <p className="font-black">{drank ? "Done, nice" : s.title}</p>
                    <p className="text-sm text-ink-soft">{drank ? "Cold water helps reset. Keep riding it out." : s.body}</p>
                  </div>
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition ${
                      drank ? "border-grass bg-grass text-white" : "border-muted text-transparent"
                    }`}
                    aria-hidden="true"
                  >
                    <Check size={18} strokeWidth={3.5} />
                  </span>
                </button>
              </li>
            ) : (
              <li key={s.title} className={`flex items-center gap-3 rounded-[1.25rem] ${s.tint} p-3`}>
                <Icon3D name={s.icon} size={52} />
                <div className="flex-1">
                  <p className="font-black">{s.title}</p>
                  <p className="text-sm text-ink-soft">{s.body}</p>
                </div>
                <ChevronRight size={18} className="text-muted" aria-hidden="true" />
              </li>
            ),
          )}
        </ul>

        <a href="tel:988" className="btn-3d flex items-center justify-center gap-3 rounded-[1.25rem] bg-coral px-4 py-4 text-white">
          <Phone size={24} aria-hidden="true" />
          <span className="text-left">
            <span className="block text-lg font-black leading-tight">Talk to someone now · 988</span>
            <span className="block text-xs font-semibold text-white/90">Free. Confidential. 24/7.</span>
          </span>
        </a>
        <p className="pb-4 text-[11px] text-ink-soft">
          Tips adapted from{" "}
          <a className="underline" href="https://teen.smokefree.gov/quit-vaping/deal-with-vape-cravings" target="_blank" rel="noreferrer">
            Smokefree Teen (National Cancer Institute)
          </a>
          .
        </p>
      </div>
    </div>
  );
}
