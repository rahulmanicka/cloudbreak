import "server-only";
import { MongoClient, type Db, type ObjectId } from "mongodb";

// One cached client per serverless instance (Atlas M0 has a low connection limit).
const g = globalThis as unknown as { _mongo?: Promise<MongoClient> };

function client(): Promise<MongoClient> {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not set");
  g._mongo ??= new MongoClient(uri, { maxPoolSize: 5 }).connect();
  return g._mongo;
}

export async function db(): Promise<Db> {
  return (await client()).db(process.env.MONGODB_DB ?? "cloudbreak");
}

export type AgeBracket = "13-17" | "18+";
export type Role = "user" | "helper" | "admin";

export interface TrackProgress {
  streakCurrent: number;
  streakLongest: number;
  lastActiveDay: string | null; // YYYY-MM-DD in the user's timezone
}

export interface UserDoc {
  _id: ObjectId;
  username: string;
  usernameLower: string;
  passwordHash: string;
  ageBracket: AgeBracket;
  role: Role;
  helperVerifiedAt?: Date;
  quitDate?: Date;
  quitting?: "vape" | "cigarettes" | "pouches" | "other";
  weeklySpendCents?: number;
  xp: number;
  tracks: Record<string, TrackProgress>;
  tz: string;
  isDemo?: boolean;
  createdAt: Date;
}

export async function users() {
  return (await db()).collection<UserDoc>("users");
}

let indexesEnsured = false;
export async function ensureIndexes() {
  if (indexesEnsured) return;
  const d = await db();
  await Promise.all([
    d.collection("users").createIndex({ usernameLower: 1 }, { unique: true }),
    d.collection("lessonProgress").createIndex({ userId: 1, lessonSlug: 1 }, { unique: true }),
    d.collection("posts").createIndex({ board: 1, status: 1, createdAt: -1 }),
    d.collection("comments").createIndex({ postId: 1, createdAt: 1 }),
    d.collection("votes").createIndex({ userId: 1, targetId: 1 }, { unique: true }),
    d.collection("reports").createIndex({ status: 1, createdAt: -1 }),
  ]);
  indexesEnsured = true;
}
