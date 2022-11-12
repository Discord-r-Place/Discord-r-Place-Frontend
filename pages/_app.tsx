import type { AppProps } from 'next/app'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <style jsx global>
        {`
          body {
            margin: 0px;
          }
        `}
      </style>
      <Component {...pageProps} />
    </>
  )
}
