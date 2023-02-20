/**
 * @module $lib/download
 * Utilities for downloading files.
 */

import { writable } from "svelte/store";
let shouldDivertDownload = false;

/**
 * When downloads are divereted, contains the latest downloaded data.
 *
 * @type{import("svelte/store").Writable<{fileName?: string, imageURL?: string|URL, fileContent?: string}>}
 */
export const downloadData = writable({});

/**
 * Set whether downloads should be stored in `downloadData` or actually downloaded.
 * @param {boolean} value
 */
export const divertDownload = (value) => {
  shouldDivertDownload = value;
};

/**
 * Download the given URL with the given filename.
 *
 * Note: This does not support diverting the download, and
 * so is not exported. If you need to download something other
 * than a string or image, you should add a wrapper that knows
 * how to divert that type download, rather than directly exporting
 * this function.
 *
 * @param {string|URL} fileURL
 * @param {string} fileName
 */
const downloadFile = (fileURL, fileName) => {
  let element = document.createElement("a");
  element.setAttribute("href", fileURL);
  element.setAttribute("download", fileName);
  element.style.display = "none";
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
};

/**
 * Download the image given by the URL with the given filename.
 * @param {string|URL} imageURL
 * @param {string} fileName
 */
export const downloadImage = (imageURL, fileName) => {
  if (shouldDivertDownload) {
    downloadData.set({ imageURL, fileName });
    return;
  }
  downloadFile(imageURL, fileName);
};

/**
 * Download the given string as file with the given mime-type and file name.
 *
 * @param {string} mimeType
 * @param {string} fileContent
 * @param {string} fileName
 */
export const downloadString = (mimeType, fileContent, fileName) => {
  if (shouldDivertDownload) {
    downloadData.set({ fileContent, fileName });
    return;
  }
  downloadFile(`data:${mimeType},${encodeURIComponent(fileContent)}`, fileName);
};

/**
 * Download the given HTML fragement with the given filename.
 *
 * @param {DocumentFragment} fragment
 * @param {string} fileName
 */
export const downloadHTML = (fragment, fileName) => {
  const helper = document.createElement("helper");
  helper.append(fragment);
  downloadString("text/html;charset=utf-8", helper.innerHTML, fileName);
};
