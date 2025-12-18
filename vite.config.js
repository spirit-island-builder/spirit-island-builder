import { sveltekit } from "@sveltejs/kit/vite";
import vitePluginMiddleware from "vite-plugin-remark-rehype";
import { remarkPlugins, rehypePlugins } from "./docs/remark-config";
import { defineConfig, loadEnv } from "vite";

/** @type {import('vite').UserConfig} */
export default defineConfig(({ mode }) => {
  process.env = { ...process.env, ...loadEnv(mode, process.cwd()) };

  return {
    define: {
      "import.meta.env.VITE_GOOGLE_CLIENT_ID": JSON.stringify(process.env.VITE_GOOGLE_CLIENT_ID),
      "import.meta.env.VITE_GOOGLE_API_KEY": JSON.stringify(process.env.VITE_GOOGLE_API_KEY),
    },
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
});
