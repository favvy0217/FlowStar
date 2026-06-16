import Link from 'next/link'
import { Waves } from 'lucide-react'
import { cn } from '@/lib/utils'

export const APP_NAME = 'Cascade'

interface BrandProps {
  href?: string
  className?: string
  showWordmark?: boolean
}

export function Brand({ href = '/', className, showWordmark = true }: BrandProps) {
  return (
    <Link
      href={href}
      className={cn('flex items-center gap-2.5 font-semibold', className)}
    >
      <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <Waves className="size-4.5" strokeWidth={2.5} />
      </span>
      {showWordmark && (
        <span className="text-lg tracking-tight text-foreground">{APP_NAME}</span>
      )}
    </Link>
  )
}
