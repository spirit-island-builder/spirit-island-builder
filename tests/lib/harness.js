// Shared mechanics for the snapshot suites under tests/ (growth, presence).
// Each runner supplies its own entry point, skip predicate, and snapshot
// roots; the jsdom setup, pretty-printing, comparison, and stale-baseline
// sweep live here.
//
// Snapshots are .txt on purpose: the lint-staged hook runs prettier on staged
// .html/.json files, which would reformat baselines and break comparison.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { JSDOM, VirtualConsole } from "jsdom";

const here = path.dirname(fileURLToPath(import.meta.url));
export const repoRoot = path.resolve(here, "..", "..");
export const corpusSourceDir = path.join(
  repoRoot,
  "static",
  "template",
  "MyCustomContent",
  "MySpirit"
);

const commonSrc = fs.readFileSync(
  path.join(repoRoot, "static", "template", "_global", "js", "common.js"),
  "utf8"
);
const boardFrontSrc = fs.readFileSync(
  path.join(repoRoot, "static", "template", "_global", "js", "board_front.js"),
  "utf8"
);

// Loads common.js + board_front.js as classic scripts into a fresh window whose
// body contains boardHTML. Real <script> elements (not window.eval) because
// board_front.js is strict-mode: eval would keep its functions scoped to the
// eval call instead of attaching them to window.
export function createRenderContext(boardHTML, requiredGlobal) {
  // Detached VirtualConsole: the inner script logs every action it renders;
  // that noise would drown the suite's own output.
  const dom = new JSDOM(`<!DOCTYPE html><html><head></head><body>${boardHTML}</body></html>`, {
    runScripts: "dangerously",
    virtualConsole: new VirtualConsole(),
  });
  for (const src of [commonSrc, boardFrontSrc]) {
    const script = dom.window.document.createElement("script");
    script.textContent = src;
    dom.window.document.head.appendChild(script);
  }
  if (typeof dom.window[requiredGlobal] !== "function") {
    throw new Error(`board_front.js failed to load in jsdom (${requiredGlobal} missing)`);
  }
  return dom.window;
}

// setupCustomIcons reads the template's first <style> (the icon.custom1/2/3
// extension point) — carry the styles over, with an empty fallback so
// style-less files no-op instead of crashing.
export function extractStyles(document) {
  const styles = Array.from(document.querySelectorAll("style"))
    .map((el) => el.outerHTML)
    .join("");
  return styles || "<style></style>";
}

// Some templates have icon.custom style rules without data-iconname, which
// crashes setupCustomIcons (can't happen in-app; the app regenerates that
// style block). Render without custom icon names, but say so.
// setupCustomIcons is async (it measures custom icon art for --icon-ratio),
// but the sync part builds all the DOM the snapshots serialize and jsdom
// can't load images anyway — so swallow the rejection instead of awaiting.
export function trySetupCustomIcons(win, fileLabel) {
  const note = (e) => console.log(`note: setupCustomIcons failed for ${fileLabel} (${e.message})`);
  try {
    const result = win.setupCustomIcons();
    if (result && typeof result.catch === "function") {
      result.catch(note);
    }
  } catch (e) {
    note(e);
  }
}

// One tag per line so snapshot diffs are readable.
export function prettyHTML(html) {
  return html.replace(/></g, ">\n<").trim() + "\n";
}

export function firstDifference(expected, actual) {
  const e = expected.split("\n");
  const a = actual.split("\n");
  for (let i = 0; i < Math.max(e.length, a.length); i++) {
    if (e[i] !== a[i]) {
      return { line: i + 1, expected: e[i], actual: a[i] };
    }
  }
  return null;
}

// updateCommand is the npm script named in the missing-baseline hint
// (e.g. "testGrowthUpdate").
export function makeCompareOrUpdate(update, updateCommand) {
  return function compareOrUpdate(name, snapshotPath, produced, failures) {
    if (update) {
      fs.writeFileSync(snapshotPath, produced);
      return;
    }
    if (!fs.existsSync(snapshotPath)) {
      failures.push(`${name}: no baseline snapshot — run \`npm run ${updateCommand}\``);
      return;
    }
    const expected = fs.readFileSync(snapshotPath, "utf8");
    if (expected !== produced) {
      const diff = firstDifference(expected, produced);
      failures.push(
        `${name}: mismatch at line ${diff.line}\n` +
          `  expected: ${diff.expected === undefined ? "<end of file>" : diff.expected}\n` +
          `  actual:   ${diff.actual === undefined ? "<end of file>" : diff.actual}`
      );
    }
  };
}

// Stale corpus baselines (template deleted or renamed) are an error, not noise.
export function sweepStaleBaselines(dir, seenSnapshots, update, failures) {
  for (const existing of fs.readdirSync(dir)) {
    if (!seenSnapshots.has(existing)) {
      if (update) {
        fs.unlinkSync(path.join(dir, existing));
      } else {
        failures.push(`corpus/${existing}: stale baseline with no matching template`);
      }
    }
  }
}
