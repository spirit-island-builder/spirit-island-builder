module.exports = {
  root: true,
  extends: ["eslint:recommended"],
  plugins: ["svelte3"],
  overrides: [
    { files: ["*.svelte"], processor: "svelte3/svelte3" },
    {
      files: ["static/template/_global/js/*.js"],
      env: { node: false },
      parserOptions: { sourceType: "script" },
    },
  ],
  parserOptions: {
    sourceType: "module",
    ecmaVersion: 2020,
  },
  env: {
    browser: true,
    es6: true,
    node: true,
  },
  rules: {
    "no-var": "error",
    "eqeqeq": "error",
  },
};
