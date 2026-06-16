import type { StreamData, StreamStatus } from '@/types/stream'

/**
 * Computes how much of the stream has unlocked as of `nowSeconds`.
 *
 * This is the client-side mirror of the contract's unlock math. Recompute it
 * every second for the live counter instead of polling the contract.
 */
export function getUnlockedAmount(
  stream: StreamData,
  nowSeconds: number = Math.floor(Date.now() / 1000),
): bigint {
  const now = BigInt(nowSeconds)
  if (now < stream.cliffTime) return 0n
  if (now >= stream.endTime) return stream.depositedAmount

  const elapsed = now - stream.startTime
  const linear = elapsed > 0n ? elapsed * stream.amountPerSecond : 0n
  const unlocked = stream.cliffAmount + linear

  // Never report more than was deposited.
  return unlocked > stream.depositedAmount ? stream.depositedAmount : unlocked
}

/** Amount currently available for the recipient to withdraw. */
export function getWithdrawableAmount(
  stream: StreamData,
  nowSeconds?: number,
): bigint {
  const unlocked = getUnlockedAmount(stream, nowSeconds)
  const available = unlocked - stream.withdrawnAmount
  return available > 0n ? available : 0n
}

/** Amount still locked in the stream. */
export function getLockedAmount(stream: StreamData, nowSeconds?: number): bigint {
  return stream.depositedAmount - getUnlockedAmount(stream, nowSeconds)
}

export function getStreamStatus(
  stream: StreamData,
  nowSeconds: number = Math.floor(Date.now() / 1000),
): StreamStatus {
  if (stream.cancelled) return 'cancelled'
  const now = BigInt(nowSeconds)
  if (now < stream.startTime) return 'scheduled'
  if (now >= stream.endTime) return 'completed'
  return 'streaming'
}

/** Progress (0–1) of unlocked vs deposited. */
export function getStreamProgress(stream: StreamData, nowSeconds?: number): number {
  if (stream.depositedAmount === 0n) return 0
  const unlocked = getUnlockedAmount(stream, nowSeconds)
  return clamp(Number((unlocked * 10000n) / stream.depositedAmount) / 10000, 0, 1)
}

function clamp(n: number, min: number, max: number) {
  return Math.min(Math.max(n, min), max)
}

/**
 * Formats a raw bigint amount (smallest unit) into a human-readable string,
 * respecting the token's decimals. Keeps full precision but trims trailing
 * zeros down to `maxFractionDigits`.
 */
export function formatTokenAmount(
  raw: bigint,
  decimals: number,
  maxFractionDigits = 4,
): string {
  const negative = raw < 0n
  const abs = negative ? -raw : raw
  const base = 10n ** BigInt(decimals)
  const whole = abs / base
  const frac = abs % base

  const wholeStr = whole.toLocaleString('en-US')

  if (decimals === 0 || maxFractionDigits === 0) {
    return `${negative ? '-' : ''}${wholeStr}`
  }

  let fracStr = frac.toString().padStart(decimals, '0').slice(0, maxFractionDigits)
  fracStr = fracStr.replace(/0+$/, '')

  return `${negative ? '-' : ''}${wholeStr}${fracStr ? '.' + fracStr : ''}`
}

/** Parses a human-typed decimal string into a raw bigint of smallest units. */
export function parseTokenAmount(value: string, decimals: number): bigint {
  if (!value) return 0n
  const [whole, frac = ''] = value.replace(/,/g, '').split('.')
  const fracPadded = frac.slice(0, decimals).padEnd(decimals, '0')
  return BigInt(whole || '0') * 10n ** BigInt(decimals) + BigInt(fracPadded || '0')
}

export function shortenAddress(address: string, chars = 4): string {
  if (address.length <= chars * 2 + 2) return address
  return `${address.slice(0, chars + 1)}…${address.slice(-chars)}`
}

export function formatDateTime(unixSeconds: bigint | number): string {
  const ms = Number(unixSeconds) * 1000
  return new Date(ms).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

/** Returns a compact "2d 4h 13m" style duration from now until `target`. */
export function formatTimeRemaining(
  targetSeconds: bigint,
  nowSeconds: number = Math.floor(Date.now() / 1000),
): string {
  let diff = Number(targetSeconds) - nowSeconds
  if (diff <= 0) return 'Ended'

  const days = Math.floor(diff / 86400)
  diff -= days * 86400
  const hours = Math.floor(diff / 3600)
  diff -= hours * 3600
  const minutes = Math.floor(diff / 60)
  const seconds = diff - minutes * 60

  const parts: string[] = []
  if (days) parts.push(`${days}d`)
  if (hours || days) parts.push(`${hours}h`)
  if (!days) parts.push(`${minutes}m`)
  if (!days && !hours) parts.push(`${seconds}s`)
  return parts.join(' ')
}
