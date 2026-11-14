/**
 * @module $lib/unsaved-changes
 * Tracks which builder components hold edits that have not been written to a
 * save file, and warns the user before the tab is closed.
 *
 * Dirtiness is tracked per-component rather than as one global flag, because
 * saves are partial: a tab's Save button writes only that component's HTML,
 * and the Builder Save writes only the components toggled on. A single flag
 * would be cleared by a spirit-board save while unsaved power cards were
 * silently discarded.
 *
 * Detection is two-stage. Every state change bumps a cheap revision counter.
 * Only components whose revision has moved since their last save are then
 * serialized and compared, which keeps the (possibly multi-megabyte, since
 * spirit art is stored as data URLs) serialization off the hot path and out
 * of the unload handler for untouched components.
 */

/**
 * Fields that live inside the state objects but describe the editor UI rather
 * than the user's content. Collapsing a form section or auto-loading the demo
 * board must not count as unsaved progress.
 */
const UI_ONLY_FIELDS = new Set(["isVisible", "demoBoardWasLoaded"]);

/**
 * @typedef {object} TrackedComponent
 * @property {object} state           Latest reference to the component's state object.
 * @property {number} revision        Bumped on every observed change.
 * @property {number} savedRevision   Value of `revision` at the last save/load.
 * @property {?string} savedSnapshot  Serialized content at the last save/load.
 */

/** @type {Map<string, TrackedComponent>} */
const components = new Map();

/**
 * Serialize a component's user-authored content, ignoring editor UI state.
 * @param {object} state
 * @returns {string}
 */
const snapshot = (state) =>
  JSON.stringify(state, (key, value) => (UI_ONLY_FIELDS.has(key) ? undefined : value));

/**
 * Record that a component's state may have changed.
 *
 * Intended to be driven by a Svelte reactive statement, e.g.
 * `$: noteChange("spiritBoard", spiritBoard)`. The `state` argument both
 * registers the reactive dependency and keeps our reference current for the
 * case where the object is replaced wholesale (loading a save file).
 *
 * @param {string} key
 * @param {object} state
 */
export const noteChange = (key, state) => {
  const existing = components.get(key);
  if (existing) {
    existing.state = state;
    existing.revision += 1;
  } else {
    components.set(key, { state, revision: 1, savedRevision: 0, savedSnapshot: null });
  }
};

/**
 * Mark the given components as matching what is on disk. Call this only after
 * a save has actually succeeded, and after `tick()` so that every pending
 * reactive update has been folded into the revision counter.
 *
 * @param {string[]} keys
 */
export const markSaved = (keys) => {
  for (const key of keys) {
    const component = components.get(key);
    if (!component) continue;
    component.savedRevision = component.revision;
    component.savedSnapshot = snapshot(component.state);
  }
};

/**
 * Components whose content differs from their last save.
 * @returns {string[]}
 */
export const dirtyComponents = () =>
  [...components.entries()]
    .filter(
      ([, component]) =>
        component.revision !== component.savedRevision &&
        snapshot(component.state) !== component.savedSnapshot
    )
    .map(([key]) => key);

/** @returns {boolean} */
export const hasUnsavedChanges = () => dirtyComponents().length > 0;

/**
 * Ask the browser to confirm before leaving the page while work is unsaved.
 *
 * The confirmation wording cannot be customized — every major browser ignores
 * the string and shows its own message — so there is nothing to configure
 * here. Browsers also suppress the prompt entirely until the user has
 * interacted with the page, which conveniently means a visitor who only reads
 * and leaves is never nagged.
 *
 * @returns {() => void} A function that removes the listener.
 */
export const installUnloadWarning = () => {
  const handleBeforeUnload = (event) => {
    if (!hasUnsavedChanges()) return;
    // preventDefault() is the spec'd trigger; returnValue is the legacy one.
    // Both are needed for full cross-browser coverage.
    event.preventDefault();
    event.returnValue = "";
  };

  window.addEventListener("beforeunload", handleBeforeUnload);
  return () => window.removeEventListener("beforeunload", handleBeforeUnload);
};
