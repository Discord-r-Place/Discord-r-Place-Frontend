export type Point = {
  x: number
  y: number
}

export type Position = {
  x: number
  y: number
  scale: number
}

export type Size = {
  width: number
  height: number
}

export type Tile = {
  x: number
  y: number
  colour: string
}

export type Image = {
  width: number
  height: number
  data: Uint8Array
  palette: ColourPalette
}

export type ColourPalette = [Colour]

export type Colour = { readonly r: number; readonly g: number; readonly b: number }
