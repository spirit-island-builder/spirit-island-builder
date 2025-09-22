<script>
  import { onMount } from "svelte";

  import * as Lib from "../lib";
  import PreviewFrame from "$lib/preview-frame/index.svelte";
  import LoadButton from "$lib/load-button.svelte";
  import LoadDropdown from "$lib/load-dropdown.svelte";

  import NameEffects from "./name-effects.svelte";
  import CustomIcons from "../custom-icons.svelte";
  import { downloadHTML } from "$lib/download";
  import { dev } from "$app/environment";

  export let fearCard;
  export let emptyFearCard;

  let previewFrame;

  async function loadHTMLFromURL(url) {
    url = new URL(url, document.baseURI);
    let loadedDocument = await Lib.loadHTML(url);
    readHTML(loadedDocument, url);
    reloadPreview();
  }

  const demoURL = "/template/MyCustomContent/MyFearCard/fear_card_blank.html";
  function onLoad() {
    if (fearCard.demoBoardWasLoaded === false) {
      loadHTMLFromURL(demoURL).then(() => {
        fearCard.demoBoardWasLoaded = true;
        emptyFearCard.demoBoardWasLoaded = true;
      });
    } else {
      reloadPreview();
    }
  }
  onMount(onLoad);

  function reloadPreview() {
    console.log("Updating Preview (f=reloadPreview)");
    previewFrame.copyHTMLFrom(generateHTML(fearCard)).then(() => {
      previewFrame.startMain();
    });
  }

  function generateHTML(fearCard) {
    const fragment = new DocumentFragment();

    let fearCardHTML = document.createElement("template-fear-card");
    fragment.append(fearCardHTML);

    //Generate HTML for Fear Card Name
    let fearCardName = document.createElement("fear-card-name");
    fearCardHTML.appendChild(fearCardName);
    fearCardName.innerHTML = fearCard.card.cardName;

    //Generate HTML for Terror Levels
    for (let i = 1; i < 4; i++) {
      let terrorLevelHTML = document.createElement("terror-level");
      fearCardHTML.appendChild(terrorLevelHTML);
      let curLevel = "level" + i;
      terrorLevelHTML.innerHTML = fearCard.card[curLevel];
      terrorLevelHTML.classList.add(curLevel);
    }

    //Show back?
    if (fearCard.showBack) {
      let fearBackHTML = document.createElement("fear-back");
      fragment.appendChild(fearBackHTML);
    }

    //Set Custom Icons
    let customIconText = Lib.getCustomIconHTML(fearCard.customIcons);
    const fearCardStyle = document.createElement("style");
    fragment.prepend(fearCardStyle);
    fearCardStyle.textContent = customIconText;

    console.log("fearCard HTML generated");
    console.log(fearCard);

    return fragment;
  }

  function readHTML(htmlElement) {
    //Reads the Template HTML file into the Form
    console.log("Loading fear card into form (f=readHTML)");

    //Create a new blank JSON for the template data
    fearCard = JSON.parse(JSON.stringify(emptyFearCard));

    const fearCardName = htmlElement.querySelectorAll("fear-card-name")[0];

    //Read Fear Card Name
    fearCard.card.cardName = fearCardName.innerHTML;

    //Read Terror Levels
    const terrorLevels = htmlElement.querySelectorAll("terror-level");
    terrorLevels.forEach((level, i) => {
      let levelNum = "level" + (i + 1);
      fearCard.card[levelNum] = level.innerHTML;
    });

    //Custom Icons
    fearCard.customIcons = Lib.loadCustomIconsFromHTML(
      htmlElement,
      fearCard.customIcons,
      document.baseURI
    );

    console.log("fearCard HTML loaded into form");
    console.log(fearCard);
  }

  function exportFearCard() {
    const htmlFileName = fearCard.card.cardName.replaceAll(" ", "_") + "_FearCard.html";
    downloadHTML(generateHTML(fearCard), htmlFileName);
  }

  function clearAllFields() {
    if (window.confirm("Are you sure? This permanently clears all fields in Aspect.")) {
      fearCard = JSON.parse(JSON.stringify(emptyFearCard));
      reloadPreview();
    }
  }

  function screenshotSetUp() {
    const fileNames = [fearCard.card.cardName.replaceAll(" ", "_") + "_FearCard.png"];
    const elementNamesInIframe = ["template-fear-card"];
    if (fearCard.showBack) {
      fileNames.push(fearCard.card.cardName.replaceAll(" ", "_") + "_FearCardBack.png");
      elementNamesInIframe.push("fear-back");
    }
    previewFrame.takeScreenshot(fileNames, elementNamesInIframe);
  }

  // async function loadExample(example) {
  //   await loadHTMLFromURL(example.url);
  //   hideAll();
  // }

  // function hideAll() {
  //   fearCard.card.isVisible = false;
  //   customIcons.isVisible = false;
  // }

  let overlayImage;
  function addOverlay() {
    let previewFrame = document.getElementById("preview-iframe").contentWindow;
    let eventCardDOM = previewFrame.document.getElementsByTagName("template-fear-card")[0];
    const overlay = previewFrame.document.createElement("dev-overlay");
    eventCardDOM.appendChild(overlay);
    overlay.style.backgroundImage = `url('${overlayImage}')`;
  }
</script>

<div class="columns ml-4 mt-0 mb-1">
  <div class="column is-one-third pt-0">
    <NameEffects bind:fearCard />
    <CustomIcons customIcons={fearCard.customIcons} />
  </div>
  <div class="column pt-0">
    <PreviewFrame id="fear-card-preview" bind:this={previewFrame} on:hot-reload={reloadPreview}>
      <svelte:fragment slot="head">
        <link href="/template/_global/css/global.css" rel="stylesheet" />
        <link href="/template/_global/css/fear_card.css" rel="stylesheet" />
        <link href="/template/_global/css/blight_fear_card_icons.css" rel="stylesheet" />
        <script type="text/javascript" src="/template/_global/js/common.js"></script>
        <script type="text/javascript" src="/template/_global/js/fear_card.js" defer></script>
      </svelte:fragment>
    </PreviewFrame>
    <div class="field has-addons mb-1 is-flex-wrap-wrap">
      <!-- <button class="button is-info js-modal-trigger mr-1" on:click={exampleModal.open}>
        Examples
      </button> -->
      <LoadDropdown
        accept="text/html"
        class="button is-success mt-1 mr-1"
        loadObjectURL={loadHTMLFromURL}>
        Load
      </LoadDropdown>
      <button class="button is-success mt-1  mr-1" on:click={exportFearCard}> Save </button>
      <button class="button is-success mt-1  mr-1" on:click={screenshotSetUp}
        >Download Image</button>
      <button class="button is-warning mt-1  mr-1" id="updateButton" on:click={reloadPreview}
        >Update Preview</button>
      <button class="button is-warning mt-1 mr-1" on:click={previewFrame.toggleSize}
        >Toggle Board Size</button>
      <button class="button is-danger mt-1 mr-1" on:click={clearAllFields}>Clear All Fields</button>
    </div>
    <div class="field has-addons mt-1 mb-0 is-flex-wrap-wrap">
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
  </div>
</div>

<!-- <Examples
  bind:this={exampleModal}
  {loadExample}
  title="Load Examples & Official Adversaries"
  {examples} /> -->
