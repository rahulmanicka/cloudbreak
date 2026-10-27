import Image from "next/image";
import Link from "next/link";
import { Check } from "lucide-react";
import { LESSONS } from "@/content/lessons";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";

export default async function LearnPath() {
  const user = await requireUser();
  const done = new Set(
    (await (await db()).collection("lessonProgress").find({ userId: user._id }).project({ lessonSlug: 1 }).toArray()).map(
      (d) => d.lessonSlug as string,
    ),
  );
  const nextIdx = LESSONS.findIndex((l) => !done.has(l.slug));

  return (
    <div>
      <h1 className="text-3xl font-black">Quit nicotine</h1>
      <p className="text-ink-soft">One small lesson at a time. Go at your own pace.</p>
      <ol className="mt-6 flex flex-col items-center gap-5">
        {LESSONS.map((l, i) => {
          const isDone = done.has(l.slug);
          const isNext = i === nextIdx;
          const offset = ["translate-x-0", "translate-x-10", "translate-x-0", "-translate-x-10"][i % 4];
          return (
            <li key={l.slug} className={`flex flex-col items-center ${offset}`}>
              <Link
                href={`/learn/${l.slug}`}
                className={`btn-3d relative block h-24 w-24 overflow-hidden rounded-full ring-4 ${
                  isDone ? "ring-sun" : isNext ? "ring-sky" : "ring-line"
                }`}
                aria-label={l.title}
              >
                <Image
                  src={`/lessons/${l.slug}.webp`}
                  alt=""
                  width={192}
                  height={192}
                  className={`h-full w-full object-cover ${!isDone && !isNext ? "opacity-60 saturate-50" : ""}`}
                />
                {isDone && (
                  <span className="absolute bottom-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-sun text-ink">
                    <Check size={14} strokeWidth={3} aria-hidden="true" />
                  </span>
                )}
              </Link>
              <span className={`mt-1 max-w-40 text-center text-sm font-extrabold ${isNext ? "text-sky-dark" : "text-ink-soft"}`}>
                {l.title}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
