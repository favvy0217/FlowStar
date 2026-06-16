/**
 * Stellar / Soroban network configuration.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * INTEGRATION POINT (you build this part)
 * ─────────────────────────────────────────────────────────────────────────
 * Once your contracts are deployed, install the SDK and create the RPC client:
 *
 *   pnpm add @stellar/stellar-sdk
 *
 *   import { rpc } from '@stellar/stellar-sdk'
 *   export const server = new rpc.Server(NETWORK.rpcUrl)
 *
 * The UI never imports the SDK directly — it only calls helpers from
 * `lib/contract.ts`, so you can swap the mock implementation for real
 * transactions without touching any component.
 */

export const NETWORK = {
  name: 'testnet',
  passphrase: 'Test SDF Network ; September 2015',
  rpcUrl: 'https://soroban-testnet.stellar.org',
  horizonUrl: 'https://horizon-testnet.stellar.org',
} as const

/** Address of the deployed streaming contract. Fill in after deployment. */
export const STREAM_CONTRACT_ID =
  process.env.NEXT_PUBLIC_STREAM_CONTRACT_ID ?? ''

/** Common tokens shown in the create-stream token picker. */
export const KNOWN_TOKENS = [
  {
    address: 'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC',
    symbol: 'XLM',
    decimals: 7,
  },
  {
    address: 'CCW67TSZV3SSS2HXMBQ5JFGCKJNXKZM7UQUWUZPUTHXSTZLEO7SJMI75',
    symbol: 'USDC',
    decimals: 7,
  },
  {
    address: 'CAS3J7GYLGXMF6TDJBBYYSE3HQ6BBSMLNUEZHRST6OAH3GZP5C7VZ6CK',
    symbol: 'EURC',
    decimals: 7,
  },
] as const
