import adapter from "@sveltejs/adapter-static";

/** @type {import('@sveltejs/kit').Config} */
const config = {
  kit: {
    adapter: adapter({
      pages: "build",
      assets: "build",
      fallback: "test.html",
      precompress: false,
    }),

    // prerender: {
    // 	// This can be false if you're using a fallback (i.e. SPA mode)
    // 	default: true
    // }
  },
};

export default config;
