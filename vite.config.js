import { sveltekit } from "@sveltejs/kit/vite";

/** @type {import('vite').UserConfig} */
const config = {
  plugins: [sveltekit()],
  // In `src/lib/preview-frame/index.svelte`, we trick vite into
  // allowing us to import a module into a dynamically built iframe
  // by telling vite that it is a worker. We set the format of the
  // generated files here.
  worker: {
    format: "es",
  },
};

export default config;
