// google-drive.js
import { SaveLocation, setSaveLocation } from "./download.js";

let signedIn = false;
let accessToken = null;
let spiritIslandFolderId = null;
let error = null;
let isDownloadInProgress = false;

const hasCredentials = !!(
  import.meta.env.VITE_GOOGLE_API_KEY &&
  import.meta.env.VITE_GOOGLE_CLIENT_ID
);

const folderName = "Spirit Island Builder";

let tokenClient = null;
let isInitialized = false;

export function getError() { return error; }
export function clearError() { error = null; }
export function isSignedIn() { return signedIn; }

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
      window.gapi.load('client', () => {
        window.gapi.client.init({
          apiKey: import.meta.env.VITE_GOOGLE_API_KEY,
          discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
        }).then(resolve).catch(reject);
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
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      scope: "https://www.googleapis.com/auth/drive.file",
      callback: (tokenResponse) => {
        if (!tokenResponse.error) {
          accessToken = tokenResponse.access_token;
          window.gapi.client.setToken({
            access_token: tokenResponse.access_token
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
          access_token: tokenResponse.access_token
        });
        signedIn = true;
        error = null;
        resolve();
      } else {
        error = tokenResponse.error;
        reject(new Error(tokenResponse.error));
      }
    };

    tokenClient.requestAccessToken({ prompt: signedIn ? '' : 'consent' });
  });
}

export function signOut() {
  if (accessToken) window.google?.accounts?.oauth2?.revoke(accessToken);
  if (window.gapi?.client) {
    window.gapi.client.setToken(null);
  }
  accessToken = null;
  signedIn = false;
  spiritIslandFolderId = null;
  error = null;
  isDownloadInProgress = false; // Reset download state
}

async function findOrCreateFolder() {
  if (spiritIslandFolderId) return spiritIslandFolderId;
  try {
    const searchRes = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=name='${encodeURIComponent(folderName)}' and mimeType='application/vnd.google-apps.folder' and trashed=false&fields=files(id,name)`,
      { headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' } }
    );
    const searchData = await searchRes.json();
    if (searchData.files?.length) return (spiritIslandFolderId = searchData.files[0].id);

    const createRes = await fetch("https://www.googleapis.com/drive/v3/files", {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({ name: folderName, mimeType: "application/vnd.google-apps.folder" }),
    });
    const createData = await createRes.json();
    return (spiritIslandFolderId = createData.id);
  } catch (err) {
    throw new Error(`Failed to find or create folder: ${err.message}`);
  }
}

async function getUniqueFilename(folderId, originalFilename) {
  // Extract name and extension
  const lastDotIndex = originalFilename.lastIndexOf('.');
  const name = lastDotIndex > 0 ? originalFilename.substring(0, lastDotIndex) : originalFilename;
  const extension = lastDotIndex > 0 ? originalFilename.substring(lastDotIndex) : '';
  
  let counter = 1;
  let testFilename = originalFilename;
  
  while (true) {
    // Check if file exists with current name
    const searchRes = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=name='${encodeURIComponent(testFilename)}' and '${folderId}' in parents and trashed=false&fields=files(id,name)`,
      { 
        headers: { 
          Authorization: `Bearer ${accessToken}`, 
          'Content-Type': 'application/json' 
        } 
      }
    );
    
    const searchData = await searchRes.json();
    
    // If no files found with this name, we can use it
    if (!searchData.files || searchData.files.length === 0) {
      return testFilename;
    }
    
    // File exists, try next number
    testFilename = `${name} (${counter})${extension}`;
    counter++;
    
    // Safety check to prevent infinite loop
    if (counter > 999) {
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
    const base64 = pdfContent.startsWith("data:")
      ? pdfContent.split(",")[1]
      : pdfContent;
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

// Shared upload function
async function uploadToDrive(fileContent, filename, mimeType) {
  if (!isSignedIn()) await signIn();
  let attempts = 0;
  while (!isSignedIn() && attempts < 30) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    attempts++;
  }
  if (!isSignedIn()) throw new Error("Sign-in did not complete");

  try {
    const folderId = await findOrCreateFolder();
    const uniqueFilename = await getUniqueFilename(folderId, filename);
    const metadata = { name: uniqueFilename, mimeType, parents: [folderId] };

    const form = new FormData();
    form.append("metadata", new Blob([JSON.stringify(metadata)], { type: "application/json" }));
    form.append("file", new Blob(fileContent, { type: mimeType }));

    const response = await fetch(
      "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink",
      { method: "POST", headers: { Authorization: `Bearer ${accessToken}` }, body: form }
    );
    if (!response.ok) throw new Error(await response.text());
    return await response.json();
  }
  catch (err) {
    throw new Error(`Failed to save file to Google Drive: ${err.message}`);
  }
}

// Function to load the Picker API script
async function loadPickerScript() {
  return new Promise((resolve, reject) => {
    if (window.google?.picker) return resolve();
    
    if (!window.gapi) {
      reject(new Error("gapi not loaded"));
      return;
    }
    
    window.gapi.load('picker', {
      callback: resolve,
      onerror: () => reject(new Error("Failed to load Google Picker"))
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

  return new Promise(async (resolve, reject) => {
    try {
      if (!accessToken) {
        throw new Error("No access token available.");
      }
      
      const folderId = await findOrCreateFolder();

      const view = new google.picker.DocsView(google.picker.ViewId.DOCS)
        .setParent(folderId)
        .setMimeTypes(accept)
        .setMode(google.picker.DocsViewMode.LIST); // Set to list view

      const picker = new google.picker.PickerBuilder()
        .addView(view)
        .setAppId(import.meta.env.VITE_GOOGLE_CLIENT_ID.split('-')[0])
        .setOAuthToken(accessToken) // FIXED: Use our stored token
        .setCallback((data) => {
          if (data[google.picker.Response.ACTION] === google.picker.Action.PICKED) {
            const file = data[google.picker.Response.DOCUMENTS][0];
            resolve(file);
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
