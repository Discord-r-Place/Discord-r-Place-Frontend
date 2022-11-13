import { createContext, useContext, useState } from 'react'

type GuildContextType =
  | {
      guildId?: string
      setGuildId: (guildId: string) => void
    }
  | undefined

const GuildContext = createContext<GuildContextType>(undefined)

export function GuildContextProvider({
  children
}: {
  children: React.ReactNode
}) {
  const [guildId, setGuildId] = useState<string>()

  return (
    <GuildContext.Provider value={{ guildId, setGuildId }}>
      {children}
    </GuildContext.Provider>
  )
}

export function useGuildContext() {
  const context = useContext(GuildContext)

  if (!context) {
    throw new Error(
      'useGuildContext must be used within a GuildContextProvider'
    )
  }

  return context
}
