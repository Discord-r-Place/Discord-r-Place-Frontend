import getConfig from 'next/config'

export function DevelopmentOnly({ children }: { children: React.ReactNode }) {
  const {
    publicRuntimeConfig: { NODE_ENV }
  } = getConfig()

  if (NODE_ENV === 'development') {
    return <>{children}</>
  }

  return null
}
