import { sveltekit } from "@sveltejs/kit/vite";
import vitePluginMiddleware from "vite-plugin-remark-rehype";
import { remarkPlugins, rehypePlugins } from "./docs/remark-config";

/** @type {import('vite').UserConfig} */
const config = {
  plugins: [sveltekit(), vitePluginMiddleware({ remarkPlugins, rehypePlugins })],
  // In `src/lib/preview-frame/index.svelte`, we trick vite into
  // allowing us to import a module into a dynamically built iframe
  // by telling vite that it is a worker. We set the format of the
  // generated files here.
  worker: {
    format: "es",
  },
  server: {
    fs: {
      allow: ["docs/"],
    },
  },
};

export default config;
