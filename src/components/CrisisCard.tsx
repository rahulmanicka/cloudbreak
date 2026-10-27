import { CRISIS_RESOURCES } from "@/content/resources";

// Shown instead of publishing when moderation detects self-harm / crisis content.
export function CrisisCard() {
  return (
    <div role="alert" className="space-y-3 rounded-[1.25rem] border-2 border-coral bg-coral-soft p-4">
      <p className="text-lg font-black text-coral-dark">We didn&apos;t post this, because you matter more than the post.</p>
      <p className="text-sm">
        It sounds like you&apos;re going through something really hard. Trained people are ready to talk right now, for free,
        any time.
      </p>
      {CRISIS_RESOURCES.map((r) => (
        <a
          key={r.name}
          href={r.href}
          className="btn-3d block rounded-2xl bg-coral p-3 font-black text-white"
        >
          {r.action}
          <span className="block text-xs font-semibold text-white/90">{r.name}</span>
        </a>
      ))}
      <p className="text-xs text-ink-soft">If you&apos;re in immediate danger, call 911.</p>
    </div>
  );
}
