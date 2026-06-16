import { cn } from '@/lib/utils'
import type { StreamStatus } from '@/types/stream'

const STATUS_STYLES: Record<StreamStatus, { label: string; className: string }> = {
  streaming: {
    label: 'Streaming',
    className: 'bg-primary/10 text-primary',
  },
  scheduled: {
    label: 'Scheduled',
    className: 'bg-chart-3/15 text-chart-2',
  },
  completed: {
    label: 'Completed',
    className: 'bg-secondary text-muted-foreground',
  },
  cancelled: {
    label: 'Cancelled',
    className: 'bg-destructive/15 text-destructive',
  },
}

export function StreamStatusBadge({
  status,
  className,
}: {
  status: StreamStatus
  className?: string
}) {
  const { label, className: styles } = STATUS_STYLES[status]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium',
        styles,
        className,
      )}
    >
      {status === 'streaming' && (
        <span className="size-1.5 animate-pulse rounded-full bg-current" />
      )}
      {label}
    </span>
  )
}
