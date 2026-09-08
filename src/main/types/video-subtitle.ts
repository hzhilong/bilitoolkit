export interface Subtitle {
  font_size: number
  font_color: string
  background_alpha: number
  background_color: string
  Stroke: string
  type: string
  lang: string
  version: string
  body: SubtitleItem[]
}

export interface SubtitleItem {
  from: number
  to: number
  sid: number
  location: number
  content: string
  music: number
}
