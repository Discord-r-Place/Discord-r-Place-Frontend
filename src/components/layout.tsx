import { useState } from 'react'
import styled from 'styled-components'

import { Colour, Position } from 'src/components/Types'
import Map from 'src/components/map'
import Palette from 'src/components/palette'

export const pixelSize = 1
// Mock palette colours
export const colours: Colour[] = [
  'white',
  'red',
  'yellow',
  'green',
  'cyan',
  'blue'
]

export default function Layout() {
  // Whether we have selected a tile and are placing/painting it
  const [placing, setPlacing] = useState(false)
  const [currentPosition, setPosition] = useState<Position>({
    x: 0,
    y: 0,
    scale: 1
  })
  // The colour of the tile we are placing
  const [cursorColour, setCursorColour] = useState<Colour>()

  /**
   * Send pixel update to server
   */
  function updatePixel() {
    console.log(
      `TODO: pixel (${currentPosition.x}, ${currentPosition.y}) is now ${cursorColour}, send to server`
    )
  }

  return (
    <>
      <Map
        setPosition={setPosition}
        // TODO, not a colour.
        cursorColour={placing ? cursorColour : `url('/cursor.svg')`}
      />
      <Container>
        {/* Upper view with current pixel position*/}
        <CoordinateBox>
          {currentPosition.x}, {currentPosition.y}, {currentPosition.scale}x
        </CoordinateBox>
        {/* Lower 'footer' view
           Palette if we have selected a tile and are placing, button otherwise */}
        <Footer>
          {placing ? (
            <PalleteBox
              style={{
                width: '100vw'
              }}
            >
              current palette colour: {cursorColour}
              <Palette
                onClose={() => setPlacing(false)}
                onSelectColour={setCursorColour}
                onAccept={updatePixel}
              />
            </PalleteBox>
          ) : (
            <PaintButton onClick={() => setPlacing(true)}>
              paint tile
            </PaintButton>
          )}
        </Footer>
      </Container>
    </>
  )
}

const Container = styled.div`
  width: 100vw;
  height: 100vh;
  margin: 0 auto;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
`

const Box = styled.div`
  color: white;
  background-color: gray;
  margin: 1vh;
  padding: 2vh;
  border-radius: 2.5vh;
`

const PalleteBox = styled(Box)`
  display: flex;
  flex-direction: column;
  align-items: center;
`

const Footer = styled.div`
  bottom: 5vw;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: absolute;

  z-index: 3;
`

const CoordinateBox = styled(Box)`
  top: 3vw;
  position: absolute;
`

const PaintButton = styled.button`
  color: white;
  background-color: gray;
  margin: 1vh;
  padding: 2vh;
  border-radius: 2.5vh;
`
