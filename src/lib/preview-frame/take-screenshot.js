// This is a module that is intended to be loaded directly by the
// preview frame. It exports `takeScreenshot` by adding it as an
// attribute on window, which can be accessed from the main frame.

import html2canvas from "html2canvas";

window.takeScreenshot = async (elementName) => {
  let element = document.querySelector(elementName);
  let canvas = await html2canvas(element, {
    allowTaint: true,
    scale: 1,
  });
  return canvas.toDataURL();
};
