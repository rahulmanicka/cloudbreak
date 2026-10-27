"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ArrowLeft, Check } from "lucide-react";
import { Breaky } from "@/components/BreakyAvatar";
import { LESSONS } from "@/content/lessons";
import { VISUALS } from "@/components/visuals";
import { Button } from "@/components/ui";
import type { Lesson } from "@/content/lessons";
import { completeLesson, type CompleteResult } from "../actions";

type Step = { kind: "card"; i: number } | { kind: "quiz"; i: number } | { kind: "done" };

export function LessonPlayer({ lesson }: { lesson: Lesson }) {
  const total = lesson.cards.length + lesson.quiz.length;
  const [step, setStep] = useState<Step>({ kind: "card", i: 0 });
  const [answers, setAnswers] = useState<number[]>([]);
  const [picked, setPicked] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [result, setResult] = useState<CompleteResult | null>(null);
  const [pending, start] = useTransition();
  const router = useRouter();

  const position = step.kind === "card" ? step.i : step.kind === "quiz" ? lesson.cards.length + step.i : total;

  function finish(all: number[]) {
    setStep({ kind: "done" });
    start(async () => {
      setResult(await completeLesson(lesson.slug, all));
      router.refresh(); // update XP in the header
    });
  }

  function next() {
    if (step.kind === "card") {
      setStep(step.i + 1 < lesson.cards.length ? { kind: "card", i: step.i + 1 } : { kind: "quiz", i: 0 });
    } else if (step.kind === "quiz") {
      const all = [...answers, picked!];
      setAnswers(all);
      setPicked(null);
      setChecked(false);
      if (step.i + 1 < lesson.quiz.length) setStep({ kind: "quiz", i: step.i + 1 });
      else finish(all);
    }
  }

  return (
    <div className="flex min-h-[70dvh] flex-col">
      <div className="mb-4">
        <div className="relative flex items-center justify-center">
          <Link href="/learn" aria-label="Close lesson" className="absolute left-0 rounded-full p-1 text-sky-dark">
            <ArrowLeft size={24} strokeWidth={2.5} />
          </Link>
          <p className="font-bold">
            Lesson {LESSONS.findIndex((l) => l.slug === lesson.slug) + 1} of {LESSONS.length}
          </p>
        </div>
        <div className="mt-3 h-3.5 overflow-hidden rounded-full bg-line">
          <div className="h-full rounded-full bg-grass transition-all duration-500" style={{ width: `${Math.max(6, (position / total) * 100)}%` }} />
        </div>
      </div>

      {step.kind === "card" &&
        (() => {
          const card = lesson.cards[step.i];
          const Visual = card.visual ? VISUALS[card.visual] : null;
          return (
        <div key={step.i} className="flex flex-1 flex-col">
          {step.i === 0 ? (
            <Image
              src={`/lessons/${lesson.slug}.webp`}
              alt=""
              width={768}
              height={768}
              priority
              className="mx-auto h-60 w-auto object-contain mix-blend-multiply"
            />
          ) : null}
          <h2 className="mt-4 text-[26px] font-black leading-tight">{card.title}</h2>
          <p className="mt-3 rounded-[1.25rem] bg-sky-soft/70 p-4 text-[17px] font-medium leading-relaxed">{card.body}</p>
          {Visual && (
            <div className="mt-4">
              <Visual />
            </div>
          )}
          <div className="mt-auto pt-8">
            <Button onClick={next}>Continue</Button>
          </div>
        </div>
          );
        })()}

      {step.kind === "quiz" &&
        (() => {
          const q = lesson.quiz[step.i];
          const right = picked === q.answer;
          return (
            <div className="flex flex-1 flex-col">
              {step.i === 0 && (
                <Image src={`/lessons/${lesson.slug}.webp`} alt="" width={768} height={768} className="mx-auto mb-2 h-44 w-auto object-contain mix-blend-multiply" />
              )}
              <p className="text-xs font-extrabold uppercase tracking-wider text-sky-dark">Quick check · {step.i + 1} of {lesson.quiz.length}</p>
              <h2 className="mt-1 text-[26px] font-black leading-tight">{q.q}</h2>
              <div className="mt-4 space-y-3">
                {q.options.map((o, i) => {
                  const state = checked
                    ? i === q.answer
                      ? "border-grass bg-[#c8f3ea] text-grass-dark"
                      : i === picked
                        ? "border-coral bg-coral-soft text-coral-dark"
                        : "border-line bg-white opacity-60"
                    : i === picked
                      ? "border-sky bg-sky-soft text-sky-dark"
                      : "border-line bg-white";
                  return (
                    <button
                      key={o}
                      disabled={checked}
                      onClick={() => setPicked(i)}
                      className={`btn-3d flex w-full items-center justify-between rounded-full border-2 px-5 py-3.5 text-left text-lg font-bold ${state}`}
                    >
                      {o}
                      {checked && i === q.answer && (
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-grass-dark text-white">
                          <Check size={16} strokeWidth={3} />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
              <div className="mt-auto pt-6">
                {checked && (
                  <div className={`mb-3 rounded-2xl p-3 font-bold ${right ? "bg-grass-soft text-grass-dark" : "bg-coral-soft text-coral-dark"}`}>
                    {right ? "Nice! " : "Not quite. "}
                    <span className="font-semibold">{q.explain}</span>
                  </div>
                )}
                {checked ? (
                  <Button tone={right ? "grass" : "coral"} onClick={next}>
                    Continue
                  </Button>
                ) : (
                  <Button disabled={picked === null} onClick={() => setChecked(true)} className="!rounded-full !py-4 text-xl">
                    Check
                  </Button>
                )}
              </div>
            </div>
          );
        })()}

      {step.kind === "done" && (
        <div className="flex flex-1 flex-col items-center text-center">
          <Breaky size={190} pose="cheer" />
          <h2 className="mt-2 text-3xl font-black">Lesson complete!</h2>
          {pending || !result ? (
            <p className="mt-2 text-ink-soft">Saving…</p>
          ) : (
            <div className="mt-4 grid w-full grid-cols-2 gap-3">
              <div className="rounded-2xl border-2 border-sun bg-sun-soft p-3">
                <p className="text-xs font-extrabold uppercase text-sun-dark">XP</p>
                <p className="text-3xl font-black text-sun-dark">+{result.xpGained}</p>
              </div>
              <div className="rounded-2xl border-2 border-grass bg-grass-soft p-3">
                <p className="text-xs font-extrabold uppercase text-grass-dark">Today</p>
                <p className="text-3xl font-black text-grass-dark">Counted</p>
              </div>
            </div>
          )}
          <details className="mt-6 w-full text-left text-sm">
            <summary className="cursor-pointer font-bold text-ink-soft">Sources for this lesson</summary>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              {lesson.citations.map((c) => (
                <li key={c.url}>
                  <a href={c.url} target="_blank" rel="noreferrer" className="text-sky-dark underline">
                    {c.title}
                  </a>{" "}
                  · {c.org}
                </li>
              ))}
            </ul>
          </details>
          <div className="mt-auto w-full pt-6">
            <Link href="/home" className="btn-3d block w-full rounded-2xl bg-sky px-5 py-3 font-extrabold uppercase text-ink">
              Continue
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
