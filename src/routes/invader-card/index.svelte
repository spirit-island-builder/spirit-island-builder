<script>
  import { onMount } from "svelte";

  import * as Lib from "../lib";
  import PreviewFrame from "$lib/preview-frame/index.svelte";
  import LoadButton from "$lib/load-button.svelte";
  import LoadDropdown from "$lib/load-dropdown.svelte";
  import SaveDropdown from "$lib/save-dropdown.svelte";

  import NameEffects from "./name-effects.svelte";
  import CustomIcons from "../custom-icons.svelte";
  import { dev } from "$app/environment";

  export let invaderCard;
  export let emptyInvaderCard;

  let previewFrame;

  async function loadHTMLFromURL(url) {
    url = new URL(url, document.baseURI);
    let loadedDocument = await Lib.loadHTML(url);
    readHTML(loadedDocument, url);
    reloadPreview();
  }

  const demoURL = "/template/MyCustomContent/MyInvaderCard/invader_card_blank.html";
  function onLoad() {
    if (invaderCard.demoBoardWasLoaded === false) {
      loadHTMLFromURL(demoURL).then(() => {
        invaderCard.demoBoardWasLoaded = true;
        emptyInvaderCard.demoBoardWasLoaded = true;
      });
    } else {
      reloadPreview();
    }
  }
  onMount(onLoad);

  function reloadPreview() {
    console.log("Updating Preview (f=reloadPreview)");
    previewFrame.copyHTMLFrom(generateHTML(invaderCard)).then(() => {
      previewFrame.startMain();
    });
  }

  function generateHTML(invaderCard) {
    const fragment = new DocumentFragment();

    let invaderCardHTML = document.createElement("template-invader-card");
    fragment.append(invaderCardHTML);

    invaderCardHTML.setAttribute("name", invaderCard.card.name);
    invaderCardHTML.setAttribute("type", invaderCard.card.type);
    invaderCardHTML.setAttribute("top", invaderCard.card.top);
    invaderCardHTML.setAttribute("bottom", invaderCard.card.bottom);
    invaderCard.card.fields.forEach((field) => {
      let fieldHTML = document.createElement("invader-field");
      if (field.type) {
        fieldHTML.setAttribute("type", field.type);
      }
      if (field.imgsrc) {
        fieldHTML.setAttribute("imgsrc", field.imgsrc);
      }
      fieldHTML.innerHTML = field.text;
      if (field.color) {
        fieldHTML.setAttribute("color", field.color);
      }
      invaderCardHTML.appendChild(fieldHTML);
    });
    // invaderCardHTML.setAttribute("text-heading", invaderCard.card.textHeading);
    // invaderCardHTML.setAttribute("text-body", invaderCard.card.textBody);

    //Show back?
    if (invaderCard.showBackOld) {
      let invaderBackHTML = document.createElement("invader-back");
      fragment.appendChild(invaderBackHTML);
      invaderBackHTML.classList.add("old");
    } else if (invaderCard.showBackNew) {
      let invaderBackHTML = document.createElement("invader-back");
      fragment.appendChild(invaderBackHTML);
      invaderBackHTML.classList.add("new");
    }

    //Set Custom Icons
    let customIconText = Lib.getCustomIconHTML(invaderCard.customIcons);
    const invaderCardStyle = document.createElement("style");
    fragment.prepend(invaderCardStyle);
    invaderCardStyle.textContent = customIconText;

    console.log("invaderCard HTML generated");
    console.log(invaderCard);

    return fragment;
  }

  function readHTML(htmlElement) {
    //Reads the Template HTML file into the Form
    console.log("Loading invader card into form (f=readHTML)");
    console.log(htmlElement);

    //Create a new blank JSON for the template data
    invaderCard = JSON.parse(JSON.stringify(emptyInvaderCard));

    const invaderCardHTML = htmlElement.querySelectorAll("template-invader-card")[0];
    invaderCard.card.type = invaderCardHTML.getAttribute("name") || "";
    invaderCard.card.type = invaderCardHTML.getAttribute("type") || "single";
    invaderCard.card.top = invaderCardHTML.getAttribute("top");
    invaderCard.card.bottom = invaderCardHTML.getAttribute("bottom") || "";
    // invaderCard.card.textHeading = invaderCardHTML.getAttribute("text-heading") || "";
    // invaderCard.card.textBody = invaderCardHTML.getAttribute("text-body") || "";

    const fields = invaderCardHTML.querySelectorAll("invader-field");
    invaderCard.card.fields.splice(0, invaderCard.card.fields.length); //Clear the Form first
    fields.forEach((field) => {
      invaderCard.card.fields.push({
        id: invaderCard.card.fields.length,
        type: field.getAttribute("type"),
        text: field.innerHTML,
        imgsrc: field.getAttribute("imgsrc") || "",
        color: field.getAttribute("color") || "#3f1d1c",
      });
    });

    const invaderCardBackHTML = invaderCardHTML.querySelectorAll("invader-card-back")[0];
    if (invaderCardBackHTML) {
      if (invaderCardBackHTML.classList.contains("old")) {
        invaderCard.showBackOld = true;
      } else {
        invaderCard.showBackNew = true;
      }
    }

    //Custom Icons
    invaderCard.customIcons = Lib.loadCustomIconsFromHTML(
      htmlElement,
      invaderCard.customIcons,
      document.baseURI
    );

    console.log("invaderCard HTML loaded into form");
    console.log(invaderCard);
  }

  function clearAllFields() {
    if (window.confirm("Are you sure? This permanently clears all fields in Aspect.")) {
      invaderCard = JSON.parse(JSON.stringify(emptyInvaderCard));
      reloadPreview();
    }
  }

  function screenshotSetUp() {
    const fileNames = [invaderCard.card.name.replaceAll(" ", "_") + "_invaderCard.png"];
    const elementNamesInIframe = ["template-invader-card"];
    if (invaderCard.showBack) {
      fileNames.push(invaderCard.card.name.replaceAll(" ", "_") + "_invaderCardBack.png");
      elementNamesInIframe.push("invader-back");
    }
    previewFrame.takeScreenshot(fileNames, elementNamesInIframe);
  }

  // async function loadExample(example) {
  //   await loadHTMLFromURL(example.url);
  //   hideAll();
  // }

  // function hideAll() {
  //   invaderCard.card.isVisible = false;
  //   customIcons.isVisible = false;
  // }

  let overlayImage;
  function addOverlay() {
    let previewFrame = document.getElementById("preview-iframe").contentWindow;
    let eventCardDOM = previewFrame.document.getElementsByTagName("template-invader-card")[0];
    const overlay = previewFrame.document.createElement("dev-overlay");
    eventCardDOM.appendChild(overlay);
    overlay.style.backgroundImage = `url('${overlayImage}')`;
  }
</script>

<div class="columns ml-4 mt-0 mb-1">
  <div class="column is-one-third pt-0">
    <NameEffects bind:invaderCard />
    <CustomIcons customIcons={invaderCard.customIcons} />
  </div>
  <div class="column pt-0">
    <PreviewFrame id="invader-card-preview" bind:this={previewFrame} on:hot-reload={reloadPreview}>
      <svelte:fragment slot="head">
        <link href="/template/_global/css/global.css" rel="stylesheet" />
        <link href="/template/_global/css/invader_card.css" rel="stylesheet" />
        <script type="text/javascript" src="/template/_global/js/common.js"></script>
        <script type="text/javascript" src="/template/_global/js/invader_card.js" defer></script>
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
      <SaveDropdown
        saveAction={() => generateHTML(invaderCard)}
        fileName={`${invaderCard.card.fields[0]}_InvaderCard.html`}
        saveType="html" />
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
