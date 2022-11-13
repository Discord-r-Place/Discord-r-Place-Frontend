import { useQuery } from '@tanstack/react-query'
import getConfig from 'next/config'
import { useEffect } from 'react'

import { Colour } from 'src/components/Types'

export function useApi(
  serverId: number,
  accessToken: string,
  onPixelChange: (data: Pixel) => void
): ImageData | undefined {
  useEffect(() => {
    const {
      publicRuntimeConfig: { WS_URL }
    } = getConfig()

    const ws = new WebSocket(`${WS_URL}${serverId}`)

    ws.onopen = () => {
      ws.send(accessToken)
    }

    ws.onmessage = (event) => {
      // TODO
      console.log(event.data)
      // onPixelChange(JSON.parse(event.data))
    }
  }, [accessToken, serverId])

  const { data: image } = useQuery(['image', serverId], async () => {
    // getpublic runtime config
    const {
      publicRuntimeConfig: { API_URL }
    } = getConfig()

    const response = await fetch(`${API_URL}${serverId}/image`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    })

    const blob = await response.blob()

    const buffer = await blob.arrayBuffer()
    const dimensions = new Uint8Array(buffer.slice(0, 4))

    const width = dimensions[0] * 256 + dimensions[1]
    const height = dimensions[2] * 256 + dimensions[3]
    const image = new Uint8Array(buffer.slice(4))

    return { width, height, image }
  })

  return image
}

type Pixel = {
  x: number
  y: number
  colour: Colour
}

type ImageData = {
  width: number
  height: number
  image: Uint8Array
}
