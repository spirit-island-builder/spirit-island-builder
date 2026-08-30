// Snapshot suite for the growth-panel *generation* pipeline in
// static/template/_global/js/board_front.js (buildGrowthPanel and everything
// under it). Run with `npm run testGrowth`; refresh baselines with
// `npm run testGrowthUpdate` after an intentional output change.
//
// Scope: generation only. dynamicResizing() is layout-dependent (offsetWidth,
// getBoundingClientRect) and jsdom has no layout engine, so sizing behavior
// still needs manual verification in a browser.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { JSDOM } from "jsdom";
import {
  corpusSourceDir,
  createRenderContext,
  extractStyles,
  makeCompareOrUpdate,
  prettyHTML,
  sweepStaleBaselines,
  trySetupCustomIcons,
} from "../lib/harness.js";
import { fixtures } from "./fixtures.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const snapshotDir = path.join(here, "snapshots");
const corpusSnapshotDir = path.join(snapshotDir, "corpus");

const update = process.argv.includes("--update");
const compareOrUpdate = makeCompareOrUpdate(update, "testGrowthUpdate");

function renderCorpusFile(filePath) {
  const source = new JSDOM(fs.readFileSync(filePath, "utf8"));
  const board = source.window.document.querySelector("board");
  if (!board || !board.querySelector("growth")) {
    return null;
  }
  const styles = extractStyles(source.window.document);
  const win = createRenderContext(styles + board.outerHTML, "buildGrowthPanel");
  trySetupCustomIcons(win, path.basename(filePath));
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
      "<growth></growth></board>",
    "buildGrowthPanel"
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

  sweepStaleBaselines(corpusSnapshotDir, seenSnapshots, update, failures);

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
