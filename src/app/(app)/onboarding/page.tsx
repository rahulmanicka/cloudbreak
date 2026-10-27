import { redirect } from "next/navigation";
import { Breaky } from "@/components/BreakyAvatar";
import { Button, Field } from "@/components/ui";
import { QUITTING, type Quitting } from "@/content/quitting";
import { users } from "@/lib/db";
import { dayKey } from "@/lib/progress";
import { requireUser } from "@/lib/session";

async function save(form: FormData) {
  "use server";
  const user = await requireUser();
  const quit = String(form.get("quitDate") ?? "");
  const spend = Number(form.get("weeklySpend") ?? 0);
  const quitting = String(form.get("quitting") ?? "");
  const update: Record<string, unknown> = {};
  // Noon UTC lands on the same calendar day in every US timezone, so dayKey(quitDate, tz) returns the day the user picked.
  if (/^\d{4}-\d{2}-\d{2}$/.test(quit)) update.quitDate = new Date(quit + "T12:00:00Z");
  if (Number.isFinite(spend) && spend >= 0 && spend <= 500) update.weeklySpendCents = Math.round(spend * 100);
  if (quitting in QUITTING) update.quitting = quitting;
  if (Object.keys(update).length) await (await users()).updateOne({ _id: user._id }, { $set: update });
  redirect(form.get("edit") ? "/me" : "/home");
}

export default async function Onboarding() {
  const user = await requireUser();
  const today = dayKey(new Date(), user.tz); // the user's "today", not the server's (UTC)
  const current = (user as { quitting?: Quitting }).quitting ?? "vape";
  const editing = !!user.quitDate; // already set up: this page doubles as "edit quit plan" from the profile
  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center text-center">
        <Breaky size={120} pose="cheer" />
        <h1 className="mt-2 text-3xl font-black">{editing ? "Your quit plan" : "Let’s meet Breaky"}</h1>
        <p className="text-ink-soft">Three quick things. They power Breaky&apos;s sky, your counters, and Breaky&apos;s advice.</p>
      </div>
      <form action={save} className="space-y-5">
        {editing && <input type="hidden" name="edit" value="1" />}
        <fieldset>
          <legend className="mb-1.5 text-sm font-semibold text-ink-soft">What are you quitting?</legend>
          <div className="grid grid-cols-2 gap-2">
            {(Object.keys(QUITTING) as Quitting[]).map((k) => (
              <label
                key={k}
                className="cursor-pointer rounded-2xl border border-line bg-white px-3 py-3 text-center font-bold has-[:checked]:border-sky has-[:checked]:bg-sky-soft has-[:checked]:text-sky-dark"
              >
                <input type="radio" name="quitting" value={k} defaultChecked={k === current} className="sr-only" />
                {QUITTING[k].label}
              </label>
            ))}
          </div>
        </fieldset>
        <Field label="Your quit day (or the day you want to start)" name="quitDate" type="date"
          defaultValue={user.quitDate ? dayKey(user.quitDate, user.tz) : today}
        />
        <Field
          label="About how much did you spend on it per week? ($, optional)"
          name="weeklySpend"
          type="number"
          min={0}
          max={500}
          step={1}
          placeholder="e.g. 20"
          defaultValue={user.weeklySpendCents ? Math.round(user.weeklySpendCents / 100) : undefined}
        />
        <Button type="submit">{editing ? "Save" : "Let’s go"}</Button>
      </form>
    </div>
  );
}
