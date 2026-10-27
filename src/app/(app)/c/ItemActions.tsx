"use client";

import { ArrowBigUp, Flag, MessageCircle } from "lucide-react";
import { useState, useTransition } from "react";
import { report, upvote } from "./actions";

export function ItemActions({
  type,
  id,
  upvotes,
  commentCount,
  href,
}: {
  type: "post" | "comment";
  id: string;
  upvotes?: number; // omit when the card shows a VoteColumn
  commentCount?: number;
  href?: string;
}) {
  const [, start] = useTransition();
  const [voted, setVoted] = useState(false);
  const [reporting, setReporting] = useState(false);
  const [reported, setReported] = useState(false);

  return (
    <div className="mt-2 flex items-center gap-4 text-sm font-semibold text-ink-soft">
      {upvotes !== undefined && (
      <button
        aria-label="Upvote"
        disabled={voted}
        onClick={() => {
          setVoted(true);
          start(() => upvote(type, id));
        }}
        className={`flex items-center gap-1 ${voted ? "text-sky-dark" : "hover:text-sky-dark"}`}
      >
        <ArrowBigUp size={20} fill={voted ? "currentColor" : "none"} aria-hidden="true" /> {upvotes + (voted ? 1 : 0)}
      </button>
      )}
      {commentCount !== undefined && href && (
        <a href={href} className="flex items-center gap-1 hover:text-sky-dark">
          <MessageCircle size={18} aria-hidden="true" /> {commentCount} {commentCount === 1 ? "reply" : "replies"}
        </a>
      )}
      <span className="flex-1" />
      {reported ? (
        <span className="text-xs text-muted">Reported. Thanks.</span>
      ) : reporting ? (
        <span className="flex gap-1">
          {["Personal info", "Selling", "Mean", "Worried about them"].map((r) => (
            <button
              key={r}
              onClick={() => {
                setReported(true);
                start(() => report(type, id, r));
              }}
              className="rounded-full bg-cloud px-2 py-0.5 text-xs"
            >
              {r}
            </button>
          ))}
        </span>
      ) : (
        <button onClick={() => setReporting(true)} className="flex items-center gap-1 text-xs text-muted hover:text-coral" aria-label="Report">
          <Flag size={14} aria-hidden="true" /> Report
        </button>
      )}
    </div>
  );
}
