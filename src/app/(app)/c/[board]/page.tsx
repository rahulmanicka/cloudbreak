import { notFound } from "next/navigation";
import { boardById } from "@/content/boards";
import { requireUser } from "@/lib/session";
import { Feed } from "../Feed";

export default async function BoardFeed({ params }: { params: Promise<{ board: string }> }) {
  const user = await requireUser();
  const board = boardById((await params).board);
  if (!board) notFound();
  return <Feed user={user} board={board.id} />;
}
