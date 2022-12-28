import adapter from "@sveltejs/adapter-static";

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // keeping these comments around until I get some questions answered about the build process
  kit: {
    // adapter: adapter(),
    adapter: adapter({
      pages: "build",
      assets: "build",
      // fallback: null,
      fallback: "index.html",
      precompress: false,
    }),
  },
};

export default config;
