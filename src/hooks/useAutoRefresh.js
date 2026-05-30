// src/hooks/useAutoRefresh.js
import { useEffect, useRef } from 'react'

export function useAutoRefresh(callback, seconds = 30) {
  const savedCallback = useRef(callback)

  useEffect(() => {
    savedCallback.current = callback
  }, [callback])

  useEffect(() => {
    const interval = setInterval(() => {
      savedCallback.current()
    }, seconds * 1000)

    return () => clearInterval(interval)
  }, [seconds])
}