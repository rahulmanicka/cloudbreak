import { CATEGORY_LABEL, comments, posts, timeAgo } from "@/lib/community";
import { users } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { adminDecide, grantHelper } from "../../c/actions";

export default async function ModerationQueue() {
  await requireAdmin();
  const q = {
    $or: [{ status: { $in: ["held" as const, "crisis" as const] } }, { status: "visible" as const, reportCount: { $gt: 0 } }],
  };
  const [ps, cs, adults] = await Promise.all([
    (await posts()).find(q).sort({ createdAt: -1 }).limit(50).toArray(),
    (await comments()).find(q).sort({ createdAt: -1 }).limit(50).toArray(),
    (await users()).find({ ageBracket: "18+", role: "user" }).sort({ createdAt: -1 }).limit(20).toArray(),
  ]);
  const items = [
    ...ps.map((d) => ({ type: "post" as const, d })),
    ...cs.map((d) => ({ type: "comment" as const, d })),
  ].sort((a, b) => b.d.createdAt.getTime() - a.d.createdAt.getTime());

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-black">Moderation queue</h1>
      <p className="text-sm text-ink-soft">
        Held by the pipeline, flagged as crisis, or reported by users. Crisis items are never shown publicly; follow your
        school&apos;s safety protocol for them.
      </p>
      {items.length === 0 && <p className="py-6 text-center text-ink-soft">Queue is empty.</p>}
      {items.map(({ type, d }) => {
        const id = d._id.toString();
        const m = d.moderation;
        return (
          <div
            key={id}
            className={`rounded-[1.25rem] border-2 p-4 ${d.status === "crisis" ? "border-coral bg-coral-soft" : "border-line"}`}
          >
            <div className="flex flex-wrap items-center gap-2 text-xs font-extrabold uppercase">
              <span className="rounded-full bg-white px-2 py-0.5">{type}</span>
              <span className="rounded-full bg-white px-2 py-0.5">{d.status}</span>
              {d.reportCount > 0 && <span className="rounded-full bg-sun-soft px-2 py-0.5">{d.reportCount} reports</span>}
              <span className="text-muted">
                {d.authorName} · {timeAgo(d.createdAt)}
              </span>
            </div>
            <p className="mt-2 whitespace-pre-line font-semibold">{d.body}</p>
            <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-3 text-xs text-ink-soft">
              <dt className="font-bold">Decision</dt>
              <dd>
                {m.decision} {m.categories.length > 0 && `(${m.categories.map((c) => CATEGORY_LABEL[c]).join(", ")})`}
              </dd>
              <dt className="font-bold">Rules</dt>
              <dd>{m.ruleHits.join(", ") || "none"}</dd>
              <dt className="font-bold">AI</dt>
              <dd>{m.classifier ? `${m.classifier.model}: ${m.classifier.label} @ ${m.classifier.confidence}` : "skipped"}</dd>
              <dt className="font-bold">Latency</dt>
              <dd>{m.latencyMs} ms</dd>
            </dl>
            <div className="mt-3 flex gap-2">
              {d.status === "crisis" ? (
                // Crisis posts are never published, even by a moderator. Handling = follow up offline, then close.
                <form action={adminDecide.bind(null, type, id, "remove")}>
                  <button className="btn-3d rounded-xl bg-coral px-3 py-1 text-sm font-black text-white">
                    Mark handled (stays private)
                  </button>
                </form>
              ) : (
                <>
              <form action={adminDecide.bind(null, type, id, "approve")}>
                <button className="btn-3d rounded-xl bg-grass px-3 py-1 text-sm font-black text-white">
                  Approve
                </button>
              </form>
              <form action={adminDecide.bind(null, type, id, "remove")}>
                <button className="btn-3d rounded-xl bg-coral px-3 py-1 text-sm font-black text-white">
                  Remove
                </button>
              </form>
                </>
              )}
            </div>
          </div>
        );
      })}

      <h2 className="pt-4 text-xl font-black">Grant helper badge</h2>
      <p className="text-sm text-ink-soft">
        Only for adults (18+) whose age and identity you verified outside the app. The badge means &quot;trusted adult,&quot;
        not &quot;counselor.&quot;
      </p>
      {adults.length === 0 && <p className="text-sm text-muted">No 18+ accounts waiting.</p>}
      {adults.map((u) => (
        <form key={u._id.toString()} action={grantHelper.bind(null, u._id.toString())} className="flex items-center justify-between rounded-xl bg-cloud p-3">
          <span className="font-bold">{u.username}</span>
          <button className="rounded-lg bg-grass px-3 py-1 text-sm font-black text-white">Make helper</button>
        </form>
      ))}
    </div>
  );
}
