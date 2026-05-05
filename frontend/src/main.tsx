// 应用入口
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import './i18n' // 初始化 i18n

function initRadarConsoleBridge() {
  if (!import.meta.env.DEV || typeof window === 'undefined') return
  if ((window as any).__RADAR_CONSOLE_BRIDGE__) return
  ;(window as any).__RADAR_CONSOLE_BRIDGE__ = true

  let ws: WebSocket | null = null
  const queue: unknown[] = []

  const serialize = (value: unknown) => {
    if (value instanceof Error) return value.stack || value.message
    if (typeof value !== 'object' || value === null) return value
    try {
      const seen = new WeakSet()
      return JSON.parse(JSON.stringify(value, (_key, nested) => {
        if (typeof nested === 'object' && nested !== null) {
          if (seen.has(nested)) return '[Circular]'
          seen.add(nested)
        }
        return nested
      }))
    } catch {
      return Object.prototype.toString.call(value)
    }
  }

  const connect = () => {
    if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) return
    try {
      ws = new WebSocket('ws://localhost:8081')
      ws.onopen = () => {
        while (queue.length && ws?.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify(queue.shift()))
        }
      }
      ws.onclose = () => {
        ws = null
        window.setTimeout(connect, 3000)
      }
      ws.onerror = () => ws?.close()
    } catch {
      window.setTimeout(connect, 3000)
    }
  }

  const send = (level: 'log' | 'warn' | 'error', args: unknown[]) => {
    const payload = {
      type: 'console',
      level,
      args: args.map(serialize),
      source: window.location.href,
      stackTrace: new Error().stack,
    }
    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(payload))
    } else {
      queue.push(payload)
      if (queue.length > 100) queue.shift()
      connect()
    }
  }

  const original = {
    log: console.log.bind(console),
    warn: console.warn.bind(console),
    error: console.error.bind(console),
  }

  console.log = (...args: unknown[]) => {
    original.log(...args)
    send('log', args)
  }
  console.warn = (...args: unknown[]) => {
    original.warn(...args)
    send('warn', args)
  }
  console.error = (...args: unknown[]) => {
    original.error(...args)
    send('error', args)
  }

  window.addEventListener('error', (event) => {
    send('error', [event.error || event.message])
  })
  window.addEventListener('unhandledrejection', (event) => {
    send('error', [event.reason])
  })

  connect()
}

initRadarConsoleBridge()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
