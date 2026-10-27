"use client";

import { useEffect, useState } from "react";

/**
 * Interactive: tap "Take a hit" and watch the reward loop fire (dopamine dots race around the pathway),
 * then fade. Tap again and the loop gets a little brighter and more automatic: that's how habits form.
 * Educational illustration, not anatomy: it shows the idea from NIDA's DrugFacts (nicotine -> dopamine -> repeat).
 */
export function RewardLoop() {
  const [hits, setHits] = useState(0);
  const [firing, setFiring] = useState(false);

  useEffect(() => {
    if (!firing) return;
    const t = setTimeout(() => setFiring(false), 1600);
    return () => clearTimeout(t);
  }, [firing]);

  const strength = Math.min(1, 0.25 + hits * 0.18);
  const path = "M60 120 C 60 60, 140 40, 175 80 S 220 150, 160 160 S 80 170, 60 120";

  return (
    <div className="rounded-[1.25rem] bg-sky-soft p-4">
      <svg viewBox="0 0 260 200" className="w-full" aria-label="Diagram of the brain's reward loop getting stronger with each use">
        {/* brain silhouette */}
        <path
          d="M40 120 C 20 80, 50 30, 110 28 C 150 10, 220 30, 230 80 C 250 110, 230 160, 190 168 C 160 190, 90 190, 70 170 C 40 165, 30 145, 40 120 Z"
          fill="#ffffff"
          stroke="#bfe7fb"
          strokeWidth="4"
        />
        {/* the reward pathway: thicker and brighter with every hit */}
        <path d={path} fill="none" stroke="#ffb020" strokeWidth={4 + hits * 2} strokeLinecap="round" opacity={strength} />
        {firing &&
          [0, 0.33, 0.66].map((delay) => (
            <circle key={delay} r="6" fill="#f2545b">
              <animateMotion dur="1.4s" begin={`${delay * 1.4}s`} repeatCount="1" path={path} fill="freeze" />
            </circle>
          ))}
        <text x="130" y="108" textAnchor="middle" fontSize="13" fontWeight="800" fill="#141b34">
          {firing ? "dopamine!" : hits === 0 ? "reward pathway" : "wants it again…"}
        </text>
      </svg>
      <div className="mt-2 flex items-center justify-between gap-3">
        <p className="text-sm font-bold text-ink-soft">
          {hits === 0
            ? "Tap to see what nicotine does."
            : `Each time, the loop gets stronger (${hits}×). That's the habit forming.`}
        </p>
        <button
          onClick={() => {
            setHits((h) => Math.min(h + 1, 4));
            setFiring(true);
          }}
          className="btn-3d shrink-0 rounded-xl bg-coral px-3 py-1.5 text-sm font-black text-white"
        >
          {hits === 0 ? "Show me" : "Again"}
        </button>
      </div>
    </div>
  );
}

/**
 * A craving as a wave: it builds, peaks, and passes. A dot rides the wave while you breathe.
 * Deliberately has no time axis or numbers: our sources say cravings are temporary and fade,
 * but don't give a duration, so we don't invent one.
 */
export function CravingWave() {
  const wave = "M0 150 C 60 150, 80 140, 110 110 C 140 60, 160 30, 190 30 C 220 30, 240 70, 270 115 C 300 150, 330 150, 400 150";
  const [breaths, setBreaths] = useState(0);

  return (
    <div className="rounded-[1.25rem] bg-sky-soft p-4">
      <svg viewBox="0 0 400 180" className="w-full" aria-label="A craving drawn as a wave that builds, peaks, and passes">
        <path d={wave + " L400 180 L0 180 Z"} fill="#eaf0ff" />
        <path d={wave} fill="none" stroke="#7cc8f8" strokeWidth="5" strokeLinecap="round" />
        <circle r="10" fill="#ffb020" stroke="#c77700" strokeWidth="3">
          <animateMotion dur="7s" repeatCount="indefinite" path={wave} />
        </circle>
        {[
          ["builds", 85, 170],
          ["peaks", 190, 18],
          ["passes", 320, 170],
        ].map(([label, x, y]) => (
          <text key={label} x={x} y={y} textAnchor="middle" fontSize="15" fontWeight="900" fill="#141b34">
            {label}
          </text>
        ))}
      </svg>
      <div className="mt-2 flex items-center justify-between gap-3">
        <p className="text-sm font-bold text-ink-soft">
          {breaths === 0 ? "Ride it with slow breaths: in through your nose, out through your mouth." : `${breaths} slow ${breaths === 1 ? "breath" : "breaths"}. Keep riding it.`}
        </p>
        <button
          onClick={() => setBreaths((b) => b + 1)}
          className="btn-3d shrink-0 rounded-xl bg-sky px-3 py-1.5 text-sm font-black text-ink"
        >
          I breathed
        </button>
      </div>
    </div>
  );
}

export const VISUALS = { "reward-loop": RewardLoop, "craving-wave": CravingWave } as const;
export type VisualId = keyof typeof VISUALS;
