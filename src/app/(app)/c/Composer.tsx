"use client";

import { Clock, ShieldAlert, ShieldCheck } from "lucide-react";
import { useActionState, useEffect, useState } from "react";
import { CrisisCard } from "@/components/CrisisCard";
import { Button } from "@/components/ui";
import { createComment, createPost, type SubmitState } from "./actions";

export function Composer({ board, postId }: { board?: string; postId?: string }) {
  const isComment = !!postId;
  const [state, action, pending] = useActionState<SubmitState, FormData>(isComment ? createComment : createPost, {});
  // Controlled textarea: React resets uncontrolled forms after every action, which would wipe a blocked
  // post the user wants to edit. We clear it ourselves, only when the post actually went live.
  const [text, setText] = useState("");

  useEffect(() => {
    if (state.decision === "allow") setText("");
  }, [state]);

  return (
    <div className="space-y-3">
      <form action={action} className="space-y-2">
        {board && <input type="hidden" name="board" value={board} />}
        {postId && <input type="hidden" name="postId" value={postId} />}
        <textarea
          name="body"
          value={text}
          onChange={(e) => setText(e.target.value)}
          required
          maxLength={1000}
          rows={isComment ? 2 : 3}
          placeholder={isComment ? "Say something encouraging…" : "What's going on? Everyone here has been there."}
          className="w-full resize-none rounded-2xl border border-line bg-white px-4 py-3 font-medium outline-none focus:border-sky"
        />
        <div className="flex items-center justify-between gap-3">
          <p className="flex items-center gap-1.5 text-xs text-ink-soft"><ShieldCheck size={14} className="shrink-0 text-grass-dark" aria-hidden="true" /> Checked before anyone sees it. No names, numbers, or meetups.</p>
          <div className="w-32 shrink-0">
            <Button type="submit" disabled={pending}>
              {pending ? "Checking…" : isComment ? "Reply" : "Post"}
            </Button>
          </div>
        </div>
      </form>

      {state.error && <p className="rounded-xl bg-coral-soft px-3 py-2 text-sm font-bold text-coral-dark">{state.error}</p>}
      {state.decision === "allow" && (
        <p className="rounded-xl bg-grass-soft px-3 py-2 text-sm font-bold text-grass-dark">Posted.</p>
      )}
      {state.decision === "block" && (
        <div className="rounded-xl bg-coral-soft px-3 py-2 text-sm text-coral-dark">
          <p className="flex items-center gap-1.5 font-black"><ShieldAlert size={16} aria-hidden="true" /> Not posted</p>
          {state.reasons?.map((r) => <p key={r}>{r}</p>)}
          <p className="mt-1 text-xs">Edit it and try again.</p>
        </div>
      )}
      {state.decision === "review" && (
        <p className="rounded-xl bg-sun-soft px-3 py-2 text-sm font-bold text-sun-dark">
          <span className="flex items-center gap-1.5"><Clock size={16} aria-hidden="true" /> A moderator is checking this before it goes live.</span>
        </p>
      )}
      {state.decision === "crisis" && <CrisisCard />}
    </div>
  );
}
