// Promote an existing account to moderator: `npm run make-admin -- <username>`.
import { MongoClient } from "mongodb";

async function main() {
  const username = process.argv[2];
  if (!username || !process.env.MONGODB_URI) throw new Error("Usage: MONGODB_URI=... npm run make-admin -- <username>");
  const client = await new MongoClient(process.env.MONGODB_URI).connect();
  const res = await client
    .db(process.env.MONGODB_DB ?? "cloudbreak")
    .collection("users")
    .updateOne({ usernameLower: username.toLowerCase() }, { $set: { role: "admin" } });
  console.log(res.matchedCount ? `${username} is now an admin` : `No user named ${username}`);
  await client.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
