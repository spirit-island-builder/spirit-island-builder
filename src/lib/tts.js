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

export const getThresholdTTSJSON = (component) => {
  let thresholds = [];
  let thresholdTags = component.getElementsByTagName("threshold");
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
        lastNum = child.innerHTML;
      } else if (child.tagName === "ICON") {
        let findIndex = elementNames.findIndex((el) => el === child.className);
        elCountArrays[j][findIndex] = lastNum;
        lastNum = 0;
      } else if (child.tagName === "THRESHOLD-OR") {
        j++;
        elCountArrays.push([0, 0, 0, 0, 0, 0, 0, 0]);
      }
    });

    let rect = threshold.getBoundingClientRect();

    elCountArrays.forEach((elArray) => {
      thresholds.push({
        elements: elArray.join(""),
        position: {
          x: toFixedNumber(
            (-(boardRect.width / boardRect.height) *
              (-23 + rect.left - boardRect.x - boardRect.width / 2)) /
              (boardRect.width / 2),
            4
          ),
          y: 0,
          z: toFixedNumber(
            (rect.y + rect.height / 2 - boardRect.y - boardRect.height / 2) /
              (boardRect.height / 2),
            4
          ),
        },
      });
    });
  });
  console.log(thresholds);
  return thresholds;
};
