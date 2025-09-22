<script>
  import { onMount } from "svelte";

  import * as Lib from "../lib";
  import PreviewFrame from "$lib/preview-frame/index.svelte";
  import LoadButton from "$lib/load-button.svelte";
  import LoadDropdown from "$lib/load-dropdown.svelte";
  import { dev } from "$app/environment";

  import EventType from "./event-type.svelte";
  import TokeneventType from "./tokenevents.svelte";
  // import AspectEffects from "./aspect-effects.svelte";
  import CustomIcons from "../custom-icons.svelte";
  import { downloadHTML } from "$lib/download";
  import Examples from "$lib/example-modal.svelte";
  import examples from "./examples.json";

  let exampleModal;

  export let eventCard;
  export let emptyEventCard;

  let previewFrame;

  async function loadHTMLFromURL(url) {
    url = new URL(url, document.baseURI);
    let loadedDocument = await Lib.loadHTML(url);
    readHTML(loadedDocument, url);
    reloadPreview();
  }

  const demoURL = "/template/MyCustomContent/MyEvent/CulturalAssimilation.html";
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

    //Show back?
    if (eventCard.showBack) {
      let eventBackHTML = document.createElement("event-back");
      fragment.appendChild(eventBackHTML);
    }

    //Set Custom Icons
    let customIconText = Lib.getCustomIconHTML(eventCard.customIcons);
    const eventCardStyle = document.createElement("style");
    fragment.prepend(eventCardStyle);
    eventCardStyle.textContent = customIconText;

    console.log("eventCard HTML generated");
    console.log(eventCard);

    return fragment;
  }

  function readHTML(htmlElement) {
    //Reads the Template HTML file into the Form
    console.log("Loading blight card into form (f=readHTML)");

    //Create a new blank JSON for the template data
    eventCard = JSON.parse(JSON.stringify(emptyEventCard));

    const eventCardHTML = htmlElement.querySelectorAll("template-event-card")[0];
    eventCard.card.name = eventCardHTML.getAttribute("name") || "";
    eventCard.card.type = eventCardHTML.getAttribute("type");
    eventCard.card.subtype = eventCardHTML.getAttribute("subtype");
    eventCard.card.lore = eventCardHTML.getAttribute("lore") || "";
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
    eventCard.customIcons = Lib.loadCustomIconsFromHTML(
      htmlElement,
      eventCard.customIcons,
      document.baseURI
    );

    console.log("eventCard HTML loaded into form");
    console.log(eventCard);
  }

  function exportEventCard() {
    const htmlFileName = eventCard.card.name.replaceAll(" ", "_") + "_EventCard.html";
    downloadHTML(generateHTML(eventCard), htmlFileName);
  }

  function clearAllFields() {
    if (window.confirm("Are you sure? This permanently clears all fields in Aspect.")) {
      eventCard = JSON.parse(JSON.stringify(emptyEventCard));
      reloadPreview();
    }
  }

  function screenshotSetUp() {
    let eventName = eventCard.card.name;
    if (eventName === "none" || eventName === "") {
      eventName = eventCard.subevents.event[0].name;
    }
    const fileNames = [`${eventName.replaceAll(" ", "_")}_EventCard.png`];
    const elementNamesInIframe = ["event-card"];
    if (eventCard.showBack) {
      fileNames.push(eventCard.card.name.replaceAll(" ", "_") + "_EventCardBack.png");
      elementNamesInIframe.push("event-back");
    }
    previewFrame.takeScreenshot(fileNames, elementNamesInIframe);
  }

  function printToPDF(pageType = "letter") {
    let eventName = eventCard.card.name;
    if (eventName === "none" || eventName === "") {
      eventName = eventCard.subevents.event[0].name;
    }
    const fileNames = [`${eventName.replaceAll(" ", "_")}_EventCard.pdf`];
    const elementNamesInIframe = ["event-card"];
    if (eventCard.showBack) {
      elementNamesInIframe.push("event-back");
    }
    previewFrame.getPDF(fileNames, elementNamesInIframe, pageType, 2.48, 3.465);
  }

  function printToPDFLetter() {
    printToPDF("letter");
  }

  function printToPDFA4() {
    printToPDF("a4");
  }

  async function loadExample(example) {
    await loadHTMLFromURL(example.url);
    hideAll();
  }

  // async function loadExample(example) {
  //   await loadHTMLFromURL(example.url);
  //   hideAll();
  // }

  function hideAll() {
    eventCard.card.isVisible = false;
    eventCard.subevents.isVisible = false;
    eventCard.tokenevents.isVisible = false;
    eventCard.customIcons.isVisible = false;
  }

  let overlayImage;
  function addOverlay() {
    let previewFrame = document.getElementById("preview-iframe").contentWindow;
    let eventCardDOM = previewFrame.document.getElementsByTagName("event-card")[0];
    const overlay = previewFrame.document.createElement("dev-overlay");
    eventCardDOM.appendChild(overlay);
    overlay.style.backgroundImage = `url('${overlayImage}')`;
  }
</script>

<div class="columns ml-4 mt-0 mb-1">
  <div class="column is-one-third pt-0">
    <EventType bind:eventCard />
    <TokeneventType bind:eventCard />
    <CustomIcons customIcons={eventCard.customIcons} />
  </div>
  <div class="column pt-0">
    <PreviewFrame id="event-card-preview" bind:this={previewFrame} on:hot-reload={reloadPreview}>
      <svelte:fragment slot="head">
        <link href="/template/_global/css/global.css" rel="stylesheet" />
        <link href="/template/_global/css/event.css" rel="stylesheet" />
        <script type="text/javascript" src="/template/_global/js/common.js"></script>
        <script type="text/javascript" src="/template/_global/js/event_card.js" defer></script>
      </svelte:fragment>
    </PreviewFrame>

    <div class="field has-addons mb-0 is-flex-wrap-wrap">
      <button class="button is-info js-modal-trigger mr-1 mt-1" on:click={exampleModal.open}>
        Examples
      </button>
      <LoadDropdown
        accept="text/html"
        class="button is-success mt-1 mr-1"
        loadObjectURL={loadHTMLFromURL}>
        Load
      </LoadDropdown>
      <button class="button is-success  mt-1 mr-1" on:click={exportEventCard}> Save </button>
      <button class="button is-warning  mt-1 mr-1" id="updateButton" on:click={reloadPreview}
        >Update Preview</button>
      <button class="button is-warning mt-1 mr-1" on:click={previewFrame.toggleSize}
        >Toggle Zoom</button>
      <button class="button is-danger mt-1 mr-1" on:click={clearAllFields}>Clear All Fields</button>
    </div>
    <div class="field has-addons mb-0 is-flex-wrap-wrap">
      <button class="button is-success  mt-1 mr-1" on:click={screenshotSetUp}
        >Download Image</button>
      <div class="dropdown is-hoverable is-up">
        <div class="dropdown-trigger">
          <button
            class="button mt-1 mr-1 is-success"
            aria-haspopup="true"
            aria-controls="dropdown-menu4">
            <span>Create PDF...</span>
          </button>
        </div>
        <div class="dropdown-menu" id="dropdown-menu4" role="menu">
          <div class="dropdown-content">
            <button class="button is-success mr-1 dropdown-item" on:click={printToPDFLetter}
              >Letter size</button>
            <button class="button is-success mt-1 mr-1 dropdown-item" on:click={printToPDFA4}
              >A4 size</button>
          </div>
        </div>
      </div>
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
<Examples bind:this={exampleModal} {loadExample} title="Load Examples" {examples} />
