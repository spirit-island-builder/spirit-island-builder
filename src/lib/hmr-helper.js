/**
 * A module that exposes the undocumented hooks for hot-reloading from svelte-hmr.
 *
 * @see https://github.com/sveltejs/svelte-hmr/issues/57
 */
import { dev } from "$app/environment";

import { onMount, createEventDispatcher } from "svelte";

import { get_current_component } from "svelte/internal";

/**
 * If running in the dev server, calls the given function when the component is reloaded.
 * This should be called during component initialization.
 *
 * @param {() => void} callback
 */
export const onHotReload = (callback) => {
  if (dev) {
    const component = get_current_component();
    onMount(() => {
      component.$$.on_hmr?.push(() => () => {
        callback();
      });
    });
  }
};

/**
 * If running in the dev server, configures the current component to dispatch
 * a "hot-reload" event when the component is updated. This should be called
 * during component initialization.
 */
export const installHotReloadEvent = () => {
  if (dev) {
    const dispatch = createEventDispatcher();
    onHotReload(() => {
      dispatch("hot-reload");
    });
  }
};
