'use client'

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { DEMO_ADDRESS } from '@/lib/mock-data'

export interface WalletOption {
  id: string
  name: string
  /** Short tagline shown in the selector. */
  detail: string
}

/**
 * Wallets surfaced by Stellar Wallets Kit. In the real integration these come
 * from `allowAllModules()` / the kit's available modules.
 */
export const WALLET_OPTIONS: WalletOption[] = [
  { id: 'freighter', name: 'Freighter', detail: 'Browser extension' },
  { id: 'xbull', name: 'xBull', detail: 'Extension & web' },
  { id: 'lobstr', name: 'LOBSTR', detail: 'Mobile & extension' },
  { id: 'albedo', name: 'Albedo', detail: 'Web signer' },
]

interface WalletContextValue {
  address: string | null
  walletId: string | null
  connecting: boolean
  isConnected: boolean
  connect: (walletId: string) => Promise<void>
  disconnect: () => void
  /**
   * Signs a transaction XDR and returns the signed XDR.
   * INTEGRATION POINT: replace with `kit.signTransaction(...)`.
   */
  signTransaction: (xdr: string) => Promise<string>
}

const WalletContext = createContext<WalletContextValue | null>(null)

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null)
  const [walletId, setWalletId] = useState<string | null>(null)
  const [connecting, setConnecting] = useState(false)

  const connect = useCallback(async (id: string) => {
    setConnecting(true)
    try {
      /**
       * INTEGRATION POINT — Stellar Wallets Kit:
       *
       *   kit.setWallet(id)
       *   const { address } = await kit.getAddress()
       *   setAddress(address)
       */
      await new Promise((r) => setTimeout(r, 600))
      setWalletId(id)
      setAddress(DEMO_ADDRESS)
    } finally {
      setConnecting(false)
    }
  }, [])

  const disconnect = useCallback(() => {
    setAddress(null)
    setWalletId(null)
  }, [])

  const signTransaction = useCallback(async (xdr: string) => {
    // INTEGRATION POINT: return (await kit.signTransaction(xdr)).signedTxXdr
    await new Promise((r) => setTimeout(r, 400))
    return xdr
  }, [])

  const value = useMemo<WalletContextValue>(
    () => ({
      address,
      walletId,
      connecting,
      isConnected: address !== null,
      connect,
      disconnect,
      signTransaction,
    }),
    [address, walletId, connecting, connect, disconnect, signTransaction],
  )

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
}

export function useWalletContext() {
  const ctx = useContext(WalletContext)
  if (!ctx) {
    throw new Error('useWallet must be used within a WalletProvider')
  }
  return ctx
}
