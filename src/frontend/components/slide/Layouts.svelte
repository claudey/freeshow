<script lang="ts">
  import { uid } from "uid"
  import { activePopup, activeProject, activeShow, dictionary, projects, showsCache, slidesOptions } from "../../stores"
  import { history } from "../helpers/history"
  import Icon from "../helpers/Icon.svelte"
  import T from "../helpers/T.svelte"
  import Button from "../inputs/Button.svelte"
  import HiddenInput from "../inputs/HiddenInput.svelte"
  import Center from "../system/Center.svelte"
  import SelectElem from "../system/SelectElem.svelte"

  $: active = $activeShow!.id
  $: layouts = $showsCache[active]?.layouts
  $: activeLayout = $showsCache[active]?.settings?.activeLayout

  $: sortedLayouts = Object.entries(layouts || {})
    .map(([id, layout]: any) => ({ id, ...layout }))
    .sort((a, b) => a.name.localeCompare(b.name))

  function addLayout(e: any) {
    let newData: any = { id: uid(), layout: { name: "", notes: "", slides: [] } }
    if (e.ctrlKey || e.metaKey) {
      newData.layout = { ...$showsCache[$activeShow!.id].layouts[$showsCache[$activeShow!.id].settings.activeLayout] }
    }
    history({ id: "addLayout", oldData: null, newData, location: { page: "show", show: $activeShow! } })
  }

  const slidesViews: any = { grid: "list", list: "lyrics", lyrics: "grid" }

  function changeName(e: any) {
    history({ id: "changeLayoutKey", newData: { key: "name", value: e.detail.value }, location: { page: "show", show: $activeShow!, layout: activeLayout } })
  }

  function setLayout(id: string) {
    showsCache.update((s) => {
      s[active].settings.activeLayout = id
      return s
    })

    // set active layout in project
    if (
      ($activeShow?.type === undefined || $activeShow?.type === "show") &&
      $activeShow?.index !== undefined &&
      $activeProject &&
      $projects[$activeProject].shows[$activeShow.index]
    ) {
      projects.update((a) => {
        a[$activeProject!].shows[$activeShow!.index!].layout = id
        return a
      })
    }
  }

  let edit: boolean = false
</script>

<div>
  {#if layouts}
    <!-- TODO: rename clitching -->
    <span style="display: flex;overflow-x: auto;">
      <!-- width: 100%; -->
      {#each sortedLayouts as layout}
        <!-- <SelectElem id="layout" data={id} borders="edges" trigger="row" draggable fill> -->
        <SelectElem id="layout" data={layout.id} fill>
          <Button
            class="context #layout"
            on:click={() => {
              if (!edit) setLayout(layout.id)
            }}
            active={activeLayout === layout.id}
            center
          >
            <!-- style="width: 100%;" -->
            <HiddenInput value={layout.name} id={"layout_" + layout.id} on:edit={changeName} bind:edit />
          </Button>
        </SelectElem>
      {/each}
    </span>
  {:else}
    <Center faded>
      <T id="error.no_layouts" />
    </Center>
  {/if}
  <span style="display: flex; align-items: center;">
    <!-- TODO: CTRL click = copy current layout, also right click... -->
    {#if layouts}
      <Button on:click={addLayout} title={$dictionary.show?.new_layout}>
        <Icon size={1.3} id="add" />
      </Button>
    {/if}
    <div class="seperator" />
    <Button on:click={() => activePopup.set("transition")} title={$dictionary.popup?.transition}>
      <Icon size={1.3} id="transition" white />
    </Button>
    <Button on:click={() => slidesOptions.set({ ...$slidesOptions, mode: slidesViews[$slidesOptions.mode] })} title={$dictionary.show?.[$slidesOptions.mode]}>
      <Icon size={1.3} id={$slidesOptions.mode} white />
    </Button>
    <Button
      disabled={$slidesOptions.columns >= 10}
      on:click={() => slidesOptions.set({ ...$slidesOptions, columns: Math.min(10, $slidesOptions.columns + 1) })}
      title={$dictionary.actions?.zoomOut}
    >
      <Icon size={1.3} id="remove" white />
    </Button>
    <Button
      disabled={$slidesOptions.columns <= 2}
      on:click={() => slidesOptions.set({ ...$slidesOptions, columns: Math.max(2, $slidesOptions.columns - 1) })}
      title={$dictionary.actions?.zoomIn}
    >
      <Icon size={1.3} id="add" white />
    </Button>
    <p class="text">{(100 / $slidesOptions.columns).toFixed()}%</p>
  </span>
</div>

<style>
  div {
    display: flex;
    justify-content: space-between;
    width: 100%;
    /* height: 50px; */
    background-color: var(--primary);
    border-top: 3px solid var(--primary-lighter);
    /* box-shadow: 0px -2px 2px rgb(0 0 0 / 40%); */
  }

  .text {
    opacity: 0.8;
    text-align: right;
    width: 50px;
    margin-right: 10px;
  }

  .seperator {
    width: 3px;
    height: 100%;
    background-color: var(--primary-lighter);
    /* margin: 0 10px; */
  }
</style>
