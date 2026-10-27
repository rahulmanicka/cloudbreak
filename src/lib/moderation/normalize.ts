// Stage 1: normalization.
// People dodge filters with tricks like "c4shapp", "5 1 0 - 5 5 5", full-width letters,
// or invisible zero-width characters. We build several "views" of the same text so each
// rule can look at the version that makes its pattern hardest to dodge.

const ZERO_WIDTH = /[​-‍⁠﻿­]/g;

const LEET: Record<string, string> = {
  "0": "o", "1": "i", "3": "e", "4": "a", "5": "s", "7": "t", "8": "b", "@": "a", "$": "s", "!": "i", "|": "l",
};

const NUMBER_WORDS: Record<string, string> = {
  zero: "0", oh: "0", o: "0", one: "1", two: "2", three: "3", four: "4", five: "5",
  six: "6", seven: "7", eight: "8", nine: "9",
};

export interface TextViews {
  /** NFKC-normalized, zero-width removed, lowercased. Use for most rules. */
  plain: string;
  /** plain + leetspeak undone + punctuation collapsed. Use for word rules ("c4shapp" becomes "cashapp"). */
  letters: string;
  /** Number words turned into digits, separators between digits removed ("five 1 0 - 5" becomes "5105"). Use for phone numbers. */
  digits: string;
}

export function normalize(raw: string): TextViews {
  const plain = raw.normalize("NFKC").replace(ZERO_WIDTH, "").toLowerCase();

  const letters = plain
    .replace(/[0-9@$!|]/g, (c) => LEET[c] ?? c)
    .replace(/[^a-z\s]/g, " ") // drop punctuation used to split words: "c.a.s.h" -> "c a s h"
    .replace(/\b([a-z])\s(?=[a-z]\b)/g, "$1") // re-join single spaced-out letters: "c a s h" -> "cash"
    .replace(/\s+/g, " ")
    .trim();

  const digits = plain
    .replace(/\b(zero|oh|one|two|three|four|five|six|seven|eight|nine)\b/g, (w) => NUMBER_WORDS[w])
    // "510 - 555 . 01" -> "51055501". "/" is deliberately NOT a separator: it's how dates are written (10/12/2025).
    .replace(/(\d)[\s.\-()_]+(?=\d)/g, "$1");

  return { plain, letters, digits };
}
