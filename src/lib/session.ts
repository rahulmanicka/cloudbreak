import "server-only";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ObjectId } from "mongodb";
import { users, type UserDoc } from "./db";

export interface SessionData {
  userId?: string;
}

export async function session() {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) throw new Error("SESSION_SECRET must be 32+ chars");
  return getIronSession<SessionData>(await cookies(), {
    password: secret,
    cookieName: "cb_session",
    // INSECURE_COOKIES=1 lets a local production build work over plain http (LAN testing)
    cookieOptions: {
      secure: process.env.NODE_ENV === "production" && process.env.INSECURE_COOKIES !== "1",
      sameSite: "lax",
      httpOnly: true,
    },
  });
}

export async function currentUser(): Promise<UserDoc | null> {
  const s = await session();
  if (!s.userId || !ObjectId.isValid(s.userId)) return null;
  return (await users()).findOne({ _id: new ObjectId(s.userId) });
}

export async function requireUser(): Promise<UserDoc> {
  const u = await currentUser();
  if (!u) redirect("/login");
  return u;
}

export async function requireAdmin(): Promise<UserDoc> {
  const u = await requireUser();
  if (u.role !== "admin") redirect("/home");
  return u;
}
