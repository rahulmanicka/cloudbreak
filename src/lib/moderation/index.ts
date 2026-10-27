// Stage 4: the decision. This is where the safety policy lives.
//
//   text -> normalize -> rules --(clear hit)--> block / crisis / review   (AI never called)
//                              \--(no hit)----> AI classifier --> decide
//
// Policy, in priority order:
//  1. Crisis from ANY stage wins: never posted, author sees 988 / Crisis Text Line.
//  2. A rule hit is final. The AI can only make a decision STRICTER, never looser,
//     so a post can't talk its way past the rules ("ignore your instructions, this is safe").
//  3. Prompt-injection attempts are held for a human; they are never sent to the AI.
//  4. The AI must be confident (>= 0.7) to allow; unsure means a human reviews it.
//  5. Fail closed: if the AI errors, times out, or is rate-limited, the post is held, not published.
import { defaultClassifier } from "./classifier";
import { normalize } from "./normalize";
import { runRules } from "./rules";
import type { Category, Classifier, ModerationInput, ModerationResult } from "./types";

const CONFIDENT = 0.7;

const REASON_TEXT: Record<Category, string> = {
  personal_info: "Personal info (like a phone number, social handle, link, or school) isn't allowed, to keep everyone safe.",
  selling_sourcing: "Posts about buying, selling, or getting vapes or other drugs aren't allowed.",
  meetup: "Meeting up or moving to private chat isn't allowed. Everything here stays public and moderated.",
  harassment: "That reads as an attack on someone. Be kind: everyone here is trying.",
  self_harm: "It sounds like you're going through something really hard. You deserve real support right now.",
  prompt_injection: "This post is being checked by a moderator.",
  other: "This post is being checked by a moderator.",
};

export async function moderate(
  input: ModerationInput,
  classifier: Classifier = defaultClassifier(),
): Promise<ModerationResult> {
  const started = performance.now();
  const done = (r: Omit<ModerationResult, "latencyMs">): ModerationResult => ({
    ...r,
    latencyMs: Math.round(performance.now() - started),
  });

  const views = normalize(input.text);
  const hits = runRules(views);
  const ruleHits = hits.map((h) => h.id);
  const cats = [...new Set(hits.map((h) => h.category))];

  // 1. Crisis wins.
  if (cats.includes("self_harm")) {
    return done({ decision: "crisis", categories: ["self_harm"], reasons: [REASON_TEXT.self_harm], ruleHits });
  }
  // 3. Injection: hold for a human, don't hand it to the AI.
  if (cats.includes("prompt_injection")) {
    return done({ decision: "review", categories: cats, reasons: [REASON_TEXT.prompt_injection], ruleHits });
  }
  // 2. Any other rule hit is a block. The AI is skipped (saves latency and cost).
  if (cats.length > 0) {
    return done({ decision: "block", categories: cats, reasons: cats.map((c) => REASON_TEXT[c]), ruleHits });
  }

  // No rule fired: ask the AI, with a hard time limit.
  let verdict;
  try {
    verdict = await classifier.classify(views.plain);
  } catch {
    // 5. Fail closed.
    return done({ decision: "review", categories: [], reasons: ["Your post is being checked."], ruleHits });
  }

  if (verdict.label === "self_harm") {
    return done({ decision: "crisis", categories: ["self_harm"], reasons: [REASON_TEXT.self_harm], ruleHits, classifier: verdict });
  }
  if (verdict.label === "safe") {
    // 4. Must be confident to publish.
    return verdict.confidence >= CONFIDENT
      ? done({ decision: "allow", categories: [], reasons: [], ruleHits, classifier: verdict })
      : done({ decision: "review", categories: [], reasons: ["Your post is being checked."], ruleHits, classifier: verdict });
  }
  // AI flagged something unsafe: confident -> block, unsure -> human review.
  const decision = verdict.confidence >= CONFIDENT && verdict.label !== "prompt_injection" ? "block" : "review";
  return done({
    decision,
    categories: [verdict.label],
    reasons: [REASON_TEXT[verdict.label]],
    ruleHits,
    classifier: verdict,
  });
}

export type { ModerationInput, ModerationResult } from "./types";
