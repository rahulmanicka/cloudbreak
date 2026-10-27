import { Heart, Users } from "lucide-react";
import Link from "next/link";
import { BOARDS } from "@/content/boards";
import { forViewer, posts } from "@/lib/community";
import { db, type UserDoc } from "@/lib/db";
import { Composer } from "./Composer";
import { HiddenCard, PostCard } from "./PostCard";

const CHIP: Record<string, string> = {
  cravings: "text-sky-dark bg-sky-soft",
  "first-week": "text-ink bg-white ring-1 ring-line",
  relapse: "text-coral-dark bg-coral-soft",
  wins: "text-grass-dark bg-grass-soft",
  "talking-to-parents": "text-sun-dark bg-sun-soft",
};

export async function Feed({ user, board }: { user: UserDoc; board?: string }) {
  const filter = board ? { board, status: { $ne: "crisis" as const } } : { status: { $ne: "crisis" as const } };
  const docs = await (await posts()).find(filter).sort({ createdAt: -1 }).limit(40).toArray();
  const items = docs.map((d) => forViewer(d, user._id)).filter((v) => v !== null);
  const hasDemo = docs.some((d) => d.isDemo);

  // "Together today": everyone's activity in the last 24 hours, so the community feels like a shared effort.
  const since = new Date(Date.now() - 86_400_000);
  const d = await db();
  const [checkinsToday, postsToday] = await Promise.all([
    d.collection("checkins").countDocuments({ at: { $gte: since } }),
    d.collection("posts").countDocuments({ createdAt: { $gte: since }, status: "visible" }),
  ]);
  const current = BOARDS.find((b) => b.id === board);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-[34px] font-black leading-none">{current ? current.name : "Community"}</h1>
        <p className="mt-1 flex items-center gap-1.5 font-semibold text-ink-soft">
          {current ? current.blurb : "You're not alone"} <Heart size={16} className="fill-sky text-sky" aria-hidden="true" />
        </p>
      </div>

      <nav className="flex flex-wrap gap-2">
        {BOARDS.map((b) => (
          <Link
            key={b.id}
            href={b.id === board ? "/c" : `/c/${b.id}`}
            className={`rounded-full px-4 py-1.5 text-sm font-bold transition ${b.id === board ? "bg-sky-dark text-white" : CHIP[b.id]}`}
          >
            {b.name}
          </Link>
        ))}
      </nav>

      <div className="flex items-center gap-3 rounded-[1.25rem] bg-gradient-to-r from-sky-soft to-grass-soft p-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-sky-dark">
          <Users size={20} aria-hidden="true" />
        </span>
        <p className="text-sm font-semibold text-ink">
          <span className="font-black">Together today:</span> {checkinsToday} check-ins · {postsToday} new posts
        </p>
      </div>

      {board && <Composer board={board} />}
      {!board && (
        <p className="text-center text-xs font-semibold text-ink-soft">Pick a board above to post. Every post is checked before anyone sees it.</p>
      )}
      {hasDemo && (
        <p className="text-center text-[11px] font-semibold text-ink-soft">
          Posts tagged &quot;Sample post · demo data&quot; were written by the Cloudbreak team to show how it works. They aren&apos;t real users.
        </p>
      )}

      <div className="space-y-3">
        {items.length === 0 && <p className="py-8 text-center text-ink-soft">No posts yet. Be the first.</p>}
        {items.map((v) => (v.kind === "shown" ? <PostCard key={v.doc._id.toString()} p={v.doc} /> : <HiddenCard key={v.id} v={v} />))}
      </div>
    </div>
  );
}
