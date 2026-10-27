"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { comments, posts } from "@/lib/community";
import { db, users } from "@/lib/db";
import { requireUser, session } from "@/lib/session";
import { LOOKS_LIKE_PII, USERNAME } from "@/lib/username";

export interface ProfileState {
  error?: string;
  ok?: string;
}

export async function changeUsername(_: ProfileState, form: FormData): Promise<ProfileState> {
  const user = await requireUser();
  const username = String(form.get("username") ?? "").trim();
  if (username === user.username) return {};
  if (!USERNAME.test(username)) return { error: "3–20 letters, numbers, or _" };
  if (LOOKS_LIKE_PII.test(username)) return { error: "Pick a username that isn't a phone number or social handle." };
  try {
    await (await users()).updateOne({ _id: user._id }, { $set: { username, usernameLower: username.toLowerCase() } });
  } catch (e) {
    if ((e as { code?: number }).code === 11000) return { error: "That username is taken." };
    throw e;
  }
  // Posts and comments store the author's name, so keep them in sync.
  await Promise.all([
    (await posts()).updateMany({ authorId: user._id }, { $set: { authorName: username } }),
    (await comments()).updateMany({ authorId: user._id }, { $set: { authorName: username } }),
  ]);
  revalidatePath("/", "layout");
  return { ok: "Username updated" };
}

/**
 * Deletes the account and everything tied to it: check-ins, lessons, coach history, votes, posts and comments
 * (plus other people's comments on those posts). Reports and the moderation log are kept for safety review,
 * but they only hold ids, not the username.
 */
export async function deleteAccount(_: ProfileState, form: FormData): Promise<ProfileState> {
  const user = await requireUser();
  if (String(form.get("confirm") ?? "").trim().toLowerCase() !== "delete") {
    return { error: 'Type "delete" to confirm.' };
  }
  const d = await db();
  const id = user._id;
  const myPosts = await (await posts()).find({ authorId: id }).project({ _id: 1 }).toArray();
  await Promise.all([
    d.collection("checkins").deleteMany({ userId: id }),
    d.collection("lessonProgress").deleteMany({ userId: id }),
    d.collection("coachChats").deleteMany({ userId: id }),
    d.collection("votes").deleteMany({ userId: id }),
    (await comments()).deleteMany({ $or: [{ authorId: id }, { postId: { $in: myPosts.map((p) => p._id) } }] }),
    (await posts()).deleteMany({ authorId: id }),
  ]);
  await (await users()).deleteOne({ _id: id });
  (await session()).destroy();
  redirect("/");
}
