'use client'

import { useEffect, useState } from 'react'

/**
 * Returns the current UNIX time in seconds, updating on an interval.
 * Use this to drive live unlock counters and countdowns client-side instead
 * of polling the contract.
 */
export function useNow(intervalMs = 1000): number {
  const [now, setNow] = useState(() => Math.floor(Date.now() / 1000))

  useEffect(() => {
    const id = setInterval(() => {
      setNow(Math.floor(Date.now() / 1000))
    }, intervalMs)
    return () => clearInterval(id)
  }, [intervalMs])

  return now
}
