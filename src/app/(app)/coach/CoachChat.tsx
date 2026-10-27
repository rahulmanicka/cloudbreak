"use client";

import { ArrowUp, Info } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { BreakyAvatar } from "@/components/BreakyAvatar";
import { CrisisCard } from "@/components/CrisisCard";
import { askCoach } from "./actions";

type Line =
  | { role: "user" | "assistant"; content: string }
  | { role: "note"; content: string }
  | { role: "crisis" }
  | { role: "system"; content: string };

const STARTERS = ["I'm craving right now", "Day 2 and I'm so irritable", "I slipped yesterday", "How do I tell my parents?"];

export function CoachChat({
  initial,
  readOnly,
  compact = false,
}: {
  initial: { role: "user" | "assistant" | "note"; content: string }[];
  readOnly: boolean;
  compact?: boolean; // inside the floating Breaky sheet
}) {
  const [lines, setLines] = useState<Line[]>(initial);
  const [draft, setDraft] = useState("");
  const [pending, start] = useTransition();
  const end = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Prefill from the home "Today" card (/coach?m=...). Nothing is sent until the user taps Send.
  useEffect(() => {
    const m = new URLSearchParams(window.location.search).get("m");
    if (m && !readOnly) setDraft(m.slice(0, 800));
  }, [readOnly]);

  // Braces matter: newer Chrome returns a Promise from scrollIntoView, and returning that from an
  // effect makes React treat it as a cleanup function ("destroy is not a function" crash).
  useEffect(() => {
    end.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [lines, pending]);

  function send(text: string) {
    const msg = text.trim();
    if (!msg || pending || readOnly) return;
    setLines((l) => [...l, { role: "user", content: msg }]);
    setDraft("");
    start(async () => {
      const r = await askCoach(msg);
      setLines((l) => [
        ...l,
        r.kind === "crisis"
          ? { role: "crisis" }
          : r.kind === "reply"
            ? { role: "assistant", content: r.text }
            : { role: "system", content: r.text },
      ]);
      router.refresh(); // update the history list
    });
  }

  return (
    <div className="flex flex-col">
      <div className="space-y-3">
        {lines.length === 0 && !readOnly && (
          <div className="space-y-3">
            <Bubble role="assistant">Hey! How&apos;s today going? Cravings, wins, whatever&apos;s on your mind.</Bubble>
            <div className="flex flex-wrap gap-2">
              {STARTERS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="rounded-full border border-line bg-white px-3 py-1.5 text-sm font-semibold text-ink-soft hover:border-sky hover:text-sky-dark"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
        {lines.map((l, i) =>
          l.role === "crisis" ? (
            <CrisisCard key={i} />
          ) : l.role === "note" ? (
            <p key={i} className="flex items-center justify-center gap-1.5 text-xs font-semibold text-muted">
              <Info size={12} aria-hidden="true" /> {l.content}
            </p>
          ) : l.role === "system" ? (
            <p key={i} className="rounded-2xl bg-sun-soft p-3 text-sm font-semibold text-sun-dark">
              {l.content}
            </p>
          ) : (
            <Bubble key={i} role={l.role}>
              {l.content}
            </Bubble>
          ),
        )}
        {pending && (
          <div className="flex items-center gap-2">
            <Avatar />
            <span className="flex gap-1 rounded-2xl bg-white px-4 py-3 shadow-sm">
              {[0, 1, 2].map((d) => (
                <span key={d} className="h-2 w-2 animate-bounce rounded-full bg-muted" style={{ animationDelay: `${d * 120}ms` }} />
              ))}
            </span>
          </div>
        )}
        <div ref={end} />
      </div>

      {!readOnly && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(draft);
          }}
          className={`sticky ${compact ? "bottom-2" : "bottom-20"} mt-4 flex items-center gap-2 rounded-full border border-line bg-white p-1.5 pl-4 shadow-sm`}
        >
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            maxLength={800}
            placeholder="Message Breaky…"
            className="flex-1 bg-transparent py-2 font-medium outline-none"
          />
          <button
            disabled={pending || !draft.trim()}
            aria-label="Send"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-sky text-ink transition disabled:opacity-40"
          >
            <ArrowUp size={20} strokeWidth={2.5} />
          </button>
        </form>
      )}
    </div>
  );
}

function Avatar() {
  return <BreakyAvatar size={32} />;
}

function Bubble({ role, children }: { role: "user" | "assistant"; children: React.ReactNode }) {
  if (role === "user") {
    return <p className="ml-auto max-w-[85%] whitespace-pre-line rounded-2xl rounded-br-md bg-sky px-4 py-2.5 text-ink">{children}</p>;
  }
  return (
    <div className="flex items-end gap-2">
      <Avatar />
      <p className="max-w-[85%] whitespace-pre-line rounded-2xl rounded-bl-md bg-white px-4 py-2.5 shadow-sm">{children}</p>
    </div>
  );
}
