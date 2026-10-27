// Shared contract for the moderation pipeline.
// Written by Claude so the community UI can be built in parallel.
// Everything else in src/lib/moderation/ is hand-written by Rahul (see AI_DISCLOSURE.md).

export type ContentKind = "post" | "comment";
export type AgeBracket = "13-17" | "18+";

export interface ModerationInput {
  text: string;
  kind: ContentKind;
  authorAge: AgeBracket;
}

/**
 * allow  : visible immediately
 * block  : never visible; author told which category (e.g. "personal info")
 * crisis : never visible; author shown crisis resources (988, Crisis Text Line); queued for admin
 * review : hidden until an admin approves (uncertain, injection attempt, or classifier unavailable)
 */
export type Decision = "allow" | "block" | "crisis" | "review";

export type Category =
  | "personal_info" // phone, email, socials, school name, address
  | "selling_sourcing" // buying/selling/getting nicotine or other drugs
  | "meetup" // requests to meet offline
  | "harassment"
  | "self_harm" // routes to crisis, never posted
  | "prompt_injection"
  | "other";

export interface ClassifierResult {
  label: "safe" | Category;
  confidence: number; // 0..1
  reason: string;
  model: string; // e.g. "mock-rules-v0" or "claude-haiku-5-5"
}

export interface ModerationResult {
  decision: Decision;
  categories: Category[];
  reasons: string[]; // short, human-readable, safe to show the author
  ruleHits: string[]; // ids of rules that fired, for the admin queue + eval
  classifier?: ClassifierResult; // absent if the classifier was skipped
  latencyMs: number;
}

/** Pluggable LLM classifier: MockClassifier now, Claude later. */
export interface Classifier {
  classify(text: string, signal?: AbortSignal): Promise<ClassifierResult>;
}

export type Moderate = (input: ModerationInput) => Promise<ModerationResult>;
