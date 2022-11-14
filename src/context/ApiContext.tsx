import { useQuery } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import getConfig from 'next/config'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react'

import { Image, ImagePalette } from 'src/components/Types'
import { useGuildContext } from 'src/context/GuildContext'
import { useWebSocket } from 'src/helpers/useWebSocket'

type ApiContextType =
  | {
      status: 'idle'
    }
  | {
      status: 'loading'
    }
  | {
      status: 'success'
      image: Image
      setPixel(x: number, y: number, colour: number): Promise<void>
    }
  | {
      status: 'error'
      retry: () => Promise<void>
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

  const [image, setImage] = useState<Image>()

  const url = useMemo(() => {
    if (!guildId) return undefined
    const {
      publicRuntimeConfig: { WS_URL }
    } = getConfig()
    return `${WS_URL}servers/${guildId}/ws`
  }, [guildId])

  const onOpen = useCallback(
    async (ws: WebSocket) => {
      ws.send(session.data?.accessToken!)
      return async (x: number, y: number, colourIndex: number) => {
        ws.send(
          new Uint8Array([
            x >> 8,
            x & 0xff,
            y >> 8,
            y & 0xff,
            colourIndex
          ])
        )
      }
    },
    [session.data?.accessToken]
  )

  const onMessage = useCallback(
    async (_ws: WebSocket, event: MessageEvent<any>) => {
      const blob = event.data as Blob
      const buffer = await blob.arrayBuffer()

      const bytes = new Uint8Array(buffer)
      const x = (bytes[0] << 8) + bytes[1]
      const y = (bytes[2] << 8) + bytes[3]
      const colour = bytes[4]

      setImage((oldImage) => {
        if (!oldImage) return undefined
        const newImageData = new Uint8Array(oldImage.data)
        newImageData[oldImage.width * y + x] = colour
        return { ...oldImage, data: newImageData }
      })
    },
    []
  )

  const ws = useWebSocket<
    (x: number, y: number, colour: number) => Promise<void>
  >({
    url: session.data ? url : undefined,
    onOpen,
    onMessage
  })
  const { status: wsStatus } = ws

  const { data: palette, refetch: refetchPalette } = useQuery(
    ['palette', guildId],
    async () => {
      const {
        publicRuntimeConfig: { API_URL }
      } = getConfig()

      const response = await fetch(`${API_URL}servers/${guildId}/palette`, {
        headers: {
          Authorization: `Bearer ${session.data?.accessToken!}`
        }
      })

      const data = await response.json();

      const colours: ImagePalette = data.map((colourValue: number) => { return { r: (colourValue >> 16) & 0xFF, g: (colourValue >> 8) & 0xFF, b: colourValue & 0xFF } });

      return colours;
    },
    { enabled: wsStatus === "loading", staleTime: 1000 * 60 * 60 }
  );

  const { data: initialImage, refetch } = useQuery(
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

      const width = (dimensions[0] << 8) + dimensions[1]
      const height = (dimensions[2] << 8) + dimensions[3]
      const data = new Uint8Array(buffer.slice(4))

      return { width, height, data }
    },
    { enabled: wsStatus === 'loading', staleTime: 1000 * 60 * 60 }
  )

  useEffect(() => {
    if (initialImage && palette) {
      setImage({...initialImage, palette: palette});
    }
  }, [initialImage])

  return (
    <ApiContext.Provider
      value={
        wsStatus === 'idle'
          ? {
              status: 'idle'
            }
          : wsStatus === 'loading' || !image || !palette
          ? {
              status: 'loading'
            }
          : wsStatus === 'success' && image && palette
          ? {
              status: 'success',
              setPixel: ws.successData,
              image: image
            }
          : {
              status: 'error',
              retry: async () => {
                await refetchPalette();
                await refetch()
                if (wsStatus === 'error') ws.retry()
              }
            }
      }
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
