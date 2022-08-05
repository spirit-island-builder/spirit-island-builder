import adapter from "@sveltejs/adapter-cloudflare";

/** @type {import('@sveltejs/kit').Config} */
const config = {
  kit: {
    adapter: adapter(),
    // adapter: adapter({
    //   pages: "build",
    //   assets: "build",
    //   fallback: "index.html",
    //   precompress: false,
    // }),

    // prerender: {
    // 	// This can be false if you're using a fallback (i.e. SPA mode)
    // 	default: true
    // }
  },
};

export default config;
