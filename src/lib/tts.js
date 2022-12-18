/**
 * Utilities for dealing with Tabletop Simulator saves and objects.
 */
import jsone from "json-e";
import ttsSaveTemplate from "./tts-savegame.json";

/**
 * Create a Tabletop Simulator savegame containting the given objects.
 *
 * @param {any[]} objects - List of objects to include.
 * @returns string
 */
export const createTTSSave = (objects) => {
  return JSON.stringify(jsone(ttsSaveTemplate, { objects }));
};
