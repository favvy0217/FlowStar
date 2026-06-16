'use client'

import { useSyncExternalStore } from 'react'
import { mockStore } from '@/lib/mock-data'
import type { StreamData } from '@/types/stream'
import { useWallet } from '@/hooks/use-wallet'

/**
 * Subscribes to the (mock) on-chain store and returns streams involving the
 * connected wallet. When wiring the real contract, swap the store subscription
 * for SWR/react-query against `fetchStreamsForAddress`.
 */
function useAllStreams(): StreamData[] {
  return useSyncExternalStore(
    mockStore.subscribe,
    mockStore.getAll,
    mockStore.getAll,
  )
}

export interface CategorizedStreams {
  sent: StreamData[]
  received: StreamData[]
  all: StreamData[]
}

export function useStreams(): CategorizedStreams {
  const all = useAllStreams()
  const { address } = useWallet()

  if (!address) return { sent: [], received: [], all: [] }

  const mine = all.filter(
    (s) => s.sender === address || s.recipient === address,
  )
  return {
    all: mine,
    sent: mine.filter((s) => s.sender === address),
    received: mine.filter((s) => s.recipient === address),
  }
}

export function useStream(id: string): StreamData | null {
  const all = useAllStreams()
  return all.find((s) => s.id === id) ?? null
}
