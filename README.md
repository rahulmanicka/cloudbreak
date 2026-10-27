# Cloudbreak

Bite-size daily lessons and a moderated peer community for teens quitting vaping.
Built by Rahul (Irvington High School, Fremont, CA) for the 2026 Congressional App Challenge.

**Live:** https://cloudbreak-seven.vercel.app

## What it does
- **Learn:** 8 short lessons with quizzes, XP, and a "days you showed up" week view (deliberately no streaks: a broken streak feels like failure, the opposite of what quitting needs). Every lesson cites its sources (CDC, NIDA, NCI Smokefree Teen, CA statutes).
- **Track:** days vape-free and money saved. A relapse resets the quit day but **not** the learning streak.
- **SOS:** a 5-minute craving timer with coping steps and a one-tap 988 button.
- **Community:** five public boards (Cravings, First week, Relapse, Wins, Talking to parents).
- **Coach:** an AI check-in coach (Claude Haiku 5.5). It says it's an AI, runs moderation first, and keeps one conversation per day that the user can delete anytime (crisis and blocked messages are never stored verbatim).
- **Get real help:** always visible. Links to 988, Crisis Text Line, Kick It California, and This is Quitting, plus a plain-language explainer of California's AB 2711 (Ed Code §48900(h)(2)).

## Safety design
Minors + nicotine + strangers is the first thing anyone should worry about, so:
- No DMs, photos, real names, emails, or locations. Usernames only, ages 13+.
- **Every post and comment is moderated before it is visible** (`src/lib/moderation/`): normalize → rules → AI classifier → decision.
  Crisis content is never published; the writer is shown 988 and Crisis Text Line. The pipeline fails closed.
- Report button on everything; 3 reports auto-hide an item; admin queue at `/admin/moderation`.
- "Helper" badge only for adults (18+) verified by a moderator outside the app.
- Demo community content is labeled "Sample post · demo data" and is not presented as real users.
- No claim that any school has adopted or endorsed the app.

## Moderation eval
`npm run eval` runs the pipeline on 44 labeled posts and prints accuracy, false positives, false negatives, and latency.
History and honest caveats: [`src/lib/moderation/eval/EVAL_LOG.md`](src/lib/moderation/eval/EVAL_LOG.md).

## Stack
Next.js 15 (App Router) · TypeScript · Tailwind CSS v4 · MongoDB Atlas · iron-session · Claude API (`@anthropic-ai/sdk`) · Vercel.
All database access happens on the server (MongoDB has no row-level security), and every action checks the session.

## Run locally
```bash
npm install
node scripts/dev-db.mjs          # throwaway local MongoDB on :27999 (or use Atlas)
# .env.local: MONGODB_URI=..., SESSION_SECRET=<32+ random chars>, optional ANTHROPIC_API_KEY=...
npm run seed                     # labeled demo content
npm run dev
npm run make-admin -- <username> # promote your account to moderator
```

**Note on Atlas network access:** Vercel serverless functions have no fixed outbound IPs, so the Atlas access list allows `0.0.0.0/0`.
Access still requires the database user's credentials, which are stored only in Vercel environment variables.
