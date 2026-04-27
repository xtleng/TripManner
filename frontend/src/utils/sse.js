import { useUserStore } from '@/stores/user'

/**
 * Create an SSE connection to the given URL.
 * @param {string} url - The SSE endpoint URL
 * @param {object} handlers - { onMessage, onError, onOpen }
 * @returns {{ close: Function }} controller to close the connection
 */
export function createSSEConnection(url, handlers = {}) {
  const userStore = useUserStore()
  const fullUrl = url.startsWith('/api') ? url : `/api${url}`
  const separator = fullUrl.includes('?') ? '&' : '?'
  const urlWithToken = userStore.token
    ? `${fullUrl}${separator}token=${encodeURIComponent(userStore.token)}`
    : fullUrl

  const eventSource = new EventSource(urlWithToken)

  eventSource.onopen = () => {
    if (handlers.onOpen) handlers.onOpen()
  }

  eventSource.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data)
      if (handlers.onMessage) handlers.onMessage(data)
    } catch {
      if (handlers.onMessage) handlers.onMessage(event.data)
    }
  }

  eventSource.onerror = (error) => {
    if (handlers.onError) handlers.onError(error)
    eventSource.close()
  }

  return {
    close: () => eventSource.close(),
  }
}

/**
 * Simulate an SSE stream from a mock route object for local development.
 * @param {object} mockRoute - The mock route data
 * @param {object} handlers - { onMessage, onError, onOpen }
 * @returns {{ close: Function }} controller to stop the simulation
 */
export function simulateSSEStream(mockRoute, handlers = {}) {
  let cancelled = false
  const steps = mockRoute.steps || []

  if (handlers.onOpen) handlers.onOpen()

  let index = 0
  const interval = setInterval(() => {
    if (cancelled || index >= steps.length) {
      clearInterval(interval)
      if (!cancelled && handlers.onMessage) {
        handlers.onMessage({ type: 'done' })
      }
      return
    }
    if (handlers.onMessage) {
      handlers.onMessage({ type: 'stream_text', data: steps[index] })
    }
    index++
  }, 100)

  return {
    close: () => {
      cancelled = true
      clearInterval(interval)
    },
  }
}
