// This is a module that is intended to be loaded directly by the
// preview frame. It exports `takeScreenshot` by adding it as an
// attribute on window, which can be accessed from the main frame.

/* in ES 6 */
import domtoimage from "dom-to-image-more";

/** JPEG quality for flattened exports. High enough to be visually lossless
 *  on a print, far smaller than the PNG of the same canvas. */
const JPEG_QUALITY = 0.95;

/**
 * Render one element of the preview to a data URL.
 *
 * @param {string} selector  CSS selector for the element to capture.
 * @param {number} scale  Canvas pixels per CSS pixel.
 * @param {"png"|"jpeg"} format  "jpeg" flattens transparency onto white.
 * @returns {Promise<string>} data URL of the rendered image.
 */
window.takeScreenshot = async (selector, scale = 1, format = "png") => {
  const element = document.querySelector(selector);
  if (!element) {
    throw new Error(`nothing in the preview matches "${selector}"`);
  }
  const canvas = await domtoimage.toCanvas(element, {
    height: element.offsetHeight,
    width: element.offsetWidth,
    scale: scale,
  });
  if (format !== "jpeg") {
    return canvas.toDataURL();
  }
  // JPEG has no alpha channel, so flatten onto white first; otherwise
  // transparent regions (rounded card corners) come out black.
  const flat = document.createElement("canvas");
  flat.width = canvas.width;
  flat.height = canvas.height;
  const ctx = flat.getContext("2d");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, flat.width, flat.height);
  ctx.drawImage(canvas, 0, 0);
  return flat.toDataURL("image/jpeg", JPEG_QUALITY);
};
