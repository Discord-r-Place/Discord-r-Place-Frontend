import { useQuery } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import getConfig from 'next/config'
import { createContext, useContext, useEffect, useRef, useState } from 'react'

import { Colour, Image } from 'src/components/Types'
import { useGuildContext } from 'src/context/GuildContext'
import { ColourToByte } from 'src/helpers/Colours'

type ApiContextType =
  | {
      image?: Image
      setPixel?(x: number, y: number, colour: Colour): Promise<void>
    }
  | undefined

const ApiContext = createContext<ApiContextType>(undefined)

export function ApiContextProvider({
  children
}: {
  children: React.ReactNode
}) {
  const { guildId } = useGuildContext()
  const session = useSession()!

  const webSocket = useRef<WebSocket>()

  const [imageWidth, setImageWidth] = useState<number>()
  const [imageHeight, setImageHeight] = useState<number>()
  const [imageData, setImageData] = useState<Uint8Array>()

  useEffect(() => {
    if (!guildId) return

    const {
      publicRuntimeConfig: { WS_URL }
    } = getConfig()

    const ws = new WebSocket(`${WS_URL}servers/${guildId}/ws`)

    ws.onopen = () => {
      ws.send(session.data?.accessToken!)
    }

    ws.onmessage = async (event) => {
      const blob = event.data as Blob
      const buffer = await blob.arrayBuffer()

      const bytes = new Uint8Array(buffer)
      const x = bytes[0] * 255 + bytes[1]
      const y = bytes[2] * 255 + bytes[3]
      const colour = bytes[4]

      setImageData((oldImage) => {
        if (!oldImage || !imageWidth) return undefined
        var newImage = new Uint8Array(oldImage)
        newImage[imageWidth * y + x] = colour
        return newImage
      })
    }

    webSocket.current = ws

    return () => {
      ws.close()
    }
  }, [guildId, imageWidth, session.data?.accessToken])

  const { data: initialImage } = useQuery(
    ['image', guildId],
    async () => {
      const {
        publicRuntimeConfig: { API_URL }
      } = getConfig()

      const response = await fetch(`${API_URL}servers/${guildId}/image`, {
        headers: {
          Authorization: `Bearer ${session.data?.accessToken!}`
        }
      })

      const blob = await response.blob()

      const buffer = await blob.arrayBuffer()
      const dimensions = new Uint8Array(buffer.slice(0, 4))

      const width = dimensions[0] * 256 + dimensions[1]
      const height = dimensions[2] * 256 + dimensions[3]
      const image = new Uint8Array(buffer.slice(4))

      return { width, height, image }
    },
    { enabled: !!guildId, staleTime: 1000 * 60 * 60 }
  )

  useEffect(() => {
    if (initialImage) {
      setImageWidth(initialImage.width)
      setImageHeight(initialImage.height)
      setImageData(initialImage.image)
    }
  }, [initialImage])

  return (
    <ApiContext.Provider
      value={{
        image:
          imageWidth && imageHeight && imageData
            ? { width: imageWidth, height: imageHeight, data: imageData }
            : undefined,
        setPixel: guildId
          ? async (x, y, colour) => {
              webSocket.current?.send(
                new Uint8Array([
                  x >> 8,
                  x & 0xff,
                  y >> 8,
                  y & 0xff,
                  ColourToByte(colour)
                ])
              )
            }
          : undefined
      }}
    >
      {children}
    </ApiContext.Provider>
  )
}

export function useApiContext() {
  const context = useContext(ApiContext)

  if (!context)
    throw new Error('useApiContext must be used within a ApiContextProvider')

  return context
}
