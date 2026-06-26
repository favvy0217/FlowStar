'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { setSignTransaction } from '@/lib/contract'
import { type NetworkName, getNetworkConfig } from '@/lib/stellar'
import { useNetwork } from './network-provider'

// ─── Wallet options ───────────────────────────────────────────────────────────

export interface WalletOption {
  id: string
  name: string
  detail: string
}

export const WALLET_OPTIONS: WalletOption[] = [
  { id: 'freighter', name: 'Freighter', detail: 'Browser extension · stellar.org' },
  { id: 'xbull',     name: 'xBull',     detail: 'Extension & web' },
  { id: 'lobstr',    name: 'LOBSTR',    detail: 'Mobile & extension' },
  { id: 'albedo',    name: 'Albedo',    detail: 'Web signer' },
]

// ─── Wallet adapter interface ─────────────────────────────────────────────────

interface WalletAdapter {
  connect(): Promise<string>
  signTransaction(xdr: string, networkPassphrase: string): Promise<string>
  isAvailable(): boolean
}

// ─── Freighter adapter ────────────────────────────────────────────────────────

const freighterAdapter: WalletAdapter = {
  isAvailable: () => typeof window !== 'undefined' && !!(window as any).freighter,

  async connect() {
    const { isConnected, getAddress, requestAccess } = await import('@stellar/freighter-api')
    const { isConnected: connected } = await isConnected()
    if (!connected) throw new Error('Freighter is not installed. Install the extension and refresh.')
    await requestAccess()
    const result = await getAddress()
    if (result.error) throw new Error(result.error)
    return result.address
  },

  async signTransaction(xdr, networkPassphrase) {
    const { signTransaction } = await import('@stellar/freighter-api')
    const result = await signTransaction(xdr, { networkPassphrase })
    if (result.error) throw new Error(result.error)
    return result.signedTxXdr
  },
}

// ─── xBull adapter ────────────────────────────────────────────────────────────
// Uses the xBull Wallet Connect SDK (window.xBullSDK injected by extension)

const xbullAdapter: WalletAdapter = {
  isAvailable: () => typeof window !== 'undefined' && !!(window as any).xBullSDK,

  async connect() {
    const sdk = (window as any).xBullSDK
    if (!sdk) throw new Error('xBull is not installed. Install the xBull extension and refresh.')
    const result = await sdk.connect()
    if (!result?.publicKey) throw new Error('xBull did not return a public key.')
    return result.publicKey
  },

  async signTransaction(xdr, networkPassphrase) {
    const sdk = (window as any).xBullSDK
    if (!sdk) throw new Error('xBull is not installed.')
    const result = await sdk.signXDR(xdr, { networkPassphrase })
    if (!result?.signedXDR) throw new Error('xBull signing failed.')
    return result.signedXDR
  },
}

// ─── LOBSTR adapter ───────────────────────────────────────────────────────────
// Uses the LOBSTR extension injected as window.lobstrSDK

const lobstrAdapter: WalletAdapter = {
  isAvailable: () => typeof window !== 'undefined' && !!(window as any).lobstrSDK,

  async connect() {
    const sdk = (window as any).lobstrSDK
    if (!sdk) throw new Error('LOBSTR extension is not installed. Install it and refresh.')
    const { publicKey } = await sdk.getPublicKey()
    if (!publicKey) throw new Error('LOBSTR did not return a public key.')
    return publicKey
  },

  async signTransaction(xdr, networkPassphrase) {
    const sdk = (window as any).lobstrSDK
    if (!sdk) throw new Error('LOBSTR extension is not installed.')
    const { signedXdr } = await sdk.signTransaction(xdr, { networkPassphrase })
    if (!signedXdr) throw new Error('LOBSTR signing failed.')
    return signedXdr
  },
}

// ─── Albedo adapter ───────────────────────────────────────────────────────────
// Uses the albedo-link JS library for intent-based signing

const albedoAdapter: WalletAdapter = {
  isAvailable: () => true, // web-based — always available

  async connect() {
    const albedo = (await import('albedo-link')).default
    const result = await albedo.publicKey({})
    if (!result?.pubkey) throw new Error('Albedo did not return a public key.')
    return result.pubkey
  },

  async signTransaction(xdr, networkPassphrase) {
    const albedo = (await import('albedo-link')).default
    const result = await albedo.tx({ xdr, network: networkPassphrase, submit: false })
    if (!result?.signed_envelope_xdr) throw new Error('Albedo signing failed.')
    return result.signed_envelope_xdr
  },
}

// ─── Adapter registry ─────────────────────────────────────────────────────────

const ADAPTERS: Record<string, WalletAdapter> = {
  freighter: freighterAdapter,
  xbull:     xbullAdapter,
  lobstr:    lobstrAdapter,
  albedo:    albedoAdapter,
}

function getAdapter(id: string): WalletAdapter {
  const adapter = ADAPTERS[id]
  if (!adapter) throw new Error(`Unknown wallet: ${id}`)
  return adapter
}

// ─── Context ──────────────────────────────────────────────────────────────────

interface WalletContextValue {
  address: string | null
  walletId: string | null
  connecting: boolean
  reconnecting: boolean
  isConnected: boolean
  connect: (walletId: string) => Promise<void>
  disconnect: () => void
  signTransaction: (xdr: string, network?: NetworkName) => Promise<string>
}

const WalletContext = createContext<WalletContextValue | null>(null)

// ─── Provider ─────────────────────────────────────────────────────────────────

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null)
  const [walletId, setWalletId] = useState<string | null>(null)
  const [connecting, setConnecting] = useState(false)
  const [reconnecting, setReconnecting] = useState(true)
  const { network } = useNetwork()

  // Auto-reconnect on mount using persisted walletId
  useEffect(() => {
    const saved = localStorage.getItem('walletId')
    if (!saved) { setReconnecting(false); return }
    getAdapter(saved)
      .connect()
      .then((addr) => { setAddress(addr); setWalletId(saved) })
      .catch(() => { localStorage.removeItem('walletId') })
      .finally(() => setReconnecting(false))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const connect = useCallback(async (id: string) => {
    setConnecting(true)
    try {
      const addr = await getAdapter(id).connect()
      setAddress(addr)
      setWalletId(id)
      localStorage.setItem('walletId', id)
    } finally {
      setConnecting(false)
    }
  }, [])

  const disconnect = useCallback(() => {
    setAddress(null)
    setWalletId(null)
    localStorage.removeItem('walletId')
  }, [])

  const signTransaction = useCallback(
    async (xdr: string, customNetwork?: NetworkName): Promise<string> => {
      if (!walletId) throw new Error('No wallet connected')
      const config = getNetworkConfig(customNetwork ?? network)
      return getAdapter(walletId).signTransaction(xdr, config.passphrase)
    },
    [walletId, network],
  )

  // Keep contract layer in sync
  useEffect(() => {
    setSignTransaction((xdr: string) => signTransaction(xdr))
  }, [signTransaction])

  const value = useMemo<WalletContextValue>(
    () => ({
      address,
      walletId,
      connecting,
      reconnecting,
      isConnected: address !== null,
      connect,
      disconnect,
      signTransaction,
    }),
    [address, walletId, connecting, reconnecting, connect, disconnect, signTransaction],
  )

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useWalletContext() {
  const ctx = useContext(WalletContext)
  if (!ctx) throw new Error('useWallet must be used within a WalletProvider')
  return ctx
}
