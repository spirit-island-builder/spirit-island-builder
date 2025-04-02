/**
 * @module $lib/tts
 * Utilities for dealing with Tabletop Simulator saves and objects.
 */
import jsone from "json-e";
import ttsSaveTemplate from "./tts-savegame.json";

/**
 * MIME Type to use for Tabletop Simualator saves.
 */
export const ttsSaveMIMEType = "text/json;charset=utf-8";

/**
 * Create a Tabletop Simulator savegame containting the given objects.
 *
 * @param {any[]} objects - List of objects to include.
 * @returns string
 */
export const createTTSSave = (objects) => {
  return JSON.stringify(jsone(ttsSaveTemplate, { objects }), null, 2);
};

/**
 * Round a number to the given number of decimal places.
 *
 * @param {number} num
 * @param {number} digits
 * @returns number
 */
export const toFixedNumber = (num, digits) => {
  const mult = 10 ** digits;
  return Math.round(num * mult) / mult;
};

export const getThresholdTTSJSON = (
  component,
  thresholdTags = component.getElementsByTagName("threshold")
) => {
  let debug = true;
  let thresholds = [];
  if (debug) {
    console.log("Threhsold from lib/tts.js");
    console.log(component);
    console.log(thresholdTags);
  }
  let isVertical = component.classList.contains("profile");
  const boardRect = component.getBoundingClientRect();
  const thresholdsNodes = Array.from(thresholdTags);
  thresholdsNodes.forEach((threshold) => {
    let childNodesArray = Array.from(threshold.childNodes);
    const elementNames = ["sun", "moon", "fire", "air", "water", "earth", "plant", "animal"];
    let elementCounts = [0, 0, 0, 0, 0, 0, 0, 0];

    let lastNum = 0;
    let j = 0;
    let elCountArrays = [elementCounts];

    childNodesArray.forEach((child) => {
      if (child.tagName === "THRESHOLD-NUM") {
        lastNum = child.innerHTML.trim();
      } else if (child.tagName === "ICON") {
        let findIndex = elementNames.findIndex(
          (el) => el === child.classList.item(child.classList.length - 1)
        );
        elCountArrays[j][findIndex] = lastNum;
        lastNum = 0;
      } else if (!isNaN(child.nodeValue)) {
        // Used in power card thresholds
        lastNum = child.nodeValue.trim();
      } else if (child.tagName === "THRESHOLD-OR") {
        j++;
        elCountArrays.push([0, 0, 0, 0, 0, 0, 0, 0]);
      }
    });
    let xRatio = 1;
    let zRatio = 1;
    if (boardRect.width >= boardRect.height) {
      xRatio = boardRect.width / boardRect.height;
    } else {
      zRatio = boardRect.height / boardRect.width;
    }
    let rect = threshold.getBoundingClientRect();

    elCountArrays.forEach((elArray) => {
      let xLoc = toFixedNumber(
        (-xRatio * (-45 / xRatio + rect.left - boardRect.x - boardRect.width / 2)) /
          (boardRect.width / 2),
        4
      );
      let zLoc = toFixedNumber(
        (zRatio * (rect.y + rect.height / 2 - boardRect.y - boardRect.height / 2)) /
          (boardRect.height / 2),
        4
      );
      if (!isVertical && component.tagName === "ASPECT") {
        let temp = zLoc;
        zLoc = -xLoc;
        xLoc = temp;
        console.log("non-vertical aspect, rotating z and x");
      }
      thresholds.push({
        elements: elArray.join(""),
        position: {
          x: xLoc,
          y: 0,
          z: zLoc,
        },
      });
    });
  });
  if (debug) {
    console.log(thresholds);
  }
  return thresholds;
};
