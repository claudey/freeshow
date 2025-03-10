<script lang="ts">
  import { OUTPUT } from "../../../types/Channels"
  import type { Transition } from "../../../types/Show"
  import { outputs, overlays, showsCache, templates, transitionData, volume } from "../../stores"
  import { receive, send } from "../../utils/request"
  import { custom } from "../../utils/transitions"
  import Draw from "../draw/Draw.svelte"
  import { getActiveOutputs, getResolution } from "../helpers/output"
  import { _show } from "../helpers/shows"
  import Textbox from "../slide/Textbox.svelte"
  import Zoomed from "../slide/Zoomed.svelte"
  import MediaOutput from "./MediaOutput.svelte"

  export let video: any = null
  export let videoData: any = { duration: 0, paused: true, muted: false, loop: false }
  export let videoTime: number = 0
  export let title: string = ""
  export let mirror: boolean = false

  // TODO: showing slide upon clear fade out will show black output (Transition bug!)
  // TODO: dont show transition upon no change!s
  export let transition: Transition = $transitionData.text
  export let mediaTransition: Transition = $transitionData.media
  export let disableTransitions: boolean = false
  export let style = ""
  export let center: boolean = false
  export let ratio: number = 0

  // out data
  const defaultLayers: string[] = ["background", "slide", "overlays"]
  $: outputId = getActiveOutputs($outputs)[0]
  $: currentOutput = $outputs[outputId] || {}

  let layers: any = currentOutput?.show?.layers || defaultLayers
  let out: any = currentOutput?.out || {}
  let slide: any = out.slide || null
  let background: any = out.background || null

  $: if (JSON.stringify(layers) !== JSON.stringify(currentOutput?.show?.layers || defaultLayers)) layers = JSON.parse(JSON.stringify(currentOutput?.show?.layers || defaultLayers))
  $: if (JSON.stringify(out) !== JSON.stringify(currentOutput?.out || {})) out = JSON.parse(JSON.stringify(currentOutput?.out || {}))
  $: if (out.refresh || outputId || JSON.stringify(slide) !== JSON.stringify(out.slide || null)) slide = JSON.parse(JSON.stringify(out.slide || null))
  $: if (out.refresh || outputId || JSON.stringify(background) !== JSON.stringify(out.background || null)) background = JSON.parse(JSON.stringify(out.background || null))

  // transition
  $: slideData = $showsCache && slide && slide.id !== "temp" ? _show(slide.id).layouts("active").ref()[0]?.[slide.index!]?.data : null
  $: slideTextTransition = slideData ? slideData.transition : null
  $: slideMediaTransition = slideData ? slideData.mediaTransition : null
  $: transition = disableTransitions ? { type: "none" } : slideTextTransition ? slideTextTransition : $transitionData.text
  $: mediaTransition = disableTransitions ? { type: "none" } : slideMediaTransition ? slideMediaTransition : $transitionData.media
  $: overlayTransition = disableTransitions ? { type: "none" } : $transitionData.text

  const receiveOUTPUT = {
    // MAIN_VIDEO_DATA: (a: any) => {
    //   if (!mirror) return
    //   videoData = a
    //   // if (a.paused && a.time) videoTime = a.time
    // },
    // MAIN_VIDEO_TIME: (a: number) => {
    //   if (!mirror) return
    //   setTime(a)
    // },
    MAIN_VIDEO: (a: any) => {
      if (!mirror || a.id !== outputId) return
      if (a.data) videoData = a.data
      if (a.time !== undefined) setTime(a.time)
    },

    REQUEST_VIDEO_DATA: (a: string) => {
      if (mirror || a !== outputId) return
      // send(OUTPUT, ["MAIN_VIDEO_DATA"], )
      send(OUTPUT, ["MAIN_VIDEO"], { id: outputId, data: videoData, time: videoTime })
      // let video load
      setTimeout(() => {
        send(OUTPUT, ["MAIN_VIDEO"], { id: outputId, time: videoTime })
        setTimeout(() => {
          send(OUTPUT, ["MAIN_VIDEO"], { id: outputId, time: videoTime })
        }, 2000)
      }, 1500)
    },
    UPDATE_VIDEO: (a: any) => {
      if (mirror) return
      let returnData: any = { id: outputId }
      if (a.data) {
        videoData = a.data
        returnData.data = videoData
        setTimeout(() => {
          send(OUTPUT, ["MAIN_VIDEO"], { id: outputId, data: videoData })
          // send(OUTPUT, ["MAIN_VIDEO"], { id: outputId, data: videoData, time: videoTime })
        }, 500)
      }
      if (a.time !== undefined) {
        setTime(a.time)
        returnData.time = videoTime
      } else if (videoData.paused) {
        returnData.time = videoTime
        setTimeout(() => {
          if (videoData.paused) send(OUTPUT, ["MAIN_VIDEO"], { id: outputId, time: videoTime })
        }, 500)
      }
      send(OUTPUT, ["MAIN_VIDEO"], returnData)
    },
    BACKGROUND: (a: any) => {
      if (a?.loop) videoData.loop = a.loop
      if (mirror) return
      if (a?.muted) videoData.muted = a.muted
    },
    VOLUME: (a: any) => {
      if (mirror) return
      volume.set(a)
    },
  }

  // if ($currentWindow === "output" || mirror) receive(OUTPUT, receiveOUTPUT)
  receive(OUTPUT, receiveOUTPUT)

  function setTime(time: number) {
    let autoPaused: boolean = false
    if (!videoData.paused) {
      autoPaused = videoData.paused = true
    }

    // TODO: youtube seekTo
    setTimeout(() => {
      console.log(videoTime, time)
      videoTime = time

      setTimeout(() => {
        if (autoPaused) videoData.paused = false
        console.log(videoTime, time)
      }, 80)
    }, 10)
  }

  $: currentLayout = slide ? _show(slide.id).layouts([slide.layout]).ref()[0] : []
  $: currentSlide =
    slide && outputId
      ? slide.id === "temp"
        ? { items: slide.tempItems }
        : currentLayout
        ? JSON.parse(JSON.stringify(_show(slide.id).slides([currentLayout[slide.index!].id]).get()[0] || {}))
        : null
      : null

  $: if (currentSlide && currentOutput.show.template) setTemplateStyle()
  function setTemplateStyle() {
    // TODO: duplicate of history "template":1107
    let template = $templates[currentOutput.show.template]
    if (template?.items.length) {
      template.items.forEach((item: any, i: number) => {
        if (currentSlide.items[i]) {
          currentSlide.items[i].style = item.style || ""
          currentSlide.items[i].align = item.align || ""
          currentSlide.items[i].lines?.forEach((line: any, j: number) => {
            let templateLine = item.lines?.[j] || item.lines?.[0]
            line.align = templateLine?.align || ""
            line.text.forEach((text: any, k: number) => {
              text.style = templateLine?.text[k] ? templateLine.text[k].style || "" : templateLine?.text[0]?.style || ""
            })
          })
        }
      })
    }
  }

  $: resolution = getResolution(currentSlide?.settings?.resolution, currentOutput)

  // lines
  let linesStart: null | number = null
  let linesEnd: null | number = null
  $: amountOfLinesToShow = currentOutput.show?.lines !== undefined ? Number(currentOutput.show?.lines) : 0
  $: linesIndex = amountOfLinesToShow && slide ? slide.line || 0 : null
  $: linesStart = linesIndex !== null ? amountOfLinesToShow! * linesIndex : null
  $: linesEnd = linesStart !== null ? linesStart + amountOfLinesToShow! : null
</script>

<Zoomed background={currentSlide?.settings?.color || currentOutput.show?.background || "black"} {center} {style} {resolution} bind:ratio>
  {#if background && layers.includes("background")}
    <div style="zoom: {1 / ratio}">
      <MediaOutput {...background} {background} {outputId} transition={mediaTransition} bind:video bind:videoData bind:videoTime bind:title {mirror} />
    </div>
  {/if}
  {#if slide && layers.includes("slide")}
    {#key slide}
      <!-- TODO: svelte transition bug makes output unresponsive (Uncaught TypeError: Cannot read properties of null (reading 'removeChild')) -->
      <span transition:custom={transition} style="pointer-events: none;display: block;">
        {#if currentSlide}
          {#each currentSlide?.items as item}
            <Textbox {item} {ratio} ref={{ showId: slide.id, id: currentSlide.id }} {linesStart} {linesEnd} />
          {/each}
        {/if}
      </span>
    {/key}
    {#if currentOutput.show?.displayMetadata === "always" || (currentOutput.show?.displayMetadata?.includes("first") && slide.index === 0) || (currentOutput.show?.displayMetadata?.includes("last") && slide.index === currentLayout.length - 1)}
      <span
        transition:custom={transition}
        style="font-size: 30px;text-shadow: 2px 2px 4px rgb(0 0 0 / 80%);position: absolute;left: {resolution.width / 2}px;bottom: 20px;transform: translateX(-50%);opacity: 0.8;"
      >
        {Object.values($showsCache[slide.id].meta || {})
          .filter((a) => a.length)
          .join("; ")}
      </span>
    {/if}
  {/if}
  {#if out.overlays?.length && layers.includes("overlays")}
    {#each out.overlays as id}
      {#if $overlays[id]}
        <div transition:custom={overlayTransition}>
          <div>
            {#each $overlays[id].items as item}
              <Textbox {item} ref={{ type: "overlay", id }} />
            {/each}
          </div>
        </div>
      {/if}
    {/each}
  {/if}
  {#if mirror || currentOutput.active}
    <Draw />
  {/if}
</Zoomed>
