<script>
  let classList;
  export { classList as class };
  export let accept;
  export let loadObjectURL;

  let fileInput;
  let files;

  const handleInput = () => {
    const file = files.item(0);
    if (file) {
      let url = URL.createObjectURL(file);
      Promise.resolve(loadObjectURL(url)).finally(() => {
        URL.revokeObjectURL(url);
      });
    }
  };
</script>

<input hidden type="file" {accept} bind:files bind:this={fileInput} on:change={handleInput} />
<button class={classList} on:click={() => fileInput.click()}> <slot /> </button>
