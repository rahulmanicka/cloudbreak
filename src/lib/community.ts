import "server-only";
import { ObjectId, type WithId } from "mongodb";
import { db } from "./db";
import type { Category, ModerationResult } from "./moderation/types";

export type Status = "visible" | "held" | "removed" | "crisis";

export interface PostDoc {
  authorId: ObjectId;
  authorName: string;
  authorRole: "user" | "helper" | "admin";
  board: string;
  body: string;
  status: Status;
  moderation: Omit<ModerationResult, "reasons"> & { reasons: string[] };
  upvotes: number;
  commentCount: number;
  reportCount: number;
  isDemo?: boolean;
  createdAt: Date;
}

export interface CommentDoc extends Omit<PostDoc, "board" | "commentCount"> {
  postId: ObjectId;
}

export const statusFor = (d: ModerationResult["decision"]): Status =>
  d === "allow" ? "visible" : d === "block" ? "removed" : d === "crisis" ? "crisis" : "held";

export async function posts() {
  return (await db()).collection<PostDoc>("posts");
}
export async function comments() {
  return (await db()).collection<CommentDoc>("comments");
}

/** What a viewer may see. Crisis items are never shown to anyone but admins; held/removed show as placeholders. */
export type Visible<T> =
  | { kind: "shown"; doc: WithId<T> }
  | { kind: "hidden"; id: string; categories: Category[]; mine: boolean; status: Status };

export function forViewer<T extends { status: Status; authorId: ObjectId; moderation: { categories: Category[] } }>(
  doc: WithId<T>,
  viewerId: ObjectId | null,
): Visible<T> | null {
  if (doc.status === "visible") return { kind: "shown", doc };
  if (doc.status === "crisis") return null;
  return {
    kind: "hidden",
    id: doc._id.toString(),
    categories: doc.moderation.categories,
    mine: !!viewerId && doc.authorId.equals(viewerId),
    status: doc.status,
  };
}

export const CATEGORY_LABEL: Record<Category, string> = {
  personal_info: "personal info",
  selling_sourcing: "buying or selling",
  meetup: "meetup request",
  harassment: "harassment",
  self_harm: "safety",
  prompt_injection: "needs review",
  other: "needs review",
};

export function timeAgo(d: Date): string {
  const s = Math.max(1, Math.round((Date.now() - d.getTime()) / 1000));
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.round(s / 60)}m ago`;
  if (s < 86400) return `${Math.round(s / 3600)}h ago`;
  return `${Math.round(s / 86400)}d ago`;
}
