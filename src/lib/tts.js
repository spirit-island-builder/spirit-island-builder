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
