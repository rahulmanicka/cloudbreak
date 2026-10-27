"use server";

import { ObjectId } from "mongodb";
import { revalidatePath } from "next/cache";
import { boardById } from "@/content/boards";
import { comments, posts, statusFor } from "@/lib/community";
import { db, ensureIndexes } from "@/lib/db";
import { moderate } from "@/lib/moderation";
import type { Decision } from "@/lib/moderation/types";
import { requireAdmin, requireUser } from "@/lib/session";

export interface SubmitState {
  decision?: Decision;
  reasons?: string[];
  error?: string;
}

const MAX_LEN = 1000;

export async function createPost(_: SubmitState, form: FormData): Promise<SubmitState> {
  const user = await requireUser();
  const board = String(form.get("board") ?? "");
  const body = String(form.get("body") ?? "").trim();
  if (!boardById(board)) return { error: "Pick a board." };
  if (body.length < 3) return { error: "Write a little more." };
  if (body.length > MAX_LEN) return { error: `Keep it under ${MAX_LEN} characters.` };

  // Moderate BEFORE anything is visible. The post is stored either way (audit trail for the admin queue).
  const m = await moderate({ text: body, kind: "post", authorAge: user.ageBracket });
  await ensureIndexes();
  await (await posts()).insertOne({
    authorId: user._id,
    authorName: user.username,
    authorRole: user.role,
    board,
    body,
    status: statusFor(m.decision),
    moderation: m,
    upvotes: 0,
    commentCount: 0,
    reportCount: 0,
    createdAt: new Date(),
  } as never);
  revalidatePath(`/c/${board}`);
  return { decision: m.decision, reasons: m.reasons };
}

export async function createComment(_: SubmitState, form: FormData): Promise<SubmitState> {
  const user = await requireUser();
  const postId = String(form.get("postId") ?? "");
  const body = String(form.get("body") ?? "").trim();
  if (!ObjectId.isValid(postId)) return { error: "Post not found." };
  if (body.length < 2 || body.length > MAX_LEN) return { error: "Comment must be 2–1000 characters." };
  const post = await (await posts()).findOne({ _id: new ObjectId(postId), status: "visible" });
  if (!post) return { error: "Post not found." };

  const m = await moderate({ text: body, kind: "comment", authorAge: user.ageBracket });
  const status = statusFor(m.decision);
  await (await comments()).insertOne({
    postId: post._id,
    authorId: user._id,
    authorName: user.username,
    authorRole: user.role,
    body,
    status,
    moderation: m,
    upvotes: 0,
    reportCount: 0,
    createdAt: new Date(),
  } as never);
  if (status === "visible") await (await posts()).updateOne({ _id: post._id }, { $inc: { commentCount: 1 } });
  revalidatePath(`/p/${postId}`);
  return { decision: m.decision, reasons: m.reasons };
}

export async function upvote(targetType: "post" | "comment", targetId: string) {
  const user = await requireUser();
  if (!ObjectId.isValid(targetId)) return;
  const id = new ObjectId(targetId);
  await ensureIndexes();
  try {
    // Unique index on (userId, targetId) means one vote per person, enforced by the database.
    await (await db()).collection("votes").insertOne({ userId: user._id, targetType, targetId: id, at: new Date() });
  } catch (e) {
    if ((e as { code?: number }).code === 11000) return;
    throw e;
  }
  const col = targetType === "post" ? await posts() : await comments();
  await col.updateOne({ _id: id }, { $inc: { upvotes: 1 } });
  revalidatePath("/c", "layout");
  revalidatePath("/p/[id]", "page");
}

const AUTO_HIDE_AT = 3; // reports from 3 different people hide an item until an admin looks

export async function report(targetType: "post" | "comment", targetId: string, reason: string) {
  const user = await requireUser();
  if (!ObjectId.isValid(targetId)) return;
  const id = new ObjectId(targetId);
  const d = await db();
  const existing = await d.collection("reports").findOne({ reporterId: user._id, targetId: id });
  if (existing) return;
  await d.collection("reports").insertOne({
    reporterId: user._id,
    targetType,
    targetId: id,
    reason: reason.slice(0, 200),
    status: "open",
    createdAt: new Date(),
  });
  // Raw collection: posts and comments share these fields, and the typed union confuses the driver's overloads.
  const col = d.collection(targetType === "post" ? "posts" : "comments");
  const doc = await col.findOneAndUpdate({ _id: id }, { $inc: { reportCount: 1 } }, { returnDocument: "after" });
  if (doc && doc.reportCount >= AUTO_HIDE_AT && doc.status === "visible") {
    await col.updateOne({ _id: id }, { $set: { status: "held" } });
  }
  revalidatePath("/c", "layout");
}

export async function adminDecide(targetType: "post" | "comment", targetId: string, action: "approve" | "remove") {
  const admin = await requireAdmin();
  const id = new ObjectId(targetId);
  const d = await db();
  const col = d.collection(targetType === "post" ? "posts" : "comments");
  // Server-side guard too: a crisis item can never be approved into public view.
  const filter = action === "approve" ? { _id: id, status: { $ne: "crisis" } } : { _id: id };
  await col.updateOne(filter, { $set: { status: action === "approve" ? "visible" : "removed" } });
  await d.collection("reports").updateMany({ targetId: id, status: "open" }, { $set: { status: "resolved" } });
  await d.collection("modLog").insertOne({ targetType, targetId: id, action, actor: admin._id, at: new Date() });
  revalidatePath("/admin/moderation");
}

export async function grantHelper(userId: string) {
  const admin = await requireAdmin();
  const d = await db();
  await d.collection("users").updateOne(
    { _id: new ObjectId(userId), ageBracket: "18+" },
    { $set: { role: "helper", helperVerifiedAt: new Date() } },
  );
  await d.collection("modLog").insertOne({ targetType: "user", targetId: new ObjectId(userId), action: "grant_helper", actor: admin._id, at: new Date() });
  revalidatePath("/admin/moderation");
}
