import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type Tone = "sky" | "grass" | "coral" | "sun" | "ghost";

const TONES: Record<Tone, string> = {
  sky: "bg-brand text-white btn-pop !shadow-[0_5px_0_var(--color-brand-dark)]",
  grass: "bg-grass text-white hover:bg-grass-dark",
  coral: "bg-coral text-white hover:bg-coral-dark",
  sun: "bg-sun text-ink",
  ghost: "bg-white text-sky-dark ring-1 ring-line",
};

const BASE =
  "btn-3d inline-flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-3.5 text-base font-bold disabled:opacity-50 disabled:shadow-none";

export function Button({ tone = "sky", className = "", ...p }: ComponentProps<"button"> & { tone?: Tone }) {
  return <button className={`${BASE} ${TONES[tone]} ${className}`} {...p} />;
}

export function ButtonLink({
  tone = "sky",
  className = "",
  ...p
}: ComponentProps<typeof Link> & { tone?: Tone }) {
  return <Link className={`${BASE} ${TONES[tone]} ${className}`} {...p} />;
}

export function Card({ className = "", children }: { className?: string; children: ReactNode }) {
  return <div className={`card p-4 ${className}`}>{children}</div>;
}

export function Field({ label, ...p }: ComponentProps<"input"> & { label: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-ink-soft">{label}</span>
      <input
        className="w-full rounded-2xl border border-line bg-white px-4 py-3 text-base font-medium outline-none transition focus:border-sky focus:ring-4 focus:ring-sky-soft"
        {...p}
      />
    </label>
  );
}

export function DemoTag() {
  return (
    <span className="rounded-full bg-sky-soft px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-sky-dark">
      Sample post · demo data
    </span>
  );
}
