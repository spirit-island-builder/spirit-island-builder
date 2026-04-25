<title>Spirit Island Builder — Changelog</title>
<link
  href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Crimson+Pro:ital,wght@0,300;0,400;0,600;1,300;1,400&display=swap"
  rel="stylesheet" />

<body>
  <div class="page">
    <header>
      <div class="site-name">spiritislandbuilder.com</div>
      <h1>Changelog</h1>
      <p class="subtitle">A record of growth, power, and occasional cursed code</p>
    </header>

    <!-- ===== 2026 ===== -->
    <div class="year-divider"><span class="year-label">2026</span></div>

    <div class="month-section">
      <div class="month-header">
        <span class="month-label">April 2026</span>
        <span class="month-rule" />
      </div>
      <ul class="entry-list">
        <li class="entry">
          <span class="tag tag-fix">Fix</span> Fixed <code>incarna(replace,x,y)</code> growth action
          — the inner icon was not positioning correctly inside the replace-with-incarna layout
        </li>
        <li class="entry">
          <span class="tag tag-new">New</span> Innate power threshold levels in the aspect builder can
          now be reordered with up/down buttons, matching the behavior on the main spirit board builder
        </li>
        <li class="entry">
          <span class="tag tag-new">New</span> "Complex Presence Tracks" added as a spirit board
          example, demonstrating advanced use of <code>_shift</code>, <code>~top</code>/<code
            >~left</code
          >/<code>~right</code>, split nodes, and additional tracks
        </li>
      </ul>
    </div>

    <div class="month-section">
      <div class="month-header">
        <span class="month-label">March 2026</span>
        <span class="month-rule" />
      </div>
      <ul class="entry-list">
        <li class="entry">
          <span class="tag tag-fix">Fix</span> Updated the Defense Bar custom icon image asset
        </li>
        <li class="entry">
          <span class="tag tag-fix">Fix</span> <code>coastal</code> and <code>inland</code> land types
          now display correctly in presence track node text — "Coastal Land" and "Inland Land" render
          as expected rather than duplicating the word "Land"
        </li>
        <li class="entry">
          <span class="tag tag-fix">Fix</span> Aspect panel layout fixes: corrected back card rotation,
          horizontal innate power width, and miscellaneous display issues
        </li>
        <li class="entry">
          <span class="tag tag-perf">Perf</span> Significant icon rendering performance improvement
          — <code>IconName</code> lookups now use memoization and a pre-built static lookup table, reducing
          redundant work on large boards
        </li>
        <li class="entry">
          <span class="tag tag-perf">Perf</span> Refactored form tab-navigation to use
          <code>data-next-field</code> HTML attributes rather than a large switch statement, making keyboard
          tab flow more maintainable
        </li>
        <li class="entry">
          <span class="tag tag-fix">Fix</span> Fixed implicit global variable declarations in template
          rendering scripts that caused silent failures in strict browser environments
        </li>
        <li class="entry">
          <span class="tag tag-fix">Fix</span> Fixed a crash when a spirit board had no presence nodes
          defined
        </li>
        <li class="entry"><span class="tag tag-fix">Fix</span> TTS export file stability fix</li>
      </ul>
    </div>

    <div class="month-section">
      <div class="month-header">
        <span class="month-label">February 2026</span>
        <span class="month-rule" />
      </div>
      <ul class="entry-list">
        <li class="entry">
          <span class="tag tag-fix">Fix</span> Fixed image export for power card layouts
        </li>
        <li class="entry">
          <span class="tag tag-fix">Fix</span> Threshold indicator: repositioned and refined visual alignment
          on spirit boards
        </li>
        <li class="entry">
          <span class="tag tag-new">New</span> Invader Card builder: updated card layout and field structure
        </li>
        <li class="entry">
          <span class="tag tag-fix">Fix</span> Innate power level display corrections
        </li>
      </ul>
    </div>

    <div class="month-section">
      <div class="month-header">
        <span class="month-label">January 2026</span>
        <span class="month-rule" />
      </div>
      <ul class="entry-list">
        <li class="entry">
          <span class="tag tag-new">New</span> <strong>Multipart aspect support</strong> — aspects can
          now have multiple parts (e.g. Part 1 of 2), with a "Show Part" toggle, part reordering, per-part
          name overrides, and dedicated instructions in the aspect tab
        </li>
        <li class="entry">
          <span class="tag tag-new">New</span> Aspect builder: cleaned up back card art layout; added
          language field
        </li>
        <li class="entry">
          <span class="tag tag-new">New</span> <em>Deeps</em> added as an official aspect example
        </li>
        <li class="entry">
          <span class="tag tag-new">New</span> Spirit board lore side: lore text formatting improvements;
          section headings can now include the spirit name
        </li>
        <li class="entry">
          <span class="tag tag-new">New</span> Added "Alternate" board type alongside the existing Regular
          and Starlight-style board layouts
        </li>
        <li class="entry">
          <span class="tag tag-new">New</span> Added <code>then(x,y)</code> growth action — allows
          one growth option to trigger before another (analogous to how <code>or(x,y)</code> works)
        </li>
        <li class="entry">
          <span class="tag tag-new">New</span> Blank growth action sizing control —
          <code>blank(x)</code> now accepts a pixel width argument
        </li>
        <li class="entry">
          <span class="tag tag-new">New</span> Cards-per-row preference is now saved between sessions
        </li>
        <li class="entry">
          <span class="tag tag-new">New</span> Cards-per-page view for PDF print layout
        </li>
        <li class="entry">
          <span class="tag tag-new">New</span> Image overlay system — place custom images on top of the
          spirit panel at specific pixel coordinates
        </li>
        <li class="entry">
          <span class="tag tag-new">New</span> <code>no-</code> prefix can now be combined with size
          modifiers in icon shorthand (e.g. <code>{"{no-large-dahan}"}</code>)
        </li>
        <li class="entry">
          <span class="tag tag-fix">Fix</span> <em>WWB example</em> and <em>Explorer icon</em> updated
        </li>
        <li class="entry">
          <span class="tag tag-new">New</span> Tables (via <code>{"{table}"}</code> shortcut) support
          added to text fields, and Intensify aspect added
        </li>
        <li class="entry">
          <span class="tag tag-fix">Fix</span> Presence node inputs now trim whitespace from complex
          <code>+</code> combinations where possible
        </li>
        <li class="entry">
          <span class="tag tag-export">Export</span> TTS export: updated track element and aspect TTS
          export handling
        </li>
        <li class="entry">
          <span class="tag tag-fix">Fix</span> Flip board orientation added (the
          <code>flipboard</code> attribute); fixed the flip button that was previously broken
        </li>
        <li class="entry">
          <span class="tag tag-fix">Fix</span> Power card printing layout fix; single-card export via
          "Save Single Card" corrected
        </li>
        <li class="entry">
          <span class="tag tag-fix">Fix</span> Growth group cost display and custom energy icon fixes
        </li>
        <li class="entry">
          <span class="tag tag-fix">Fix</span> Presence track first-node rendering fix; Incarna add/move
          action fix in growth
        </li>
        <li class="entry">
          <span class="tag tag-fix">Fix</span> Aspect effect fields and growth-inside-aspect rendering
          corrections
        </li>
        <li class="entry">
          <span class="tag tag-fix">Fix</span> Dark mode toggle light-up state fix
        </li>
        <li class="entry">
          <span class="tag tag-fix">Fix</span> Innate power threshold checkboxes repositioned to align
          correctly
        </li>
        <li class="entry">
          <span class="tag tag-new">New</span> Privacy policy page added at
          <code>/privacypolicy</code>, linked in the footer
        </li>
        <li class="entry">
          <span class="tag tag-fix">Fix</span> Responsive layout improvements for narrow screen widths
        </li>
      </ul>
    </div>

    <!-- ===== 2025 ===== -->
    <div class="year-divider"><span class="year-label">2025</span></div>

    <div class="month-section">
      <div class="month-header">
        <span class="month-label">December 2025</span>
        <span class="month-rule" />
      </div>
      <ul class="entry-list">
        <li class="entry">
          <span class="tag tag-new">New</span> <strong>Google Drive integration launched</strong> — save
          and load files directly to/from Google Drive, with folder browsing, folder creation, custom
          filename input, and toast notifications for save/load status. The Save and Load buttons now
          show a Drive icon when Drive mode is active.
        </li>
        <li class="entry">
          <span class="tag tag-new">New</span> Drag-and-drop power card reordering via the new "Reorder
          Cards" section
        </li>
        <li class="entry">
          <span class="tag tag-new">New</span> Power card filenames on export now reflect the card name
        </li>
        <li class="entry">
          <span class="tag tag-new">New</span> <em>Covets Gleaming Shards of Earth</em> spirit example
          updated
        </li>
        <li class="entry">
          <span class="tag tag-fix">Fix</span> Lore board formatting improvements
        </li>
        <li class="entry">
          <span class="tag tag-fix">Fix</span> Gather action fix for split-node presence tracks
        </li>
        <li class="entry">
          <span class="tag tag-fix">Fix</span> Icon rendering fixes; growth option CSS tweaks
        </li>
      </ul>
    </div>

    <div class="month-section">
      <div class="month-header">
        <span class="month-label">November 2025</span>
        <span class="month-rule" />
      </div>
      <ul class="entry-list">
        <li class="entry">
          <span class="tag tag-lang">Lang</span> <strong>Korean translation</strong> — full pass covering
          spirit boards, power cards, adversary sheets, header font, and lore text
        </li>
        <li class="entry">
          <span class="tag tag-lang">Lang</span> German translation corrections and missing string additions
          across multiple components
        </li>
        <li class="entry">
          <span class="tag tag-new">New</span> <strong>Adversary language selector</strong> — the adversary
          builder can now output in multiple languages (English, German, French, Polish, Chinese, Hungarian,
          Arabic, Korean, Japanese)
        </li>
        <li class="entry">
          <span class="tag tag-new">New</span> Range icons (<code>gain-range</code>,
          <code>lose-range</code>) added to power cards and the adversary builder
        </li>
        <li class="entry">
          <span class="tag tag-new">New</span> Image export: aspect subtext width is now locked for consistent
          sizing across exports
        </li>
        <li class="entry">
          <span class="tag tag-fix">Fix</span> Added a confirmation dialog before removing items from
          sets to prevent accidental deletion
        </li>
        <li class="entry">
          <span class="tag tag-fix">Fix</span> File save naming improvements; validation added to require
          a set name before saving
        </li>
      </ul>
    </div>

    <div class="month-section">
      <div class="month-header">
        <span class="month-label">October 2025</span>
        <span class="month-rule" />
      </div>
      <ul class="entry-list">
        <li class="entry">
          <span class="tag tag-lang">Lang</span> <strong>French translation</strong> for the adversary
          page, contributed by a community member
        </li>
        <li class="entry">
          <span class="tag tag-lang">Lang</span> <strong>Japanese translation</strong> — initial pass
          added alongside Korean
        </li>
        <li class="entry">
          <span class="tag tag-lang">Lang</span> Translation framework extended to the adversary builder
          (previously only supported on spirit boards and power cards)
        </li>
        <li class="entry">
          <span class="tag tag-new">New</span> Dark mode toggle redesigned with a sun/moon icon switch
        </li>
      </ul>
    </div>

    <div class="month-section">
      <div class="month-header">
        <span class="month-label">September 2025</span>
        <span class="month-rule" />
      </div>
      <ul class="entry-list">
        <li class="entry">
          <span class="tag tag-new">New</span>
          <strong>Google Drive integration (initial development)</strong> — Google Drive API setup, save
          location selector, PDF export to Drive, image export to Drive, and an alert/toast system for
          operation feedback
        </li>
        <li class="entry">
          <span class="tag tag-new">New</span> Element icons can now be used in aspect subtext fields
        </li>
      </ul>
    </div>

    <div class="month-section">
      <div class="month-header">
        <span class="month-label">August 2025</span>
        <span class="month-rule" />
      </div>
      <ul class="entry-list">
        <li class="entry">
          <span class="tag tag-new">New</span> Fear card builder: per-terror-level effect fields
        </li>
        <li class="entry">
          <span class="tag tag-new">New</span> Invader card can now be downloaded as a standalone image
        </li>
        <li class="entry">
          <span class="tag tag-fix">Fix</span> Adversary builder: hostility flag rendering fix and general
          adversary fixes
        </li>
        <li class="entry">
          <span class="tag tag-fix">Fix</span> Lore board: font improvements and black drop-shadow rendering
          fix on spirit images
        </li>
        <li class="entry">
          <span class="tag tag-fix">Fix</span> Minor range icon display fix on power cards
        </li>
      </ul>
    </div>

    <div class="month-section">
      <div class="month-header">
        <span class="month-label">July 2025</span>
        <span class="month-rule" />
      </div>
      <ul class="entry-list">
        <li class="entry">
          <span class="tag tag-new">New</span> <strong>Custom Invader Card builder</strong> — new tab
          for creating fully custom invader cards, supporting Single, Double, and Split card types; title,
          paragraph, reminder, image, and spacer content fields; color picker per field; terrain texture
          presets (Jungle, Sand, Mountain, Wetland, Ocean)
        </li>
        <li class="entry">
          <span class="tag tag-new">New</span> Presence track: energy wildcard (<code>+any</code>)
          and icon-based range values (e.g. <code>gain-range(sun)</code>) now supported
        </li>
        <li class="entry">
          <span class="tag tag-new">New</span> Custom icons can now be used inside presence token nodes
        </li>
        <li class="entry">
          <span class="tag tag-new">New</span> TTS export: tokens in the spirit bag can now be specified
          from the lore side
        </li>
        <li class="entry">
          <span class="tag tag-new">New</span> Scenario text size is now adjustable
        </li>
        <li class="entry"><span class="tag tag-new">New</span> Binder/set view: layout updates</li>
        <li class="entry">
          <span class="tag tag-fix">Fix</span> TTS presence track: element icons on presence nodes now
          export correctly
        </li>
        <li class="entry"><span class="tag tag-fix">Fix</span> Spirit name font rendering fix</li>
        <li class="entry">
          <span class="tag tag-fix">Fix</span> <code>slow</code> speed icon and black icon rendering
          corrections
        </li>
        <li class="entry">
          <span class="tag tag-fix">Fix</span> <code>or()</code> in presence tracks now works correctly;
          node modifier ordering fix
        </li>
        <li class="entry">
          <span class="tag tag-fix">Fix</span> Special rules rendering fix; Covets example and instructions
          updated
        </li>
        <li class="entry"><span class="tag tag-fix">Fix</span> Power card element icon fix</li>
        <li class="entry">
          <span class="tag tag-fix">Fix</span> Aspect text rendering improvements; move-presence node
          updates in the aspect builder
        </li>
      </ul>
    </div>

    <div class="month-section">
      <div class="month-header">
        <span class="month-label">June 2025</span>
        <span class="month-rule" />
      </div>
      <ul class="entry-list">
        <li class="entry">
          <span class="tag tag-new">New</span> Presence node system updated — new
          <code>_shift(x;y)</code> modifier to move nodes from their default positions; slide/shift combo
          nodes; blank node fix
        </li>
        <li class="entry">
          <span class="tag tag-fix">Fix</span> Event card rendering fix; presence node update corrections
        </li>
      </ul>
    </div>

    <div class="month-section">
      <div class="month-header">
        <span class="month-label">May 2025</span>
        <span class="month-rule" />
      </div>
      <ul class="entry-list">
        <li class="entry">
          <span class="tag tag-lang">Lang</span> French translation strings added to spirit board and
          power card builders
        </li>
        <li class="entry">
          <span class="tag tag-new">New</span> Presence token type <code>token(any)</code> — tokens can
          now represent any token type rather than a specific one
        </li>
        <li class="entry">
          <span class="tag tag-new">New</span> Donation link (Ko-fi) added to the About page and footer
        </li>
        <li class="entry">
          <span class="tag tag-fix">Fix</span> Adversary level click-to-edit interaction fix
        </li>
        <li class="entry">
          <span class="tag tag-fix">Fix</span> Growth cost display and autocomplete fixes in the spirit
          board builder
        </li>
      </ul>
    </div>

    <div class="month-section">
      <div class="month-header">
        <span class="month-label">April 2025</span>
        <span class="month-rule" />
      </div>
      <ul class="entry-list">
        <li class="entry">
          <span class="tag tag-new">New</span> <strong>Additive load</strong> — power cards can now be
          loaded from a file without clearing the existing card set, merging new cards into the current
          set. Available via the "Additive Load" button.
        </li>
        <li class="entry">
          <span class="tag tag-new">New</span> <strong>Single save</strong> — power cards can now export
          a single card via the "Save Single Card" button per card, rather than requiring export of the
          full set
        </li>
        <li class="entry">
          <span class="tag tag-fix">Fix</span> Additive load stability fixes and cost field corrections
          after loading
        </li>
      </ul>
    </div>

    <!-- ===== 2024 (Jan–Apr) ===== -->
    <div class="year-divider"><span class="year-label">2024</span></div>

    <div class="month-section">
      <div class="month-header">
        <span class="month-label">February – March 2024</span>
        <span class="month-rule" />
      </div>
      <ul class="entry-list">
        <li class="entry">
          <span class="tag tag-new">New</span> Aspect builder: landscape/portrait format toggle; aspect
          subtext can now be omitted; aspect size and layout improvements
        </li>
        <li class="entry">
          <span class="tag tag-new">New</span> <em>Keeper of the Forbidden Wilds</em> added as an aspect
          example (the Keeper growth option)
        </li>
        <li class="entry">
          <span class="tag tag-new">New</span> Dev-overlay tool for comparing your board against reference
          images (dev feature)
        </li>
        <li class="entry">
          <span class="tag tag-fix">Fix</span> Event card overlay rendering fixes
        </li>
      </ul>
    </div>

    <div class="month-section">
      <div class="month-header">
        <span class="month-label">March 2024</span>
        <span class="month-rule" />
      </div>
      <ul class="entry-list">
        <li class="entry">
          <span class="tag tag-fix">Fix</span> OR threshold rendering fix in power cards and spirit boards
        </li>
        <li class="entry">
          <span class="tag tag-new">New</span> Direct URL navigation — you can now link to a
          specific builder tab using URL hashes (e.g. <code>#powerCards</code>,
          <code>#adversary</code>)
        </li>
        <li class="entry">
          <span class="tag tag-new">New</span> Art overlay on adversary, fear card, and blight card previews
          extended to all additional component types
        </li>
        <li class="entry">
          <span class="tag tag-new">New</span> <strong>TTS export for aspects</strong> — aspect cards
          can now be exported as Tabletop Simulator JSON files, with threshold marker positions and element
          data
        </li>
        <li class="entry">
          <span class="tag tag-new">New</span> Presence track: range icon support in
          <code>move-presence(coastal)</code> style nodes
        </li>
        <li class="entry">
          <span class="tag tag-new">New</span> TTS export: threshold marker position improvement for
          spirit boards
        </li>
        <li class="entry">
          <span class="tag tag-new">New</span> Incarna growth action: <code>incarna(add-move)</code>
          now supported in presence track nodes
        </li>
        <li class="entry">
          <span class="tag tag-new">New</span> Incarna token builder: empowered/unempowered toggle, color
          picker, separate token icons for each state
        </li>
        <li class="entry">
          <span class="tag tag-new">New</span> Power cards: printer-friendly mode removes backgrounds
        </li>
        <li class="entry">
          <span class="tag tag-new">New</span>
          <strong>Horizons of Spirit Island spirits added</strong> as examples: Rising Heat, Devouring
          Teeth, Sun-Bright Whirlwind, Eyes Watch From the Trees, Fathomless Mud
        </li>
        <li class="entry">
          <span class="tag tag-new">New</span> Line breaks (<code>&lt;br&gt;</code> /
          <code>{"{line-break}"}</code>) now work in special rules text
        </li>
      </ul>
    </div>

    <div class="month-section">
      <div class="month-header">
        <span class="month-label">March – April 2024</span>
        <span class="month-rule" />
      </div>
      <ul class="entry-list">
        <li class="entry">
          <span class="tag tag-new">New</span> <strong>PDF export</strong> — spirit boards, power cards,
          aspects, adversaries, and other components can now be exported as properly scaled PDFs in Letter
          or A4 size
        </li>
        <li class="entry">
          <span class="tag tag-new">New</span> <code>take-power-card()</code> growth action added — distinct
          from gain-power-card, used by spirits like Finder
        </li>
        <li class="entry">
          <span class="tag tag-new">New</span> Aspect builder: back card rotation options; aspect PDF
          export
        </li>
        <li class="entry"><span class="tag tag-fix">Fix</span> Lore side "Clear All Fields" fix</li>
        <li class="entry">
          <span class="tag tag-new">New</span> <code>_nofirst</code> presence node modifier — prevents
          the solid first-node ring, using the dashed style instead
        </li>
        <li class="entry">
          <span class="tag tag-fix">Fix</span> TTS export fix for spirit board snap points
        </li>
      </ul>
    </div>

    <div class="month-section">
      <div class="month-header">
        <span class="month-label">April 2024</span>
        <span class="month-rule" />
      </div>
      <ul class="entry-list">
        <li class="entry">
          <span class="tag tag-new">New</span> Spirit board: "Transparent" button makes growth and innate
          power panels transparent so art shows through
        </li>
        <li class="entry">
          <span class="tag tag-new">New</span> Power cards: "Aspect" card type added with subtitle field
          (e.g. "Sparking (2 of 2)") and dedicated banner
        </li>
        <li class="entry">
          <span class="tag tag-new">New</span> Adversary builder: visual overhaul with new background
          frame and border styling
        </li>
        <li class="entry">
          <span class="tag tag-new">New</span> Scenario builder: image fields for front panels, improved
          back panel editing
        </li>
      </ul>
    </div>

    <div class="month-section">
      <div class="month-header">
        <span class="month-label">May 2024</span>
        <span class="month-rule" />
      </div>
      <ul class="entry-list">
        <li class="entry">
          <span class="tag tag-new">New</span> Adversary levels can now be reordered with up/down buttons
        </li>
        <li class="entry">
          <span class="tag tag-new">New</span> Adversary builder: alternate loss condition can be switched
          to a Special Rule instead
        </li>
        <li class="entry">
          <span class="tag tag-new">New</span> Innate powers can now be reordered with up/down buttons;
          threshold levels can also be reordered
        </li>
        <li class="entry">
          <span class="tag tag-new">New</span> Printer-friendly buttons added to power cards, adversary,
          and lore side builders
        </li>
        <li class="entry">
          <span class="tag tag-new">New</span> Stack view for power cards — click a card in the preview
          to expand/collapse its editor panel
        </li>
        <li class="entry">
          <span class="tag tag-new">New</span> Image re-input button fix — clicking the file input again
          now correctly clears the previous selection
        </li>
        <li class="entry">
          <span class="tag tag-new">New</span> UI cleanup: side panel layout improvements for wider screens
        </li>
      </ul>
    </div>

    <div class="month-section">
      <div class="month-header">
        <span class="month-label">June 2024</span>
        <span class="month-rule" />
      </div>
      <ul class="entry-list">
        <li class="entry">
          <span class="tag tag-new">New</span> <strong>Language/translation system overhaul</strong>
          — wildcard growth text (<code>*your custom text</code>) now works on all growth and
          presence track options, allowing full custom translations of auto-generated text
        </li>
        <li class="entry">
          <span class="tag tag-new">New</span> Split presence nodes: <code>split(x;y)</code> — two nodes
          displayed in a single slot (as seen on the Apocrypha dragon)
        </li>
        <li class="entry">
          <span class="tag tag-new">New</span> Presence track: <code>^pay(x)</code> node cost notation
          — shows a negative energy cost requirement on a node (as seen on Many Minds)
        </li>
        <li class="entry">
          <span class="tag tag-new">New</span> GoatCounter analytics added for basic anonymous usage
          tracking
        </li>
        <li class="entry">
          <span class="tag tag-fix">Fix</span> Gather text and gather-from-specific-land fixes in presence
          tracks
        </li>
      </ul>
    </div>

    <div class="month-section">
      <div class="month-header">
        <span class="month-label">July 2024</span>
        <span class="month-rule" />
      </div>
      <ul class="entry-list">
        <li class="entry">
          <span class="tag tag-new">New</span> <code>move-presence(coastal)</code> and other land-type
          destinations now supported in presence tracks
        </li>
        <li class="entry">
          <span class="tag tag-new">New</span> Icon names now usable inside presence track nodes
          (e.g. <code>push(incarna)</code> shows the incarna icon)
        </li>
        <li class="entry">
          <span class="tag tag-lang">Lang</span> "You may pay" localization added for cost nodes in translated
          boards
        </li>
        <li class="entry">
          <span class="tag tag-new">New</span> <strong>Threshold HTML rework</strong> — innate power
          thresholds now render with much greater visual fidelity to the physical card, including OR
          thresholds (as seen on Trickster)
        </li>
        <li class="entry">
          <span class="tag tag-new">New</span> Growth action instructions: inline dropdown detail now
          shows usage examples for each growth action type
        </li>
        <li class="entry">
          <span class="tag tag-new">New</span> <code>discard(x)</code> growth action — discard a card
          with a specific element (as seen on Ember-Eyed Behemoth)
        </li>
        <li class="entry">
          <span class="tag tag-new">New</span> <strong>Combined TTS Export</strong> — new section to
          assemble a complete spirit bag (play side, lore side, power cards, and incarna token) into
          a single Tabletop Simulator export, with image URL inputs for each component
        </li>
      </ul>
    </div>

    <div class="month-section">
      <div class="month-header">
        <span class="month-label">August 2024</span>
        <span class="month-rule" />
      </div>
      <ul class="entry-list">
        <li class="entry">
          <span class="tag tag-new">New</span>
          <strong>Language options for power cards and lore side</strong> — the language selector (previously
          only on spirit board play side) now extends to power cards and the lore/back side
        </li>
        <li class="entry">
          <span class="tag tag-fix">Fix</span> Aspect builder: various rendering fixes after the rotation/format
          overhaul
        </li>
      </ul>
    </div>

    <div class="month-section">
      <div class="month-header">
        <span class="month-label">September 2024</span>
        <span class="month-rule" />
      </div>
      <ul class="entry-list">
        <li class="entry">
          <span class="tag tag-new">New</span> <strong>Scenario image export</strong> — scenario front
          and back can now be downloaded as PNG images
        </li>
        <li class="entry">
          <span class="tag tag-new">New</span> Autocomplete value list expanded — all icon shortcuts
          now appear in the autocomplete dropdown with descriptions
        </li>
        <li class="entry">
          <span class="tag tag-new">New</span> Keyboard tab navigation (<code>Enter</code> key) improved
          across all builders — pressing Enter in any field now moves to the next logical field
        </li>
        <li class="entry">
          <span class="tag tag-new">New</span> Special rules track support documented — presence nodes
          can be embedded inside special rules text (as seen on Serpent)
        </li>
        <li class="entry">
          <span class="tag tag-fix">Fix</span> Dark mode improvements for additional UI elements
        </li>
      </ul>
    </div>

    <div class="month-section">
      <div class="month-header">
        <span class="month-label">October 2024</span>
        <span class="month-rule" />
      </div>
      <ul class="entry-list">
        <li class="entry">
          <span class="tag tag-new">New</span> Presence track: <code>~top</code>,
          <code>~left</code>, <code>~right</code> subtext placement modifiers — controls where node label
          text appears relative to the ring
        </li>
        <li class="entry">
          <span class="tag tag-new">New</span> Presence track: <code>gain-power-card</code> and
          <code>take-power-card</code> now render correctly as presence node options (with cost notation)
        </li>
        <li class="entry">
          <span class="tag tag-new">New</span> Push and gather actions: <code>push(x,y,z)</code> with
          all combinations of range, conditions, and counts now fully documented and supported
        </li>
        <li class="entry">
          <span class="tag tag-lang">Lang</span> German language additions — German translation strings
          added for spirit board auto-generated text
        </li>
        <li class="entry">
          <span class="tag tag-fix">Fix</span> Stack view rendering fix for power cards
        </li>
        <li class="entry">
          <span class="tag tag-fix">Fix</span> Innate power notes section fix — optional notes field
          now saves and loads correctly
        </li>
      </ul>
    </div>

    <div class="month-section">
      <div class="month-header">
        <span class="month-label">November 2024</span>
        <span class="month-rule" />
      </div>
      <ul class="entry-list">
        <li class="entry">
          <span class="tag tag-new">New</span> Presence track: multi-node display tightened — nodes with
          combined effects (e.g. energy + element) now layout more compactly
        </li>
        <li class="entry">
          <span class="tag tag-new">New</span> <code>add-presence(x,relative,y)</code> growth action
          — add a presence at range relative to a custom entity (used by Covets in Apocrypha)
        </li>
        <li class="entry">
          <span class="tag tag-lang">Lang</span> Hungarian language added across spirit board and lore
          side builders
        </li>
        <li class="entry">
          <span class="tag tag-lang">Lang</span> German icon font support — DK Snemand font variants
          updated for correct German character rendering
        </li>
        <li class="entry">
          <span class="tag tag-new">New</span> Bullet list support in special rules text using
          <code>*</code> prefix
        </li>
        <li class="entry">
          <span class="tag tag-new">New</span> Range icons now render correctly in adversary level rules
          text
        </li>
        <li class="entry">
          <span class="tag tag-fix">Fix</span> TTS export: presence nodes inside special rules now export
          correctly
        </li>
        <li class="entry">
          <span class="tag tag-fix">Fix</span> Enter key behavior in autocomplete fields improved — Enter
          now moves to the next field when the autocomplete list is closed
        </li>
      </ul>
    </div>

    <div class="month-section">
      <div class="month-header">
        <span class="month-label">December 2024</span>
        <span class="month-rule" />
      </div>
      <ul class="entry-list">
        <li class="entry">
          <span class="tag tag-new">New</span> Event card builder: token events and subevents now support
          keyboard tab navigation
        </li>
        <li class="entry">
          <span class="tag tag-new">New</span> Special rules: live preview now updates when you tab out
          of any field, without requiring "Update Preview" click
        </li>
        <li class="entry">
          <span class="tag tag-new">New</span> Push/gather with OR: <code>push(x;y)</code> — push either
          of two entity types (as seen on Finder's bottom track)
        </li>
        <li class="entry">
          <span class="tag tag-fix">Fix</span> Innate power range value font size fix
        </li>
      </ul>
    </div>

    <!-- ===== 2023 ===== -->
    <div class="year-divider"><span class="year-label">2023</span></div>

    <div class="month-section">
      <div class="month-header">
        <span class="month-label">November – December 2023</span>
        <span class="month-rule" />
      </div>
      <ul class="entry-list">
        <li class="entry">
          <span class="tag tag-new">New</span> <strong>Incarna token builder launched</strong> — dedicated
          tab for creating custom Incarna tokens, with icon selection, color picker, empowered/unempowered
          states, and TTS export
        </li>
        <li class="entry">
          <span class="tag tag-new">New</span> Incarna token: toggle button for empowered state; separate
          token icons for normal vs empowered
        </li>
        <li class="entry">
          <span class="tag tag-new">New</span> <strong>Starlight-style spirit board</strong> — "Starlight
          Style" board type option added, supporting Starlight Seeks Its Form's unusual board layout
        </li>
        <li class="entry">
          <span class="tag tag-new">New</span> <strong>Translation support</strong> — "Hide Text" button
          removes all auto-generated text from spirit boards, and a language selector enables partial
          translation of growth/presence/innate text
        </li>
        <li class="entry">
          <span class="tag tag-new">New</span> Power card visual update — card layout and typography
          improvements
        </li>
        <li class="entry">
          <span class="tag tag-new">New</span> <strong>Subpower blocks</strong> — innate powers can
          include a second power in the same column using a <code>new-power</code> threshold, as seen
          on some Apocrypha spirits
        </li>
        <li class="entry">
          <span class="tag tag-new">New</span> Image export resolution increased for higher quality downloads
        </li>
        <li class="entry">
          <span class="tag tag-new">New</span> <code>lose-range</code> icon added to the icon library
        </li>
        <li class="entry">
          <span class="tag tag-new">New</span> Additional presence tracks — spirits can have a third
          presence track beyond the energy and plays tracks
        </li>
        <li class="entry">
          <span class="tag tag-fix">Fix</span> Presence track subtext positioning fix
        </li>
        <li class="entry">
          <span class="tag tag-fix">Fix</span> Aspect builder: various fixes after the major Nature Incarnate
          update
        </li>
        <li class="entry">
          <span class="tag tag-new">New</span>
          <strong>Nature Incarnate spirits added as examples:</strong> Ember-Eyed Behemoth, Hearth-Vigil,
          Towering Roots, Relentless Gaze, Wandering Voice, Breath of Darkness, Wounded Waters Bleeding,
          Dances Up Earthquakes
        </li>
      </ul>
    </div>

    <div class="month-section">
      <div class="month-header">
        <span class="month-label">September – October 2023</span>
        <span class="month-rule" />
      </div>
      <ul class="entry-list">
        <li class="entry">
          <span class="tag tag-new">New</span> <strong>Blight card builder launched</strong> — create
          custom blight cards with name, blight-per-player count, healthy/blighted state toggle, and
          effect text
        </li>
        <li class="entry">
          <span class="tag tag-new">New</span> <strong>Fear card builder launched</strong> — create custom
          fear cards with name and three terror level effects
        </li>
        <li class="entry">
          <span class="tag tag-new">New</span> Custom section heading overrides — the section headers
          ("Special Rules", "Growth", "Presence Tracks", "Innate Powers") can now be renamed via the
          Language & Options panel
        </li>
        <li class="entry">
          <span class="tag tag-new">New</span> Adversary builder: custom loss condition indication
          styling; <em>Habsburg Mining Expedition</em> added as an example
        </li>
        <li class="entry">
          <span class="tag tag-new">New</span> Aspect builder: new official aspect examples added (Lair,
          Tactician, Stranded, Mentor, Intensify, Dark Fire, Keeper, Ocean/Deeps)
        </li>
      </ul>
    </div>

    <div class="month-section">
      <div class="month-header">
        <span class="month-label">June – August 2023</span>
        <span class="month-rule" />
      </div>
      <ul class="entry-list">
        <li class="entry">
          <span class="tag tag-new">New</span>
          <strong>Drag-and-drop growth group reordering</strong> — growth groups and actions can now
          be rearranged by dragging the handle on the left side
        </li>
        <li class="entry">
          <span class="tag tag-new">New</span> Blank presence nodes — <code>blank</code> or
          <code>blank(x)</code> creates an empty slot in the presence track for spacing
        </li>
        <li class="entry">
          <span class="tag tag-new">New</span> <strong>Clickable preview</strong> — clicking sections
          of the spirit board preview (Special Rules, Growth, Presence Tracks, Innate Powers, spirit
          name) now opens the corresponding editor panel
        </li>
        <li class="entry">
          <span class="tag tag-new">New</span> Blank growth action — <code>blank()</code> creates visual
          spacing in growth option rows
        </li>
        <li class="entry">
          <span class="tag tag-new">New</span> Growth in aspects — aspect special rules can now include
          growth action groups (as seen on some Apocrypha aspects)
        </li>
        <li class="entry">
          <span class="tag tag-new">New</span> OR elements in presence tracks —
          <code>elements(x;y)</code> lets a presence node grant a choice of elements
        </li>
        <li class="entry">
          <span class="tag tag-new">New</span> Vitality token added to the TTS combined export bag options
        </li>
        <li class="entry">
          <span class="tag tag-new">New</span> Wide growth groups — growth groups can be set to "Start
          New Row" to break onto a new line
        </li>
        <li class="entry">
          <span class="tag tag-new">New</span> Icons now usable in the lore description field
        </li>
        <li class="entry">
          <span class="tag tag-new">New</span>
          <strong>Dances Up Earthquakes and other NI spirits</strong> added as examples, including push(incarna)
          and bonus node support
        </li>
        <li class="entry">
          <span class="tag tag-fix">Fix</span> Spirit board TTS export: snap point calculations fixed
        </li>
      </ul>
    </div>

    <div class="month-section">
      <div class="month-header">
        <span class="month-label">March – May 2023</span>
        <span class="month-rule" />
      </div>
      <ul class="entry-list">
        <li class="entry">
          <span class="tag tag-new">New</span> <strong>Instructions rewritten in Markdown</strong> —
          the full instructions page is now authored in Markdown and rendered via the site, making it
          easier to maintain and read
        </li>
        <li class="entry">
          <span class="tag tag-new">New</span> Adversary builder: interface improvements, level layout
          refinements, and board resize
        </li>
        <li class="entry">
          <span class="tag tag-new">New</span> Spirit name auto-scales when it overflows the name banner
        </li>
        <li class="entry">
          <span class="tag tag-new">New</span> Custom icons now support display names — set a name for
          a custom icon and it appears in growth/presence track text instead of "custom1"
        </li>
        <li class="entry">
          <span class="tag tag-new">New</span> Screenshots now use 2× scale for higher resolution image
          exports
        </li>
        <li class="entry">
          <span class="tag tag-new">New</span> Additional banner presets added to the banner art selector
        </li>
        <li class="entry">
          <span class="tag tag-new">New</span> More official spirit examples added
        </li>
        <li class="entry">
          <span class="tag tag-new">New</span> Aspects can now replace more than one special rule or
          innate power at once
        </li>
        <li class="entry">
          <span class="tag tag-fix">Fix</span> Plus energy in presence tracks (<code>+2</code>,
          <code>+water</code>) now renders correctly
        </li>
        <li class="entry">
          <span class="tag tag-fix">Fix</span> Various power card TTS and OR rendering fixes
        </li>
      </ul>
    </div>

    <div class="month-section">
      <div class="month-header">
        <span class="month-label">January – February 2023</span>
        <span class="month-rule" />
      </div>
      <ul class="entry-list">
        <li class="entry">
          <span class="tag tag-new">New</span> <strong>Power card TTS export</strong> — power cards can
          now be exported as Tabletop Simulator JSON files with element data, energy cost, and threshold
          positions
        </li>
        <li class="entry">
          <span class="tag tag-new">New</span> <strong>Premade banner options</strong> — a library of
          pre-made banner art options (lightning, earth, water, lava, mist, smoke, metal, etc.) is now
          available in the banner selector
        </li>
        <li class="entry">
          <span class="tag tag-new">New</span> Aspect builder: can now replace multiple special rules/innate
          powers; multiple replacement text lines supported
        </li>
        <li class="entry">
          <span class="tag tag-new">New</span> Live preview auto-update — editing special rules, innate
          power names, range, and target fields now updates the preview without clicking "Update Preview"
        </li>
        <li class="entry">
          <span class="tag tag-new">New</span> Preview frame "Toggle Size" button — expands the preview
          for a larger view
        </li>
        <li class="entry">
          <span class="tag tag-new">New</span> Examples button redesigned as a modal dialog with organized
          categories
        </li>
        <li class="entry">
          <span class="tag tag-new">New</span> Combined banner support for Finder-type spirits — a single
          banner image can span both presence tracks
        </li>
        <li class="entry">
          <span class="tag tag-new">New</span> Footer updated with contributor credits and repository
          link
        </li>
        <li class="entry">
          <span class="tag tag-new">New</span> Icons in instructions now load from packaged sources for
          reliability
        </li>
        <li class="entry">
          <span class="tag tag-fix">Fix</span> Base URI handling — images and templates load correctly
          whether the site is on a custom domain or a path
        </li>
        <li class="entry">
          <span class="tag tag-fix">Fix</span> Spirit board card range display fix
        </li>
        <li class="entry">
          <span class="tag tag-fix">Fix</span> Bonus energy in TTS JSON export now correctly included
        </li>
      </ul>
    </div>

    <!-- ===== 2022 ===== -->
    <div class="year-divider"><span class="year-label">2022</span></div>

    <div class="month-section">
      <div class="month-header">
        <span class="month-label">November – December 2022</span>
        <span class="month-rule" />
      </div>
      <ul class="entry-list">
        <li class="entry">
          <span class="tag tag-new">New</span> <strong>Non-English font support</strong> — DK Snemand
          font added, enabling correct display of Danish and other characters for translated spirit boards
        </li>
        <li class="entry">
          <span class="tag tag-new">New</span> Download file names now include the spirit name for easier
          file management
        </li>
        <li class="entry">
          <span class="tag tag-new">New</span> Major template update — growth options, presence track
          rendering, and innate power display brought in line with the latest version of the Spirit Island
          HTML template
        </li>
        <li class="entry">
          <span class="tag tag-new">New</span> Growth action HTML restructured for more reliable rendering
        </li>
        <li class="entry">
          <span class="tag tag-new">New</span> <strong>TTS snap points</strong> — spirit board TTS export
          now includes snap point positions for presence nodes, enabling correct placement in the TTS
          mod
        </li>
        <li class="entry">
          <span class="tag tag-new">New</span> Template-based TTS JSON generation using json-e, replacing
          hand-built JSON strings
        </li>
        <li class="entry">
          <span class="tag tag-new">New</span> Preview frame isolated into its own component for better
          reliability and hot-reload support in development
        </li>
        <li class="entry">
          <span class="tag tag-fix">Fix</span> Aspect builder tweaks and download fix
        </li>
        <li class="entry">
          <span class="tag tag-fix">Fix</span> Growth option rendering improvements: cost options, tint
          colors, and group headers
        </li>
      </ul>
    </div>

    <div class="month-section">
      <div class="month-header">
        <span class="month-label">October 2022</span>
        <span class="month-rule" />
      </div>
      <ul class="entry-list">
        <li class="entry">
          <span class="tag tag-new">New</span> <strong>Aspect builder launched</strong> — create custom
          aspects for existing spirits, with replacement text for special rules and innate powers, complexity
          indicator, and back card with spirit art
        </li>
        <li class="entry">
          <span class="tag tag-new">New</span> <strong>Custom icons for all builders</strong> — custom
          icon upload extended from spirit boards to power cards, aspects, and adversary sheets
        </li>
        <li class="entry">
          <span class="tag tag-new">New</span> <strong>Instructions popup</strong> — a floating, draggable
          instructions panel accessible from within any builder tab
        </li>
        <li class="entry">
          <span class="tag tag-new">New</span> Artist credit field added to spirit boards and power cards
        </li>
        <li class="entry">
          <span class="tag tag-new">New</span> Cloudflare Web Analytics added for basic anonymous usage
          tracking
        </li>
        <li class="entry">
          <span class="tag tag-new">New</span> Full instructions document published as a dedicated page
        </li>
        <li class="entry">
          <span class="tag tag-new">New</span> Growth group cost fix and tint color support
        </li>
        <li class="entry">
          <span class="tag tag-new">New</span> Lore side: spirit image vertical scale control added
        </li>
        <li class="entry">
          <span class="tag tag-fix">Fix</span> Power card layout and tab-switching fixes
        </li>
      </ul>
    </div>

    <div class="month-section">
      <div class="month-header">
        <span class="month-label">July – September 2022</span>
        <span class="month-rule" />
      </div>
      <ul class="entry-list">
        <li class="entry">
          <span class="tag tag-new">New</span> <strong>Spirit Island Builder launched</strong> — a web-based
          interface for creating custom Spirit Island content, built on top of the Spirit Island HTML
          Template. Initial release supports the Spirit Board (play side and lore side) and Power Cards
          builders.
        </li>
        <li class="entry">
          <span class="tag tag-new">New</span> Growth builder: growth sets, groups, and actions with
          autocomplete for all growth option types
        </li>
        <li class="entry">
          <span class="tag tag-new">New</span> Presence track builder: energy and card play tracks with
          all node types
        </li>
        <li class="entry">
          <span class="tag tag-new">New</span> Innate power builder with threshold levels, fast/slow
          speed, range, and target
        </li>
        <li class="entry">
          <span class="tag tag-new">New</span> Load and Save: HTML files are saved locally and can be
          reloaded to continue editing
        </li>
        <li class="entry">
          <span class="tag tag-new">New</span> Live preview iframe — the spirit board renders in real
          time as you fill in the form
        </li>
        <li class="entry">
          <span class="tag tag-new">New</span> Icon autocomplete — type <code>{"{}"}</code> in any text
          field to trigger autocomplete for all Spirit Island icons
        </li>
        <li class="entry">
          <span class="tag tag-new">New</span> Official spirit examples — load any official spirit as
          a starting point
        </li>
      </ul>
    </div>

    <footer>
      <p>
        Spirit Island Builder is an unofficial fan project. All Spirit Island materials belong to <a
          href="https://www.greaterthangames.com">Greater Than Games, LLC</a
        >.
      </p>
      <p style="margin-top:0.5rem">
        Visit <a href="https://spiritislandbuilder.com">spiritislandbuilder.com</a> &nbsp;·&nbsp;
        <a href="https://github.com/spirit-island-builder/spirit-island-builder">GitHub</a>
      </p>
    </footer>
  </div>
</body>

<!-- PLACEHOLDER - will be replaced -->
<style>
  :root {
    --ink: #1a1208;
    --page-bg: #f5efe0;
    --body-bg: white;
    --rust: #8b3a1a;
    --gold: #b8860b;
    --forest: #2d4a2d;
    --entry-color: #2a1e08;
    --subtitle-color: #5a4a2a;
    --year-label-bg: var(--page-bg);
    --border-color: rgba(184, 134, 11, 0.3);
    --inner-border: rgba(184, 134, 11, 0.15);
    --entry-border: rgba(184, 134, 11, 0.2);
    --month-rule: rgba(139, 58, 26, 0.4);
    --footer-color: #7a6a4a;
  }

  :root[data-theme="dark"],
  .theme-dark {
    --ink: #e8dcc8;
    --page-bg: #1e1a14;
    --body-bg: #121212;
    --rust: #c8724a;
    --gold: #c8960e;
    --forest: #5a8a5a;
    --entry-color: #d4c4a8;
    --subtitle-color: #9a8a6a;
    --year-label-bg: var(--page-bg);
    --border-color: rgba(184, 134, 11, 0.25);
    --inner-border: rgba(184, 134, 11, 0.1);
    --entry-border: rgba(184, 134, 11, 0.15);
    --month-rule: rgba(200, 114, 74, 0.35);
    --footer-color: #6a5a4a;
  }

  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  body {
    background-color: var(--body-bg);
    min-height: 100vh;
    font-family: "Crimson Pro", Georgia, serif;
    color: var(--ink);
    padding: 2rem 1rem 4rem;
  }

  .page {
    max-width: 760px;
    margin: 0 auto;
    background: var(--page-bg);
    border: 1px solid var(--border-color);
    box-shadow: 0 0 0 4px rgba(184, 134, 11, 0.08), 0 4px 40px rgba(0, 0, 0, 0.8),
      inset 0 0 80px rgba(184, 134, 11, 0.04);
    padding: 3rem 3.5rem 4rem;
    position: relative;
  }

  .page::before {
    content: "";
    position: absolute;
    top: 8px;
    left: 8px;
    right: 8px;
    bottom: 8px;
    border: 1px solid var(--inner-border);
    pointer-events: none;
  }

  /* Header */
  header {
    text-align: center;
    margin-bottom: 3rem;
    padding-bottom: 2rem;
    border-bottom: 2px solid var(--gold);
    position: relative;
  }

  header::after {
    content: "✦ ✦ ✦";
    display: block;
    font-size: 0.75rem;
    color: var(--gold);
    letter-spacing: 0.5em;
    margin-top: 1rem;
  }

  .site-name {
    font-family: "Cinzel", serif;
    font-size: 0.7rem;
    font-weight: 600;
    letter-spacing: 0.35em;
    text-transform: uppercase;
    color: var(--rust);
    margin-bottom: 0.5rem;
  }

  h1 {
    font-family: "Cinzel", serif;
    font-size: 2.4rem;
    font-weight: 700;
    color: var(--ink);
    line-height: 1.1;
    letter-spacing: 0.02em;
  }

  .subtitle {
    margin-top: 0.6rem;
    font-style: italic;
    color: var(--subtitle-color);
    font-size: 1.05rem;
    font-weight: 300;
  }

  /* Month sections */
  .month-section {
    margin-bottom: 2.5rem;
    animation: fadeIn 0.4s ease both;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(6px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .month-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1rem;
  }

  .month-label {
    font-family: "Cinzel", serif;
    font-size: 0.95rem;
    font-weight: 600;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: var(--rust);
    white-space: nowrap;
  }

  .month-rule {
    flex: 1;
    height: 1px;
    background: linear-gradient(to right, var(--month-rule), transparent);
  }

  /* Entry groups */
  .entry-list {
    list-style: none;
    padding-left: 0.5rem;
    border-left: 2px solid var(--entry-border);
    margin-left: 0.5rem;
  }

  .entry {
    padding: 0.3rem 0 0.3rem 1.25rem;
    position: relative;
    font-size: 1rem;
    line-height: 1.4;
    color: var(--entry-color);
  }

  .entry::before {
    content: "›";
    position: absolute;
    left: 0.25rem;
    color: var(--gold);
    font-size: 1.1rem;
    line-height: 1.3;
  }

  .entry .tag {
    display: inline-block;
    font-family: "Cinzel", serif;
    font-size: 0.6rem;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    padding: 0.1em 0.45em;
    border-radius: 2px;
    margin-right: 0.4em;
    position: relative;
    line-height: 2em;
  }

  .tag-new {
    background: rgba(45, 74, 45, 0.15);
    color: var(--forest);
    border: 1px solid rgba(45, 74, 45, 0.3);
  }
  .tag-fix {
    background: rgba(139, 58, 26, 0.1);
    color: var(--rust);
    border: 1px solid rgba(139, 58, 26, 0.25);
  }
  .tag-lang {
    background: rgba(184, 134, 11, 0.12);
    color: #7a5f00;
    border: 1px solid rgba(184, 134, 11, 0.3);
  }
  .tag-perf {
    background: rgba(30, 60, 120, 0.09);
    color: #1e3c78;
    border: 1px solid rgba(30, 60, 120, 0.2);
  }
  .tag-export {
    background: rgba(80, 40, 80, 0.1);
    color: #502858;
    border: 1px solid rgba(80, 40, 80, 0.25);
  }

  /* Section divider */
  .year-divider {
    text-align: center;
    margin: 2.5rem 0;
    position: relative;
  }
  .year-divider::before {
    content: "";
    position: absolute;
    top: 50%;
    left: 0;
    right: 0;
    height: 1px;
    background: var(--gold);
    opacity: 0.3;
  }
  .year-label {
    display: inline-block;
    position: relative;
    background: var(--year-label-bg);
    padding: 0 1.2rem;
    font-family: "Cinzel", serif;
    font-size: 1.1rem;
    font-weight: 700;
    color: var(--gold);
    letter-spacing: 0.2em;
  }

  footer {
    margin-top: 3rem;
    padding-top: 1.5rem;
    border-top: 1px solid rgba(184, 134, 11, 0.25);
    text-align: center;
    font-size: 0.85rem;
    color: var(--footer-color);
    font-style: italic;
  }

  footer a {
    color: var(--rust);
    text-decoration: none;
  }
  footer a:hover {
    text-decoration: underline;
  }

  @media (max-width: 600px) {
    .page {
      padding: 2rem 1.5rem 3rem;
    }
    h1 {
      font-size: 1.8rem;
    }
  }
</style>
