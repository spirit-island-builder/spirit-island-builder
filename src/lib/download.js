/**
 * @module $lib/download
 * Utilities for downloading files.
 */

import { writable } from "svelte/store";
import { saveToDrive } from "$lib/google-drive.js";
import { showToast } from "./alert.js";

/**
 * @enum {string}
 * The possible locations to save a file.
 */
export const SaveLocation = {
  DRIVE: "drive",
  LOCAL: "local"
};

let shouldDivertDownload = false;
let saveLocation = SaveLocation.LOCAL;
let listeners = [];

export const getSaveLocation = () => saveLocation;

/**
 * Set the save location.
 * @param {SaveLocation} location
 */
export const setSaveLocation = (newLocation) => {
  saveLocation = newLocation;
  // Notify all listeners
  listeners.forEach(listener => listener(saveLocation));
};

export const subscribeSaveLocation = (callback) => {
  listeners.push(callback);
  // Return unsubscribe function
  return () => {
    listeners = listeners.filter(listener => listener !== callback);
  };
};

/**
 * When downloads are divereted, contains the latest downloaded data.
 *
 * @type{import("svelte/store").Writable<{fileName?: string, imageURL?: string|URL, fileContent?: string}>}
 */
export const downloadData = writable({});

/**
 * Set whether downloads should be stored in `downloadData` instead of saving.
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
  showToast(`💾 File saved locally`);
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
export const downloadString = (mimeType, fileContent, fileName, saveLocationOverride = SaveLocation.LOCAL) => {
  if (shouldDivertDownload) {
    downloadData.set({ fileContent, fileName });
    return;
  }

  const location = saveLocationOverride ?? SaveLocation.LOCAL

  // Local download
  if (location === SaveLocation.LOCAL) {
    downloadFile(
      `data:${mimeType},${encodeURIComponent(fileContent)}`,
      fileName
    );
  }

  // Google Drive upload
  if (location === SaveLocation.DRIVE) {
    saveToDrive(fileContent, fileName).catch(err => {
      if (err.message.includes("cancelled")) {
        showToast("📁 Save cancelled");
      } else {
        showToast(`❌ Save failed: ${err.message}`);
      }
    });
  }
};

/**
 * Download the given HTML fragement with the given filename.
 *
 * @param {DocumentFragment} fragment
 * @param {string} fileName
 */
export const downloadHTML = (fragment, fileName, saveLocationOverride = SaveLocation.LOCAL) => {
  const helper = document.createElement("helper");
  helper.append(fragment);
  downloadString("text/html;charset=utf-8", helper.innerHTML, fileName, saveLocationOverride);
};
