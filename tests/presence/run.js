// Snapshot suite for the presence-track *generation* pipeline in
// static/template/_global/js/board_front.js (buildPresenceTracks,
// getPresenceNodeHtml, and everything under them). Run with
// `npm run testPresence`; refresh baselines with `npm run testPresenceUpdate`
// after an intentional output change.
//
// Scope: generation only. addTrackBanners() and dynamicResizing() are
// layout-dependent (getBoundingClientRect, offsetWidth) and jsdom has no
// layout engine, so banner placement and sizing behavior still need manual
// verification in a browser. The <track-banner-art> elements themselves ARE
// writer output (parked on <board> until addTrackBanners adopts them), so
// they are captured alongside each snapshot.

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
import { nodeFixtures, trackFixtures } from "./fixtures.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const snapshotDir = path.join(here, "snapshots");
const corpusSnapshotDir = path.join(snapshotDir, "corpus");

const update = process.argv.includes("--update");
const compareOrUpdate = makeCompareOrUpdate(update, "testPresenceUpdate");

// The rendered <presence-tracks> plus any banner art the writers parked on
// <board> (kept separate so banner changes show up as their own diff lines).
function serializeTracks(win) {
  let out = prettyHTML(win.document.querySelector("presence-tracks").outerHTML);
  const banners = Array.from(win.document.querySelectorAll("board > track-banner-art"));
  if (banners.length) {
    out += "=== board > track-banner-art\n";
    out += banners.map((el) => prettyHTML(el.outerHTML)).join("");
  }
  return out;
}

function renderCorpusFile(filePath) {
  const source = new JSDOM(fs.readFileSync(filePath, "utf8"));
  const board = source.window.document.querySelector("board");
  if (
    !board ||
    !board.querySelector("presence-tracks") ||
    !board.querySelector("energy-track[values]") ||
    !board.querySelector("card-play-track[values]")
  ) {
    return null;
  }
  const styles = extractStyles(source.window.document);
  const win = createRenderContext(styles + board.outerHTML, "buildPresenceTracks");
  trySetupCustomIcons(win, path.basename(filePath));
  win.buildPresenceTracks();
  return serializeTracks(win);
}

function tagHTML(tag, attrs = {}) {
  const attrText = Object.entries(attrs)
    .map(([key, value]) => ` ${key}="${value}"`)
    .join("");
  return `<${tag}${attrText}></${tag}>`;
}

// Track fixtures need a fresh context each: buildPresenceTracks consumes the
// track elements (innerHTML replacement, attribute removal).
function renderTrackFixture(fixture) {
  const boardHTML =
    "<board>" +
    `<presence-tracks${Object.entries(fixture.attrs || {})
      .map(([key, value]) => ` ${key}="${value}"`)
      .join("")}>` +
    tagHTML("energy-track", fixture.energy) +
    tagHTML("card-play-track", fixture.plays) +
    (fixture.additional || []).map((attrs) => tagHTML("additional-track", attrs)).join("") +
    "</presence-tracks></board>";
  const win = createRenderContext("<style></style>" + boardHTML, "buildPresenceTracks");
  win.buildPresenceTracks();
  return serializeTracks(win);
}

function renderSyntheticNodes() {
  // One shared context: getPresenceNodeHtml only reads the document, it never
  // mutates the board.
  const win = createRenderContext("<style></style><board></board>", "getPresenceNodeHtml");
  const sections = nodeFixtures.map((fixture) => {
    const first = fixture.first || false;
    const trackType = fixture.trackType || "energy";
    const addRing = fixture.addRing !== undefined ? fixture.addRing : trackType === "energy";
    const html = win.getPresenceNodeHtml(fixture.nodeText, first, 0, trackType, addRing);
    const inputs = { nodeText: fixture.nodeText, first, trackType, addRing };
    return `=== ${fixture.name}\n--- ${JSON.stringify(inputs)}\n${prettyHTML(html)}`;
  });
  return sections.join("\n");
}

function renderSyntheticTracks() {
  const sections = trackFixtures.map((fixture) => {
    const inputs = { ...fixture };
    delete inputs.name;
    return `=== ${fixture.name}\n--- ${JSON.stringify(inputs)}\n${renderTrackFixture(fixture)}`;
  });
  return sections.join("\n");
}

function main() {
  fs.mkdirSync(corpusSnapshotDir, { recursive: true });
  const failures = [];
  const skipped = [];
  const seenSnapshots = new Set();

  // Corpus: every spirit template's presence tracks, rendered end to end
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

  // Synthetic fixtures: node grammar and table assembly
  compareOrUpdate(
    "synthetic-nodes",
    path.join(snapshotDir, "synthetic-nodes.snap.txt"),
    renderSyntheticNodes(),
    failures
  );
  compareOrUpdate(
    "synthetic-tracks",
    path.join(snapshotDir, "synthetic-tracks.snap.txt"),
    renderSyntheticTracks(),
    failures
  );

  if (skipped.length) {
    console.log(`skipped (no <presence-tracks> with track values): ${skipped.join(", ")}`);
  }
  console.log(
    `${corpusCount} corpus files, ${nodeFixtures.length} node fixtures, ` +
      `${trackFixtures.length} track fixtures`
  );

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
