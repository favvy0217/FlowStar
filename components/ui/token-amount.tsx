import { cn } from '@/lib/utils'
import { formatTokenAmount } from '@/lib/stream-utils'
import type { TokenInfo } from '@/types/stream'

interface TokenAmountProps {
  amount: bigint
  token: TokenInfo
  className?: string
  symbolClassName?: string
  maxFractionDigits?: number
  showSymbol?: boolean
}

/** Formats a raw bigint token amount with correct decimals + symbol. */
export function TokenAmount({
  amount,
  token,
  className,
  symbolClassName,
  maxFractionDigits = 4,
  showSymbol = true,
}: TokenAmountProps) {
  return (
    <span className={cn('font-mono tabular-nums', className)}>
      {formatTokenAmount(amount, token.decimals, maxFractionDigits)}
      {showSymbol && (
        <span className={cn('ml-1 text-muted-foreground', symbolClassName)}>
          {token.symbol}
        </span>
      )}
    </span>
  )
}
