// Throwaway local MongoDB for development/testing: `node scripts/dev-db.mjs` (data is lost on exit).
import { MongoMemoryServer } from "mongodb-memory-server";
const s = await MongoMemoryServer.create({ instance: { port: 27999 } });
console.log("READY", s.getUri());
setInterval(() => {}, 1 << 30);
