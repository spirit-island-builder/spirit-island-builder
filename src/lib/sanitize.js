// Sanitizer for untrusted component files.
//
// Loaded .html component files and builder-save .json files are user-supplied
// and are routinely shared between players. Their rich-text fields end up in
// innerHTML twice: in the editor document while generateHTML() builds the
// preview fragment, and again inside the preview iframe, which is same-origin
// (srcdoc, no sandbox). A crafted file could therefore run script in the app's
// origin, where the Google Drive access token lives. Everything a loaded file
// can carry is funnelled through here before it reaches readHTML() or state:
//
//   sanitizeDocument(doc)   the DOMParser document that readHTML() reads
//   sanitizeSaveData(json)  a parsed builder-save object (mutated in place)
//   sanitizeRichText(html)  one rich-text string
//
// The save format is made of non-standard tags (<board>, <special-rule>,
// <level threshold="…">, <quick-card name="…">, …) carrying arbitrary
// attributes, so DOMPurify's defaults would strip the whole format. Rules:
//
//   * Standard HTML (b, i, br, img, table, a, …) follows DOMPurify's default
//     allowlist and URL checks. Form controls and legacy plugin/frame elements
//     are forbidden outright.
//   * Any tag the browser does not know (an HTMLUnknownElement such as <board>,
//     or a hyphenated custom-element name such as <special-rule>) is save
//     format and is kept with all its attributes except on* event handlers.
//     Browsers never act on src/href/etc. of an unknown element, so those
//     values are inert in the DOM; what the inner renderer does with them is
//     covered by the next rule.
//   * Attribute values that themselves contain markup (rules="<strong>…",
//     note="…<br>…") are rich text the inner renderer will innerHTML, so they
//     are sanitized again as HTML strings. Values with no tag-like "<" are
//     left byte-for-byte alone, so plain text ("a < b"), URLs and numbers
//     never change.
//
// `tests/sanitize/run.js` checks that every template and example under
// static/template/MyCustomContent survives this unchanged and that known
// payloads do not. Run it with `npm run testSanitize`.

import createDOMPurify from "dompurify";

const XHTML_NAMESPACE = "http://www.w3.org/1999/xhtml";

// What the HTML tokenizer treats as the start of a tag, comment or
// declaration. A bare "<" followed by anything else (e.g. "a < b") is text.
const MARKUP_START = /<[a-zA-Z/!?]/;

// Never part of the save format. Some of these are HTMLUnknownElement in
// current browsers and would otherwise pass as save-format tags.
const FORBID_TAGS = [
  "applet",
  "bgsound",
  "blink",
  "embed",
  "frame",
  "frameset",
  "isindex",
  "keygen",
  "multicol",
  "nextid",
  "object",
  "spacer",
  "form",
  "input",
  "button",
  "textarea",
  "select",
  "option",
  "optgroup",
  "datalist",
  "dialog",
];
const FORBIDDEN = new Set(FORBID_TAGS);

/**
 * Build a sanitizer bound to a window. The app uses the one bound to the
 * browser window (see the exports at the bottom); tests pass a jsdom window.
 *
 * @param {Window} win
 */
export function createSanitizer(win) {
  const purify = createDOMPurify(win);
  const unknownTagCache = new Map();

  /** A tag that belongs to the save format rather than to HTML. */
  const isSaveFormatTag = (tagName) => {
    if (FORBIDDEN.has(tagName)) return false;
    // Valid custom-element names always contain a hyphen; nothing in HTML does.
    if (tagName.includes("-")) return true;
    let unknown = unknownTagCache.get(tagName);
    if (unknown === undefined) {
      try {
        unknown = win.document.createElement(tagName) instanceof win.HTMLUnknownElement;
      } catch {
        unknown = false;
      }
      unknownTagCache.set(tagName, unknown);
    }
    return unknown;
  };

  // Save-format elements keep every attribute except event handlers.
  // forceKeepAttr skips DOMPurify's per-attribute allowlist and URL checks,
  // which would otherwise drop e.g. <aspect-back src="data:…"> or
  // <quick-card name="title">.
  purify.addHook("uponSanitizeAttribute", (node, data) => {
    if (
      node.namespaceURI === XHTML_NAMESPACE &&
      isSaveFormatTag(node.localName) &&
      !data.attrName.startsWith("on")
    ) {
      data.forceKeepAttr = true;
    }
  });

  const baseConfig = {
    // Function form: consulted for every tag outside DOMPurify's default allowlist.
    ADD_TAGS: isSaveFormatTag,
    FORBID_TAGS,
  };
  const stringConfig = { ...baseConfig };
  const inPlaceConfig = { ...baseConfig, IN_PLACE: true };

  /**
   * Sanitize one rich-text string. Strings with no "<" cannot carry markup
   * and are returned untouched, so plain text is never re-encoded.
   *
   * @param {unknown} value
   */
  const sanitizeRichText = (value) => {
    if (typeof value !== "string" || !MARKUP_START.test(value)) return value;
    return purify.sanitize(value, stringConfig);
  };

  /**
   * Sanitize a parsed component file in place and return it. Only <body> is
   * touched: readHTML() reads body elements plus the first <style> for custom
   * icons, and nothing in a DOMParser document's <head> is live.
   *
   * @template {Document} T
   * @param {T} doc
   * @returns {T}
   */
  const sanitizeDocument = (doc) => {
    const body = doc.body;
    if (!body) return doc;
    purify.sanitize(body, inPlaceConfig);
    // Second pass: attribute values that are rich text.
    for (const element of body.querySelectorAll("*")) {
      for (const { name, value } of Array.from(element.attributes)) {
        if (value.includes("<")) element.setAttribute(name, sanitizeRichText(value));
      }
    }
    return doc;
  };

  /**
   * Sanitize every string inside a parsed builder-save object, in place.
   *
   * @template T
   * @param {T} value
   * @returns {T}
   */
  const sanitizeSaveData = (value) => {
    if (typeof value === "string") return sanitizeRichText(value);
    if (Array.isArray(value)) {
      for (let i = 0; i < value.length; i++) value[i] = sanitizeSaveData(value[i]);
    } else if (value && typeof value === "object") {
      for (const key of Object.keys(value)) value[key] = sanitizeSaveData(value[key]);
    }
    return value;
  };

  return { sanitizeRichText, sanitizeDocument, sanitizeSaveData };
}

// Browser-bound sanitizer, created on first use so this module can be imported
// during SSR/prerendering where `window` does not exist.
let browserSanitizer = null;
const browser = () => {
  if (!browserSanitizer) browserSanitizer = createSanitizer(window);
  return browserSanitizer;
};

export const sanitizeRichText = (value) => browser().sanitizeRichText(value);
export const sanitizeDocument = (doc) => browser().sanitizeDocument(doc);
export const sanitizeSaveData = (data) => browser().sanitizeSaveData(data);
