import { requireUser } from "@/lib/session";
import { Feed } from "./Feed";

export default async function Community() {
  const user = await requireUser();
  return <Feed user={user} />;
}
