import { useQuery } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import getConfig from 'next/config'
import { createContext, useContext, useEffect, useState } from 'react'

import { useGuildContext } from 'src/context/GuildContext'

type ApiContextType =
  | {
      image?: Image
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

    ws.onmessage = (event) => {
      // TODO
      console.log(event.data)

      // setImageData(oldImage => oldImage[imageWidth] )
    }

    return () => {
      ws.close()
    }
  }, [guildId, session.data?.accessToken])

  const { data: initialImage } = useQuery(
    ['image', guildId],
    async () => {
      // getpublic runtime config
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
    { enabled: !!guildId }
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

type Image = {
  width: number
  height: number
  data: Uint8Array
}
