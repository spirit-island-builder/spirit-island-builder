<script>
  import { afterUpdate, beforeUpdate } from "svelte";

  export let elementType;
  export let placeholder;
  export let validAutoCompleteValues;
  export let endCharacters = ["}", " "];
  export let startCharacter = "{";
  export let value;
  export let id;
  export let showListImmediately;

  let showAutoCompleteList = false;
  let valuesToShow = validAutoCompleteValues;
  let startOfWordPosition = 0;
  let startingCharacterPosition = 0;
  let previousCursorPosition = 0;
  let currentKeyBoardFocus = 0;
  let showActiveSelection = true;
  let currentAutoCompleteTermLength = 0;
  let selectedWord = "";
  let inputElementThatWasCompleted;

  beforeUpdate(() => {});

  afterUpdate(() => {
    // Refocus the input element that was just completed
    if (inputElementThatWasCompleted) {
      inputElementThatWasCompleted.focus();
      // In textarea/input with multiple autocompletes set cursor position the end of the autocomplete term that was inserted. Without this the cursor goes to the end of the input.
      if (!showListImmediately) {
        inputElementThatWasCompleted.selectionEnd = startOfWordPosition + selectedWord.length + 1;
      }
      // Prevent further refocus and cursor positioning
      inputElementThatWasCompleted = undefined;
    }
  });

  function handleInputAndFocus(event) {
    const inputValue = event.target.value;
    const currentCursorPostion = event.target.selectionStart;
    if (
      event.data === startCharacter ||
      (showListImmediately === true && (inputValue.length === 0 || event.type === "focus"))
    ) {
      openAutoComplete(currentCursorPostion, inputValue);
    } else if (
      (endCharacters.includes(event.data) ||
        hasCursorMovedOutsideOfCurrentAutoCompleteTerm(inputValue, currentCursorPostion)) &&
      !showListImmediately
    ) {
      closeAutoComplete();
    } else if (isAutoCompleteListOpen()) {
      currentAutoCompleteTermLength++;
      updateValuesToShow(inputValue);
    }
    previousCursorPosition = currentCursorPostion;
  }

  function updateValuesToShow(inputValue) {
    const autoCompleteStartText = inputValue.substring(
      startOfWordPosition,
      startingCharacterPosition + currentAutoCompleteTermLength
    );
    valuesToShow = validAutoCompleteValues.filter((autoCompleteItem) =>
      autoCompleteItem.value.startsWith(autoCompleteStartText)
    );
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
            showActiveSelection = true;
          } else if (event.key === "ArrowUp") {
            event.preventDefault();
            updateCurrentKeyBoardFocus(-1);
            showActiveSelection = true;
          } else if (event.key === "Enter" || event.key === "Tab") {
            showActiveSelection = false;
            // Stop other events, such as moving to the next form input with tab, from happening
            event.preventDefault();
            if (currentKeyBoardFocus > -1) {
              // Simulate a click on the "active" item
              if (autoCompleteList) autoCompleteList[currentKeyBoardFocus].click();
            }
          }
        }
      }
    }
  }

  function updateCurrentKeyBoardFocus(valueToAdd) {
    currentKeyBoardFocus += valueToAdd;
    if (currentKeyBoardFocus >= valuesToShow.length) {
      // Wrap from bottom of the list to the top
      currentKeyBoardFocus = 0;
    } else if (currentKeyBoardFocus < 0) {
      // Wrap from the top of the list to the bottom
      currentKeyBoardFocus = valuesToShow.length - 1;
    }
  }

  function handleAutoCompleteSelectionFromList(event) {
    selectedWord = event.target.attributes.value.value;
    inputElementThatWasCompleted = document.getElementById(
      event.target.attributes.autoCompleteForId.value
    );
    if (showListImmediately === true) {
      value = selectedWord;
    } else {
      value = `${value.substring(0, startOfWordPosition)}${selectedWord}}${value.substring(
        startingCharacterPosition + currentAutoCompleteTermLength
      )}`;
    }
    closeAutoComplete();
  }

  // This is needed for on:mousedown on the autocomplete list because without it a physical click on a list item will close the list due to the on:blur={closeAutoComplete} handlers on the input element
  function handleMouseDown(event) {
    event.preventDefault();
    handleAutoCompleteSelectionFromList(event);
  }

  function closeAutoComplete() {
    // selectedWord, startOfWordPosition, and inputElementThatWasCompleted are intentionally not reset here so that cursor repositioning in afterUpdate() works
    showAutoCompleteList = false;
    showActiveSelection = true;
    valuesToShow = validAutoCompleteValues;
    previousCursorPosition = 0;
    currentKeyBoardFocus = 0;
    startingCharacterPosition = 0;
    currentAutoCompleteTermLength = 0;
  }

  function openAutoComplete(currentCursorPostion, inputValue) {
    showAutoCompleteList = true;
    startOfWordPosition = currentCursorPostion;
    startingCharacterPosition = currentCursorPostion - 1;
    currentAutoCompleteTermLength = 1;
    valuesToShow = validAutoCompleteValues;
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

  function renderListValue(autoCompleteItem) {
    const boldEndIndex = showListImmediately
      ? currentAutoCompleteTermLength
      : currentAutoCompleteTermLength - 1;
    return `<strong>${autoCompleteItem.label.substring(
      0,
      boldEndIndex
    )}</strong>${autoCompleteItem.label.substring(boldEndIndex)}`;
  }
</script>

<div class="control autocomplete">
  {#if elementType === "input"}
    <input
      {id}
      class="input"
      type="text"
      {placeholder}
      tabindex="1"
      autocomplete="off"
      on:input={handleInputAndFocus}
      on:focus={handleInputAndFocus}
      on:blur={closeAutoComplete}
      on:keydown={handleAutoCompleteKeyboardInput}
      bind:value />
  {:else if elementType === "textarea"}
    <textarea
      {id}
      class="textarea"
      {placeholder}
      autocomplete="off"
      on:input={handleInputAndFocus}
      on:focus={handleInputAndFocus}
      on:blur={closeAutoComplete}
      on:keydown={handleAutoCompleteKeyboardInput}
      tabindex="1"
      bind:value />
  {/if}
  {#if showAutoCompleteList === true}
    <div id={`${id}AutoCompleteList`} class="autocomplete-items">
      {#each valuesToShow as autoCompleteItem, j}
        <div
          autoCompleteForId={id}
          class:autocomplete-active={currentKeyBoardFocus === j && showActiveSelection}
          value={autoCompleteItem.value}
          on:click={handleAutoCompleteSelectionFromList}
          on:mousedown={handleMouseDown}>
          <!-- @html lets you return HTML from a function to render. Helps to keep things readable. -->
          {@html renderListValue(autoCompleteItem)}
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .autocomplete {
    position: relative;
    display: inline-block;
  }

  .autocomplete-items {
    position: absolute;
    border: 1px solid #d4d4d4;
    border-bottom: none;
    border-top: none;
    z-index: 99;
    /*position the autocomplete items to be the same width as the container:*/
    top: 100%;
    left: 0;
    right: 0;
  }
  .autocomplete-items div:hover {
    /*when hovering an item:*/
    background-color: #e9e9e9;
  }

  .autocomplete-active {
    /*when navigating through the items using the arrow keys:*/
    background-color: DodgerBlue !important;
    color: #ffffff;
  }

  .autocomplete-items div {
    padding: 10px;
    cursor: pointer;
    background-color: #fff;
    border-bottom: 1px solid #d4d4d4;
  }
</style>
