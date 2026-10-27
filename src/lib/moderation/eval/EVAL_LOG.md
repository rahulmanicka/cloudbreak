# Moderation eval log

Every run of `npm run eval` that changed something, newest last. Numbers are copied from the script output and never edited.

## Run 1 (2026-10-25, rules-only, 44 fixtures)
- Accuracy 42/44 (95.5%), false positives 1, false negatives 1, latency p50 0 ms / max 4 ms.
- **FP:** "Quit date was 10/12/2025…" was blocked as `pii.phone`. Normalization joined digits across `/`, so the date became an 8-digit "phone number."
  Fix: `/` is no longer treated as a separator between digits.
- **FN (dangerous):** "I've been thinking about hurting myself again" was **published**. The crisis rule matched "hurt myself" but not "hurting myself."
  Fix: the crisis rule now covers cut/hurt/harm in both forms. Lesson: a fixed word list will always miss phrasings, which is why the AI classifier
  stage exists, and why `self_harm` from either stage always wins.

## Run 2 (2026-10-25, rules-only, 44 fixtures, after the two fixes)
- Accuracy 44/44 (100%), false positives 0, false negatives 0, latency p50 0 ms / max 4 ms.
- **Caveat:** the same author wrote both the rules and the fixtures, so 100% means "it handles the cases we thought of,"
  not real-world accuracy. Next step: a held-out set written by someone else, plus the Claude classifier run (`npm run eval -- --claude`).

## Run 3 (2026-10-25, Claude Haiku 5.5 classifier ON, 44 fixtures)
- Accuracy 44/44 (100%), false positives 0, false negatives 0, latency p50 0 ms / max 2656 ms.
- p50 is 0 ms because most unsafe fixtures are stopped by rules, so the AI is skipped. Only posts with no rule hit reach Claude.
- **Watch item:** the slowest AI call (2.66 s) is close to the 3 s timeout. If Claude is slower in production, safe posts will be
  *held for review* (fail closed) instead of published. Safe, but annoying. Options: raise the timeout, or publish after the rules pass
  and pull the post back if the AI flags it later (riskier for minors, so not chosen).
