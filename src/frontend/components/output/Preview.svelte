<script lang="ts">
  import { OUTPUT } from "../../../types/Channels"
  import { activePage, activeShow, outLocked, outputs, playingAudio, presenterControllerKeys, showsCache, slideTimers } from "../../stores"
  import { send } from "../../utils/request"
  import { clearAudio } from "../helpers/audio"
  import { getActiveOutputs, getResolution, isOutCleared, refreshOut, setOutput } from "../helpers/output"
  import { getItemWithMostLines, nextSlide, previousSlide } from "../helpers/showActions"
  import { _show } from "../helpers/shows"
  import T from "../helpers/T.svelte"
  import { newSlideTimer } from "../helpers/tick"
  import { getStyleResolution } from "../slide/getStyleResolution"
  import AudioMeter from "./AudioMeter.svelte"
  import ClearButtons from "./ClearButtons.svelte"
  import Output from "./Output.svelte"
  import PreviewOutputs from "./PreviewOutputs.svelte"
  import ShowActions from "./ShowActions.svelte"
  import Audio from "./tools/Audio.svelte"
  import Media from "./tools/Media.svelte"
  import NextTimer from "./tools/NextTimer.svelte"
  import Overlay from "./tools/Overlay.svelte"
  import Show from "./tools/Show.svelte"

  $: outputId = getActiveOutputs($outputs)[0]
  let currentOutput: any = {}
  $: currentOutput = outputId ? $outputs[outputId] || {} : {}

  let callClear: boolean = false
  const ctrlShortcuts: any = {
    // c: () => (callClear = true),
    f: () => (fullscreen = !fullscreen),
    l: () => outLocked.set(!$outLocked),
    r: () => {
      if (!$outLocked) {
        // outSlide.set($outSlide)
        // outBackground.set($outBackground)
        refreshOut()
      }
    },
  }

  const shortcuts: any = {
    // presenter controller keys
    Escape: () => {
      // TODO: dont toggle drawer
      if ($presenterControllerKeys) callClear = true
      else if (fullscreen) fullscreen = false
    },
    F1: () => {
      if (!$outLocked) setOutput("background", null)
    },
    F2: () => {
      if (!$outLocked) setOutput("slide", null)
    },
    F3: () => {
      if (!$outLocked) setOutput("overlays", [])
    },
    F4: () => {
      if (!$outLocked) clearAudio()
    },
    ".": () => {
      // if ($presenterControllerKeys)
      callClear = true
    },
    F5: () => {
      if ($presenterControllerKeys) nextSlide(null, true)
      else setOutput("transition", null)
    },
    PageDown: (e: any) => {
      if ($activeShow?.type !== "show" && $activeShow?.type !== undefined) return
      if ($presenterControllerKeys) nextSlide(e)
    },
    PageUp: () => {
      if ($activeShow?.type !== "show" && $activeShow?.type !== undefined) return
      if ($presenterControllerKeys) previousSlide()
    },

    ArrowRight: (e: any) => {
      if ($activeShow?.type !== "show" && $activeShow?.type !== undefined) return
      if ($outLocked || e.ctrlKey || e.metaKey) return
      nextSlide(e)
    },
    ArrowLeft: (e: any) => {
      if ($activeShow?.type !== "show" && $activeShow?.type !== undefined) return
      if ($outLocked || e.ctrlKey || e.metaKey) return
      previousSlide()
    },
    " ": (e: any) => {
      if ($activeShow?.type !== "show" && $activeShow?.type !== undefined) return
      // TODO: ...
      if (currentOutput.out?.slide?.id !== $activeShow?.id || ($activeShow && currentOutput.out?.slide?.layout !== $showsCache[$activeShow.id].settings.activeLayout))
        nextSlide(e, true)
      else {
        if (e.shiftKey) previousSlide()
        else nextSlide(e)
      }
    },
    Home: (e: any) => {
      if ($activeShow?.type !== "show" && $activeShow?.type !== undefined) return
      nextSlide(e, true)
    },
    End: (e: any) => {
      if ($activeShow?.type !== "show" && $activeShow?.type !== undefined) return
      nextSlide(e, false, true)
    },
  }

  function keydown(e: any) {
    if ((e.ctrlKey || e.metaKey || e.altKey) && !e.metaKey && ctrlShortcuts[e.key]) {
      e.preventDefault()
      ctrlShortcuts[e.key]()
    }
    if (e.target.closest("input") || e.target.closest(".edit") || !$activeShow) return

    // ($activeShow?.type === "show" || $activeShow?.type === undefined) &&
    if (shortcuts[e.key]) {
      e.preventDefault()
      shortcuts[e.key](e)
      return
    }

    if (["media", "video", "player"].includes(currentOutput.out?.background?.type || "")) {
      e.preventDefault()
      if (e.key === " ") {
        videoData.paused = !videoData.paused
        send(OUTPUT, ["UPDATE_VIDEO"], { id: outputId, data: videoData })
        // send(OUTPUT, ["UPDATE_VIDEO_TIME"], videoTime)
      }
    }
  }

  let fullscreen: boolean = false
  $: resolution = getResolution(currentOutput.show?.resolution)

  // TODO: video gets ((removed)) if video is starting while another is fading out
  let video: any = null
  let videoData: any = {
    duration: 0,
    paused: true,
    muted: false,
    loop: false,
  }
  let videoTime: number = 0

  let title: string = ""

  // active menu
  // TODO: remember previous and go back on clear!
  let activeClear: any = null
  let autoChange: boolean = true
  $: {
    if (autoChange && $outputs) {
      // let active = getActiveClear(currentOutput.out?.transition, $playingAudio, currentOutput.out?.overlays, currentOutput.out?.slide, currentOutput.out?.background)
      let active = getActiveClear(!isOutCleared("transition"), $playingAudio, !isOutCleared("overlays"), !isOutCleared("slide"), !isOutCleared("background"))
      if (active !== activeClear) activeClear = active
    }
  }

  $: if (outputId) autoChange = true

  function getActiveClear(slideTimer: any, audio: any, overlays: any, slide: any, background: any) {
    if (slideTimer) return "nextTimer"
    if (Object.keys(audio).length) return "audio"
    //   if (overlays?.length) return "overlays"
    //   if (slide?.id) return "slide"
    if (overlays) return "overlays"
    if (slide) return "slide"
    if (background) return "background"
    return null
  }

  // slide timer
  let timer: any = {}
  $: timer = outputId && $slideTimers[outputId] ? $slideTimers[outputId] : {}
  $: {
    Object.entries($outputs).forEach(([id, output]: any) => {
      if (output.enabled && output.out?.transition && !$slideTimers[id]) {
        newSlideTimer(id, output.out.transition.duration)
      }
    })
  }

  // lines
  $: slide = currentOutput.out?.slide
  $: ref = slide ? (slide?.id === "temp" ? [{ temp: true, items: slide.tempItems }] : _show(slide.id).layouts([slide.layout]).ref()[0]) : []
  let linesIndex: null | number = null
  let maxLines: null | number = null
  $: amountOfLinesToShow = currentOutput.show?.lines !== undefined ? Number(currentOutput.show?.lines) : 0
  $: linesIndex = amountOfLinesToShow && slide ? slide.line || 0 : null
  $: showSlide = slide?.index !== undefined ? _show(slide.id).slides([ref[slide.index].id]).get()[0] : null
  $: slideLines = showSlide ? getItemWithMostLines(showSlide) : null
  $: maxLines = slideLines && linesIndex !== null ? (amountOfLinesToShow >= slideLines ? null : slideLines - (amountOfLinesToShow % slideLines)) : null
</script>

<svelte:window on:keydown={keydown} />

<div class="main">
  <PreviewOutputs bind:currentOutputId={outputId} />
  <div class="top">
    <div on:click={() => (fullscreen = !fullscreen)} class:fullscreen style={fullscreen ? "width: 100%;height: 100%;" : "width: 100%"}>
      {#if fullscreen}
        <span class="resolution">
          <!-- TODO: get actual resultion ... -->
          <p><b><T id="screen.width" />:</b> {resolution.width} <T id="screen.pixels" /></p>
          <p><b><T id="screen.height" />:</b> {resolution.height} <T id="screen.pixels" /></p>
        </span>
      {/if}
      <Output
        center={fullscreen}
        style={fullscreen ? getStyleResolution(resolution, window.innerWidth, window.innerHeight, "fit") : ""}
        mirror
        bind:video
        bind:videoData
        bind:videoTime
        bind:title
      />
      <!-- <RecordedOutput /> -->
    </div>
    <AudioMeter />
    <!-- {#if $activePage === 'live'}
    {/if} -->
  </div>

  <!-- TODO: enable stage output -->

  <!-- TODO: title keyboard shortcuts -->

  <ShowActions {currentOutput} {ref} {linesIndex} {maxLines} />

  {#if $activePage === "show"}
    <ClearButtons bind:autoChange bind:activeClear bind:video bind:videoData bind:videoTime bind:callClear />

    {#if activeClear === "background"}
      <Media {currentOutput} {outputId} {video} bind:videoData bind:videoTime bind:title />
    {:else if activeClear === "slide"}
      <Show {currentOutput} {ref} {linesIndex} {maxLines} />
    {:else if activeClear === "overlays"}
      <Overlay {currentOutput} />
    {:else if activeClear === "audio" && Object.keys($playingAudio).length}
      <Audio />
    {:else if activeClear === "nextTimer"}
      <NextTimer {currentOutput} {timer} />
    {/if}
  {/if}
</div>

<style>
  .main {
    /* max-height: 50%; */
    flex: 1;
    min-width: 50%;
  }

  .top {
    display: flex;
  }
  /* button {
    background-color: inherit;
    color: inherit;
    border: none;
  } */

  .fullscreen {
    position: fixed;
    background-color: var(--primary-darkest);
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    /* border: 4px solid var(--secondary); */
    z-index: 90;
  }
  .resolution {
    position: absolute;
    bottom: 0;
    right: 0;

    color: var(--secondary-text);
    /* background-color: var(--primary);
    background-color: black; */
    text-align: right;
    display: flex;
    flex-direction: column;
    gap: 5px;
    padding: 10px 12px;
    opacity: 0.8;
    transition: opacity ease-in-out 0.2s;

    z-index: 30;
  }
  .resolution:hover {
    opacity: 0;
  }
  .resolution p {
    display: flex;
    gap: 5px;
    justify-content: space-between;
  }
</style>
