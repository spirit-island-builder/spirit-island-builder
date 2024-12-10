<script>
  import { afterUpdate } from "svelte";
  import * as Lib from "../../routes/lib";

  export let elementType;
  export let placeholder;
  export let validAutoCompleteValues;
  export let endCharacters = ["}", " "];
  export let startCharacter = "{";
  export let value;
  export let id;
  export let classNames = "";
  export let showListImmediately = false;
  export let additionalOnBlurFunction = () => {};

  let initialOnBlurFunction = () => {};

  let showAutoCompleteList = false;
  let showDetailAutoCompleteList = false; //This is for the detailed growth options
  let valuesToShow;
  let selectedWord = "";
  // updateValuesToShow();
  let startOfWordPosition = 0;
  let startingCharacterPosition = 0;
  let previousCursorPosition = 0;
  let currentKeyBoardFocus = 0;
  let showActiveSelection = true;
  let currentAutoCompleteTermLength = 0;
  let inputElementThatWasCompleted;
  let initialValue = "";

  afterUpdate(() => {
    console.log("afterUpdate");
    // Refocus the input element that was just completed
    if (inputElementThatWasCompleted) {
      // console.log("Element completed:");
      // console.log(inputElementThatWasCompleted);
      inputElementThatWasCompleted.focus();
      // In textarea/input with multiple autocompletes set cursor position the end of the autocomplete term that was inserted. Without this the cursor goes to the end of the input.
      if (!showListImmediately) {
        // console.log("icon autocomplete detected");
        // console.log("selectedWord: " + selectedWord);
        // console.log("selectedWordLength: " + selectedWord.length);
        // console.log("startOfWordPosition: " + startOfWordPosition);
        // console.log("positionCalc: " + (startOfWordPosition + selectedWord.length - 1));
        inputElementThatWasCompleted.selectionEnd = startOfWordPosition + selectedWord.length - 1;
      } else if (selectedWord.endsWith(")")) {
        // If its the 'growth' autocomplete, move cursor to between the ()
        inputElementThatWasCompleted.selectionEnd = startOfWordPosition + selectedWord.length - 1;
        // showDetailAutoCompleteList = true;
        // console.log("show detail:" + showDetailAutoCompleteList);
      }

      // Prevent further refocus and cursor positioning
      inputElementThatWasCompleted = undefined;
    }
  });

  function handleInputAndFocus(event) {
    console.log("handleInputAndFocus");
    initialValue = event.target.value;
    // select all for 'input' type fields
    if (event.target.tagName === "INPUT" && event.type === "focus") {
      document.getElementById(event.target.id).select();
    }

    const inputValue = event.target.value;
    const currentCursorPostion = event.target.selectionStart;
    const shouldAutoCompleteOpen =
      !isAutoCompleteListOpen() &&
      (event.data === startCharacter ||
        (showListImmediately === true && (inputValue.length <= 1 || event.type === "focus")));
    const shouldAutoCompleteClose =
      isAutoCompleteListOpen() &&
      !showListImmediately &&
      (endCharacters.includes(event.data) ||
        hasCursorMovedOutsideOfCurrentAutoCompleteTerm(inputValue, currentCursorPostion));

    if (shouldAutoCompleteOpen) {
      openAutoComplete(currentCursorPostion, inputValue);
    } else if (shouldAutoCompleteClose) {
      closeAutoComplete();
    } else if (isAutoCompleteListOpen()) {
      currentAutoCompleteTermLength++;
      updateValuesToShow(inputValue);
    }
    previousCursorPosition = currentCursorPostion;
  }

  function updateValuesToShow(inputValue) {
    console.log("updateValuesToShow");

    if (showDetailAutoCompleteList) {
      valuesToShow =
        validAutoCompleteValues.find((autoCompleteItem) => autoCompleteItem.value === selectedWord)
          .detail || [];
    } else if (inputValue) {
      {
        const autoCompleteStartText = inputValue.substring(
          startOfWordPosition,
          startingCharacterPosition + currentAutoCompleteTermLength
        );
        valuesToShow = validAutoCompleteValues.filter((autoCompleteItem) =>
          autoCompleteItem.label.startsWith(autoCompleteStartText)
        );
      }
    } else {
      valuesToShow = validAutoCompleteValues;
    }
  }

  function hasCursorMovedOutsideOfCurrentAutoCompleteTerm(inputValue, currentCursorPostion) {
    const isCurrentCursorPositionBeforeTheStartOfTheCurrentAutoCompleteTerm =
      currentCursorPostion - 1 < startingCharacterPosition;
    if (isCurrentCursorPositionBeforeTheStartOfTheCurrentAutoCompleteTerm) {
      return true;
    }
    const isCurrentCursorPositionAfterPreviousCursorPosition =
      currentCursorPostion > previousCursorPosition;
    if (isCurrentCursorPositionAfterPreviousCursorPosition) {
      const potentialAutoCompleteTerm = inputValue.substring(
        startingCharacterPosition,
        startingCharacterPosition + currentAutoCompleteTermLength
      );
      let endCharacterFoundInPotentialAutoCompleteTerm = false;
      endCharacters.forEach((character) => {
        endCharacterFoundInPotentialAutoCompleteTerm =
          potentialAutoCompleteTerm.includes(character);
      });
      const doesPotentialAutoCompleteTermIncludeWhiteSpaceOrEndCharacter =
        /\s/.test(potentialAutoCompleteTerm) || endCharacterFoundInPotentialAutoCompleteTerm;
      if (doesPotentialAutoCompleteTermIncludeWhiteSpaceOrEndCharacter) {
        return true;
      }
    }
  }

  function handleAutoCompleteKeyboardInput(event) {
    console.log("handleAutoCompleteKeyboardInput");
    if (isAutoCompleteListOpen()) {
      if (event.key === "Backspace" || event.key === "Delete") {
        // 2 is subtracted from currentAutoCompleteTermLength because handleInputAndFocus will add 1 once this function finishes
        currentAutoCompleteTermLength -= 2;
        if (currentAutoCompleteTermLength < 0) {
          currentAutoCompleteTermLength = 0;
        }
        updateValuesToShow(event.target.value);
      } else {
        let autoCompleteList = document.getElementById(`${id}AutoCompleteList`);
        if (autoCompleteList) {
          autoCompleteList = autoCompleteList.getElementsByTagName("div");
        }

        if (valuesToShow.length) {
          if (event.key === "ArrowDown") {
            // This, and the same line in the ArrowUp case, stops the cursor from jumping around
            event.preventDefault();
            updateCurrentKeyBoardFocus(1);
          } else if (event.key === "ArrowUp") {
            event.preventDefault();
            updateCurrentKeyBoardFocus(-1);
          } else if (event.key === "Enter" || event.key === "Tab") {
            showActiveSelection = false;
            // Stop other events, such as moving to the next form input with tab, from happening
            if (currentKeyBoardFocus > -1) {
              if (showDetailAutoCompleteList) {
                // Simulate a click on the "active" item
                // document.getElementById(id).blur();
                closeAutoComplete();
                // nextNode(event);
              } else if (autoCompleteList) {
                // Simulate a click on the "active" item
                event.preventDefault();
                autoCompleteList[currentKeyBoardFocus].click();
              }
            }
          }
        }
      }
    } else {
      console.log("handleAuto... list not open... ");
      // if (event.key === "Enter" && event.shiftKey) {
      //   // Enter does not line break
      //   // Enter moves to next node (see NextNode)
      //   // Shift enter behaves normally (line break)
      //   console.log("handleAuto... list not open... ")
      //   event.preventDefault();
      // } else
      if (event.key === "Enter") {
        console.log("got to nextNode");
        nextNode(event);
      }
    }
  }

  function updateCurrentKeyBoardFocus(valueToAdd) {
    console.log("updateCurrentKeyBoardFocus");
    currentKeyBoardFocus += valueToAdd;
    if (currentKeyBoardFocus >= valuesToShow.length) {
      // Wrap from bottom of the list to the top
      currentKeyBoardFocus = 0;
    } else if (currentKeyBoardFocus < 0) {
      // Wrap from the top of the list to the bottom
      currentKeyBoardFocus = valuesToShow.length - 1;
    }
    valuesToShow = valuesToShow;
    showActiveSelection = true;
    // Scroll the currently focused list element into view.
    const autoCompleteListDiv = document.getElementById(`${id}AutoCompleteList`);
    const halfOfListDivHeight = autoCompleteListDiv.clientHeight / 2;
    const centerOfListDiv = autoCompleteListDiv.scrollTop + halfOfListDivHeight;
    const currentItemElement = document.getElementById(`item${currentKeyBoardFocus}`);
    if (currentItemElement.offsetTop !== centerOfListDiv) {
      const halfOfItemElementHeight = currentItemElement.clientHeight / 2;
      // Position the middle of the item element in the middle of the the list
      autoCompleteListDiv.scrollTo(
        0,
        currentItemElement.offsetTop - halfOfListDivHeight + halfOfItemElementHeight
      );
    }
  }

  function handleAutoCompleteSelectionFromList(event) {
    console.log("handleAutoCompleteSelectionFromList");
    selectedWord = event.target.attributes.value.value;
    inputElementThatWasCompleted = document.getElementById(
      event.target.attributes.autoCompleteForId.value
    );
    if (showListImmediately === true) {
      value = selectedWord;
    } else {
      value = `${value.substring(0, startOfWordPosition - 1)}${selectedWord}${value.substring(
        startingCharacterPosition + currentAutoCompleteTermLength
      )}`;
      // (above) Modified to not auto-include the {}
      // value = `${value.substring(0, startOfWordPosition)}${selectedWord}}${value.substring(
      //   startingCharacterPosition + currentAutoCompleteTermLength
      // )}`;
    }
    closeAutoComplete();
  }

  // This is needed for on:mousedown on the autocomplete list because without it a physical click on a list item will close the list due to the on:blur={closeAutoComplete} handlers on the input element
  function handleMouseDown(event) {
    event.preventDefault();
    handleAutoCompleteSelectionFromList(event);
  }

  function closeAutoComplete(event) {
    // selectedWord, startOfWordPosition, and inputElementThatWasCompleted are intentionally not reset here so that cursor repositioning in afterUpdate() works
    console.log("closeAutoComplete");
    showAutoCompleteList = false;
    showActiveSelection = true;
    if (selectedWord.indexOf(")") > 0 && !showDetailAutoCompleteList) {
      showDetailAutoCompleteList = true;
      showAutoCompleteList = true;
      console.log("showAutoCompleteList set true");
    } else {
      console.log("showAutoCompleteList set false");
      if (showDetailAutoCompleteList) {
        // Clear the selected word if it was a detailed autocomplete (which doesn't really want to be completed anyway)
        selectedWord = "";
      }
      showDetailAutoCompleteList = false;
    }
    updateValuesToShow();
    previousCursorPosition = 0;
    currentKeyBoardFocus = 0;
    startingCharacterPosition = 0;
    currentAutoCompleteTermLength = 0;

    // since closeAutoComplete can be called from events other than "blur", we check to make sure this is a "blur" event before calling the function that might have been passed in from the parent
    if (event?.type === "blur") {
      if (additionalOnBlurFunction.toString() !== initialOnBlurFunction.toString()) {
        additionalOnBlurFunction();
      } else if (initialValue !== event.target.value) {
        // If a custom blur isn't selected, do default update
        // Update the initial value
        document.getElementById("updateButton").click();
      }
      initialValue = event.target.value;
    }
  }

  function openAutoComplete(currentCursorPostion, inputValue) {
    console.log("openAutoComplete");
    showAutoCompleteList = true;
    startOfWordPosition = currentCursorPostion;
    startingCharacterPosition = currentCursorPostion - 1;
    currentAutoCompleteTermLength = 1;
    updateValuesToShow();
    selectedWord = "";
    inputElementThatWasCompleted = undefined;
    if (showListImmediately === true) {
      startOfWordPosition = 0;
      startingCharacterPosition = 0;
      currentAutoCompleteTermLength = inputValue.length;
      if (inputValue.length) {
        updateValuesToShow(inputValue);
        if (!valuesToShow.length || (valuesToShow.length && valuesToShow[0].value === inputValue)) {
          closeAutoComplete();
        }
      }
    }
  }

  function isAutoCompleteListOpen() {
    return showAutoCompleteList === true;
  }

  function renderListValue(autoCompleteItem, j) {
    const boldEndIndex = showListImmediately
      ? currentAutoCompleteTermLength
      : currentAutoCompleteTermLength - 1;
    const activeItemPrefix = currentKeyBoardFocus === j && showActiveSelection ? "> " : "";
    if (showDetailAutoCompleteList) {
      if (typeof autoCompleteItem === "string") {
        return `<strong>${autoCompleteItem.substring(
          0,
          1 + autoCompleteItem.indexOf(")")
        )}</strong>${autoCompleteItem.substring(1 + autoCompleteItem.indexOf(")"))}`;
      } else {
        return `fix the string issue`;
      }
    } else {
      return `${activeItemPrefix}<strong>${autoCompleteItem.label.substring(
        0,
        boldEndIndex
      )}</strong>${autoCompleteItem.label.substring(boldEndIndex)}`;
    }
  }

  function nextNode(event) {
    console.log("nextNode, isAutoCompleteListOpen() = " + isAutoCompleteListOpen());
    Lib.nextNode(event);
    // if (!isAutoCompleteListOpen()) {
    //   // This isn't currently behaving as expected. Intent: if autocomplete is open, don't jump to the next node when user presses 'enter'
    //   Lib.nextNode(event);
    // }
  }
</script>

<div class="control autocomplete">
  {#if elementType === "input"}
    <input
      {id}
      class={`input ${classNames}`}
      type="text"
      {placeholder}
      autocomplete="off"
      on:input={handleInputAndFocus}
      on:focus={handleInputAndFocus}
      on:blur={closeAutoComplete}
      on:keydown={handleAutoCompleteKeyboardInput}
      bind:value />
  {:else if elementType === "textarea"}
    <textarea
      {id}
      class={`textarea ${classNames}`}
      {placeholder}
      autocomplete="off"
      on:input={handleInputAndFocus}
      on:focus={handleInputAndFocus}
      on:blur={closeAutoComplete}
      on:keydown={handleAutoCompleteKeyboardInput}
      bind:value />
    <!-- removing       on:keyup={nextNode} for now -->
  {/if}
  {#if showAutoCompleteList === true && showDetailAutoCompleteList === false}
    <div id={`${id}AutoCompleteList`} class="autocomplete-items">
      {#each valuesToShow as autoCompleteItem, j}
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <div
          id={`item${j}`}
          autoCompleteForId={id}
          class:autocomplete-active={currentKeyBoardFocus === j && showActiveSelection}
          value={autoCompleteItem.value}
          on:click={handleAutoCompleteSelectionFromList}
          on:mousedown={handleMouseDown}>
          <!-- @html lets you return HTML from a function to render. Helps to keep things readable. -->
          {@html renderListValue(autoCompleteItem, j)}
        </div>
      {/each}
    </div>
  {/if}
  {#if showAutoCompleteList === true && showDetailAutoCompleteList === true}
    <div id={`${id}AutoCompleteList`} class="detail autocomplete-items">
      {#if valuesToShow}
        {#each valuesToShow as autoCompleteItem, j}
          <!-- svelte-ignore a11y-click-events-have-key-events -->
          <div
            id={`item${j}`}
            autoCompleteForId={id}
            value={autoCompleteItem.value}
            on:click={handleAutoCompleteSelectionFromList}
            on:mousedown={handleMouseDown}>
            <!-- @html lets you return HTML from a function to render. Helps to keep things readable. -->
            {@html renderListValue(autoCompleteItem, j)}
          </div>
        {/each}
      {/if}
    </div>
  {/if}
</div>
