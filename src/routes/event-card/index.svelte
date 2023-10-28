<script>
  import { onMount } from "svelte";

  import * as Lib from "../lib";
  import PreviewFrame from "$lib/preview-frame/index.svelte";
  import LoadButton from "$lib/load-button.svelte";

  import EventType from "./event-type.svelte";
  import TokeneventType from "./tokenevents.svelte";
  // import AspectEffects from "./aspect-effects.svelte";
  import CustomIcons from "../custom-icons.svelte";
  import { downloadHTML } from "$lib/download";

  // import examples from "./examples.json";
  // import Examples from "$lib/example-modal.svelte";

  // let exampleModal;

  export let eventCard;
  export let emptyEventCard;
  export let customIcons;

  let previewFrame;

  async function loadHTMLFromURL(url) {
    url = new URL(url, document.baseURI);
    let loadedDocument = await Lib.loadHTML(url);
    readHTML(loadedDocument, url);
    reloadPreview();
  }

  const demoURL = "/template/MyCustomContent/MyEventCard/blight_card_downward_spiral.html";
  function onLoad() {
    if (eventCard.demoBoardWasLoaded === false) {
      loadHTMLFromURL(demoURL).then(() => {
        eventCard.demoBoardWasLoaded = true;
        emptyEventCard.demoBoardWasLoaded = true;
      });
    } else {
      reloadPreview();
    }
  }
  onMount(onLoad);

  function reloadPreview() {
    console.log("Updating Preview (f=reloadPreview)");
    previewFrame.copyHTMLFrom(generateHTML(eventCard)).then(() => {
      previewFrame.startMain();
    });
  }

  function generateHTML(eventCard) {
    const fragment = new DocumentFragment();

    let eventCardHTML = document.createElement("template-blight-card");
    fragment.append(eventCardHTML);

    //Generate HTML for Blight Card Name
    eventCardHTML.setAttribute("name", eventCard.card.cardName);

    //Generate HTML for Blight Per Player
    eventCardHTML.setAttribute("per-player", eventCard.card.blightPerPlayer);

    //Generate HTML for Still Healthy?
    eventCardHTML.setAttribute("still-healthy", eventCard.card.isStillHealthy);

    //Generate HTML for Effect
    let blightEffect = document.createElement("effect");
    eventCardHTML.appendChild(blightEffect);
    blightEffect.innerHTML = eventCard.card.cardEffect;

    //Set Custom Icons
    const spiritStyle = document.createElement("style");
    fragment.prepend(spiritStyle);
    let customIconText = "";
    customIcons.icons.forEach((icon) => {
      customIconText +=
        "icon.custom" + (icon.id + 1) + "{background-image: url('" + icon.name + "'); }\n";
    });
    spiritStyle.textContent = customIconText;

    console.log("eventCard HTML generated");
    console.log(eventCard);

    return fragment;
  }

  function readHTML(htmlElement) {
    //Reads the Template HTML file into the Form
    console.log("Loading blight card into form (f=readHTML)");

    //Create a new blank JSON for the template data
    eventCard = JSON.parse(JSON.stringify(emptyEventCard));

    const eventCardHTML = htmlElement.querySelectorAll("template-blight-card")[0];

    //Read Blight Card Name
    eventCard.card.cardName = eventCardHTML.getAttribute("name");

    //Read Blight Per Player
    eventCard.card.blightPerPlayer = eventCardHTML.getAttribute("per-player");

    //Read HTML for Still Healthy?
    eventCard.card.isStillHealthy = eventCardHTML.getAttribute("still-healthy");
    console.log("read stillhealthy=" + eventCard.card.isStillHealthy);
    //Read Effect
    let blightEffect = eventCardHTML.querySelectorAll("effect")[0];
    eventCard.card.cardEffect = blightEffect.innerHTML;

    //Custom Icons
    if (eventCard.demoBoardWasLoaded) {
      const eventCardStyle = htmlElement.querySelectorAll("style")[0];
      customIcons.icons.splice(0, customIcons.icons.length); //Clear the Form first
      if (eventCardStyle) {
        const regExp = new RegExp(/(?<=(["']))(?:(?=(\\?))\2.)*?(?=\1)/, "g");
        let iconList = eventCardStyle.textContent.match(regExp);
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

    console.log("eventCard HTML loaded into form");
    console.log(eventCard);
  }

  function exportEventCard() {
    const htmlFileName = eventCard.card.cardName.replaceAll(" ", "_") + "_EventCard.html";
    downloadHTML(generateHTML(eventCard), htmlFileName);
  }

  function clearAllFields() {
    if (window.confirm("Are you sure? This permanently clears all fields in Aspect.")) {
      eventCard = JSON.parse(JSON.stringify(emptyEventCard));
      reloadPreview();
    }
  }

  function screenshotSetUp() {
    const fileNames = [eventCard.card.cardName.replaceAll(" ", "_") + "_EventCard.png"];
    const elementNamesInIframe = ["event-card"];
    previewFrame.takeScreenshot(fileNames, elementNamesInIframe);
  }

  // async function loadExample(example) {
  //   await loadHTMLFromURL(example.url);
  //   hideAll();
  // }

  // function hideAll() {
  //   eventCard.card.isVisible = false;
  //   customIcons.isVisible = false;
  // }
</script>

<PreviewFrame id="event-card-preview" bind:this={previewFrame} on:hot-reload={reloadPreview}>
  <svelte:fragment slot="head">
    <link href="/template/_global/css/global.css" rel="stylesheet" />
    <link href="/template/_global/css/event.css" rel="stylesheet" />
    <script type="text/javascript" src="/template/_global/js/common.js"></script>
    <script type="text/javascript" src="/template/_global/js/event_card.js" defer></script>
  </svelte:fragment>
</PreviewFrame>

<div class="field has-addons mb-2 is-flex-wrap-wrap">
  <!-- <button class="button is-info js-modal-trigger mr-1" on:click={exampleModal.open}>
    Examples
  </button> -->
  <LoadButton accept=".html" class="button is-success mr-1" loadObjectURL={loadHTMLFromURL}>
    Load
  </LoadButton>
  <button class="button is-success  mr-1" on:click={exportEventCard}> Save </button>
  <button class="button is-success  mr-1" on:click={screenshotSetUp}>Download Image</button>
  <button class="button is-warning  mr-1" id="updateButton" on:click={reloadPreview}
    >Update Preview</button>
  <button class="button is-warning mr-1" on:click={previewFrame.toggleSize}
    >Toggle Board Size</button>
  <button class="button is-danger mr-1" on:click={clearAllFields}>Clear All Fields</button>
</div>
<div class="columns mt-0 mb-1">
  <div class="column pt-0">
    <EventType bind:eventCard />
    <CustomIcons bind:customIcons />
  </div>
  <div class="column pt-0">
    <TokeneventType bind:eventCard />
  </div>
</div>
