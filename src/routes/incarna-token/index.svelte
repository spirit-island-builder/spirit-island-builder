<script>
  import { onMount } from "svelte";

  import * as Lib from "../lib";
  import PreviewFrame from "$lib/preview-frame/index.svelte";
  import LoadButton from "$lib/load-button.svelte";

  import NameEffects from "./name-effects.svelte";
  import CustomIcons from "../custom-icons.svelte";
  import { downloadHTML } from "$lib/download";

  export let incarnaToken;
  export let emptyIncarnaToken;
  export let customIcons;

  let previewFrame;

  async function loadHTMLFromURL(url) {
    url = new URL(url, document.baseURI);
    let loadedDocument = await Lib.loadHTML(url);
    readHTML(loadedDocument, url);
    reloadPreview();
  }

  const demoURL = "/template/MyCustomContent/MyIncarna/incarna.html";
  function onLoad() {
    if (incarnaToken.demoBoardWasLoaded === false) {
      loadHTMLFromURL(demoURL).then(() => {
        incarnaToken.demoBoardWasLoaded = true;
        emptyIncarnaToken.demoBoardWasLoaded = true;
      });
    } else {
      reloadPreview();
    }
  }
  onMount(onLoad);

  function reloadPreview() {
    console.log("Updating Preview (f=reloadPreview)");
    previewFrame.copyHTMLFrom(generateHTML(incarnaToken)).then(() => {
      previewFrame.startMain();
    });
  }

  function generateHTML(incarnaToken) {
    const fragment = new DocumentFragment();

    let incarnaTokenHTML = document.createElement("incarna");
    fragment.append(incarnaTokenHTML);

    //Generate HTML for Incarna
    if (incarnaToken.incarna.name) {
      incarnaTokenHTML.setAttribute("name", incarnaToken.incarna.name);
    }
    if (incarnaToken.incarna.icon) {
      incarnaTokenHTML.setAttribute(
        "icon",
        incarnaToken.incarna.icon.replace("{", "").replace("}", "")
      );
    }
    if (incarnaToken.incarna.token) {
      incarnaTokenHTML.setAttribute(
        "token",
        incarnaToken.incarna.token.replace("{", "").replace("}", "")
      );
    }
    if (incarnaToken.incarna.empowered) {
      incarnaTokenHTML.setAttribute("empowered", incarnaToken.incarna.empowered);
    }
    if (incarnaToken.incarna.empoweredOnlyToken) {
      incarnaTokenHTML.setAttribute(
        "empowered-only-token",
        incarnaToken.incarna.empoweredOnlyToken
      );
    }
    if (incarnaToken.incarna.color) {
      incarnaTokenHTML.setAttribute("color", incarnaToken.incarna.color);
    }

    //Set Custom Icons
    const spiritStyle = document.createElement("style");
    fragment.prepend(spiritStyle);
    let customIconText = "";
    customIcons.icons.forEach((icon) => {
      customIconText +=
        "icon.custom" + (icon.id + 1) + "{background-image: url('" + icon.name + "'); }\n";
    });
    spiritStyle.textContent = customIconText;

    console.log("incarnaToken HTML generated");
    console.log(incarnaToken);

    return fragment;
  }

  function readHTML(htmlElement) {
    //Reads the Template HTML file into the Form
    console.log("Loading incarna token into form (f=readHTML)");

    //Create a new blank JSON for the template data
    incarnaToken = JSON.parse(JSON.stringify(emptyIncarnaToken));

    const incarnaTokenHTML = htmlElement.querySelectorAll("incarna")[0];

    //Read Token HTML
    if (incarnaTokenHTML.getAttribute("name")) {
      incarnaToken.incarna.name = incarnaTokenHTML.getAttribute("name");
    }
    if (incarnaTokenHTML.getAttribute("icon")) {
      incarnaToken.incarna.icon = incarnaTokenHTML
        .getAttribute("icon")
        .replace("{", "")
        .replace("}", "");
      console.log(incarnaToken.incarna.icon);
    }
    if (incarnaTokenHTML.getAttribute("token")) {
      incarnaToken.incarna.token = incarnaTokenHTML
        .getAttribute("token")
        .replace("{", "")
        .replace("}", "");
      console.log(incarnaToken.incarna.token);
    }
    if (incarnaTokenHTML.getAttribute("empowered")) {
      incarnaToken.incarna.empowered = incarnaTokenHTML.getAttribute("empowered") === "true";
    }
    if (incarnaTokenHTML.getAttribute("empowered-only-token")) {
      incarnaToken.incarna.empoweredOnlyToken =
        incarnaTokenHTML.getAttribute("empowered-only-token") === "true";
    }
    if (incarnaTokenHTML.getAttribute("color")) {
      incarnaToken.incarna.color = incarnaTokenHTML.getAttribute("color");
    }

    //Custom Icons
    if (incarnaToken.demoBoardWasLoaded) {
      const incarnaTokenStyle = htmlElement.querySelectorAll("style")[0];
      customIcons.icons.splice(0, customIcons.icons.length); //Clear the Form first
      if (incarnaTokenStyle) {
        const regExp = new RegExp(/(?<=(["']))(?:(?=(\\?))\2.)*?(?=\1)/, "g");
        let iconList = incarnaTokenStyle.textContent.match(regExp);
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

    console.log("incarnaToken HTML loaded into form");
    console.log(incarnaToken);
  }

  function exportIncarnaToken() {
    const htmlFileName = incarnaToken.incarna.name.replaceAll(" ", "_") + "_incarnaToken.html";
    downloadHTML(generateHTML(incarnaToken), htmlFileName);
  }

  function clearAllFields() {
    if (window.confirm("Are you sure? This permanently clears all fields in Incarna.")) {
      incarnaToken = JSON.parse(JSON.stringify(emptyIncarnaToken));
      reloadPreview();
    }
  }

  function screenshotSetUp() {
    const fileNames = [incarnaToken.incarna.name.replaceAll(" ", "_") + "_incarnaToken.png"];
    const elementNamesInIframe = ["incarna-wrapper"];
    previewFrame.takeScreenshot(fileNames, elementNamesInIframe);
  }

  // async function loadExample(example) {
  //   await loadHTMLFromURL(example.url);
  //   hideAll();
  // }

  // function hideAll() {
  //   incarnaToken.incarna.isVisible = false;
  //   customIcons.isVisible = false;
  // }
</script>

<PreviewFrame id="incarna-preview" bind:this={previewFrame} on:hot-reload={reloadPreview}>
  <svelte:fragment slot="head">
    <link href="/template/_global/css/global.css" rel="stylesheet" />
    <link href="/template/_global/css/incarna.css" rel="stylesheet" />
    <script type="text/javascript" src="/template/_global/js/common.js"></script>
    <script type="text/javascript" src="/template/_global/js/incarna.js" defer></script>
  </svelte:fragment>
</PreviewFrame>

<div class="field has-addons mb-2 is-flex-wrap-wrap">
  <!-- <button class="button is-info js-modal-trigger mr-1" on:click={exampleModal.open}>
    Examples
  </button> -->
  <LoadButton accept=".html" class="button is-success mr-1" loadObjectURL={loadHTMLFromURL}>
    Load
  </LoadButton>
  <button class="button is-success  mr-1" on:click={exportIncarnaToken}> Save </button>
  <button class="button is-success  mr-1" on:click={screenshotSetUp}>Download Image</button>
  <button class="button is-warning  mr-1" id="updateButton" on:click={reloadPreview}
    >Update Preview</button>
  <button class="button is-warning mr-1" on:click={previewFrame.toggleSize}
    >Toggle Board Size</button>
  <button class="button is-danger mr-1" on:click={clearAllFields}>Clear All Fields</button>
</div>
<div class="columns mt-0 mb-1">
  <div class="column pt-0">
    <NameEffects bind:incarnaToken />
    <CustomIcons bind:customIcons />
  </div>
  <div class="column pt-0">
    <!-- <AspectEffects bind:aspect /> -->
  </div>
</div>
