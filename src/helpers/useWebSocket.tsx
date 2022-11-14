import { useEffect, useState } from 'react'

export function useWebSocket<T>({
  url,
  onOpen,
  onMessage
}: {
  url?: string
  onOpen(ws: WebSocket): Promise<T>
  onMessage: (ws: WebSocket, event: MessageEvent<any>) => Promise<void>
}) {
  const [state, setState] = useState<
    | { status: 'idle' }
    | { status: 'loading' }
    | { status: 'success'; successData: T }
    | { status: 'error'; retry: () => void }
  >({ status: 'idle' })

  const [attempts, setAttempts] = useState(0)

  useEffect(() => {
    if (!url) {
      setState({ status: 'idle' })
      return
    }

    setState({ status: 'loading' })

    const ws = new WebSocket(url)

    ws.onopen = async () => {
      const data = await onOpen(ws)
      setState({ status: 'success', successData: data })
    }

    ws.onerror = () => {
      setState({
        status: 'error',
        retry: () => setAttempts((attempts) => attempts + 1)
      })
    }

    ws.onmessage = (event) => onMessage(ws, event)

    return () => {
      console.log('closing ws')
      ws.close()
    }
  }, [onMessage, onOpen, url, attempts])

  return state
}
