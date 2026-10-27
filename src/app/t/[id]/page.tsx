import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SkyScene, skyStage } from "@/components/BreakySky";
import { activityDates, countDays } from "@/lib/activity";
import { users } from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "A Breaky on Cloudbreak",
  description: "Clearing the sky one day at a time with Cloudbreak.",
  robots: { index: false }, // shared links aren't for search engines
};

// Public, opt-in share page. Deliberately shows no username or personal data: just Breaky and the sky.
export default async function SharedSky({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[A-Za-z0-9_-]{6,20}$/.test(id)) notFound();
  const user = await (await users()).findOne({ shareId: id } as never);
  if (!user) notFound();
  const days = countDays(await activityDates(user._id), user.tz);
  const { index, stage } = skyStage(days);

  return (
    <main className="mx-auto flex min-h-app max-w-md flex-col items-center justify-center bg-gradient-to-b from-sky-soft to-white px-6 text-center">
      <p className="text-sm font-bold uppercase tracking-widest text-sky-dark">Someone is taking care of this Breaky</p>
      <div className="mt-4 w-full overflow-hidden rounded-[1.75rem] ring-1 ring-line">
        <SkyScene index={index} pose={index >= 3 ? "cheer" : "proud"} height={260} />
      </div>
      <h1 className="mt-4 text-3xl font-black">
        {days} {days === 1 ? "day" : "days"} of showing up
      </h1>
      <p className="mt-1 text-ink-soft">
        Level {index + 1}: {stage.name}. Every day they check in or learn, Breaky&apos;s sky clears. It never goes back.
      </p>
      <Link href="/" className="btn-3d mt-6 rounded-2xl bg-sky px-6 py-3 font-bold text-ink">
        Get your own Breaky
      </Link>
      <p className="mt-3 text-xs text-ink-soft">Cloudbreak helps teens quit nicotine. Free, and no real names.</p>
    </main>
  );
}
