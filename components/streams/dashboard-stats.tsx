'use client'

import { useNow } from '@/hooks/use-now'
import { getStreamStatus, getWithdrawableAmount } from '@/lib/stream-utils'
import { TokenAmount } from '@/components/ui/token-amount'
import type { StreamData } from '@/types/stream'

interface DashboardStatsProps {
  sent: StreamData[]
  received: StreamData[]
}

/**
 * Aggregates per-token totals. Amounts only sum within a single token symbol
 * to avoid mixing units. We display the dominant token plus active counts.
 */
export function DashboardStats({ sent, received }: DashboardStatsProps) {
  const now = useNow(1000)

  const activeReceiving = received.filter(
    (s) => getStreamStatus(s, now) === 'streaming',
  ).length
  const activeSending = sent.filter(
    (s) => getStreamStatus(s, now) === 'streaming',
  ).length

  // Total currently withdrawable across received streams, grouped by token.
  const withdrawableByToken = new Map<
    string,
    { amount: bigint; token: StreamData['token'] }
  >()
  for (const s of received) {
    const amt = getWithdrawableAmount(s, now)
    const existing = withdrawableByToken.get(s.token.symbol)
    if (existing) existing.amount += amt
    else withdrawableByToken.set(s.token.symbol, { amount: amt, token: s.token })
  }
  const topWithdrawable = [...withdrawableByToken.values()].sort((a, b) =>
    a.amount > b.amount ? -1 : 1,
  )[0]

  const stats = [
    {
      label: 'Available to withdraw',
      value: topWithdrawable ? (
        <TokenAmount
          amount={topWithdrawable.amount}
          token={topWithdrawable.token}
          maxFractionDigits={2}
        />
      ) : (
        <span className="text-muted-foreground">—</span>
      ),
      hint:
        withdrawableByToken.size > 1
          ? `+${withdrawableByToken.size - 1} more token${withdrawableByToken.size > 2 ? 's' : ''}`
          : 'across received streams',
    },
    {
      label: 'Receiving',
      value: <span>{received.length}</span>,
      hint: `${activeReceiving} streaming now`,
    },
    {
      label: 'Sending',
      value: <span>{sent.length}</span>,
      hint: `${activeSending} streaming now`,
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {stats.map((stat) => (
        <div key={stat.label} className="rounded-2xl border border-border bg-card p-5">
          <p className="text-sm text-muted-foreground">{stat.label}</p>
          <p className="mt-2 font-mono text-2xl font-semibold tabular-nums">
            {stat.value}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">{stat.hint}</p>
        </div>
      ))}
    </div>
  )
}
