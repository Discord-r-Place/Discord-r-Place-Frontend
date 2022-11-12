import 'antd/dist/antd.dark.css'
import { SessionProvider } from 'next-auth/react'
import type { AppProps } from 'next/app'

export default function App({
  Component,
  pageProps: { session, ...pageProps }
}: AppProps) {
  return (
    <SessionProvider session={session}>
      <style jsx global>
        {`
          body {
            margin: 0px;
          }
        `}
      </style>
      <Component {...pageProps} />
    </SessionProvider>
  )
}
