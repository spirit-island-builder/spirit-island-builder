/**
 * @module $lib/download
 * Utilities for downloading files.
 */

/**
 * Download the given URL with the given filename.
 * @param {string|URL} fileURL 
 * @param {string} fileName 
 */
export const downloadFile = (fileURL, fileName) => {
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
