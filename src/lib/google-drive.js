// google-drive.js
import { showToast } from "./alert.js";

const googleApiKey = import.meta.env.VITE_GOOGLE_API_KEY;
const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

function injectDriveStyles() {
  const css = `
    .drive-modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.5); z-index: 9999; display: flex; justify-content: center; align-items: center; }
    .drive-modal { background: white; width: 400px; padding: 20px; border-radius: 8px; box-shadow: 0 4px 15px rgba(0,0,0,0.2); font-family: sans-serif; }
    .drive-modal h3 { margin-top: 0; }
    .drive-input-group { margin-bottom: 15px; }
    .drive-input-group label { display: block; font-weight: bold; margin-bottom: 5px; }
    .drive-input-group input { width: 100%; padding: 8px; box-sizing: border-box; }
    .folder-list-container { border: 1px solid #ccc; height: 200px; overflow-y: auto; margin-bottom: 15px; border-radius: 4px; }
    .folder-item { padding: 8px 10px; border-bottom: 1px solid #eee; cursor: pointer; display: flex; align-items: center; }
    .folder-item:hover { background-color: #f0f4ff; }
    .folder-icon { margin-right: 8px; }
    .breadcrumbs { font-size: 0.9em; color: #666; margin-bottom: 5px; cursor: pointer; }
    .modal-actions { display: flex; justify-content: space-between; align-items: center; }
    .btn-create { font-size: 0.85em; color: #007bff; background: none; border: none; cursor: pointer; }
    .btn-group button { padding: 8px 15px; cursor: pointer; margin-left: 5px; }
  `;
  const style = document.createElement("style");
  style.appendChild(document.createTextNode(css));
  document.head.appendChild(style);
}

let signedIn = false;
let accessToken = null;
let error = null;
let isDownloadInProgress = false;

const hasCredentials = !!(googleApiKey && googleClientId);

let tokenClient = null;
let isInitialized = false;

export function getError() {
  return error;
}
export function clearError() {
  error = null;
}
export function isSignedIn() {
  return signedIn;
}

export async function loadGisScript() {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts?.oauth2) return resolve();
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => setTimeout(() => resolve(), 100);
    script.onerror = () => reject(new Error("Failed to load Google Identity Services"));
    document.head.appendChild(script);
  });
}

export async function loadGapiScript() {
  return new Promise((resolve, reject) => {
    if (window.gapi) return resolve();
    const script = document.createElement("script");
    script.src = "https://apis.google.com/js/api.js";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      window.gapi.load("client", () => {
        window.gapi.client
          .init({
            apiKey: googleApiKey,
            discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"],
          })
          .then(resolve)
          .catch(reject);
      });
    };
    script.onerror = () => reject(new Error("Failed to load Google API library"));
    document.head.appendChild(script);
  });
}

export async function initializeGoogleDrive() {
  if (isInitialized) return true;
  if (!hasCredentials) {
    error = "Google API credentials not configured.";
    return false;
  }

  try {
    await Promise.all([loadGisScript(), loadGapiScript()]);

    tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: googleClientId,
      scope: "https://www.googleapis.com/auth/drive.file", // if we want to show all folders (also those not created by this app) we need to set this to https://www.googleapis.com/auth/drive)
      callback: (tokenResponse) => {
        if (!tokenResponse.error) {
          accessToken = tokenResponse.access_token;
          window.gapi.client.setToken({
            access_token: tokenResponse.access_token,
          });
          signedIn = true;
          error = null;
        } else {
          error = tokenResponse.error;
        }
      },
    });

    isInitialized = true;
    return true;
  } catch (err) {
    error = `Initialization failed: ${err.message}`;
    return false;
  }
}

export async function signIn() {
  const initialized = await initializeGoogleDrive();
  if (!initialized || !tokenClient) throw new Error(error || "Initialization failed");

  return new Promise((resolve, reject) => {
    const originalCallback = tokenClient.callback;
    const timeout = setTimeout(() => {
      tokenClient.callback = originalCallback; // Restore original callback
      reject(new Error("Sign-in timeout - user may have cancelled or closed the popup"));
    }, 60000); // 60 second timeout

    tokenClient.callback = (tokenResponse) => {
      clearTimeout(timeout);
      tokenClient.callback = originalCallback; // Restore original callback

      if (!tokenResponse.error) {
        accessToken = tokenResponse.access_token;
        window.gapi.client.setToken({
          access_token: tokenResponse.access_token,
        });
        signedIn = true;
        error = null;
        resolve();
      } else {
        error = tokenResponse.error;
        reject(new Error(tokenResponse.error));
      }
    };

    tokenClient.requestAccessToken({ prompt: signedIn ? "" : "consent" });
  });
}

export function signOut() {
  if (accessToken) window.google?.accounts?.oauth2?.revoke(accessToken);
  if (window.gapi?.client) {
    window.gapi.client.setToken(null);
  }
  accessToken = null;
  signedIn = false;
  error = null;
  isDownloadInProgress = false; // Reset download state
}

async function getUniqueFilename(folderId, originalFilename) {
  // Extract name and extension
  const lastDotIndex = originalFilename.lastIndexOf(".");
  const name = lastDotIndex > 0 ? originalFilename.substring(0, lastDotIndex) : originalFilename;
  const extension = lastDotIndex > 0 ? originalFilename.substring(lastDotIndex) : "";

  let counter = 1;
  let testFilename = originalFilename;
  const MAX_ATTEMPTS = 999;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    // Construct URL with safe query parameters
    const url = new URL("https://www.googleapis.com/drive/v3/files");
    const safeName = testFilename.replace(/'/g, "\\'");
    const query = `name = '${safeName}' and '${folderId}' in parents and trashed = false`;

    url.searchParams.append("q", query);
    url.searchParams.append("fields", "files(id,name)");

    const searchRes = await fetch(url.toString(), {
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!searchRes.ok) throw new Error("Failed to check for existing files");

    const searchData = await searchRes.json();

    // If no files found with this name, we can use it
    if (!searchData.files || searchData.files.length === 0) {
      return testFilename;
    }

    // File exists, try next number
    testFilename = `${name} (${counter})${extension}`;
    counter++;

    // Safety check to prevent infinite loop
    if (counter > MAX_ATTEMPTS) {
      throw new Error("Too many duplicate files, cannot generate unique name");
    }
  }
}

/**
 * Original: Save HTML content to Google Drive
 */
export async function saveToDrive(htmlContent, filename) {
  return saveHTMLToDrive(htmlContent, filename);
}

/**
 * Save HTML file to Google Drive
 * @param {string} htmlContent
 * @param {string} filename
 */
export async function saveHTMLToDrive(htmlContent, filename) {
  return uploadToDrive([htmlContent], filename, "text/html");
}

/**
 * Save PDF file to Google Drive
 * @param {Uint8Array|ArrayBuffer|string} pdfContent
 * @param {string} filename
 */
export async function savePDFToDrive(pdfContent, filename) {
  let contentBlob;
  if (pdfContent instanceof Uint8Array || pdfContent instanceof ArrayBuffer) {
    contentBlob = [pdfContent];
  } else if (typeof pdfContent === "string") {
    const base64 = pdfContent.startsWith("data:") ? pdfContent.split(",")[1] : pdfContent;
    const binary = atob(base64);
    const len = binary.length;
    const buffer = new Uint8Array(len);
    for (let i = 0; i < len; i++) buffer[i] = binary.charCodeAt(i);
    contentBlob = [buffer];
  } else {
    throw new Error("Unsupported PDF content format");
  }

  return uploadToDrive(contentBlob, filename, "application/pdf");
}

/**
 * Save image (PNG/JPEG) file to Google Drive
 * @param {string|Blob|Uint8Array} imageContent
 * @param {string} filename
 */
export async function saveImageToDrive(imageContent, filename) {
  let contentBlob;

  if (typeof imageContent === "string") {
    // If it's a dataURL like "data:image/png;base64,..."
    if (imageContent.startsWith("data:")) {
      const [header, base64] = imageContent.split(",");
      const mimeType = header.match(/data:(.*);base64/)[1] || "image/png";
      const binary = atob(base64);
      const len = binary.length;
      const buffer = new Uint8Array(len);
      for (let i = 0; i < len; i++) buffer[i] = binary.charCodeAt(i);
      contentBlob = [buffer];
      return uploadToDrive(contentBlob, filename, mimeType);
    } else {
      throw new Error("Unsupported image string format (expected dataURL).");
    }
  } else if (imageContent instanceof Blob) {
    contentBlob = [imageContent];
    return uploadToDrive(contentBlob, filename, imageContent.type || "image/png");
  } else if (imageContent instanceof Uint8Array || imageContent instanceof ArrayBuffer) {
    contentBlob = [imageContent];
    return uploadToDrive(contentBlob, filename, "image/png");
  } else {
    throw new Error("Unsupported image content type");
  }
}

async function uploadToDrive(fileContent, defaultFilename, mimeType) {
  injectDriveStyles();
  if (!isSignedIn()) await signIn();

  // Wait for sign-in
  let attempts = 0;
  while (!isSignedIn() && attempts < 30) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    attempts++;
  }
  if (!isSignedIn()) throw new Error("Sign-in did not complete");

  try {
    const userSelection = await openCustomSaveDialog(defaultFilename);

    if (!userSelection) {
      console.log("Save cancelled by user.");
      return null;
    }

    let { filename, folderId } = userSelection;

    showToast("⏳ Uploading...");

    filename = await getUniqueFilename(folderId, filename);

    const metadata = {
      name: filename,
      mimeType: mimeType,
      parents: [folderId],
    };

    const form = new FormData();
    form.append("metadata", new Blob([JSON.stringify(metadata)], { type: "application/json" }));
    form.append("file", new Blob(fileContent, { type: mimeType }));

    const response = await fetch(
      "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink",
      { method: "POST", headers: { Authorization: `Bearer ${accessToken}` }, body: form }
    );

    if (!response.ok) throw new Error(await response.text());
    const result = await response.json();

    showToast(`💾 File saved as "${filename}"`);
    return result;
  } catch (err) {
    console.error(err);
    alert(`Error: ${err.message}`);
    throw err;
  }
}

function openCustomSaveDialog(defaultFilename) {
  return new Promise((resolve) => {
    const overlay = document.createElement("div");
    overlay.className = "drive-modal-overlay";

    overlay.innerHTML = `
      <div class="drive-modal">
        <h3>Save to Google Drive</h3>
        
        <div class="drive-input-group">
          <label>Filename:</label>
          <input type="text" id="drive-filename" value="${defaultFilename}">
        </div>

        <div class="drive-input-group">
          <label>Choose Folder:</label>
          <div class="breadcrumbs" id="drive-breadcrumbs">Current: /</div>
          <div class="folder-list-container" id="drive-folder-list">
            <div style="padding:10px;">Loading folders...</div>
          </div>
        </div>

        <div class="modal-actions">
          <button class="btn-create" id="btn-new-folder">+ Create New Folder</button>
          <div class="btn-group">
            <button id="btn-cancel">Cancel</button>
            <button id="btn-save">Save</button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    let currentFolderId = "root";
    const filenameInput = overlay.querySelector("#drive-filename");
    const folderListEl = overlay.querySelector("#drive-folder-list");
    const breadcrumbsEl = overlay.querySelector("#drive-breadcrumbs");

    // Fetch folders for the current parent
    async function fetchFolders(parentId) {
      folderListEl.innerHTML = '<div style="padding:10px; color:#666;">Loading...</div>';
      const query = `'${parentId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;
      const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(
        query
      )}&fields=files(id,name)&orderBy=name`;

      try {
        const res = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } });
        const data = await res.json();
        renderList(data.files || []);
      } catch (e) {
        folderListEl.innerHTML =
          '<div style="padding:10px; color:red;">Error loading folders.</div>';
      }
    }

    // Create a new folder
    async function createNewFolder() {
      const name = prompt("Enter name for new folder:");
      if (!name) return;

      const metadata = {
        name: name,
        mimeType: "application/vnd.google-apps.folder",
        parents: [currentFolderId],
      };

      try {
        const res = await fetch("https://www.googleapis.com/drive/v3/files", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(metadata),
        });
        if (res.ok) {
          // Refresh list to show new folder
          fetchFolders(currentFolderId);
        }
      } catch (e) {
        alert("Failed to create folder");
      }
    }

    // Render the list of folders
    function renderList(folders) {
      folderListEl.innerHTML = "";

      if (currentFolderId !== "root") {
        const upDiv = document.createElement("div");
        upDiv.className = "folder-item";
        upDiv.innerHTML = `<span class="folder-icon">⬆️</span> .. (Go Up)`;
        upDiv.onclick = () => {
          currentFolderId = "root";
          breadcrumbsEl.textContent = "Current: /";
          fetchFolders("root");
        };
        folderListEl.appendChild(upDiv);
      }

      if (folders.length === 0) {
        const empty = document.createElement("div");
        empty.style.padding = "10px";
        empty.style.color = "#888";
        empty.innerText = "No sub-folders found.";
        folderListEl.appendChild(empty);
      }

      folders.forEach((folder) => {
        const div = document.createElement("div");
        div.className = "folder-item";
        div.innerHTML = `<span class="folder-icon">📁</span> ${folder.name}`;
        div.onclick = () => {
          currentFolderId = folder.id;
          breadcrumbsEl.textContent = `Current: ... / ${folder.name}`;
          fetchFolders(folder.id);
        };
        folderListEl.appendChild(div);
      });
    }

    fetchFolders("root");

    overlay.querySelector("#btn-new-folder").onclick = createNewFolder;

    overlay.querySelector("#btn-cancel").onclick = () => {
      document.body.removeChild(overlay);
      resolve(null);
    };

    overlay.querySelector("#btn-save").onclick = () => {
      const finalFilename = filenameInput.value.trim();
      if (!finalFilename) {
        alert("Please enter a filename");
        return;
      }
      document.body.removeChild(overlay);
      resolve({ filename: finalFilename, folderId: currentFolderId });
    };
  });
}
async function loadPickerScript() {
  return new Promise((resolve, reject) => {
    if (window.google?.picker) return resolve();

    if (!window.gapi) {
      reject(new Error("gapi not loaded"));
      return;
    }

    window.gapi.load("picker", {
      callback: resolve,
      onerror: () => reject(new Error("Failed to load Google Picker")),
    });
  });
}

// Function to open the Google Picker and return the selected file's metadata
export async function openPickerAndLoadFile(accept) {
  const initialized = await initializeGoogleDrive();
  if (!initialized) throw new Error(error || "Initialization failed");

  // Ensure the user is signed in
  if (!isSignedIn()) {
    try {
      await signIn();
    } catch (err) {
      throw new Error(`Authentication failed: ${err.message}`);
    }
  }

  await loadPickerScript();

  return new Promise((resolve, reject) => {
    try {
      if (!accessToken) {
        throw new Error("No access token available.");
      }

      // eslint-disable-next-line no-undef
      const view = new google.picker.DocsView(google.picker.ViewId.DOCS)
        .setParent("root")
        .setIncludeFolders(true)
        .setMimeTypes(accept)
        // eslint-disable-next-line no-undef
        .setMode(google.picker.DocsViewMode.LIST);

      // eslint-disable-next-line no-undef
      const picker = new google.picker.PickerBuilder()
        .addView(view)
        // eslint-disable-next-line no-undef
        .enableFeature(google.picker.Feature.NAV_HIDDEN)
        .setAppId(googleClientId.split("-")[0])
        .setOAuthToken(accessToken)
        .setCallback((data) => {
          // eslint-disable-next-line no-undef
          if (data[google.picker.Response.ACTION] === google.picker.Action.PICKED) {
            // eslint-disable-next-line no-undef
            const file = data[google.picker.Response.DOCUMENTS][0];
            resolve(file);
            // eslint-disable-next-line no-undef
          } else if (data[google.picker.Response.ACTION] === google.picker.Action.CANCEL) {
            resolve(null);
          }
        })
        .build();

      picker.setVisible(true);
    } catch (err) {
      reject(err);
    }
  });
}

// Function to load a file's content from Google Drive given its metadata
export async function loadFileFromDrive(accept) {
  // Prevent duplicate downloads
  if (isDownloadInProgress) {
    console.log("Download already in progress, ignoring duplicate request");
    return null;
  }

  try {
    isDownloadInProgress = true;

    const file = await openPickerAndLoadFile(accept);
    if (!file) {
      // User closed the picker
      return null;
    }

    if (!accessToken) {
      throw new Error("No access token available for file download.");
    }

    const response = await fetch(`https://www.googleapis.com/drive/v3/files/${file.id}?alt=media`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to download file: ${await response.text()}`);
    }

    const blob = await response.blob();
    return blob;
  } catch (err) {
    console.error("Error loading file from Google Drive:", err);
    throw new Error(`Could not load file from Google Drive: ${err.message}`);
  } finally {
    // Always reset the download state, even if there was an error
    isDownloadInProgress = false;
  }
}
