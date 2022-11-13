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

export type Colour = 'white' | 'red' | 'yellow' | 'green' | 'cyan' | 'blue'
