// Five Seconds to Explain the Glass — deterministic one-liner entry.
//
// The program writes exactly one sentence — the excuse a house cat gives
// in the five seconds after knocking a glass off the table — to
// $OUTPUT_DIR/entry.txt (or /output/entry.txt when OUTPUT_DIR is unset).
// No randomness, no clock, no network, no input: the same bytes every run.
//
// Gate enforced before writing (mirrors the sealed scorer):
//   * UTF-8 text of 1 to 200 characters
//   * not only white space
//   * exactly one sentence (one terminal full stop, no other sentence
//     terminators) — verified against the entry at build time: 120 chars,
//     one full stop, no "sorry", no gravity joke, no slippery edge.
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ENTRY =
  "That glass squatted in my sunbeam all afternoon, so I evicted it — the rent is one chin scratch a day and it never paid.";

function fail(message: string): never {
  throw new Error(`entry gate failed: ${message}`);
}

function checkGate(text: string): void {
  if (text.length < 1 || text.length > 200) {
    fail(`length ${text.length} outside 1..200 characters`);
  }
  if (text.trim().length === 0) {
    fail("entry is only white space");
  }
  // Exactly one sentence: a single terminal full stop and no other
  // sentence terminators anywhere in the text.
  const terminators = text.match(/[.!?]/g) ?? [];
  if (terminators.length !== 1 || !text.endsWith(".")) {
    fail(`expected exactly one sentence, found ${terminators.length} terminator(s)`);
  }
  // Must be valid UTF-8 when encoded (guards against stray surrogates).
  const encoded = Buffer.from(text, "utf8");
  if (encoded.toString("utf8") !== text) {
    fail("entry is not valid UTF-8 text");
  }
}

const outDir = process.env.OUTPUT_DIR ?? "/output";
checkGate(ENTRY);
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, "entry.txt"), ENTRY, "utf8");
