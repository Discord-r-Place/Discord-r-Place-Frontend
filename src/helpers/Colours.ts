import { Colour, ColourPalette } from 'src/components/Types'

export function toCSS(colour: Colour): string {
  return `rgb(${colour.r}, ${colour.g}, ${colour.b})`
}

export function colourFromPalette(palette: ColourPalette, index: number) {
  return index >= 0 && index < palette.length ? toCSS(palette[index]) : '#FF00FF'
}