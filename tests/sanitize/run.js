// Checks for src/lib/sanitize.js, the sanitizer every loaded component file
// and builder-save passes through. Run with `npm run testSanitize`.
//
// Four things are verified (the fourth covers the inner renderer, see below):
//   1. Corpus round-trip: every .html under static/template/MyCustomContent
//      (templates, blanks, official and community examples) comes out of
//      sanitizeDocument() unchanged. Attribute values that carry rich text may
//      be normalised (e.g. a stray closing tag dropped); those are accepted
//      only when the original and sanitized values render to the same DOM, and
//      they are listed so the normalisation can be eyeballed.
//   2. Payloads: known XSS vectors placed in element content, in rich-text
//      attributes and in builder-save JSON are neutralised, while the
//      save-format constructs next to them survive.
//   3. Idempotence: sanitizing twice equals sanitizing once, for every
//      rich-text attribute value in the corpus.
//
// Runs in jsdom, so this proves what DOMPurify does to the DOM; whether a
// loaded file still looks right in the preview is still a browser check.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { JSDOM, VirtualConsole } from "jsdom";
import { createSanitizer } from "../../src/lib/sanitize.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, "..", "..");
const corpusDir = path.join(repoRoot, "static", "template", "MyCustomContent");

const window = new JSDOM("").window;
const { sanitizeRichText, sanitizeSaveData } = createSanitizer(window);

let failures = 0;
const fail = (msg) => {
  failures++;
  console.log("  FAIL " + msg);
};

const listHTML = (dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return listHTML(full);
    return entry.name.endsWith(".html") ? [full] : [];
  });

/** Serialize a string as the DOM it would produce via innerHTML. */
const scratch = window.document.createElement("div");
const rendered = (html) => {
  scratch.innerHTML = html;
  const out = scratch.innerHTML;
  scratch.innerHTML = "";
  return out;
};

/**
 * Compare two element trees. Attribute values that differ are tolerated when
 * both render to the same DOM (rich-text normalisation); everything else is a
 * failure. Returns the list of tolerated normalisations.
 */
function compareTrees(before, after, file) {
  const normalised = [];
  const walk = (a, b, where) => {
    if (a.nodeType !== b.nodeType) return fail(`${file}: node type changed at ${where}`);
    if (a.nodeType === 3) {
      if (a.data !== b.data)
        fail(`${file}: text changed at ${where}: ${JSON.stringify(a.data.slice(0, 80))}`);
      return;
    }
    if (a.nodeType !== 1) return;
    if (a.tagName !== b.tagName)
      return fail(`${file}: <${a.tagName}> became <${b.tagName}> at ${where}`);
    const tag = a.tagName.toLowerCase();
    const bAttrs = new Map(Array.from(b.attributes, (x) => [x.name, x.value]));
    for (const { name, value } of a.attributes) {
      if (!bAttrs.has(name)) {
        fail(`${file}: <${tag} ${name}> dropped at ${where}`);
        continue;
      }
      const v2 = bAttrs.get(name);
      if (value !== v2) {
        if (rendered(value) === rendered(v2)) {
          normalised.push({ file, tag, name, from: value, to: v2 });
        } else {
          fail(
            `${file}: <${tag} ${name}> changed at ${where}\n     from ${JSON.stringify(
              value.slice(0, 120)
            )}\n       to ${JSON.stringify(v2.slice(0, 120))}`
          );
        }
      }
    }
    for (const name of bAttrs.keys()) {
      if (!a.hasAttribute(name)) fail(`${file}: <${tag} ${name}> added at ${where}`);
    }
    if (a.childNodes.length !== b.childNodes.length) {
      return fail(
        `${file}: <${tag}> child count ${a.childNodes.length} -> ${b.childNodes.length} at ${where}`
      );
    }
    for (let i = 0; i < a.childNodes.length; i++) {
      walk(a.childNodes[i], b.childNodes[i], `${where}/${tag}[${i}]`);
    }
  };
  walk(before, after, "");
  return normalised;
}

// ---------------------------------------------------------------------------
console.log("1. corpus round-trip");
const files = listHTML(corpusDir);
const normalisations = [];
let identical = 0;
let commentsRemoved = 0;

/** Remove HTML comments from a tree and return how many there were. */
const stripComments = (root) => {
  const walker = root.ownerDocument.createNodeIterator(root, 128 /* SHOW_COMMENT */);
  const comments = [];
  for (let n = walker.nextNode(); n; n = walker.nextNode()) comments.push(n);
  comments.forEach((c) => c.remove());
  return comments.length;
};

for (const file of files) {
  const rel = path.relative(repoRoot, file);
  const html = fs.readFileSync(file, "utf8");
  const before = new JSDOM(html).window.document.body;
  const doc = new JSDOM(html).window.document;
  const failuresBefore = failures;
  // Sanitizer is bound to one window; sanitize this document's body via a
  // sanitizer bound to its own window so instanceof checks line up.
  createSanitizer(doc.defaultView).sanitizeDocument(doc);
  if (before.innerHTML === doc.body.innerHTML) {
    identical++;
    continue;
  }
  // DOMPurify drops comments that contain markup (template author notes such
  // as <!-- rules="…<strong>…" -->). readHTML never reads comments, so only
  // the remaining tree has to match.
  commentsRemoved += stripComments(before) - stripComments(doc.body);
  if (before.innerHTML === doc.body.innerHTML) {
    identical++;
    continue;
  }
  const n = compareTrees(before, doc.body, rel);
  normalisations.push(...n);
  if (failures === failuresBefore && n.length === 0)
    fail(`${rel}: serialization changed but no tree difference found`);
}
console.log(
  `  ${files.length} files, ${identical} identical (ignoring ${commentsRemoved} removed comments), ${normalisations.length} render-equivalent attribute normalisations`
);
for (const n of normalisations) {
  console.log(`  ~ ${n.file} <${n.tag} ${n.name}>`);
  console.log(`      from ${JSON.stringify(n.from.slice(0, 110))}`);
  console.log(`        to ${JSON.stringify(n.to.slice(0, 110))}`);
}

// ---------------------------------------------------------------------------
console.log("2. payloads");
const payloads = [
  `<img src=x onerror=alert(1)>`,
  `<script>alert(1)</script>`,
  `<a href="javascript:alert(1)">x</a>`,
  `<a href="  JaVaScRiPt:alert(1)">x</a>`,
  `<svg><script>alert(1)</script></svg>`,
  `<svg><a xlink:href="javascript:alert(1)"><text>x</text></a></svg>`,
  `<math><mi xlink:href="javascript:alert(1)">x</mi></math>`,
  `<iframe srcdoc="<script>alert(1)</script>"></iframe>`,
  `<object data="x"></object><embed src="x">`,
  `<div onmouseover=alert(1)>x</div>`,
  `<special-rule onclick="alert(1)">x</special-rule>`,
  `<quick-card name="x" onanimationstart="alert(1)" style="animation:a 1s"></quick-card>`,
  `<form><button formaction="javascript:alert(1)">x</button></form>`,
  `<img src="javascript:alert(1)">`,
  `<noscript><p title="</noscript><img src=x onerror=alert(1)>"></noscript>`,
  `<svg><style><img src=x onerror=alert(1)></style></svg>`,
  `<table><td background="javascript:alert(1)">x</td></table>`,
  `<base href="javascript:alert(1)//"><a href="x">x</a>`,
  `<meta http-equiv="refresh" content="0;url=javascript:alert(1)">`,
  `<link rel="import" href="x">`,
  `<img name="getElementById" src="x">`,
  `<a id="location" href="x">x</a>`,
];
const bad =
  /on\w+=|<script|javascript:|<iframe|<object|<embed|srcdoc|<base|<meta|<link|<form|formaction|name="getElementById"|id="location"/i;
const escapeAttr = (s) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

for (const payload of payloads) {
  // In element content, in a rich-text attribute, and in builder-save JSON.
  const html = `<board spirit-image="https://example.test/a.png"><special-rule>${payload}</special-rule><quick-innate-power note="${escapeAttr(
    payload
  )}"></quick-innate-power></board>`;
  const doc = new JSDOM(html).window.document;
  createSanitizer(doc.defaultView).sanitizeDocument(doc);
  const out = doc.body.innerHTML;
  if (bad.test(out)) fail(`element/attribute payload survived: ${payload}\n     -> ${out}`);
  if (!/<board spirit-image="https:\/\/example.test\/a.png">/.test(out))
    fail(`board lost next to payload: ${payload}\n     -> ${out}`);

  const save = sanitizeSaveData({
    spiritBoard: { specialRules: { rules: [{ name: "n", effect: payload }] } },
  });
  if (bad.test(JSON.stringify(save)))
    fail(`JSON payload survived: ${payload}\n     -> ${JSON.stringify(save)}`);
}
console.log(`  ${payloads.length} payloads checked`);

// Save-format constructs that must survive exactly.
const mustSurvive = [
  `<board spirit-image="https://example.test/a.png" spirit-image-scale="1.2" spirit-border="2" lang="de" clickable-gui="true"><spirit-name>Name</spirit-name></board>`,
  `<aspect-back src="data:image/png;base64,AAAA" spirit-name="X" lore="Some lore"></aspect-back>`,
  `<level-1 name="title" fear-cards="3" difficulty="2" rules="<strong>Setup:</strong> add 1 {city}"></level-1>`,
  `<growth title="Growth (Pick <u>two</u>)"><growth-group values="reclaim-one,gain-power-card" cost="2"></growth-group></growth>`,
  `<quick-innate-power name="Power" speed="fast" range="1 {sacred-site}" target="any" target-title="TARGET" note="1 {fear}.<br> More"></quick-innate-power>`,
  `<special-rule>Text with <i>italics</i>, <b>bold</b>, <em>em</em>, <u>u</u>, {fire} and a <br> break &amp; an entity.</special-rule>`,
  `<rules><ul><li>one</li><li>two</li></ul><table><tbody><tr><td>cell</td></tr></tbody></table></rules>`,
  `<icon class="custom1"></icon><img src="data:image/png;base64,AAAA" class="x">`,
  `<quick-card name="Title" cost="2" elements="fire,air" image="https://example.test/b.png" range="Fear: 2"></quick-card>`,
  `<level threshold="2-fire,1-air">Effect text</level><threshold condition="fire">x</threshold>`,
  `<escalation-effect name="E" rules="<strong>On each board:</strong> Build.\n\t"></escalation-effect>`,
  `<template-event-card name="N" type="x" subtype="y" lore="L" effect="<b>Effect</b>" headercolor="#fff"></template-event-card>`,
  `<subevent effect="Add 1 {dahan}. Fear: 1" name="Sub" type="t"></subevent>`,
  `<incarna name="I" color="#abc" empowered="true" token="t" icon="x"></incarna>`,
  `<overlay-image imgurl="https://example.test/c.png" imgx="1" imgy="2" imgwidth="3" imgheight="4"></overlay-image>`,
  `<a href="https://example.test/">link</a><a href="mailto:a@b.c">m</a>`,
];
for (const html of mustSurvive) {
  const doc = new JSDOM(html).window.document;
  const before = doc.body.innerHTML;
  createSanitizer(doc.defaultView).sanitizeDocument(doc);
  if (doc.body.innerHTML !== before)
    fail(`save-format construct changed:\n     from ${before}\n       to ${doc.body.innerHTML}`);
}
console.log(`  ${mustSurvive.length} save-format constructs preserved`);

// sanitizeRichText leaves plain strings alone.
for (const s of [
  "Fear & Terror",
  "Range > 2",
  "a < b",
  "https://x.test/?a=1&b=2",
  "",
  "{fire} 2 > 1 &amp; 3",
]) {
  if (sanitizeRichText(s) !== s)
    fail(`plain string changed: ${JSON.stringify(s)} -> ${JSON.stringify(sanitizeRichText(s))}`);
}

// ---------------------------------------------------------------------------
console.log("3. idempotence");
let richValues = 0;
for (const file of files) {
  const doc = new JSDOM(fs.readFileSync(file, "utf8")).window.document;
  for (const element of doc.body.querySelectorAll("*")) {
    for (const { value } of element.attributes) {
      if (!value.includes("<")) continue;
      richValues++;
      const once = sanitizeRichText(value);
      if (sanitizeRichText(once) !== once)
        fail(
          `not idempotent in ${path.relative(repoRoot, file)}: ${JSON.stringify(
            value.slice(0, 100)
          )}`
        );
    }
  }
}
console.log(`  ${richValues} rich-text attribute values checked`);

// ---------------------------------------------------------------------------
console.log("4. inner renderer: file values escaped inside generated markup");
// The inner renderer (static/template/_global/js) builds some markup with
// template literals. Values from the loaded file that land inside an HTML
// attribute go through attrHTML()/cssURL() from common.js, so a quote in a
// spirit image URL, card speed or power value cannot start a new attribute.
// The sanitizer cannot catch these: they contain no "<".
{
  const innerJS = path.join(repoRoot, "static", "template", "_global", "js");
  const loadScripts = (bodyHTML, files) => {
    const dom = new JSDOM(`<!DOCTYPE html><html><head></head><body>${bodyHTML}</body></html>`, {
      runScripts: "dangerously",
      virtualConsole: new VirtualConsole(),
    });
    for (const file of files) {
      const script = dom.window.document.createElement("script");
      script.textContent = fs.readFileSync(path.join(innerJS, file), "utf8");
      dom.window.document.head.appendChild(script);
    }
    return dom.window;
  };
  const breakout = `" onmouseover="alert(1)`;
  const attr = (value) => value.replace(/"/g, "&quot;");
  const win = loadScripts(
    `<quick-card name="N" cost="1" speed="${attr("fast" + breakout)}" image="${attr(
      "x.png" + breakout
    )}" elements="${attr(
      "fire" + breakout
    )},air" range="1" target="any" target-title="TARGET LAND"><rules>Rules text</rules></quick-card>`,
    ["common.js", "card.js"]
  );

  const attrOut = win.attrHTML("style", 'a" onmouseover="x');
  if (attrOut !== ` style="a&quot; onmouseover=&quot;x"`)
    fail("attrHTML does not escape quotes: " + attrOut);
  const urlOut = win.cssURL('a")b');
  if (urlOut !== `url("a\\")b")`) fail("cssURL does not escape quotes: " + urlOut);

  const quickCard = win.document.querySelector("quick-card");
  const card = win.constructCard(win.getData(quickCard, 0), 0);
  const handlers = Array.from(card.querySelectorAll("*")).flatMap((el) =>
    Array.from(el.attributes)
      .filter((a) => /^on/i.test(a.name))
      .map((a) => `<${el.tagName.toLowerCase()} ${a.name}>`)
  );
  if (handlers.length)
    fail("card markup gained event handlers from hostile attributes: " + handlers.join(" "));
  const artStyle = card.querySelector("card-art .image")?.getAttribute("style") || "";
  if (!artStyle.includes(`url("x.png`)) fail("card art lost its image URL: " + artStyle);
  const speedClass = card.querySelector("info-speed icon")?.getAttribute("class");
  if (speedClass !== "fast" + breakout) fail("speed class not kept verbatim: " + speedClass);
  const elementClasses = Array.from(card.querySelectorAll("element"), (e) =>
    e.getAttribute("class")
  );
  if (elementClasses.join("|") !== "fire" + breakout + "|air")
    fail("element classes changed: " + elementClasses.join("|"));
  console.log("  card renderer keeps hostile attribute values inert and verbatim");
}

// ---------------------------------------------------------------------------
if (failures) {
  console.log(`\n${failures} failure(s)`);
  process.exit(1);
}
console.log("\nall sanitize checks passed");
