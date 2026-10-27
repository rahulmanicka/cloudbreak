// Stage 2: deterministic rules.
// Fast (~1 ms), free, and impossible to "talk out of" with a prompt.
// Each rule says which normalized view it reads and which category it belongs to.
import type { Category } from "./types";
import type { TextViews } from "./normalize";

export interface Rule {
  id: string;
  category: Category;
  test: (v: TextViews) => boolean;
}

// Links are only allowed to adult-run help services we already point to.
const ALLOWED_LINK_HOSTS = [
  "988lifeline.org", "crisistextline.org", "kickitca.org", "truthinitiative.org",
  "smokefree.gov", "teen.smokefree.gov", "cdc.gov", "nida.nih.gov", "leginfo.legislature.ca.gov",
];

function hasDisallowedLink(text: string): boolean {
  const urls = text.match(/\b(?:https?:\/\/|www\.)\S+|\b[a-z0-9-]+\.(?:com|net|org|io|gg|me|co|app|xyz|ly)\b\S*/g) ?? [];
  return urls.some((u) => {
    const host = u.replace(/^https?:\/\//, "").replace(/^www\./, "").split(/[/?#]/)[0];
    return !ALLOWED_LINK_HOSTS.some((ok) => host === ok || host.endsWith("." + ok));
  });
}

export const RULES: Rule[] = [
  // ---- personal info: anything that lets a stranger find or contact a kid ----
  { id: "pii.phone", category: "personal_info", test: (v) => /\d{7,}/.test(v.digits) },
  { id: "pii.email", category: "personal_info", test: (v) => /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/.test(v.plain) },
  { id: "pii.handle", category: "personal_info", test: (v) => /(^|\s)@[a-z0-9_.]{3,}/.test(v.plain) },
  {
    id: "pii.social",
    category: "personal_info",
    test: (v) =>
      /\b(add|hit|follow|msg|message|text|dm)\s+me\b/.test(v.letters) ||
      /\bmy\s+(snap|snapchat|insta|instagram|ig|tiktok|discord|number|cell|phone number|addy|address)\b/.test(v.letters) ||
      /\b(snap|sc|insta|ig|discord|tiktok)\s*(is|:|-)\s*\S+/.test(v.plain),
  },
  {
    id: "pii.school",
    category: "personal_info",
    test: (v) => /\b(i go to|i'm at|im at|go to|at|from|attend)\s+[a-z]+(\s[a-z]+)?\s+(high|middle|hs|ms|high school|middle school|academy)\b/.test(v.plain),
  },
  { id: "pii.link", category: "personal_info", test: (v) => hasDisallowedLink(v.plain) },

  // ---- selling / sourcing nicotine or other drugs ----
  {
    id: "sell.payment",
    category: "selling_sourcing",
    test: (v) => /\b(cashapp|cash app|venmo|zelle|paypal|apple pay)\b/.test(v.letters),
  },
  {
    id: "sell.plug",
    category: "selling_sourcing",
    // "plug" is slang for a dealer, but "my charger plug" is innocent: skip electrical context.
    test: (v) =>
      /\bplug\b/.test(v.letters) && !/\bplug\b.{0,25}\b(charger|charging|phone|laptop|outlet|socket|cord|wall|in)\b/.test(v.letters) &&
      !/\b(charger|phone|laptop|outlet|wall)\b.{0,15}\bplug\b/.test(v.letters),
  },
  {
    id: "sell.ask",
    category: "selling_sourcing",
    test: (v) =>
      /\b(who|anyone|any1|anybody)\s+(has|got|sell|sells|selling|got extra)\b/.test(v.letters) ||
      /\bwhere\s+(can|do|could)\s+(i|u|you)\s+(get|buy|cop|find)\b/.test(v.letters) ||
      /\b(selling|for sale|sell you|i sell|cop (some|a)|hmu)\b/.test(v.letters),
  },

  // ---- meeting up offline ----
  {
    id: "meet.request",
    category: "meetup",
    test: (v) =>
      /\b(meet up|meetup|link up|pull up|come over|hang out irl|meet irl|meet me|wanna meet|lets meet)\b/.test(v.letters) ||
      /\b(where do you live|what school do you go|wya)\b/.test(v.letters),
  },

  // ---- harassment aimed at another user ----
  {
    id: "harass.direct",
    category: "harassment",
    test: (v) =>
      /\b(kys|kill yourself|go die|you('re| are) (worthless|pathetic|a loser|disgusting)|nobody likes you|shut up loser)\b/.test(v.plain),
  },

  // ---- self-harm / crisis: never posted, always routed to help ----
  {
    id: "crisis.selfharm",
    category: "self_harm",
    test: (v) =>
      /\b(kill myself|killing myself|end it all|end my life|want to die|wanna die|suicide|suicidal|self harm|self-harm|(cut|cutting|hurt|hurting|harm|harming) myself|don'?t want to (be alive|live|exist)|no reason to live|better off dead)\b/.test(v.plain),
  },

  // ---- prompt injection: text trying to instruct the AI moderator ----
  {
    id: "inject.instructions",
    category: "prompt_injection",
    test: (v) =>
      /\b(ignore|disregard|forget)\b.{0,20}\b(previous|prior|above|all|your)\b.{0,20}\b(instructions|rules|prompt)\b/.test(v.plain) ||
      /\b(you are now|act as|system prompt|developer mode|jailbreak)\b/.test(v.plain) ||
      /<\/?\s*(user_post|system|assistant|instructions?)\s*>/.test(v.plain) ||
      /\b(classify|label|mark|rate)\s+(this|it|me)\s+(as\s+)?(safe|allowed|ok|harmless)\b/.test(v.plain),
  },
];

export function runRules(v: TextViews): Rule[] {
  return RULES.filter((r) => r.test(v));
}
