import { LoadingOutlined } from '@ant-design/icons'
import { Alert, Button, Card, Spin } from 'antd'
import { useState } from 'react'
import styled from 'styled-components'

import { Colour, Position } from 'src/components/Types'
import Map from 'src/components/map'
import Palette from 'src/components/palette'
import { useApiContext } from 'src/context/ApiContext'

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
  const [position, setPosition] = useState<Position>({
    x: 0,
    y: 0,
    scale: 1
  })
  // The colour of the tile we are placing
  const [cursorColour, setCursorColour] = useState<Colour>()

  const apiContext = useApiContext()

  if (apiContext.status === 'idle')
    return (
      <AlertCenterer>
        <CenteredAlert
          message='Please select a guild in the top right corner'
          type='info'
        />
      </AlertCenterer>
    )
  if (apiContext.status === 'loading')
    return <CenterSpinner size='large' indicator={<LoadingOutlined spin />} />
  if (apiContext.status === 'error')
    return <Button onClick={() => apiContext.retry()}>Error, retry</Button>

  return (
    <>
      <Map
        image={apiContext.image}
        setPosition={setPosition}
        // TODO, not a colour.
        cursorColour={placing ? cursorColour : undefined}
      />
      <Container>
        {/* Upper view with current pixel position*/}
        <CoordinateBox size='small'>
          ({position.x}, {position.y}) {position.scale}x
        </CoordinateBox>
        {/* Lower 'footer' view
           Palette if we have selected a tile and are placing, button otherwise */}
        <Footer>
          {placing ? (
            <Palette
              onClose={() => setPlacing(false)}
              colour={cursorColour}
              onSelectColour={setCursorColour}
              onAccept={() =>
                apiContext.setPixel(position.x, position.y, cursorColour!)
              }
            />
          ) : (
            <PaintButton
              type='primary'
              size='large'
              onClick={() => setPlacing(true)}
            >
              paint tile
            </PaintButton>
          )}
        </Footer>
      </Container>
    </>
  )
}

const AlertCenterer = styled.div`
  height: 100vh;

  display: grid;
  place-items: center;

  grid-template-rows: 1fr auto 1fr;
`

const CenteredAlert = styled(Alert)`
  grid-row: 2;
`

const Container = styled.div`
  width: 100vw;
  height: 100vh;
  margin: 0 auto;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
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

const CoordinateBox = styled(Card)`
  top: 3vw;
  position: absolute;
  z-index: 3;
`

const PaintButton = styled(Button)``

const CenterSpinner = styled(Spin)`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
`
