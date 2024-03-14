<script>
  import { onMount } from "svelte";

  import * as Lib from "../lib";
  import PreviewFrame from "$lib/preview-frame/index.svelte";
  import LoadButton from "$lib/load-button.svelte";

  import NameEffects from "./name-effects.svelte";
  // import AspectEffects from "./aspect-effects.svelte";
  import CustomIcons from "../custom-icons.svelte";
  import { downloadHTML } from "$lib/download";
  import { dev } from "$app/environment";
  // import examples from "./examples.json";
  // import Examples from "$lib/example-modal.svelte";

  // let exampleModal;

  export let blightCard;
  export let emptyBlightCard;
  export let customIcons;

  let previewFrame;

  async function loadHTMLFromURL(url) {
    url = new URL(url, document.baseURI);
    let loadedDocument = await Lib.loadHTML(url);
    readHTML(loadedDocument, url);
    reloadPreview();
  }

  const demoURL = "/template/MyCustomContent/MyBlightCard/blight_card_downward_spiral.html";
  function onLoad() {
    if (blightCard.demoBoardWasLoaded === false) {
      loadHTMLFromURL(demoURL).then(() => {
        blightCard.demoBoardWasLoaded = true;
        emptyBlightCard.demoBoardWasLoaded = true;
      });
    } else {
      reloadPreview();
    }
  }
  onMount(onLoad);

  function reloadPreview() {
    console.log("Updating Preview (f=reloadPreview)");
    previewFrame.copyHTMLFrom(generateHTML(blightCard)).then(() => {
      previewFrame.startMain();
    });
  }

  function generateHTML(blightCard) {
    const fragment = new DocumentFragment();

    let blightCardHTML = document.createElement("template-blight-card");
    fragment.append(blightCardHTML);

    //Generate HTML for Blight Card Name
    blightCardHTML.setAttribute("name", blightCard.card.cardName);

    //Generate HTML for Blight Per Player
    blightCardHTML.setAttribute("per-player", blightCard.card.blightPerPlayer);

    //Generate HTML for Still Healthy?
    blightCardHTML.setAttribute("still-healthy", blightCard.card.isStillHealthy);

    //Generate HTML for Effect
    let blightEffect = document.createElement("effect");
    blightCardHTML.appendChild(blightEffect);
    blightEffect.innerHTML = blightCard.card.cardEffect;

    //Set Custom Icons
    const spiritStyle = document.createElement("style");
    fragment.prepend(spiritStyle);
    let customIconText = "";
    customIcons.icons.forEach((icon) => {
      customIconText +=
        "icon.custom" + (icon.id + 1) + "{background-image: url('" + icon.name + "'); }\n";
    });
    spiritStyle.textContent = customIconText;

    console.log("blightCard HTML generated");
    console.log(blightCard);

    return fragment;
  }

  function readHTML(htmlElement) {
    //Reads the Template HTML file into the Form
    console.log("Loading blight card into form (f=readHTML)");

    //Create a new blank JSON for the template data
    blightCard = JSON.parse(JSON.stringify(emptyBlightCard));

    const blightCardHTML = htmlElement.querySelectorAll("template-blight-card")[0];

    //Read Blight Card Name
    blightCard.card.cardName = blightCardHTML.getAttribute("name");

    //Read Blight Per Player
    blightCard.card.blightPerPlayer = blightCardHTML.getAttribute("per-player");

    //Read HTML for Still Healthy?
    blightCard.card.isStillHealthy = blightCardHTML.getAttribute("still-healthy");
    console.log("read stillhealthy=" + blightCard.card.isStillHealthy);
    //Read Effect
    let blightEffect = blightCardHTML.querySelectorAll("effect")[0];
    blightCard.card.cardEffect = blightEffect.innerHTML;

    //Custom Icons
    if (blightCard.demoBoardWasLoaded) {
      const blightCardStyle = htmlElement.querySelectorAll("style")[0];
      customIcons.icons.splice(0, customIcons.icons.length); //Clear the Form first
      if (blightCardStyle) {
        const regExp = new RegExp(/(?<=(["']))(?:(?=(\\?))\2.)*?(?=\1)/, "g");
        let iconList = blightCardStyle.textContent.match(regExp);
        if (iconList) {
          iconList.forEach((customIcon) => {
            customIcons = Lib.addCustomIcon(customIcons, customIcon);
            console.log(customIcon);
          });
        }
      }
    } else {
      console.log("SKIPPING ICON LOAD");
    }

    console.log("blightCard HTML loaded into form");
    console.log(blightCard);
  }

  function exportBlightCard() {
    const htmlFileName = blightCard.card.cardName.replaceAll(" ", "_") + "_BlightCard.html";
    downloadHTML(generateHTML(blightCard), htmlFileName);
  }

  function clearAllFields() {
    if (window.confirm("Are you sure? This permanently clears all fields in Aspect.")) {
      blightCard = JSON.parse(JSON.stringify(emptyBlightCard));
      reloadPreview();
    }
  }

  function screenshotSetUp() {
    const fileNames = [blightCard.card.cardName.replaceAll(" ", "_") + "_BlightCard.png"];
    const elementNamesInIframe = ["blight-card"];
    previewFrame.takeScreenshot(fileNames, elementNamesInIframe);
  }

  // async function loadExample(example) {
  //   await loadHTMLFromURL(example.url);
  //   hideAll();
  // }

  // function hideAll() {
  //   blightCard.card.isVisible = false;
  //   customIcons.isVisible = false;
  // }
  let overlayImage;
  function addOverlay() {
    let previewFrame = document.getElementById("preview-iframe").contentWindow;
    let eventCardDOM = previewFrame.document.getElementsByTagName("blight-card")[0];
    const overlay = previewFrame.document.createElement("dev-overlay");
    eventCardDOM.appendChild(overlay);
    overlay.style.backgroundImage = `url('${overlayImage}')`;
  }
</script>

<PreviewFrame id="blight-card-preview" bind:this={previewFrame} on:hot-reload={reloadPreview}>
  <svelte:fragment slot="head">
    <link href="/template/_global/css/global.css" rel="stylesheet" />
    <link href="/template/_global/css/blight_card.css" rel="stylesheet" />
    <link href="/template/_global/css/blight_fear_card_icons.css" rel="stylesheet" />
    <script type="text/javascript" src="/template/_global/js/common.js"></script>
    <script type="text/javascript" src="/template/_global/js/blight_card.js" defer></script>
  </svelte:fragment>
</PreviewFrame>

<div class="field has-addons mb-2 is-flex-wrap-wrap">
  <!-- <button class="button is-info js-modal-trigger mr-1" on:click={exampleModal.open}>
    Examples
  </button> -->
  <LoadButton accept=".html" class="button is-success mr-1" loadObjectURL={loadHTMLFromURL}>
    Load
  </LoadButton>
  <button class="button is-success  mr-1" on:click={exportBlightCard}> Save </button>
  <button class="button is-success  mr-1" on:click={screenshotSetUp}>Download Image</button>
  <button class="button is-warning  mr-1" id="updateButton" on:click={reloadPreview}
    >Update Preview</button>
  <button class="button is-warning mr-1" on:click={previewFrame.toggleSize}
    >Toggle Board Size</button>
  <button class="button is-danger mr-1" on:click={clearAllFields}>Clear All Fields</button>
  {#if dev}
    <LoadButton
      accept="image/png, image/jpeg"
      class="button is-file-load is-small"
      loadDataURL={(url) => {
        overlayImage = url;
      }}>Load Overlay</LoadButton>
    <button class="button is-danger mr-1" on:click={addOverlay}>Add Overlay</button>
  {/if}
</div>
<div class="columns mt-0 mb-1">
  <div class="column pt-0">
    <NameEffects bind:blightCard />
    <CustomIcons bind:customIcons />
  </div>
  <div class="column pt-0">
    <!-- <AspectEffects bind:aspect /> -->
  </div>
</div>
<!-- <Examples
  bind:this={exampleModal}
  {loadExample}
  title="Load Examples & Official Adversaries"
  {examples} /> -->
