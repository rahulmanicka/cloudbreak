// Moderation eval: `npm run eval` (rules-only) or `npm run eval -- --claude` (uses ANTHROPIC_API_KEY).
// Prints every miss, then accuracy, false positives (safe post wrongly held/blocked),
// false negatives (unsafe post wrongly published), and latency.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ClaudeClassifier, RulesOnlyClassifier } from "../classifier";
import { moderate } from "../index";
import type { Decision } from "../types";

interface Fixture {
  text: string;
  expect: Decision;
  category?: string;
  note?: string;
}

async function main() {
  const fixtures: Fixture[] = JSON.parse(readFileSync(join(__dirname, "fixtures.json"), "utf8"));
  const useClaude = process.argv.includes("--claude");
  const classifier = useClaude ? new ClaudeClassifier() : new RulesOnlyClassifier();

  let correct = 0;
  let falsePos = 0; // expected allow, got something else
  let falseNeg = 0; // expected not-allow, got allow (the dangerous kind)
  const latencies: number[] = [];

  for (const f of fixtures) {
    const r = await moderate({ text: f.text, kind: "post", authorAge: "13-17" }, classifier);
    latencies.push(r.latencyMs);
    if (r.decision === f.expect) {
      correct++;
      continue;
    }
    if (f.expect === "allow") falsePos++;
    if (r.decision === "allow") falseNeg++;
    console.log(
      `MISS  expected=${f.expect.padEnd(6)} got=${r.decision.padEnd(6)} rules=[${r.ruleHits.join(",")}]` +
        (r.classifier ? ` ai=${r.classifier.label}@${r.classifier.confidence}` : "") +
        `\n      "${f.text}"${f.note ? `  (${f.note})` : ""}`,
    );
  }

  latencies.sort((a, b) => a - b);
  const pct = (n: number) => `${((100 * n) / fixtures.length).toFixed(1)}%`;
  console.log(`\nClassifier: ${useClaude ? "claude-haiku-5-5" : "rules-only"}`);
  console.log(`Accuracy:        ${correct}/${fixtures.length} (${pct(correct)})`);
  console.log(`False positives: ${falsePos}  (safe posts wrongly held/blocked)`);
  console.log(`False negatives: ${falseNeg}  (unsafe posts wrongly published)`);
  console.log(`Latency p50/max: ${latencies[Math.floor(latencies.length / 2)]}ms / ${latencies.at(-1)}ms`);
  if (falseNeg > 0) process.exitCode = 1;
}

main();
