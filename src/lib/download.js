/**
 * @module $lib/download
 * Utilities for downloading files.
 */

import { writable } from "svelte/store";
let shouldDivertDownload = false;

/**
 * @type{import("svelte/store").Writable<{fileName?: string, imageURL?: string, fileContent?: string}>}
 */
export const downloadData = writable({});

export const divertDownload = (value) => {
  shouldDivertDownload = value;
};

/**
 * Download the given URL with the given filename.
 * @param {string|URL} fileURL
 * @param {string} fileName
 */
export const downloadFile = (fileURL, fileName) => {
  if (shouldDivertDownload) {
    downloadData.set({ imageURL: fileURL, fileName });
    return;
  }
  let element = document.createElement("a");
  element.setAttribute("href", fileURL);
  element.setAttribute("download", fileName);
  element.style.display = "none";
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
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
  downloadFile(`${mimeType},${encodeURIComponent(fileContent)}`, fileName);
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

export const takeScreenshot = (frame, fileNames, elementNamesInIframe) => {
  elementNamesInIframe.forEach((elementNameInIframe, index) => {
    frame.contentWindow
      .takeScreenshot(elementNameInIframe)
      .then((imageURL) => downloadFile(imageURL, fileNames[index]));
  });
};
