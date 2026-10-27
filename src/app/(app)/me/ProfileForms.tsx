"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui";
import { changeUsername, deleteAccount, type ProfileState } from "./actions";

const INPUT =
  "w-full rounded-2xl border border-line bg-white px-4 py-3 text-base font-medium outline-none transition focus:border-sky focus:ring-4 focus:ring-sky-soft";

export function UsernameForm({ current }: { current: string }) {
  const [state, action, pending] = useActionState<ProfileState, FormData>(changeUsername, {});
  return (
    <form action={action} className="space-y-2">
      <label className="block">
        <span className="mb-1.5 block text-sm font-semibold text-ink-soft">Username</span>
        <div className="flex gap-2">
          <input name="username" defaultValue={current} maxLength={20} autoComplete="off" className={INPUT} />
          <button
            disabled={pending}
            className="btn-3d shrink-0 rounded-2xl bg-brand px-4 font-bold text-white disabled:opacity-50"
          >
            Save
          </button>
        </div>
      </label>
      {state.error && <p className="text-sm font-semibold text-coral-dark">{state.error}</p>}
      {state.ok && <p className="text-sm font-semibold text-grass-dark">{state.ok}</p>}
      <p className="text-xs text-ink-soft">No real names, phone numbers or social handles.</p>
    </form>
  );
}

// Two steps, no browser confirm() dialog: reveal the form, then type "delete".
export function DeleteAccount() {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState<ProfileState, FormData>(deleteAccount, {});
  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="w-full py-2 text-sm font-bold text-coral-dark">
        Delete my account
      </button>
    );
  }
  return (
    <form action={action} className="space-y-3 rounded-2xl bg-coral-soft p-4">
      <p className="font-black text-coral-dark">Delete your account?</p>
      <p className="text-sm text-ink">
        This erases your Breaky, check-ins, lessons, coach chats, posts and comments. It can&apos;t be undone.
      </p>
      <input name="confirm" placeholder='Type "delete"' autoComplete="off" className={INPUT} />
      {state.error && <p className="text-sm font-semibold text-coral-dark">{state.error}</p>}
      <div className="grid grid-cols-2 gap-2">
        <Button type="button" tone="ghost" onClick={() => setOpen(false)}>
          Cancel
        </Button>
        <Button tone="coral" disabled={pending}>
          Delete forever
        </Button>
      </div>
    </form>
  );
}
