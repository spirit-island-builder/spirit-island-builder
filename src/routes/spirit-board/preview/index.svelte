<script>
  import ParseIcons from "./parse-icons.svelte";
  import GrowthCell from "./growth-cell.svelte";
  export let spiritBoard;

  let board;

  import PresenceNode from "./presence-node.svelte";

  import { afterUpdate, onMount } from "svelte";
  onMount(() => board.ownerDocument.defaultView.dynamicResizing());
  afterUpdate(() => {
    // return;
    let window = board.ownerDocument.defaultView;
    if (!window.resizing) {
      window.resizing = true;
      window.requestIdleCallback(
        () => {
          window.resizing = false;
          window.dynamicResizing();
        },
        { timeout: 100 }
      );
    }
  });
</script>

<svelte:element this="style" />
<board bind:this={board}>
  <spirit-image
    style="background-image: url({spiritBoard.nameAndArt
      .artPath}); background-size: auto {spiritBoard.nameAndArt.artScale}; width:1700px" />
  <spirit-name
    style="background-image: url({spiritBoard.nameAndArt
      .bannerPath}); background-size: 705px 100px">
    {spiritBoard.nameAndArt.name}
  </spirit-name>
  <custom-meeple />
  <artist-name>Artist Credit: {spiritBoard.nameAndArt.artistName || ""}</artist-name>
  <special-rules-container>
    <section-title>SPECIAL RULES</section-title>
    {#each spiritBoard.specialRules.rules as rule}
      <special-rules-subtitle>{rule.name}</special-rules-subtitle>
      <special-rule><div><ParseIcons text={rule.effect} /></div></special-rule>
    {/each}
  </special-rules-container>

  {#if spiritBoard.nameAndArt.artistCredit}
    <artist-name>
      Artist Credit: {spiritBoard.nameAndArt.artistCredit}
    </artist-name>
  {/if}

  <right>
    <growth>
      <section-title>
        Growth
        {#if !spiritBoard.growth.useGrowthSets}
          ({spiritBoard.growth.directions})
        {/if}
      </section-title>
      <growth-table>
        {#each spiritBoard.growth.growthSets as growthSet, setIndex}
          {#each growthSet.growthGroups as growthGroup, groupIndex}
            <growth-group>
              {#each growthGroup.growthActions as growthAction}
                <GrowthCell effect={growthAction.effect} />
              {/each}
            </growth-group>
            {#if groupIndex + 1 < growthSet.growthGroups.length}
              <growth-border />
            {/if}
          {/each}
          <!-- </growth-set> -->
          {#if setIndex + 1 < spiritBoard.growth.growthSets.length}
            <growth-border double />
          {/if}
        {/each}
      </growth-table>
    </growth>

    <presence-tracks>
      <presence-title
        ><section-title class:has-note={spiritBoard.presenceTrack.note}>Presence</section-title
        ></presence-title>
      {#if spiritBoard.presenceTrack.note}<note
          ><ParseIcons text={spiritBoard.presenceTrack.note} /></note
        >{/if}
      <table id="presence-table">
        <tbody>
          <tr
            class="energy-track"
            style={spiritBoard.nameAndArt.energyBannerPath
              ? `background-image: url("${spiritBoard.nameAndArt.energyBannerPath}"); ` +
                `background-size: ${spiritBoard.presenceTrack.energyNodes.length * 130 + 15}px ${
                  spiritBoard.nameAndArt.energyBannerScale
                }; ` +
                `background-repeat: no-repeat; background-position: left 0px top 20px;`
              : null}>
            <td style="width: 10px" />
            {#each spiritBoard.presenceTrack.energyNodes as energyNode, i}
              <td>
                <PresenceNode
                  effect={energyNode.effect}
                  first={i === 0}
                  trackType="energy"
                  addEnergyRing={true} />
              </td>
            {/each}
          </tr>
          <tr
            class="plays-track"
            style={spiritBoard.nameAndArt.playsBannerPath
              ? `background-image: url("${spiritBoard.nameAndArt.playsBannerPath}"); ` +
                `background-size: ${spiritBoard.presenceTrack.playsNodes.length * 130 + 15}px ${
                  spiritBoard.nameAndArt.playsBannerScale
                }; ` +
                `background-repeat: no-repeat; background-position: left 0px top 20px;`
              : null}>
            <td style="width: 10px" />
            {#each spiritBoard.presenceTrack.playsNodes as playsNode, i}
              <td>
                <PresenceNode
                  effect={playsNode.effect}
                  first={i === 0}
                  trackType="card"
                  addEnergyRing={false} />
              </td>
            {/each}
          </tr>
        </tbody>
      </table>
    </presence-tracks>

    <innate-powers>
      <section-title>Innate Powers</section-title>
      <innate-power-container>
        {#each spiritBoard.innatePowers.powers as power}
          <innate-power class={power.speed.toLowerCase()}>
            <innate-power-title>{power.name}</innate-power-title>
            <info-container
              ><info-title>
                <info-title-speed>SPEED</info-title-speed>
                <info-title-range>RANGE</info-title-range>
                <info-title-target>{power.targetTitle}</info-title-target>
              </info-title><innate-info>
                <innate-info-speed />
                <innate-info-range>
                  {#if power.range === "none" || power.range === ""}
                    <no-range />
                  {:else}
                    {#each power.range.split(",") as item}
                      {#if !isNaN(item)}
                        <range>{item}</range>
                      {:else}
                        <icon class={item} />
                      {/if}
                    {/each}
                  {/if}
                </innate-info-range>
                <innate-info-target><ParseIcons text={power.target} /></innate-info-target>
              </innate-info></info-container>
            <description-container>
              {#if power.note}<note><ParseIcons text={power.note} /></note>{/if}
              {#each power.levels as level}
                <level>
                  <threshold>
                    {#each level.threshold.split(",") as thresholdPiece}
                      {#if thresholdPiece.toUpperCase() === "OR"}
                        <threshold-or>or</threshold-or>
                      {:else}
                        <!-- TODO -->
                        {@const [number, ...rest] = thresholdPiece.split("-")}
                        {#if number.toUpperCase() === "COST"}
                          <cost-threshold
                            >Cost<cost-energy><value>-{rest[0]}</value></cost-energy
                            ></cost-threshold>
                        {:else}
                          {number}<ParseIcons text={"{" + rest.join("-") + "}"} />
                        {/if}
                      {/if}
                    {/each}
                  </threshold>
                  <div class="description" class:long={level.isLong}>
                    <div><ParseIcons text={level.effect} /></div>
                  </div>
                </level>
              {/each}
            </description-container>
          </innate-power>
        {/each}
      </innate-power-container>
    </innate-powers>
  </right>
</board>
