<script>
  let classList;
  export { classList as class };
  export let accept;
  export let loadObjectURL;
  export let loadDataURL;

  let fileInput;
  let files;

  const handleInput = () => {
    const file = files.item(0);
    if (file) {
      if (loadObjectURL) {
        let url = URL.createObjectURL(file);
        Promise.resolve(loadObjectURL(url)).finally(() => {
          URL.revokeObjectURL(url);
        });
      }
      if (loadDataURL) {
        const fileReader = new FileReader();
        fileReader.onload = (event) => {
          loadDataURL(event.target.result);
        };

        // This reads the file and then triggers the onload function above once it finishes
        fileReader.readAsDataURL(file);
      }
    }
  };
</script>

<input hidden type="file" {accept} bind:files bind:this={fileInput} on:change={handleInput} />
<button class={classList} on:click={() => fileInput.click()}> <slot /> </button>
