<script lang="ts">
  import { activePopup, alertUpdates, fullColors, groupNumbers, formatNewShow, labelsDisabled, showsPath, splitLines, autoOutput } from "../../../stores"
  import { setLanguage } from "../../../utils/language"
  import Icon from "../../helpers/Icon.svelte"
  import T from "../../helpers/T.svelte"
  import Button from "../../inputs/Button.svelte"
  import Checkbox from "../../inputs/Checkbox.svelte"
  import FolderPicker from "../../inputs/FolderPicker.svelte"
  import NumberInput from "../../inputs/NumberInput.svelte"
  import LocaleSwitcher from "../LocaleSwitcher.svelte"

  const inputs: any = {
    updates: (e: any) => alertUpdates.set(e.target.checked),
    labels: (e: any) => labelsDisabled.set(e.target.checked),
    colors: (e: any) => fullColors.set(e.target.checked),
    formatNewShow: (e: any) => formatNewShow.set(e.target.checked),
    groupNumber: (e: any) => groupNumbers.set(e.target.checked),
    autoOutput: (e: any) => autoOutput.set(e.target.checked),
  }

  // const projectNames: any[] = ["date", "today", "sunday", "week", "custom", "blank"].map((id) => ({ name: "$:projectName.${" + id + "}:$", id }))

  function reset() {
    setLanguage(null)
    alertUpdates.set(true)
    labelsDisabled.set(false)
    fullColors.set(false)
    groupNumbers.set(true)
    autoOutput.set(false)
  }
</script>

<div>
  <p><T id="settings.language" /></p>
  <LocaleSwitcher />
</div>
<div>
  <p><T id="settings.alert_updates" /></p>
  <!-- style="width: 200px;" -->
  <Checkbox checked={$alertUpdates} on:change={inputs.updates} />
</div>
<div>
  <p><T id="settings.auto_output" /></p>
  <Checkbox checked={$autoOutput} on:change={inputs.autoOutput} />
</div>
<div>
  <p><T id="settings.disable_labels" /></p>
  <!-- style="width: 200px;" -->
  <Checkbox checked={$labelsDisabled} on:change={inputs.labels} />
</div>
<hr />
<div>
  <p><T id="settings.group_numbers" /></p>
  <Checkbox checked={$groupNumbers} on:change={inputs.groupNumber} />
</div>
<div>
  <p><T id="settings.full_colors" /></p>
  <Checkbox checked={$fullColors} on:change={inputs.colors} />
</div>
<div>
  <p><T id="settings.format_new_show" /></p>
  <Checkbox checked={$formatNewShow} on:change={inputs.formatNewShow} />
</div>
<div>
  <p><T id="settings.split_lines" /></p>
  <NumberInput
    value={$splitLines}
    max={100}
    buttons={false}
    outline
    on:change={(e) => {
      splitLines.set(e.detail)
    }}
  />
</div>
<!-- <div>
  <p><T id="settings.default_project_name" /></p>
  <Dropdown
    options={projectNames}
    value={$defaultProjectName}
    style="width: 200px;"
    on:click={(e) => {
      // history?
      defaultProjectName.set(e.detail.id)
    }}
  />
</div> -->

<!-- TODO: video / image extensions -->
<!-- <div>
  <p><T id="settings.video_extensions" /></p>
  <span class="flex">
    <span style="text-transform: uppercase;margin-right: 10px;">
      {#each $videoExtensions as extension, i}
        {#if i > 0},&nbsp;{/if}<span class="hoverDelete" on:click={() => videoExtensions.set($videoExtensions.filter((a) => a !== extension))}>{extension}</span>
      {/each}
    </span>
    <TextInput value={value.video} on:input={(e) => changeValue(e, "video")} light />
    <Button
      on:click={() => {
        if (!$videoExtensions.includes(value.video.toLowerCase())) {
          videoExtensions.set([...$videoExtensions, value.video.toLowerCase()])
          value.video = ""
        }
      }}
    >
      <p><T id="settings.add" /></p>
    </Button>
  </span>
</div>
<div>
  <p><T id="settings.image_extensions" /></p>
  <span class="flex">
    <span style="text-transform: uppercase;margin-right: 10px;">
      {#each $imageExtensions as extension, i}
        {#if i > 0},&nbsp;{/if}<span class="hoverDelete" on:click={() => imageExtensions.set($imageExtensions.filter((a) => a !== extension))}>{extension}</span>
      {/each}
    </span>
    <TextInput value={value.image} on:input={(e) => changeValue(e, "image")} light />
    <Button
      on:click={() => {
        if (!$imageExtensions.includes(value.image.toLowerCase())) {
          imageExtensions.set([...$imageExtensions, value.image.toLowerCase()])
          value.image = ""
        }
      }}
    >
      <p><T id="settings.add" /></p>
    </Button>
  </span>
</div> -->
<div>
  <p><T id="settings.show_location" /></p>
  <span class="shows_path" title={$showsPath}>
    <p>{$showsPath}</p>
    <FolderPicker id="shows">
      <T id="inputs.change_folder" />
    </FolderPicker>
  </span>
</div>

<hr />
<!-- <Button style="width: 100%;" center><T id="settings.export_settings" /></Button> -->
<!-- <Button style="width: 100%;" center><T id="settings.import_all" /></Button>
<Button style="width: 100%;" center><T id="settings.export_all" /></Button> -->
<Button style="width: 100%;" on:click={reset} center>
  <Icon id="reset" right />
  <T id="actions.reset" />
</Button>
<Button style="width: 100%;" on:click={() => activePopup.set("reset_all")} center>
  <Icon id="reset" right /><T id="settings.reset_all" />
</Button>

<!-- project store location... -->
<style>
  div:not(.scroll) {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin: 5px 0;
    /* height: 35px; */
    min-height: 38px;
  }
  /* .flex {
    display: flex;
    align-items: center;
  }
  .flex span {
    display: flex;
  }

  .hoverDelete:hover {
    color: #ff5050;
    text-decoration: line-through;
  } */

  .shows_path {
    display: flex;
    align-items: center;
    max-width: 70%;
  }
  .shows_path :global(button) {
    white-space: nowrap;
  }

  hr {
    margin: 20px 0;
    border: none;
    height: 2px;
    background-color: var(--primary-lighter);
  }

  div :global(.numberInput) {
    width: 80px;
  }
</style>
