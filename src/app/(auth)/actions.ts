"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { z } from "zod";
import { ensureIndexes, users } from "@/lib/db";
import { session } from "@/lib/session";
import { LOOKS_LIKE_PII, USERNAME } from "@/lib/username";

export interface AuthState {
  error?: string;
}

const SignupSchema = z.object({
  username: z.string().trim().regex(USERNAME, "3–20 letters, numbers, or _"),
  password: z.string().min(8, "Password needs at least 8 characters"),
  age: z.enum(["under13", "13-17", "18+"], { message: "Pick your age range" }),
  tz: z.string().default("America/Los_Angeles"),
});

export async function signup(_: AuthState, form: FormData): Promise<AuthState> {
  const parsed = SignupSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const { username, password, age, tz } = parsed.data;

  if (age === "under13") {
    return { error: "Cloudbreak is for ages 13 and up. Please check out the Get real help page." };
  }
  if (LOOKS_LIKE_PII.test(username)) {
    return { error: "Pick a username that isn't a phone number or social handle." };
  }

  await ensureIndexes();
  const col = await users();
  try {
    const res = await col.insertOne({
      username,
      usernameLower: username.toLowerCase(),
      passwordHash: await bcrypt.hash(password, 10),
      ageBracket: age,
      role: "user",
      xp: 0,
      tracks: {},
      tz,
      createdAt: new Date(),
    } as never);
    const s = await session();
    s.userId = res.insertedId.toString();
    await s.save();
  } catch (e) {
    if ((e as { code?: number }).code === 11000) return { error: "That username is taken." };
    throw e;
  }
  redirect("/onboarding");
}

export async function login(_: AuthState, form: FormData): Promise<AuthState> {
  const username = String(form.get("username") ?? "").trim().toLowerCase();
  const password = String(form.get("password") ?? "");
  const user = await (await users()).findOne({ usernameLower: username });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return { error: "Wrong username or password." };
  }
  const s = await session();
  s.userId = user._id.toString();
  await s.save();
  redirect("/home");
}

export async function logout() {
  const s = await session();
  s.destroy();
  redirect("/");
}
