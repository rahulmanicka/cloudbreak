"use client";

import { useActionState } from "react";
import { Button, Field } from "@/components/ui";
import { login, signup, type AuthState } from "./actions";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const [state, action, pending] = useActionState<AuthState, FormData>(
    mode === "signup" ? signup : login,
    {},
  );
  const tz = typeof Intl !== "undefined" ? Intl.DateTimeFormat().resolvedOptions().timeZone : "";

  return (
    <form action={action} className="space-y-4">
      <Field label="Username" name="username" autoComplete="username" required />
      <Field
        label="Password"
        name="password"
        type="password"
        autoComplete={mode === "signup" ? "new-password" : "current-password"}
        required
      />
      {mode === "signup" && (
        <>
          <fieldset>
            <legend className="mb-1 text-sm font-bold text-ink-soft">How old are you?</legend>
            <div className="grid grid-cols-3 gap-2">
              {[
                ["under13", "Under 13"],
                ["13-17", "13–17"],
                ["18+", "18+"],
              ].map(([v, l]) => (
                <label
                  key={v}
                  className="cursor-pointer rounded-2xl border-2 border-line px-2 py-3 text-center font-extrabold has-[:checked]:border-sky has-[:checked]:bg-sky-soft has-[:checked]:text-sky-dark"
                >
                  <input type="radio" name="age" value={v} className="sr-only" required />
                  {l}
                </label>
              ))}
            </div>
          </fieldset>
          <input type="hidden" name="tz" value={tz} />
          <p className="text-xs text-ink-soft">
            No real name, email, or photo needed. Please don&apos;t use your real name as your username.
          </p>
        </>
      )}
      {state.error && (
        <p role="alert" className="rounded-xl bg-coral-soft px-3 py-2 text-sm font-bold text-coral-dark">
          {state.error}
        </p>
      )}
      <Button type="submit" disabled={pending}>
        {pending ? "One sec…" : mode === "signup" ? "Create account" : "Log in"}
      </Button>
    </form>
  );
}
