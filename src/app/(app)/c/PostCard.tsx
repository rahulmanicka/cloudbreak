import Image from "next/image";
import Link from "next/link";
import { BadgeCheck, ShieldAlert } from "lucide-react";
import type { WithId } from "mongodb";
import { DemoTag } from "@/components/ui";
import { CATEGORY_LABEL, timeAgo, type PostDoc, type Visible } from "@/lib/community";
import { ItemActions } from "./ItemActions";
import { VoteColumn } from "./VoteColumn";

export function HiddenCard({ v }: { v: Extract<Visible<unknown>, { kind: "hidden" }> }) {
  const what = v.categories.map((c) => CATEGORY_LABEL[c]).join(", ") || "needs review";
  return (
    <div className="flex items-start gap-3 rounded-[1.5rem] border border-dashed border-line bg-cloud p-4 text-ink-soft">
      <ShieldAlert size={24} className="shrink-0 text-muted" aria-hidden="true" />
      <div>
        <p className="font-black">{v.status === "held" ? "Waiting for a moderator" : "Hidden by moderation"}</p>
        <p className="text-sm">Reason: {what}{v.mine ? " · this was your post" : ""}</p>
      </div>
    </div>
  );
}

export function RoleBadge({ role }: { role: string }) {
  if (role === "helper")
    return (
      <span title="Verified adult (18+) helper" className="rounded-full bg-grass-soft px-2 py-0.5 text-[10px] font-extrabold uppercase text-grass-dark">
        <BadgeCheck size={12} className="mr-0.5 inline" aria-hidden="true" />Helper 18+
      </span>
    );
  if (role === "admin")
    return <span className="rounded-full bg-sky-soft px-2 py-0.5 text-[10px] font-extrabold uppercase text-sky-dark">Mod</span>;
  return null;
}

const AVATARS = ["sun", "frog", "planet", "peach", "leaf", "fox"];
export function avatarFor(name: string) {
  let h = 0;
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return AVATARS[h % AVATARS.length];
}

export function Avatar({ name, size = 40 }: { name: string; size?: number }) {
  return (
    <span className="inline-flex shrink-0 overflow-hidden rounded-full bg-white" style={{ width: size, height: size }}>
      <Image src={`/avatars/${avatarFor(name)}.webp`} alt="" width={size * 2} height={size * 2} className="h-full w-full object-cover mix-blend-multiply" />
    </span>
  );
}

export function PostCard({ p, link = true }: { p: WithId<PostDoc>; link?: boolean }) {
  const id = p._id.toString();
  const body = <p className="mt-1.5 whitespace-pre-line text-[15px] leading-snug text-ink">{p.body}</p>;
  return (
    <article className="card flex gap-2 p-3 pr-4">
      <VoteColumn id={id} upvotes={p.upvotes} />
      <div className="min-w-0 flex-1">
        <header className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <Avatar name={p.authorName} size={36} />
          <div className="mr-auto leading-tight">
            <p className="flex items-center gap-1.5 font-black">
              {p.authorName} <RoleBadge role={p.authorRole} />
            </p>
            <p className="text-xs text-muted">{timeAgo(p.createdAt)}</p>
          </div>
          {p.isDemo && <DemoTag />}
        </header>
        {link ? <Link href={`/p/${id}`}>{body}</Link> : body}
        <ItemActions type="post" id={id} commentCount={p.commentCount} href={`/p/${id}`} />
      </div>
    </article>
  );
}
