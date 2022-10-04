module.exports = {
  root: true,
  extends: ["eslint:recommended"],
  plugins: ["svelte3"],
  overrides: [{ files: ["*.svelte"], processor: "svelte3/svelte3" }],
  parserOptions: {
    sourceType: "module",
    ecmaVersion: 2020,
  },
  env: {
    browser: true,
    es6: true,
    node: true,
  },
  settings: {
    "svelte3/ignore-warnings": (object) => {
      if (object.code === "a11y-positive-tabindex") {
        return true;
      }
      return false;
    },
  },
};
