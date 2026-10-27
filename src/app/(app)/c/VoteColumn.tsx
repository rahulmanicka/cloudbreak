"use client";

import { ArrowBigDown, ArrowBigUp } from "lucide-react";
import { useState, useTransition } from "react";
import { upvote } from "./actions";

/** Reddit-style vote column on the left of a post card (upvotes only count; the down arrow just un-votes). */
export function VoteColumn({ id, upvotes, type = "post" }: { id: string; upvotes: number; type?: "post" | "comment" }) {
  const [, start] = useTransition();
  const [voted, setVoted] = useState(false);
  return (
    <div className="flex w-9 shrink-0 flex-col items-center pt-1 text-ink-soft">
      <button
        aria-label="Upvote"
        disabled={voted}
        onClick={() => {
          setVoted(true);
          start(() => upvote(type, id));
        }}
        className={voted ? "text-coral" : "hover:text-coral"}
      >
        <ArrowBigUp size={26} fill={voted ? "currentColor" : "none"} />
      </button>
      <span className={`text-sm font-black ${voted ? "text-coral" : "text-ink"}`}>{upvotes + (voted ? 1 : 0)}</span>
      <ArrowBigDown size={26} className="text-line" aria-hidden="true" />
    </div>
  );
}
