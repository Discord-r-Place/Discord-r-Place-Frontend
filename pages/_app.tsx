import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import 'antd/dist/antd.dark.css'
import { SessionProvider } from 'next-auth/react'
import type { AppProps } from 'next/app'
import { useState } from 'react'

import { ApiContextProvider } from 'src/context/ApiContext'
import { GuildContextProvider } from 'src/context/GuildContext'

export default function App({
  Component,
  pageProps: { session, ...pageProps }
}: AppProps) {
  const [queryClient] = useState(() => new QueryClient())

  return (
    <SessionProvider session={session}>
      <QueryClientProvider client={queryClient}>
        <GuildContextProvider>
          <ApiContextProvider>
            <style jsx global>
              {`
                body {
                  margin: 0px;
                }
              `}
            </style>
            <Component {...pageProps} />
          </ApiContextProvider>
        </GuildContextProvider>
      </QueryClientProvider>
    </SessionProvider>
  )
}
