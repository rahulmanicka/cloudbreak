import Link from "next/link";
import { ObjectId } from "mongodb";
import { notFound } from "next/navigation";
import { DemoTag } from "@/components/ui";
import { boardById } from "@/content/boards";
import { comments, forViewer, posts, timeAgo } from "@/lib/community";
import { requireUser } from "@/lib/session";
import { Composer } from "../../c/Composer";
import { ItemActions } from "../../c/ItemActions";
import { HiddenCard, PostCard, RoleBadge } from "../../c/PostCard";

export default async function PostPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  if (!ObjectId.isValid(id)) notFound();
  const post = await (await posts()).findOne({ _id: new ObjectId(id), status: "visible" });
  if (!post) notFound();
  const board = boardById(post.board);

  const cs = (await (await comments()).find({ postId: post._id, status: { $ne: "crisis" } }).sort({ createdAt: 1 }).toArray())
    .map((c) => forViewer(c, user._id))
    .filter((v) => v !== null);

  return (
    <div className="space-y-4">
      <Link href={`/c/${post.board}`} className="text-sm font-extrabold text-sky-dark">
        ← {board?.name ?? "Back"}
      </Link>
      <PostCard p={post} link={false} />
      <h2 className="text-sm font-extrabold uppercase tracking-wide text-ink-soft">Replies</h2>
      <div className="space-y-2 border-l-4 border-line pl-3">
        {cs.length === 0 && <p className="text-sm text-ink-soft">No replies yet.</p>}
        {cs.map((v) =>
          v.kind === "shown" ? (
            <div key={v.doc._id.toString()} className="rounded-2xl bg-cloud p-3">
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className="font-black">{v.doc.authorName}</span>
                <RoleBadge role={v.doc.authorRole} />
                <span className="text-xs text-muted">{timeAgo(v.doc.createdAt)}</span>
                {v.doc.isDemo && <DemoTag />}
              </div>
              <p className="mt-1 whitespace-pre-line">{v.doc.body}</p>
              <ItemActions type="comment" id={v.doc._id.toString()} upvotes={v.doc.upvotes} />
            </div>
          ) : (
            <HiddenCard key={v.id} v={v} />
          ),
        )}
      </div>
      <Composer postId={id} />
    </div>
  );
}
