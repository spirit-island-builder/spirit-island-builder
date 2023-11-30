<footer>
  Developed by Resonant, Neubee, Tom, and Derrick. Use <a
    href="https://forms.gle/7EaVLHfAvhmLjEDn8"
    target="_blank"
    rel="noreferrer">this form</a>
  or email <a href="mailto:resonant@spiritislandbuilder.com">resonant@spiritislandbuilder.com</a>
  with questions, comments or feedback.
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
      >){/if}.<br /></span>
  <br />All materials belong to Greater Than Games, LLC.
</footer>

<style>
  footer {
    font-size: 0.8rem;
    padding-block-start: 0.25rem;
    padding-block-end: 0.5rem;
    padding-inline-start: 0.5rem;
    background-color: #f5f5f5;
  }

  a {
    text-decoration: underline;
  }
</style>
