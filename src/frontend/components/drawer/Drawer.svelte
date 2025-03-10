<script lang="ts">
  import type { Bible } from "../../../types/Scripture"
  import { activeDrawerTab, activePage, activeProject, activeShow, dictionary, drawer, drawerTabsData, labelsDisabled, os, previousShow, projects } from "../../stores"
  import { drawerTabs } from "../../values/tabs"
  import Content from "../drawer/Content.svelte"
  import Navigation from "../drawer/Navigation.svelte"
  import { history } from "../helpers/history"
  import Icon from "../helpers/Icon.svelte"
  import { selectTextOnFocus } from "../helpers/inputActions"
  import T from "../helpers/T.svelte"
  import Button from "../inputs/Button.svelte"
  import Resizeable from "../system/Resizeable.svelte"
  import Info from "./info/Info.svelte"

  const minHeight = 40
  let maxHeight = window.innerHeight - 50 - ($os.platform === "win32" ? 30 : 0)
  let defaultHeight: number = 300
  $: height = $drawer.height

  let move: boolean = false
  let mouse: null | { x: number; y: number; offsetY: number } = null
  function mousedown(e: any) {
    if (!e.target.classList.contains("top")) return

    maxHeight = window.innerHeight - 50 - ($os.platform === "win32" ? 30 : 0)
    mouse = {
      x: e.clientX,
      y: e.clientY,
      offsetY: window.innerHeight - height - e.clientY,
    }
  }

  function mousemove(e: any) {
    if (!mouse) return

    autoDrawer = false
    drawer.set({ height: getHeight(window.innerHeight - e.clientY - mouse.offsetY), stored: null })
  }

  function getHeight(height: any) {
    if (height < minHeight * 2) return minHeight
    if (height > maxHeight) return maxHeight
    move = true
    return height
  }

  $: storeHeight = $drawer.stored
  function click(e: any) {
    if (move || e?.target instanceof HTMLInputElement) {
      move = false
      return
    }

    if (height > minHeight) {
      if (e === null || e?.target.classList.contains("top")) drawer.set({ height: minHeight, stored: height })
      return
    }

    drawer.set({ height: storeHeight === null || storeHeight < defaultHeight ? defaultHeight : storeHeight, stored: null })
  }

  function mouseup(e: any) {
    mouse = null
    if (!e.target.closest(".top")) move = false
  }

  // TODO: serach for each drawer menu
  // TODO: better search! (not seperated by comma...)
  let searchValue = ""
  $: searchValue = searchValue.endsWith(" ") ? removeWhitespace(searchValue) + " " : removeWhitespace(searchValue)
  $: if ($activeDrawerTab) searchValue = ""
  const removeWhitespace = (v: string) =>
    v
      .split(" ")
      .filter((n) => n)
      .join(" ")
  function search() {
    if (storeHeight === null) return

    autoDrawer = true
    click(null)
    // if ($activeDrawerTab === "shows") {
    // }
  }

  let bible: Bible = {
    version: null,
    book: null,
    chapter: null,
    verses: [],
    activeVerses: [],
  }

  let firstMatch: null | any = null
  let searchElem: any
  let autoDrawer: boolean = false
  function keydown(e: any) {
    if (document.activeElement === document.body && !e.ctrlKey && !e.metaKey && !e.altKey) {
      // Alphabet upper case | Alphabet lower case
      if (/^[A-Z]{1}$/i.test(e.key)) searchElem.focus()
    } else if (e.key === "Enter") {
      // TODO: first match
      if (document.activeElement !== searchElem || !searchValue.length || !firstMatch || !$activeProject) return

      console.log(firstMatch)
      searchElem.select()
      if ($activePage === "show") history({ id: "addShowToProject", newData: { id: firstMatch.id }, location: { page: "show", project: $activeProject } })
      activeShow.set({ ...firstMatch, index: $projects[$activeProject].shows.length - 1 })
      searchValue = ""

      if (!autoDrawer || storeHeight !== null) {
        click(null)
        autoDrawer = false
      }
    }
  }

  $: {
    if ($activeShow?.type === undefined || $activeShow?.type === "show") previousShow.set(JSON.stringify($activeShow))
    // else if ($activeDrawerTab === "shows" && $previousShow !== null) {
    //   activeShow.set(JSON.parse($previousShow))
    //   previousShow.set(null)
    // }
  }

  $: tabs = Object.entries(drawerTabs).map(([id, tab]: any) => ({ id, ...tab }))
</script>

<svelte:window on:mouseup={mouseup} on:mousemove={mousemove} on:keydown={keydown} />

<!-- <Resizeable id="drawer" side="bottom" minWidth={50}> -->
<section class="drawer" style="height: {height}px">
  <div class="top context #drawer_top" on:mousedown={mousedown} on:click={click}>
    <span class="tabs">
      {#each tabs as tab}
        {#if $drawerTabsData[tab.id].enabled}
          <Button
            on:click={() => activeDrawerTab.set(tab.id)}
            active={$activeDrawerTab === tab.id}
            class="context #drawer_top"
            title={$labelsDisabled ? $dictionary[tab.name.split(".")[0]]?.[tab.name.split(".")[1]] : ""}
          >
            <Icon id={tab.icon} size={1.3} />
            {#if !$labelsDisabled}
              <span><T id={tab.name} /></span>
            {/if}
          </Button>
        {/if}
      {/each}
    </span>
    <input bind:this={searchElem} class="search edit" type="text" placeholder="{$dictionary.main?.search}..." bind:value={searchValue} on:input={search} use:selectTextOnFocus />
  </div>
  <div class="content">
    <Resizeable id={"drawerNavigation"}>
      <Navigation id={$activeDrawerTab} />
    </Resizeable>
    <Content id={$activeDrawerTab} bind:searchValue bind:firstMatch bind:bible />
    <Resizeable id={"drawerInfo"} side="right">
      <Info id={$activeDrawerTab} {bible} />
    </Resizeable>
  </div>
</section>

<style>
  section {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100px;
    z-index: 20;

    background-color: var(--primary);
  }

  .top {
    position: relative;
    height: 40px;
    display: flex;
    justify-content: space-between;
    padding-top: 4px;
  }
  .top::after {
    content: "";
    background-color: var(--primary-lighter);
    position: absolute;
    top: 0;
    width: 100%;
    height: 4px;
    cursor: ns-resize;
  }

  .top .tabs {
    display: flex;
    overflow-x: auto;
    overflow-y: hidden;
  }
  .top .tabs span {
    margin-left: 0.5em;
  }

  .search {
    background-color: rgb(0 0 0 / 0.2);
    color: var(--text);
    /* font-family: inherit; */
    width: 300px;
    /* width: 50%; */
    padding: 0 8px;
    border: none;
    border-left: 4px solid var(--primary-darker);
  }
  .search:active,
  .search:focus {
    outline: 2px solid var(--secondary);
  }
  .search::placeholder {
    color: inherit;
    opacity: 0.4;
  }

  .content {
    display: flex;
    height: calc(100% - 40px);
    justify-content: space-between;
  }
</style>
