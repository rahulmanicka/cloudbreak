"use client";

import { Maximize2, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { CoachChat } from "@/app/(app)/coach/CoachChat";
import { loadTodayCoach } from "@/app/(app)/coach/actions";
import { BreakyAvatar } from "./BreakyAvatar";

type Turn = { role: "user" | "assistant" | "note"; content: string };

/** Breaky floats bottom-right on every screen; tap to talk without leaving what you're doing. */
export function FloatingBreaky() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const [turns, setTurns] = useState<Turn[] | null>(null);

  useEffect(() => {
    if (!open) return;
    let alive = true;
    loadTodayCoach()
      .then((t) => alive && setTurns(t))
      .catch(() => alive && setTurns([]));
    return () => {
      alive = false;
    };
  }, [open]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (path.startsWith("/coach") || path.startsWith("/learn/")) return null;

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="Talk to Breaky, your AI coach"
          className="cb-bob fixed bottom-24 right-4 z-30 h-16 w-16 rounded-full bg-white shadow-[0_10px_30px_-8px_rgb(20_27_52/0.35)] ring-4 ring-sky-soft transition hover:scale-105"
        >
          <BreakyAvatar size={64} />
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-grass ring-2 ring-white" aria-hidden="true" />
        </button>
      )}

      {open && (
        <div className="fixed inset-0 z-40 flex items-end justify-center bg-ink/30 backdrop-blur-[2px]" onClick={() => setOpen(false)}>
          <div
            role="dialog"
            aria-label="Chat with Breaky"
            onClick={(e) => e.stopPropagation()}
            className="cb-sheet flex max-h-[85dvh] w-full max-w-md flex-col rounded-t-[1.75rem] bg-[#fbfcff] shadow-2xl"
          >
            <div className="flex items-center gap-3 border-b border-line px-4 py-3">
              <BreakyAvatar size={40} />
              <div className="flex-1">
                <p className="font-black leading-tight">Breaky</p>
                <p className="text-[11px] font-medium text-ink-soft">AI coach, not a person · saved by day</p>
              </div>
              <Link href="/coach" onClick={() => setOpen(false)} aria-label="Open full coach" className="rounded-full p-2 text-ink-soft hover:bg-cloud">
                <Maximize2 size={18} />
              </Link>
              <button onClick={() => setOpen(false)} aria-label="Close" className="rounded-full p-2 text-ink-soft hover:bg-cloud">
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-4 pb-2 pt-4">
              {turns === null ? (
                <p className="py-10 text-center text-sm text-ink-soft">Loading…</p>
              ) : (
                <CoachChat initial={turns} readOnly={false} compact />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
