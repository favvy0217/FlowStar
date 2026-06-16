'use client'

import { useWalletContext } from '@/components/providers/wallet-provider'

/** Wallet connection state + actions. Backed by WalletProvider. */
export function useWallet() {
  return useWalletContext()
}
