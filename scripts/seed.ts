// Seeds clearly-labeled demo content: `npm run seed`.
// Every seeded user and post has isDemo: true and shows a "Sample post · demo data" tag in the UI.
// These are NOT real users. They were written by the Cloudbreak team to demonstrate the app.
// Each post still goes through the real moderation pipeline, so the demo shows real decisions.
import bcrypt from "bcryptjs";
import { randomBytes } from "node:crypto";
import { MongoClient, type ObjectId } from "mongodb";
import { moderate } from "../src/lib/moderation";

const statusFor = (d: string) => (d === "allow" ? "visible" : d === "block" ? "removed" : d === "crisis" ? "crisis" : "held");

const DEMO_USERS = [
  { username: "SunnySteps", ageBracket: "13-17", role: "user" },
  { username: "BetterDays", ageBracket: "13-17", role: "user" },
  { username: "Day1Again", ageBracket: "13-17", role: "user" },
  { username: "CoachMaya", ageBracket: "18+", role: "helper" },
] as const;

const DEMO_POSTS: { by: string; board: string; body: string; replies?: { by: string; body: string }[] }[] = [
  {
    by: "SunnySteps",
    board: "cravings",
    body: "Had a huge craving at school today but it passed like the lesson said. Drank cold water and texted my friend instead. Feels good 💙",
    replies: [{ by: "CoachMaya", body: "That's exactly the move. Every craving you outlast makes the next one weaker. Proud of you." }],
  },
  {
    by: "BetterDays",
    board: "wins",
    body: "One week vape-free! I can already breathe better running the mile. If you're struggling, it really does get easier.",
    replies: [{ by: "Day1Again", body: "this gives me hope fr, im on day 2" }],
  },
  {
    by: "Day1Again",
    board: "relapse",
    body: "Slipped at a party Saturday. Felt like I wasted 10 days. Starting again today, not deleting the app this time.",
    replies: [{ by: "CoachMaya", body: "A setback isn't a failure. Most people take a few tries. What triggered it? Plan for that next time." }],
  },
  {
    by: "SunnySteps",
    board: "talking-to-parents",
    body: "Finally told my mom. She was upset for like 10 minutes and then asked how she could help. Way better than I imagined.",
  },
  {
    by: "BetterDays",
    board: "first-week",
    body: "Day 3 and I'm SO irritable. Snapped at my little brother over nothing. Is this normal??",
    replies: [{ by: "CoachMaya", body: "Totally normal. Irritability is a common withdrawal symptom and it fades. Water, sleep, and a walk help." }],
  },
  // These two demonstrate moderation: they will be stored but hidden, exactly as a real one would be.
  { by: "Day1Again", board: "cravings", body: "if anyone wants to talk text me 510 555 0199" },
  { by: "BetterDays", board: "cravings", body: "who has extra pods? i can venmo" },
];

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("Set MONGODB_URI");
  const client = await new MongoClient(uri).connect();
  const db = client.db(process.env.MONGODB_DB ?? "cloudbreak");

  // Idempotent: wipe previous demo data only.
  const old = await db.collection("users").find({ isDemo: true }).project({ _id: 1 }).toArray();
  await db.collection("posts").deleteMany({ isDemo: true });
  await db.collection("comments").deleteMany({ isDemo: true });
  await db.collection("users").deleteMany({ _id: { $in: old.map((o) => o._id) } });

  const ids = new Map<string, { _id: ObjectId; role: string }>();
  for (const u of DEMO_USERS) {
    const res = await db.collection("users").insertOne({
      username: u.username,
      usernameLower: u.username.toLowerCase(),
      passwordHash: await bcrypt.hash(randomBytes(24).toString("hex"), 10), // unguessable: demo users can't be logged into
      ageBracket: u.ageBracket,
      role: u.role,
      ...(u.role === "helper" ? { helperVerifiedAt: new Date() } : {}),
      xp: 0,
      tracks: {},
      tz: "America/Los_Angeles",
      isDemo: true,
      createdAt: new Date(),
    });
    ids.set(u.username, { _id: res.insertedId, role: u.role });
  }

  let minutesAgo = 60 * 30;
  for (const p of DEMO_POSTS) {
    const author = ids.get(p.by)!;
    const m = await moderate({ text: p.body, kind: "post", authorAge: "13-17" });
    const replies = p.replies ?? [];
    const postRes = await db.collection("posts").insertOne({
      authorId: author._id,
      authorName: p.by,
      authorRole: author.role,
      board: p.board,
      body: p.body,
      status: statusFor(m.decision),
      moderation: m,
      upvotes: 3 + Math.floor(Math.random() * 20),
      commentCount: replies.length,
      reportCount: 0,
      isDemo: true,
      createdAt: new Date(Date.now() - minutesAgo * 60_000),
    });
    console.log(`${m.decision.padEnd(6)} ${p.board.padEnd(20)} ${p.body.slice(0, 50)}`);
    for (const r of replies) {
      minutesAgo -= 20;
      const rm = await moderate({ text: r.body, kind: "comment", authorAge: "18+" });
      const ra = ids.get(r.by)!;
      await db.collection("comments").insertOne({
        postId: postRes.insertedId,
        authorId: ra._id,
        authorName: r.by,
        authorRole: ra.role,
        body: r.body,
        status: statusFor(rm.decision),
        moderation: rm,
        upvotes: Math.floor(Math.random() * 8),
        reportCount: 0,
        isDemo: true,
        createdAt: new Date(Date.now() - minutesAgo * 60_000),
      });
    }
    minutesAgo -= 180;
  }
  await client.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
