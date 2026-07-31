// Snapshot suite for the growth-panel *generation* pipeline in
// static/template/_global/js/board_front.js (buildGrowthPanel and everything
// under it). Run with `npm run testGrowth`; refresh baselines with
// `npm run testGrowthUpdate` after an intentional output change.
//
// Scope: generation only. dynamicResizing() is layout-dependent (offsetWidth,
// getBoundingClientRect) and jsdom has no layout engine, so sizing behavior
// still needs manual verification in a browser.
//
// Snapshots are .txt on purpose: the lint-staged hook runs prettier on staged
// .html/.json files, which would reformat baselines and break comparison.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { JSDOM, VirtualConsole } from "jsdom";
import { fixtures } from "./fixtures.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, "..", "..");
const snapshotDir = path.join(here, "snapshots");
const corpusSnapshotDir = path.join(snapshotDir, "corpus");
const corpusSourceDir = path.join(repoRoot, "static", "template", "MyCustomContent", "MySpirit");

const update = process.argv.includes("--update");

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
function createRenderContext(boardHTML) {
  // Detached VirtualConsole: the inner script logs every growth action; that
  // noise would drown the suite's own output.
  const dom = new JSDOM(`<!DOCTYPE html><html><head></head><body>${boardHTML}</body></html>`, {
    runScripts: "dangerously",
    virtualConsole: new VirtualConsole(),
  });
  for (const src of [commonSrc, boardFrontSrc]) {
    const script = dom.window.document.createElement("script");
    script.textContent = src;
    dom.window.document.head.appendChild(script);
  }
  if (typeof dom.window.buildGrowthPanel !== "function") {
    throw new Error("board_front.js failed to load in jsdom (buildGrowthPanel missing)");
  }
  return dom.window;
}

// One tag per line so snapshot diffs are readable.
function prettyHTML(html) {
  return html.replace(/></g, ">\n<").trim() + "\n";
}

function renderCorpusFile(filePath) {
  const source = new JSDOM(fs.readFileSync(filePath, "utf8"));
  const board = source.window.document.querySelector("board");
  if (!board || !board.querySelector("growth")) {
    return null;
  }
  // setupCustomIcons reads the template's first <style> (the icon.custom1/2/3
  // extension point) — carry the styles over, with an empty fallback so
  // style-less files no-op instead of crashing.
  let styles = Array.from(source.window.document.querySelectorAll("style"))
    .map((el) => el.outerHTML)
    .join("");
  if (!styles) {
    styles = "<style></style>";
  }
  const win = createRenderContext(styles + board.outerHTML);
  try {
    win.setupCustomIcons();
  } catch (e) {
    // Some templates have icon.custom style rules without data-iconname, which
    // crashes setupCustomIcons (can't happen in-app; the app regenerates that
    // style block). Render without custom icon names, but say so.
    console.log(`note: setupCustomIcons failed for ${path.basename(filePath)} (${e.message})`);
  }
  win.buildGrowthPanel();
  return prettyHTML(win.document.querySelector("growth").outerHTML);
}

function renderSynthetic() {
  // The track templates are here for presence-track(): a growth track borrows
  // its banner from <card-play-track> (or <energy-track>), so without them the
  // banner path would never be exercised. Nothing else in writeGrowthGroup
  // reads them.
  const win = createRenderContext(
    "<board>" +
      '<energy-track banner="energy-banner.png" banner-v-scale="70%"></energy-track>' +
      '<card-play-track banner="plays-banner.png"></card-play-track>' +
      "<growth></growth></board>"
  );
  const sections = fixtures.map((fixture) => {
    const el = win.document.createElement("growth-group");
    for (const [key, value] of Object.entries(fixture.attrs)) {
      el.setAttribute(key, value);
    }
    const html = win.writeGrowthGroup(el, 0, 0);
    return `=== ${fixture.name}\n--- ${JSON.stringify(fixture.attrs)}\n${prettyHTML(html)}`;
  });
  return sections.join("\n");
}

function firstDifference(expected, actual) {
  const e = expected.split("\n");
  const a = actual.split("\n");
  for (let i = 0; i < Math.max(e.length, a.length); i++) {
    if (e[i] !== a[i]) {
      return { line: i + 1, expected: e[i], actual: a[i] };
    }
  }
  return null;
}

function compareOrUpdate(name, snapshotPath, produced, failures) {
  if (update) {
    fs.writeFileSync(snapshotPath, produced);
    return;
  }
  if (!fs.existsSync(snapshotPath)) {
    failures.push(`${name}: no baseline snapshot — run \`npm run testGrowthUpdate\``);
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
}

function main() {
  fs.mkdirSync(corpusSnapshotDir, { recursive: true });
  const failures = [];
  const skipped = [];
  const seenSnapshots = new Set();

  // Corpus: every spirit template's growth panel, rendered end to end
  const corpusFiles = fs
    .readdirSync(corpusSourceDir)
    .filter((f) => f.endsWith(".html"))
    .sort();
  let corpusCount = 0;
  for (const file of corpusFiles) {
    const produced = renderCorpusFile(path.join(corpusSourceDir, file));
    if (produced === null) {
      skipped.push(file);
      continue;
    }
    corpusCount++;
    const snapshotName = file.replace(/\.html$/, "") + ".snap.txt";
    seenSnapshots.add(snapshotName);
    compareOrUpdate(
      `corpus/${file}`,
      path.join(corpusSnapshotDir, snapshotName),
      produced,
      failures
    );
  }

  // Stale corpus baselines (template deleted or renamed) are an error, not noise
  for (const existing of fs.readdirSync(corpusSnapshotDir)) {
    if (!seenSnapshots.has(existing)) {
      if (update) {
        fs.unlinkSync(path.join(corpusSnapshotDir, existing));
      } else {
        failures.push(`corpus/${existing}: stale baseline with no matching template`);
      }
    }
  }

  // Synthetic fixtures: one context, every switch case
  compareOrUpdate(
    "synthetic",
    path.join(snapshotDir, "synthetic.snap.txt"),
    renderSynthetic(),
    failures
  );

  if (skipped.length) {
    console.log(`skipped (no <board> with <growth>): ${skipped.join(", ")}`);
  }
  console.log(`${corpusCount} corpus files, ${fixtures.length} synthetic fixtures`);

  if (update) {
    console.log("baselines updated");
    return;
  }
  if (failures.length) {
    console.error(`\n${failures.length} FAILURE(S):\n`);
    for (const failure of failures) {
      console.error(failure + "\n");
    }
    process.exit(1);
  }
  console.log("all snapshots match");
}

main();
