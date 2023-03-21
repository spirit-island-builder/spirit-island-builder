<script>
  import html from "/docs/instructions.md";
</script>

<main>
  {@html html}
</main>

<style>
  main :global(table) {
    border: 1px solid #333;
    border-spacing: 0;
    border-collapse: collapse;
  }
  main :global(td),
  main :global(th) {
    border: 1px solid #333;
  }
</style>
