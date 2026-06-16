import type { CreateStreamInput, StreamData } from '@/types/stream'
import { mockStore } from '@/lib/mock-data'

/**
 * ─────────────────────────────────────────────────────────────────────────
 * CONTRACT BOUNDARY — this is the only file you need to rewrite.
 * ─────────────────────────────────────────────────────────────────────────
 *
 * Every function below is currently backed by an in-memory mock so the UI is
 * fully interactive. Replace the bodies with real Soroban calls. A typical
 * write looks like:
 *
 *   import { Contract, TransactionBuilder, nativeToScVal } from '@stellar/stellar-sdk'
 *   import { server, NETWORK, STREAM_CONTRACT_ID } from '@/lib/stellar'
 *
 *   const contract = new Contract(STREAM_CONTRACT_ID)
 *   const op = contract.call('create_stream', ...args.map(nativeToScVal))
 *   const tx = new TransactionBuilder(account, { fee, networkPassphrase: NETWORK.passphrase })
 *     .addOperation(op).setTimeout(30).build()
 *   const prepared = await server.prepareTransaction(tx)
 *   const signedXdr = await signTransaction(prepared.toXDR()) // from useWallet
 *   const sent = await server.sendTransaction(/* rebuild from signedXdr */)
 *   // poll server.getTransaction(sent.hash) until success
 *
 * Reads use `server.simulateTransaction` (no signature needed) and you map the
 * returned ScVal into `StreamData`.
 *
 * `simulateLatency` only exists to make the mock feel realistic; delete it.
 */

const USE_MOCK = true

function simulateLatency(ms = 700) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/** Create + fund a new stream. Returns the created stream's id. */
export async function createStream(
  input: CreateStreamInput,
  sender: string,
): Promise<string> {
  if (USE_MOCK) {
    await simulateLatency()
    return mockStore.create(input, sender).id
  }
  throw new Error('Real createStream not implemented — wire up Soroban here.')
}

/** Withdraw `amount` (smallest unit) of unlocked funds from a stream. */
export async function withdrawFromStream(
  id: string,
  amount: bigint,
): Promise<void> {
  if (USE_MOCK) {
    await simulateLatency()
    mockStore.withdraw(id, amount)
    return
  }
  throw new Error('Real withdraw not implemented — wire up Soroban here.')
}

/** Cancel a stream (sender only). Returns unlocked funds to recipient. */
export async function cancelStream(id: string): Promise<void> {
  if (USE_MOCK) {
    await simulateLatency()
    mockStore.cancel(id)
    return
  }
  throw new Error('Real cancel not implemented — wire up Soroban here.')
}

/** Read a single stream by id (simulate, no signature). */
export async function fetchStream(id: string): Promise<StreamData | null> {
  if (USE_MOCK) return mockStore.getById(id) ?? null
  throw new Error('Real fetchStream not implemented — wire up Soroban here.')
}

/** Read all streams involving `address` (as sender or recipient). */
export async function fetchStreamsForAddress(
  address: string,
): Promise<StreamData[]> {
  if (USE_MOCK) {
    return mockStore
      .getAll()
      .filter((s) => s.sender === address || s.recipient === address)
  }
  throw new Error('Real fetchStreams not implemented — wire up Soroban here.')
}
