// Records every icon image's intrinsic aspect ratio, so CSS can size an icon by
// one dimension and let the other follow the art instead of hard-coding both.
//
//   npm run genIconRatios              rewrite the sheets in place
//   npm run genIconRatios -- --check   fail if anything is stale (for CI)
//
// A ratio is a property of the image file, so each one is declared EXACTLY
// ONCE, as a token in the generated `icon-ratios.css`:
//
//   :root { --art-fast-power-ratio: 100 / 82; }
//
// and every rule that paints that art points at the token:
//
//   icon.fast { background-image: url(".../fast_power.png");
//               --icon-ratio: var(--art-fast-power-ratio); }
//
// Without the token layer the same number gets restated everywhere the art is:
// fast_power.png is painted by 6 rules across 6 sheets, slow_power.png by 5.
// Element art already has tokens (`--el-fancy-sun` and friends in global.css),
// so those rules reference `--el-fancy-sun-ratio` rather than minting a
// duplicate - that covers the `modified-reclaim` / `discard-element` blocks in
// growth-options.css and incarna's element table.
//
// Ratios are plain numbers, so unlike the `url()` tokens they carry no
// relative-path hazard and resolve fine from any sheet.
//
// FOUR REWRITES, all custom properties and therefore inert until something opts
// in with `aspect-ratio: var(--icon-ratio)`:
//
//   background-image: url(fast_power.png)  -> --icon-ratio: var(--art-fast-power-ratio);
//   background-image: var(--el-sun, var(--el-fancy-sun))
//                                          -> --icon-ratio: var(--el-sun-ratio, var(--el-fancy-sun-ratio));
//   --el-fancy-sun: url(Sun.png)           -> --el-fancy-sun-ratio: 122 / 128;
//   --el-sun: var(--el-simple-sun)         -> --el-sun-ratio: var(--el-simple-sun-ratio);
//
// The last two mirror the element-art indirection so ratio follows art through
// the same var() chain.
//
// MINIMALITY: global.css's top-level `icon.<class>` rules are the default
// table. A rule elsewhere declares --icon-ratio only when it resolves to a
// DIFFERENT token - `info-range icon.sand` is sands-presence.png, not sand.png,
// so it needs one; `info-range icon.ocean` is the same art as global, so it
// declares nothing and the table wins by cascade.
//
// Ratios are only attached to rules whose innermost selector targets <icon>.
// Backgrounds on panels and frames (card-frame, growth-background, ...) are
// sized explicitly and deliberately not shrink-wrapped, so they are skipped -
// as are the stretch overlays and zero-width spacers in SKIP_SELECTORS.
//
// The sheets are prettier-formatted, so this works line-wise: every declaration
// is on its own line. Re-running is idempotent; a generated line directly below
// its source declaration is replaced, not duplicated.
//
// See also the `--icon-ratio: initial` reset on the base `icon` rule in
// global.css - custom properties inherit, and composite icons nest <icon>
// children that must not pick up their parent's ratio.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const cssRoot = path.resolve(here, "..", "static", "template", "_global", "css");
const tokenFile = path.join(cssRoot, "icon-ratios.css");

// Icons that deliberately ignore their art's proportions: `no` and `is-no` are
// strike-through overlays stretched across whatever they cover, `range-any` is
// a zero-width spacer, `none` is display:none.
const SKIP_SELECTORS = [/\bicon\.no\b/, /\bicon\.is-no\b/, /\bicon\.range-any\b/, /\bicon\.none\b/];

function cssFiles(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...cssFiles(full));
    else if (entry.name.endsWith(".css") && full !== tokenFile) out.push(full);
  }
  return out.sort();
}

// --- intrinsic dimensions, straight out of the file headers -----------------

function pngSize(buf) {
  if (buf.length < 24 || buf.readUInt32BE(0) !== 0x89504e47) return null;
  // IHDR is always the first chunk: width at byte 16, height at byte 20.
  return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
}

function jpgSize(buf) {
  let i = 2;
  while (i + 9 < buf.length) {
    if (buf[i] !== 0xff) {
      i++;
      continue;
    }
    const marker = buf[i + 1];
    // SOF0-SOF15, excluding DHT (c4), JPGA (c8) and DAC (cc).
    if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
      return { h: buf.readUInt16BE(i + 5), w: buf.readUInt16BE(i + 7) };
    }
    i += 2 + buf.readUInt16BE(i + 2);
  }
  return null;
}

const sizeCache = new Map();

function imageSize(file) {
  if (sizeCache.has(file)) return sizeCache.get(file);
  let size = null;
  try {
    const buf = fs.readFileSync(file);
    const ext = path.extname(file).toLowerCase();
    size = ext === ".jpg" || ext === ".jpeg" ? jpgSize(buf) : pngSize(buf);
  } catch {
    size = null;
  }
  sizeCache.set(file, size);
  return size;
}

// --- parsing helpers ---------------------------------------------------------

const DECL_URL = /^(\s*)(--[\w-]+|background-image)\s*:\s*url\(\s*["']?(.*?)["']?\s*\)\s*;\s*$/;
const DECL_VAR = /^(\s*)(--[\w-]+|background-image)\s*:\s*(var\(.+\))\s*;\s*$/;

// `var(--a, var(--b))` -> `var(--a-ratio, var(--b-ratio))`
function ratioVar(expr) {
  return expr.replace(/--[\w-]+/g, (name) => `${name}-ratio`);
}

function partTargetsIcon(part) {
  // `icon`, `icon.sand`, `growth-cell icon.discard-element.sun`, ...
  if (/(^|[\s>+~])icon(\.[\w-]+)*\s*$/.test(part)) return true;
  // Composite icons nest <icon> children that some rules address by class
  // alone - `growth-cell icon.modified-reclaim .sun` is an <icon class="element
  // sun"> (board_front.js buildReclaimIcon). Treat a class-only tail as an icon
  // when an ancestor compound in the same part is one.
  const compounds = part.split(/[\s>+~]+/).filter(Boolean);
  const tail = compounds[compounds.length - 1];
  if (compounds.length < 2 || !tail.startsWith(".")) return false;
  return compounds.slice(0, -1).some((c) => /^icon(\.[\w-]+)*$/.test(c));
}

function targetsIcon(selectorStack) {
  const innermost = selectorStack[selectorStack.length - 1];
  if (!innermost) return false;
  if (/::?(before|after)\b/.test(innermost)) return false;
  // Every comma-separated part must target <icon>; mixed rules are left alone.
  return innermost.split(",").every((part) => partTargetsIcon(part.trim()));
}

// Blank out comment bodies while preserving line count and column offsets, so
// brace tracking can run on a shadow copy. Several sheets keep large chunks of
// commented-out CSS, braces and all.
function blankComments(text) {
  let out = "";
  let i = 0;
  while (i < text.length) {
    if (text[i] === "/" && text[i + 1] === "*") {
      const end = text.indexOf("*/", i + 2);
      const stop = end === -1 ? text.length : end + 2;
      for (let j = i; j < stop; j++) out += text[j] === "\n" ? "\n" : " ";
      i = stop;
    } else {
      out += text[i];
      i++;
    }
  }
  return out;
}

const problems = [];

// Walks a sheet, invoking `onDecl` for each declaration with the selector stack
// it sits in. Returns the (possibly rewritten) lines.
function walkSheet(file, onDecl) {
  const raw = fs.readFileSync(file, "utf8");
  const lines = raw.split("\n");
  const code = blankComments(raw).split("\n");
  const out = [];
  const selectorStack = [];
  let pendingSelector = "";
  let changed = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = code[i];
    out.push(lines[i]);

    const bare = line.trim();
    if (!bare) continue;

    // Track block nesting so we know which selector a declaration belongs to.
    if (bare.endsWith("{")) {
      selectorStack.push((pendingSelector + " " + bare.slice(0, -1)).trim().replace(/\s+/g, " "));
      pendingSelector = "";
      continue;
    }
    if (bare === "}") {
      selectorStack.pop();
      continue;
    }
    if (!bare.includes(";") && !bare.includes("{") && !bare.includes("}")) {
      // A selector split across lines by prettier.
      pendingSelector += " " + bare;
      continue;
    }

    const url = DECL_URL.exec(line);
    const varRef = !url && DECL_VAR.exec(line);
    if (!url && !varRef) continue;

    const generated = onDecl({ url, varRef, selectorStack, line: i });
    // `undefined` means "leave alone"; `null` means "drop any generated line".
    if (generated === undefined) continue;

    const name = (generated ?? "").trim().split(":")[0];
    const next = lines[i + 1];
    const hadGenerated =
      next !== undefined &&
      /^\s*--[\w-]*ratio\s*:/.test(next) &&
      (!name || next.trim().startsWith(name + ":"));

    if (generated === null) {
      // Drop a stale declaration that is no longer needed.
      if (next !== undefined && /^\s*--[\w-]*ratio\s*:/.test(next)) {
        i++;
        changed++;
      }
      continue;
    }
    if (hadGenerated) {
      i++;
      if (next !== generated) changed++;
    } else if (next !== undefined && /^\s*--[\w-]*ratio\s*:/.test(next)) {
      i++; // a differently-named generated line: replace it
      changed++;
    } else {
      changed++;
    }
    out.push(generated);
  }

  if (selectorStack.length) problems.push(`${path.basename(file)}: unbalanced braces`);
  return { lines: out, changed };
}

// --- pass 1: build the token table ------------------------------------------

const tokenByImage = new Map(); // resolved image path -> --art-*-ratio token name
const tokenValue = new Map(); // token name -> "W / H"
const wantToken = new Map(); // resolved image path -> size
const usedSlugs = new Set();

// A url()-valued custom property is an art token in its own right (--el-fancy-sun,
// --speed-power-fast). It gets a ratio sibling that POINTS AT the image's --art-*
// token rather than restating the number, so every literal lives in one file.
const isArtToken = (prop) => prop.startsWith("--") && !prop.endsWith("-ratio");

function slugFor(imgPath) {
  const base = path
    .basename(imgPath, path.extname(imgPath))
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  let slug = base;
  let n = 2;
  while (usedSlugs.has(slug)) slug = `${base}-${n++}`;
  usedSlugs.add(slug);
  return slug;
}

function collect(file) {
  walkSheet(file, ({ url, selectorStack }) => {
    if (!url) return undefined;
    const [, , prop, ref] = url;
    const abs = path.resolve(path.dirname(file), ref.replace(/\\ /g, " "));
    const size = imageSize(abs);
    if (!size) return undefined;

    if (isArtToken(prop)) {
      wantToken.set(abs, size);
      return undefined;
    }
    if (prop !== "background-image") return undefined;
    if (!targetsIcon(selectorStack)) return undefined;
    if (SKIP_SELECTORS.some((r) => r.test(selectorStack.join(" ")))) return undefined;
    wantToken.set(abs, size);
    return undefined;
  });
}

for (const file of cssFiles(cssRoot)) collect(file);

// One --art-* token per distinct image; everything else references it.
for (const [abs, size] of [...wantToken].sort((a, b) => a[0].localeCompare(b[0]))) {
  const name = `--art-${slugFor(abs)}-ratio`;
  tokenByImage.set(abs, name);
  tokenValue.set(name, `${size.w} / ${size.h}`);
}

// --- pass 2: the default table, in token terms -------------------------------

const defaultToken = new Map(); // icon class -> token name, from global.css's top-level rules

function isDefaultTableRule(file, selectorStack) {
  if (path.basename(file) !== "global.css" || selectorStack.length !== 1) return false;
  return selectorStack[0].split(",").every((p) => /^icon\.[\w-]+$/.test(p.trim()));
}

collectDefaults();
function collectDefaults() {
  const file = path.join(cssRoot, "global.css");
  walkSheet(file, ({ url, selectorStack }) => {
    if (!url || url[2] !== "background-image") return undefined;
    if (!isDefaultTableRule(file, selectorStack)) return undefined;
    const abs = path.resolve(path.dirname(file), url[3].replace(/\\ /g, " "));
    const token = tokenByImage.get(abs);
    if (!token) return undefined;
    for (const p of selectorStack[0].split(","))
      defaultToken.set(p.trim().slice("icon.".length), token);
    return undefined;
  });
}

// True when the default table already yields this exact token for every class
// the rule targets. `info-range icon.ocean` matches a subset of `icon.ocean`,
// so dropping the declaration is safe.
function coveredByDefault(selectorStack, token) {
  const innermost = selectorStack[selectorStack.length - 1] || "";
  const classes = [...innermost.matchAll(/icon\.([\w-]+)/g)].map((m) => m[1]);
  return classes.length > 0 && classes.every((c) => defaultToken.get(c) === token);
}

// --- pass 3: rewrite ---------------------------------------------------------

function rewrite(file) {
  return walkSheet(file, ({ url, varRef, selectorStack }) => {
    if (url) {
      const [, indent, prop, ref] = url;
      const abs = path.resolve(path.dirname(file), ref.replace(/\\ /g, " "));

      if (isArtToken(prop)) {
        const token = tokenByImage.get(abs);
        return token ? `${indent}${prop}-ratio: var(${token});` : undefined;
      }
      if (prop !== "background-image") return undefined;
      if (!targetsIcon(selectorStack)) return undefined;
      if (SKIP_SELECTORS.some((r) => r.test(selectorStack.join(" ")))) return null;

      const token = tokenByImage.get(abs);
      if (!token) {
        problems.push(`${path.basename(file)}: no ratio token for ${ref}`);
        return null;
      }
      if (!isDefaultTableRule(file, selectorStack) && coveredByDefault(selectorStack, token))
        return null;
      return `${indent}--icon-ratio: var(${token});`;
    }

    const [, indent, prop, expr] = varRef;
    if (isArtToken(prop)) return `${indent}${prop}-ratio: ${ratioVar(expr)};`;
    if (prop !== "background-image") return undefined;
    if (!targetsIcon(selectorStack)) return undefined;
    return `${indent}--icon-ratio: ${ratioVar(expr)};`;
  });
}

// --- emit --------------------------------------------------------------------

function tokenSheet() {
  const artTokens = [...tokenValue].filter(([n]) => n.startsWith("--art-")).sort();
  const lines = [
    "/* GENERATED by `npm run genIconRatios` (scripts/gen-icon-ratios.js) - do not edit.",
    "",
    "   One entry per icon image: its intrinsic pixel dimensions, taken from the",
    "   file header. A ratio belongs to the image, not to the context painting it,",
    "   so it is declared here once and referenced as `--icon-ratio: var(--art-*)`",
    "   by every rule that uses that art. Element art keeps its own",
    "   `--el-*-ratio` tokens alongside the `--el-*` url tokens in global.css.",
    "",
    "   Inert on its own - nothing reads these until a rule opts in with",
    "   `aspect-ratio: var(--icon-ratio)`. */",
    ":root {",
    ...artTokens.map(([name, value]) => `  ${name}: ${value};`),
    "}",
    "",
  ];
  return lines.join("\n");
}

const check = process.argv.includes("--check");
let totalChanged = 0;
const stale = [];

const wantTokenSheet = tokenSheet();
const haveTokenSheet = fs.existsSync(tokenFile) ? fs.readFileSync(tokenFile, "utf8") : "";
if (wantTokenSheet !== haveTokenSheet) {
  totalChanged++;
  stale.push("icon-ratios.css");
  if (!check) fs.writeFileSync(tokenFile, wantTokenSheet);
}

for (const file of cssFiles(cssRoot)) {
  const { lines, changed } = rewrite(file);
  if (!changed) continue;
  totalChanged += changed;
  stale.push(`${path.relative(cssRoot, file).replace(/\\/g, "/")} (${changed})`);
  if (!check) fs.writeFileSync(file, lines.join("\n"));
}

for (const p of new Set(problems)) console.warn("warn: " + p);

if (check) {
  if (totalChanged) {
    console.error(
      `icon ratios are stale in ${stale.length} file(s): ${stale.join(", ")}\n` +
        "run `npm run genIconRatios`"
    );
    process.exit(1);
  }
  console.log(`icon ratios up to date (${tokenValue.size} tokens)`);
} else {
  console.log(
    totalChanged
      ? `${tokenValue.size} ratio tokens; updated ${stale.length} file(s):\n  ` + stale.join("\n  ")
      : "icon ratios already up to date"
  );
}
