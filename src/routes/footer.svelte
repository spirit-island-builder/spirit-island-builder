<script>
  import { instructionsURL } from "$lib/instructions/index.svelte";
</script>

<footer>
  Welcome to the Spirit Island Builder! See <a
    href={instructionsURL}
    target="_blank"
    rel="noreferrer">Instructions</a>
  for details on how to use the application. The Examples (blue button above) are helpful.
  <span class="is-pulled-right has-text-right"
    >Code for this project is hosted <a
      href="https://github.com/neubee/spirit-island-builder"
      target="_blank"
      rel="noreferrer">here</a
    >{#if import.meta.env.VITE_COMMIT_SHA !== undefined}
      &nbsp;(built from
      <a
        href="https://github.com/neubee/spirit-island-builder/commit/{import.meta.env
          .VITE_COMMIT_SHA}"
        target="_blank"
        rel="noreferrer">{import.meta.env.VITE_COMMIT_SHA.substring(0, 8)}</a
      >){/if}.<br />Developed by Resonant, Neubee, and Tom. The Spirit Island Builder is adapted
    from
    <a href="https://github.com/Gudradain/spirit-island-template" target="_blank">HTML template</a>
    created by Spirit Island fanbase.</span>
  <br />This is an unofficial website. All materials belong to Greater Than Games, LLC.
</footer>

<style>
  footer {
    font-size: 0.75rem;
    padding-block-start: 0.25rem;
    padding-block-end: 0.5rem;
    padding-inline-start: 0.5rem;
    background-color: #f5f5f5;
  }

  a {
    text-decoration: underline;
  }
</style>
