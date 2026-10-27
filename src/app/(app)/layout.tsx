import Link from "next/link";
import { BottomNav } from "@/components/BottomNav";
import { BreakyAvatar, Icon3D } from "@/components/BreakyAvatar";
import { FloatingBreaky } from "@/components/FloatingBreaky";
import { HelpPill } from "@/components/HelpPill";
import { currentUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await currentUser().catch(() => null);

  return (
    <div className="min-h-app bg-[#fbfcff] pb-24">
      <header className="sticky top-0 z-10 bg-[#fbfcff]/90 backdrop-blur">
        <div className="mx-auto flex max-w-md items-center justify-between px-4 py-3">
          <Link href={user ? "/home" : "/"} className="shrink-0 text-2xl font-black tracking-tight text-brand">
            cloudbreak
          </Link>
          <div className="flex items-center gap-2 font-extrabold">
            {user && (
              <span title="XP" className="flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full bg-sun-soft py-0.5 pl-0.5 pr-2.5 text-sm font-black text-sun-dark">
                <Icon3D name="flame" size={24} /> {user.xp} XP
              </span>
            )}
            <HelpPill />
            {user && (
              <Link href="/me" aria-label="Your profile and settings" className="shrink-0 rounded-full ring-2 ring-sky-soft">
                <BreakyAvatar size={34} pose="wave" />
              </Link>
            )}
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-md px-4 pt-4">{children}</main>
      {user && <FloatingBreaky />}
      <BottomNav />
    </div>
  );
}
