// This is a module that is intended to be loaded directly by the
// preview frame. It exports `takeScreenshot` by adding it as an
// attribute on window, which can be accessed from the main frame.



/* in ES 6 */
import domtoimage from 'dom-to-image-more';

window.takeScreenshot = async (elementName, scale = 1) => {
  let element = document.querySelector(elementName);
  console.log("scale=" + scale);
  let height = element.offsetHeight ;
  let width = element.offsetWidth ;
  console.log("Height: " + height);
  console.log("width: " + width);
  let canvas = await domtoimage.toCanvas(element, {
    allowTaint: true,
    backgroundColor: null,
    height: height,
    width: width,
    scale: scale
  });
  return canvas.toDataURL();
};


