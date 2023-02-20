<footer>
  See <a
    href="https://neubee.github.io/spirit-island-builder/instructions"
    target="_blank"
    rel="noreferrer">Instructions</a>
  for details on how to use the form. For custom art,
  <a href="https://www.wombo.art/" target="_blank" rel="noreferrer">Wombo</a>
  (unaffiliated) is a popular art generator.
  <span class="is-pulled-right"
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
      >){/if}.</span>
  <br />This is an unofficial website. Interface created by Neubee & Resonant. The Spirit Island
  Builder is adapted from
  <a href="https://github.com/Gudradain/spirit-island-template" target="_blank">HTML template</a>
  developed by Spirit Island fanbase. All materials belong to Greater Than Games, LLC.
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
