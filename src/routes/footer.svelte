<footer>
  Developed by Resonant, Neubee, Tom, Derrick, and Nils. Use <a
    href="https://forms.gle/7EaVLHfAvhmLjEDn8"
    target="_blank"
    rel="noreferrer">this form</a>
  or email <a href="mailto:resonant@spiritislandbuilder.com">resonant@spiritislandbuilder.com</a>
  with questions, comments or feedback. <a href="/privacypolicy">Privacy Policy</a>
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
      >){/if}.<br />Always free. Support with a
    <a href="https://ko-fi.com/resonantbuilder" target="_blank" rel="noreferrer">donation</a
    >.</span>
  <br />All materials belong to Greater Than Games, LLC.
</footer>

<style>
  a {
    text-decoration: underline;
  }
</style>
