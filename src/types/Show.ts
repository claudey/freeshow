import type { Resolution } from "./Settings"

export interface Shows {
  [key: string]: Show
}

export interface Show {
  name: string
  private?: boolean
  category: null | ID
  settings: {
    activeLayout: ID
    resolution?: Resolution
    template: null | ID
  }
  timestamps: {
    created: number
    modified: null | number
    used: null | number
  }
  meta: {
    title?: string
    artist?: string
    license?: string
    key?: string
  }
  slides: { [key: ID]: Slide }
  layouts: { [key: ID]: Layout }
  media: { [key: ID]: Media }
}

export interface Slide {
  group: null | string
  color: null | string
  globalGroup?: string
  settings: {
    background?: boolean
    color?: string
    resolution?: Resolution
  }
  children?: string[]
  notes: string
  items: Item[]
  stageItems?: Item[]
}

export interface Item {
  id?: string
  lines?: Line[]
  auto?: boolean
  style: string
  align?: string
  media?: any
  timer?: Timer
  type?: ItemType
  // tag?: string; // p, div????
}

export interface Timer {
  id: string
  name: string
  type?: "countdown"
  start: number
  end: number
  format: string
  paused?: boolean
}

export interface Line {
  align: string
  text: {
    value: string
    style: string
  }[]
}

export interface Layout {
  name: string
  notes: string
  slides: SlideData[]
}

export interface SlideData {
  id: ID
  disabled?: boolean
  parent?: ID // layout ref
  children?: any // layout slide
  color?: null | string
  // TODO: this is next slide timer
  nextTimer?: number
  transition?: Transition
  end?: boolean
  timer?: number
  background?: string // set backgorund action?
  overlays?: string[]
  audio?: string[]

  actions?: {
    clearBackground?: boolean
    clearOverlays?: boolean
    clearAudio?: boolean
  }
  // actions?: {} // to begininng / index, clear (all), start timer, start audio/music ++
}

export interface Transition {
  type: TransitionType
  duration: number
  easing: string
}

export interface Media {
  // name?: string
  id?: string
  name?: string
  path?: string
  type?: MediaType
  muted?: boolean
  loop?: boolean
  filters?: string
}

//

export interface Overlays {
  [key: ID]: Overlay
}
export interface Overlay {
  name: string
  color: null | string
  category: null | string
  items: Item[]
}

export interface Templates {
  [key: ID]: Template
}
export interface Template {
  name: string
  color: null | string
  category: null | string
  items: Item[]
}

// output

export interface OutBackground {
  id?: ID
  path?: string
  name?: string
  startAt?: number
  muted?: boolean
  loop?: boolean
  filter?: string
  flipped?: boolean
  // name?: string
  type?: MediaType
}

export interface OutSlide {
  id: ID
  layout?: ID
  index?: number
  tempItems?: Item[]
  line?: number
  // layout: ID ?
  // type?: ShowType
  // private?: boolean
}

export interface OutTransition {
  // action: string
  // slide?: number
  duration: number
}

// types

export type ID = string
export type ItemType = "text" | "shape" | "image" | "video" | "audio" | "icon" | "timer"
export type ShowType = "show" | "image" | "video" | "audio" | "player" // "private"
export type TransitionType = "none" | "blur" | "fade" | "fly" | "scale" | "slide" | "spin"
export type MediaType = "media" | "video" | "image" | "screen" | "camera" | "player" | "audio"
