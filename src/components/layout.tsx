import { Button, Spin } from 'antd'
import { useState } from 'react'
import styled from 'styled-components'

import { Colour, Position } from 'src/components/Types'
import Map from 'src/components/map'
import Palette from 'src/components/palette'
import { useApiContext } from 'src/context/ApiContext'
import { colourFromPalette, toCSS } from 'src/helpers/Colours'

export const pixelSize = 1

export default function Layout() {
  // Whether we have selected a tile and are placing/painting it
  const [placing, setPlacing] = useState(false)
  const [currentPosition, setPosition] = useState<Position>({
    x: 0,
    y: 0,
    scale: 1
  })
  // The colourIndex of the tile we are placing
  const [cursorColourIndex, setCursorColourIndex] = useState<number>()

  const apiContext = useApiContext()

  if (apiContext.status === 'idle') return <div>Select Guild</div>
  if (apiContext.status === 'loading') return <CenterSpinner size='large' />
  if (apiContext.status === 'error')
    return <Button onClick={() => apiContext.retry()}>Error, retry</Button>

  return (
    <>
      <Map
        image={apiContext.image}
        setPosition={setPosition}
        // TODO, not a colour.
        cursorColour={placing ? (cursorColourIndex != undefined ? colourFromPalette(apiContext.image.palette, cursorColourIndex) : undefined) : `url('/cursor.svg')`}
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
              current palette colour: {cursorColourIndex != undefined ? colourFromPalette(apiContext.image.palette, cursorColourIndex) : 'none'}
              <Palette
                onClose={() => setPlacing(false)}
                onSelectColourIndex={setCursorColourIndex}
                onAccept={() =>
                  apiContext.setPixel(
                    currentPosition.x,
                    currentPosition.y,
                    cursorColourIndex!
                  )
                }
                palette={apiContext.image.palette}
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
  z-index: 3;
`

const PaintButton = styled.button`
  color: white;
  background-color: gray;
  margin: 1vh;
  padding: 2vh;
  border-radius: 2.5vh;
`

const CenterSpinner = styled(Spin)`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
`
