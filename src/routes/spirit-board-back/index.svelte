<script>
  import { onMount } from "svelte";
  export let spiritBoardBack;
  import NameArtLore from "./name-art-lore.svelte";
  import SetupPlaystyleComplexityPowers from "./setup-playstyle-complexity-powers.svelte";
  // import NameAndArt from "./name-and-art.svelte";
  // import SpecialRules from "./special-rules.svelte";

  let loreFrame;
  onMount(() => {
    loreFrame.addEventListener("load", onLoad());
  });

  function onLoad() {
    if (loreFrame) {
      if (spiritBoardBack.demoBoardWasLoaded === false){
        setTimeout(() => {
          console.log('First time Lore Board is loaded... use default preview')
          readHTML(loreFrame.contentDocument);
          spiritBoardBack.demoBoardWasLoaded = true;
          }, 200);
      }else{
        setTimeout(() => {
          console.log('Lore Board previously loaded... reload form content')
          reloadPreview();
          }, 200);
      }
    }
  }

  function showOrHideSection(event) {
    spiritBoardBack[event.target.id].isVisible = !spiritBoardBack[event.target.id].isVisible;
  }

  function showOrHideBoard() {
    if (document.getElementById("lore-board-wrap").style.display == "none") {
      document.getElementById("lore-board-wrap").style.display = "block";
    } else {
      document.getElementById("lore-board-wrap").style.display = "none";
    }
  }
  
  function reloadPreview() {
    console.log("Updating Preview Lore Side Board (f=setBoardValues)");
    setBoardValues(spiritBoardBack);
    copyHTML();
    document.getElementById("lore-scaled-frame").contentWindow.startMain();
  }

  function copyHTML() {
    console.log("Copying HTML from Form to Preview (f=copyHTML)");
    var modFrame = document.getElementById("lore-mod-frame");
    modFrame.doc = document.getElementById("lore-mod-frame").contentWindow.document;
    modFrame.head = modFrame.doc.getElementsByTagName("head")[0];
    modFrame.body = modFrame.doc.getElementsByTagName("body")[0];
    var scaledFrame = document.getElementById("lore-scaled-frame");
    scaledFrame.doc = document.getElementById("lore-scaled-frame").contentWindow.document;
    scaledFrame.head = scaledFrame.doc.getElementsByTagName("head")[0];
    scaledFrame.body = scaledFrame.doc.getElementsByTagName("body")[0];

    let bodyClone;
    bodyClone = document.getElementById("lore-mod-frame").contentWindow.document.body.cloneNode(true);
    document.getElementById("lore-scaled-frame").contentWindow.document.body = bodyClone;
    let headClone = modFrame.head.cloneNode(true);
    scaledFrame.head.parentElement.replaceChild(headClone, scaledFrame.head);
  }

  function setBoardValues(spiritBoardBack) {
    if (loreFrame) {
      
      console.log(spiritBoardBack)
      
      const loreBoardHTML = loreFrame.contentDocument.querySelectorAll("board")[0];
      
      //Set Spirit Name
      const loreName = loreBoardHTML.querySelectorAll("spirit-name")[0];
      loreName.innerHTML = spiritBoardBack.nameImage.name;

      //Set Spirit Image
      const loreImage = loreBoardHTML.querySelectorAll("img")[0];
      loreImage.setAttribute("src", spiritBoardBack.nameImage.img);

      //Set Lore Description
      const loreDescription = loreBoardHTML.querySelectorAll("lore-description")[0];
      loreDescription.innerHTML = spiritBoardBack.lore.loreText;

      //Set Lore Setup
      const loreSetup = loreBoardHTML.querySelectorAll("setup-description")[0];
      loreSetup.innerHTML = spiritBoardBack.setup.setupText;

      //Set Lore Play Style
      const lorePlayStyle = loreBoardHTML.querySelectorAll("play-style-description")[0];
      lorePlayStyle.innerHTML = spiritBoardBack.playStyle.playStyleText;

      //Set Complexity
      const complexityHeader = loreBoardHTML.querySelectorAll("complexity")[0];
      complexityHeader.setAttribute("value", spiritBoardBack.complexity.complexityValue);
      complexityHeader.setAttribute("descriptor", spiritBoardBack.complexity.complexityDescriptor);
      
      //Set Summary of Powers
      const summaryPowersHeader = loreBoardHTML.querySelectorAll("summary-of-powers")[0];
      var summaryPowersValues = spiritBoardBack.summary.offenseValue +","+ spiritBoardBack.summary.controlValue +","+ spiritBoardBack.summary.fearValue +","+spiritBoardBack.summary.defenseValue +","+spiritBoardBack.summary.utilityValue
      summaryPowersHeader.setAttribute("values", summaryPowersValues);
      summaryPowersHeader.setAttribute("uses", spiritBoardBack.summary.usesTokens);
    }
  }
  
  function readHTML(htmlElement) {
    console.log("Loading spirit lore board into form (f=readHTML)");
    //Reads the Template HTML file into the Form
    if (loreFrame) {
      const loreBoardHTML = htmlElement.querySelectorAll("board")[0];
    
      //Set Spirit Name
      const loreName = loreBoardHTML.querySelectorAll("spirit-name")[0];

      spiritBoardBack.nameImage.name = loreName.innerHTML.trim();

      //Set Spirit Image
      const loreImage = loreBoardHTML.querySelectorAll("img")[0];
      spiritBoardBack.nameImage.img = loreImage.getAttribute("src");

      //Set Lore Description
      const loreDescription = loreBoardHTML.querySelectorAll("lore-description")[0];

      spiritBoardBack.lore.loreText = loreDescription.innerHTML.trim();

      //Set Lore Setup
      const loreSetup = loreBoardHTML.querySelectorAll("setup-description")[0];
      spiritBoardBack.setup.setupText = loreSetup.innerHTML.trim();

      //Set Lore Play Style
      const lorePlayStyle = loreBoardHTML.querySelectorAll("play-style-description")[0];
      spiritBoardBack.playStyle.playStyleText = lorePlayStyle.innerHTML.trim();


      //Set Complexity
      const complexityHeader = loreBoardHTML.querySelectorAll("complexity")[0];
      spiritBoardBack.complexity.complexityValue = complexityHeader.getAttribute("value");
      spiritBoardBack.complexity.complexityDescriptor = complexityHeader.getAttribute("descriptor");
      
      //Set Summary of Powers
      const summaryPowersHeader = loreBoardHTML.querySelectorAll("summary-of-powers")[0];
      var summaryPowersValues = summaryPowersHeader.getAttribute("values");
      var summaryPowersSplit = summaryPowersValues.split(',');
      spiritBoardBack.summary.offenseValue = summaryPowersSplit[0];
      spiritBoardBack.summary.controlValue = summaryPowersSplit[1];
      spiritBoardBack.summary.fearValue = summaryPowersSplit[2];
      spiritBoardBack.summary.defenseValue = summaryPowersSplit[3];
      spiritBoardBack.summary.utilityValue = summaryPowersSplit[4];
      spiritBoardBack.summary.usesTokens = summaryPowersHeader.getAttribute("uses");
      
    }
  }
  
  let loreFrameLarge = false;
  function toggleSize() {
    var displayFrame = document.getElementById("lore-scaled-frame");
    var displayWrap = document.getElementById("lore-board-wrap");
    if (!loreFrameLarge) {
      displayFrame.style.webkitTransform = "scale(0.745)";
      displayWrap.style.height = "915px";
    } else {
      displayFrame.style.webkitTransform = "scale(0.55)";
      displayWrap.style.height = "670px";
    }
    loreFrameLarge = !loreFrameLarge;
  }
  
  function exportSpiritBoardBack() {
    var element = document.createElement("a");
    element.setAttribute(
      "href",
      "data:text/html;charset=utf-8," +
        encodeURIComponent(
          document
            .getElementById("lore-mod-frame")
            .contentWindow.document.getElementsByTagName("html")[0].innerHTML
        )
    );
    console.log(document.getElementById("lore-mod-frame").contentWindow.document.getElementsByTagName("html")[0].innerHTML)
    element.setAttribute(
      "download",
      spiritBoardBack.nameImage.name.replaceAll(" ", "_") + "_spiritlore.html"
    );
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }
  
  function handleTextFileInput(event) {
    var dummyEl = document.createElement("html");
    const file = event.target.files.item(0);

    if (file) {
      const fileReader = new FileReader();
      fileReader.onload = (data) => {
        const fileText = data.target.result;
        dummyEl.innerHTML = fileText;
        dummyEl.head = dummyEl.getElementsByTagName("head")[0];
        dummyEl.body = dummyEl.getElementsByTagName("body")[0];
        readHTML(dummyEl);
      };

      // This reads the file and then triggers the onload function above once it finishes
      fileReader.readAsText(file);
    }
  }
  
  function clearAllFields() {
    spiritBoardBack = {
      prop: "value",
      demoBoardWasLoaded: false,
      previewBoard: {
        isVisible: false,
      },
      nameArtLore:{
        isVisible: false,
      },
      setupPlaystyleComplexityPowers:{
        isVisible: false,
      },
      nameImage: {
        name:"",
        img:"",
      },
      lore: {
        loreText: "",
      },
      setup: {
        setupText: "",
      },
      playStyle: {
        playStyleText: "",
      },
      complexity: {
        complexityValue: "",
        complexityDescriptor: "",
      },
      summary: {
        offenseValue: "",
        controlValue: "",
        fearValue: "",
        defenseValue: "",
        utilityValue: "",
        usesTokens: "",
      },
    };
    console.log('Reseting fields')
    console.log(spiritBoardBack)
  }
  
  
</script>

<h5 class="title is-5">Spirit Board Lore Side</h5>
<h6
  on:click={showOrHideBoard}
  class="subtitle is-6 is-flex is-justify-content-space-between has-background-link-light"
  id="previewBoard">
  Preview
  <span on:click={showOrHideBoard}>
    {#if spiritBoardBack.previewBoard.isVisible}
      <ion-icon id="previewBoard" on:click={showOrHideBoard} name="chevron-down-outline" />
    {:else}
      <ion-icon id="previewBoard" on:click={showOrHideBoard} name="chevron-up-outline" />
    {/if}
  </span>
</h6>
<div id="lore-board-wrap">
  <iframe
    src="/template/MyCustomContent/MySpirit/board_lore.html"
    height="600"
    width="100%"
    id="lore-scaled-frame"
    title="yay" />
</div>
<div class="field has-addons mb-2">
  <div class="file is-success mr-1">
    <label class="file-label">
      <input
        class="file-input"
        id="userHTMLInput"
        type="file"
        name="userHTMLInput"
        accept=".html"
        on:change={handleTextFileInput} />
      <span class="file-cta">
        <span class="file-label"> Load Spirit Board file </span>
      </span>
    </label>
  </div>
  <button class="button is-success  mr-1" on:click={exportSpiritBoardBack}
    >Download Spirit Board file</button>
  <button class="button is-info  mr-1" on:click={reloadPreview}>Generate Spirit Board Lore</button>
  <button class="button is-warning mr-1" on:click={toggleSize}>Toggle Board Size</button>
  <button class="button is-danger mr-1" on:click={clearAllFields}>Clear All Fields</button>
</div>
<div class="columns mt-0">
  <div class="column pt-0">
    <NameArtLore bind:spiritBoardBack {showOrHideSection} />
  </div>
  <div class="column pt-0">
    <SetupPlaystyleComplexityPowers bind:spiritBoardBack {showOrHideSection} />
  </div>
</div>
<article class="message is-small mb-1">
  <div class="message-body p-1">
    See <a
      href="https://github.com/neubee/spirit-island-builder/blob/dev/docs/instructions.md"
      target="_blank">Instructions</a>
    for details on how to use the form. For custom art,
    <a href="https://www.wombo.art/" target="_blank">Wombo</a>
    (unaffiliated) is a popular art generator.
    <br />This is an unofficial website. Interface created by Neubee & Resonant. The Spirit Island Builder
    is adapted from
    <a href="https://github.com/Gudradain/spirit-island-template" target="_blank">HTML template</a>
    developed by Spirit Island fanbase. All materials belong to Greater Than Games, LLC.
  </div>
</article>
<div id="lore-holder">
  <iframe
    bind:this={loreFrame}
    src="/template/MyCustomContent/MySpirit/board_lore_website.html"
    height="600"
    width="100%"
    title="yay"
    style="display:none;"
    id="lore-mod-frame" />
</div>
