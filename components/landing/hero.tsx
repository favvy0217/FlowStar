import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Brand } from '@/components/brand'
import { Button } from '@/components/ui/button'
import { LiveStreamPreview } from '@/components/landing/live-stream-preview'

export function LandingHeader() {
  return (
    <header className="absolute inset-x-0 top-0 z-30">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Brand />
        <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
          <a href="#features" className="transition-colors hover:text-foreground">
            Features
          </a>
          <a href="#how" className="transition-colors hover:text-foreground">
            How it works
          </a>
          <a
            href="#use-cases"
            className="transition-colors hover:text-foreground"
          >
            Use cases
          </a>
        </nav>
        <Button asChild size="sm">
          <Link href="/app">
            Open app
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>
    </header>
  )
}

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-28 pb-16 sm:pt-36 sm:pb-24">
      {/* subtle radial accent */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 size-[640px] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl"
      />
      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">
            <span className="size-1.5 rounded-full bg-primary" />
            Built on Stellar &amp; Soroban
          </span>
          <h1 className="mt-5 text-balance text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
            Stream money by the second
          </h1>
          <p className="mt-5 max-w-md text-pretty text-lg leading-relaxed text-muted-foreground">
            Cascade turns one-time transfers into continuous streams. Perfect
            for payroll, token vesting, and grants that unlock in real time —
            withdraw anytime, cancel anytime.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button asChild size="lg">
              <Link href="/app/create">
                Create a stream
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link href="/app">Open dashboard</Link>
            </Button>
          </div>
          <p className="mt-6 font-mono text-xs text-muted-foreground">
            No code · Non-custodial · Testnet ready
          </p>
        </div>

        <div className="relative">
          <LiveStreamPreview />
        </div>
      </div>
    </section>
  )
}
