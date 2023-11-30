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

  const demoURL = "/template/MyCustomContent/MyEvent/CulturalAssimilation (Terror 1+23).html";
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

    //Generate HTML for Event Card Name
    let eventCardHTML = document.createElement("template-event-card");
    fragment.append(eventCardHTML);

    eventCardHTML.setAttribute("name", eventCard.card.name);
    eventCardHTML.setAttribute("type", eventCard.card.type);
    eventCardHTML.setAttribute("subtype", eventCard.card.subtype);
    eventCardHTML.setAttribute("lore", eventCard.card.lore);

    //Generate HTML for Event Card Name
    let eventHeaderHTML = document.createElement("event-header");
    eventCardHTML.append(eventHeaderHTML);

    eventCardHTML.setAttribute("hasHeader", eventCard.card.hasHeader);
    eventCardHTML.setAttribute("headerColor", eventCard.card.headerColor);
    eventCardHTML.setAttribute("effect", eventCard.card.effect);

    //Generate HTML for subevents
    eventCard.subevents.event.forEach((subevent) => {
      let subeventHTML = document.createElement("subevent");
      eventCardHTML.append(subeventHTML);
      subeventHTML.setAttribute("name", subevent.name);
      subeventHTML.setAttribute("type", subevent.type);
      subeventHTML.setAttribute("bannerText", subevent.customBanner);
      subeventHTML.setAttribute("effect", subevent.effect);
    });

    //Generate HTML for tokenevents
    eventCard.tokenevents.event.forEach((tokenevent) => {
      let tokeneventHTML = document.createElement("token-event");
      eventCardHTML.append(tokeneventHTML);
      tokeneventHTML.setAttribute("name", tokenevent.name);
      tokeneventHTML.setAttribute("tokens", tokenevent.tokens);
      tokeneventHTML.setAttribute("effect", tokenevent.effect);
    });

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
    console.log(fragment);

    return fragment;
  }

  function readHTML(htmlElement) {
    //Reads the Template HTML file into the Form
    console.log("Loading blight card into form (f=readHTML)");

    //Create a new blank JSON for the template data
    eventCard = JSON.parse(JSON.stringify(emptyEventCard));

    const eventCardHTML = htmlElement.querySelectorAll("template-event-card")[0];
    eventCard.card.name = eventCardHTML.getAttribute("name");
    eventCard.card.type = eventCardHTML.getAttribute("type");
    eventCard.card.subtype = eventCardHTML.getAttribute("subtype");
    eventCard.card.lore = eventCardHTML.getAttribute("lore");
    const headerHTML = eventCardHTML.querySelectorAll("event-header")[0];
    if (headerHTML) {
      eventCard.card.hasHeader = headerHTML.getAttribute("hasHeader");
      eventCard.card.headerColor = headerHTML.getAttribute("headerColor");
      eventCard.card.effect = headerHTML.getAttribute("effect");
    }

    const subeventHTML = eventCardHTML.querySelectorAll("subevent");
    eventCard.subevents.event.splice(0, eventCard.subevents.event.length); //Clear the Form first
    subeventHTML.forEach((subevent) => {
      eventCard.subevents.event.push({
        id: eventCard.subevents.event.length,
        name: subevent.getAttribute("name"),
        type: subevent.getAttribute("type"),
        effect: subevent.getAttribute("effect"),
        customBanner: subevent.getAttribute("bannerText"),
      });
    });

    const tokeneventHTML = eventCardHTML.querySelectorAll("token-event");
    eventCard.tokenevents.event.splice(0, eventCard.tokenevents.event.length); //Clear the Form first
    tokeneventHTML.forEach((tokenevent) => {
      eventCard.tokenevents.event.push({
        id: eventCard.tokenevents.event.length,
        name: tokenevent.getAttribute("name"),
        tokens: tokenevent.getAttribute("tokens"),
        effect: tokenevent.getAttribute("effect"),
      });
    });

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
    const fileNames = [eventCard.card.name.replaceAll(" ", "_") + "_EventCard.png"];
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
