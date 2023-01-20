<!--
  @component
  Displays the contents of a file for debugging.

  This is used to make changing file downloads easier, by displaying
  the content that would be downloaded in the browser instead.
  -->
<script>
  export let fileName = null;
  export let imageURL = null;
  export let fileContent = null;

  import prettier from "prettier";
  import parserHTML from "prettier/parser-html";
  import parserBabel from "prettier/parser-babel";
  import parserPostcss from "prettier/parser-postcss";

  import { HighlightAuto } from "svelte-highlight";
  import styles from "svelte-highlight/styles/github";

  import Section from "./section.svelte";

  const plugins = [parserBabel, parserHTML, parserPostcss];
  const format = (text, fileName) =>
    prettier.format(text, { filepath: fileName, plugins, htmlWhitespaceSensitivity: "ignore" });

  let formatCode = false;
</script>

<svelte:head>
  {#if styles}
    {@html styles}
  {/if}
</svelte:head>
{#if imageURL || fileContent}
  <Section title={fileName || "Unknown"}>
    {#if imageURL}
      <img src={imageURL} alt="Preview of {fileName}" />
    {/if}
    {#if fileContent}
      <button
        class={`button ${formatCode ? "is-primary is-selected" : ""}`}
        on:click={() => {
          formatCode = !formatCode;
        }}>
        Format Code
      </button>
      {@const code = formatCode ? format(fileContent, fileName) : fileContent}
      <HighlightAuto {code} />
    {/if}
  </Section>
{/if}
