import Link from "next/link";
import { redirect } from "next/navigation";
import { Breaky } from "@/components/BreakyAvatar";
import { ButtonLink } from "@/components/ui";
import { currentUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function Landing() {
  if (await currentUser().catch(() => null)) redirect("/home");

  return (
    <main className="mx-auto flex min-h-app max-w-md flex-col px-5 py-8">
      <div className="flex items-center justify-between">
        <span className="text-2xl font-black text-brand">cloudbreak</span>
        <Link href="/help" className="rounded-full bg-coral-soft px-3 py-1 text-xs font-extrabold text-coral-dark">
          Get real help
        </Link>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <Breaky size={190} pose="cheer" />
        <h1 className="mt-4 text-4xl font-black leading-tight">
          Quit vaping,
          <br />
          one small win a day.
        </h1>
        <p className="mt-3 text-lg text-ink-soft">
          Bite-size lessons, a craving SOS button, and a safe community of people who&apos;ve been there.
        </p>
      </div>

      <div className="space-y-3">
        <ButtonLink href="/signup" tone="grass">
          Get started
        </ButtonLink>
        <ButtonLink href="/login" tone="ghost">
          I have an account
        </ButtonLink>
        <p className="pt-2 text-center text-xs text-ink-soft">
          Ages 13+. No real names, no photos, no DMs. Every post is checked before anyone sees it.
        </p>
      </div>
    </main>
  );
}
