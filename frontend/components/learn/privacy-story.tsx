'use client'

import { memo, useRef, useEffect, useState } from 'react'
import { ArrowRight, ArrowDown, AlertTriangle, ScanSearch } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  TransactionFlow,
  BlockchainLedger,
  PatternRadar,
  WalletNetwork,
  BeforeAfterLink,
  CorrelationChain,
  PrivacyTransformation,
} from './diagrams'

// ============================================================================
// ANIMATED SCENE WRAPPER
// ============================================================================

interface SceneProps {
  children: React.ReactNode
  id?: string
  className?: string
  delay?: number
}

const Scene = memo(function Scene({ children, id, className, delay = 0 }: SceneProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) {
      setIsVisible(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay)
          observer.disconnect()
        }
      },
      { threshold: 0.15, rootMargin: '0px' }
    )

    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [delay])

  return (
    <section
      id={id}
      ref={ref}
      className={cn(
        'transition-all duration-700 ease-out',
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8',
        className
      )}
    >
      {children}
    </section>
  )
})

// ============================================================================
// SCENE 1: Most of the time, privacy doesn't matter
// ============================================================================

const Scene1 = memo(function Scene1() {
  return (
    <Scene id="scene-1" className="min-h-[50vh] flex items-center justify-center py-16 border-t border-border/20">
      <div className="max-w-3xl mx-auto text-center px-4">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight mb-6 text-foreground">
          Most of the time, privacy doesn&apos;t matter.
        </h2>
        <p className="text-lg text-muted-foreground mb-12">
          You trade. You swap. Nothing bad happens.
        </p>
        <TransactionFlow className="mb-8" />
        <div className="opacity-60">
          <ArrowDown className="w-5 h-5 mx-auto text-muted-foreground/50 animate-bounce" />
        </div>
      </div>
    </Scene>
  )
})

// ============================================================================
// SCENE 2: But everything you do is public
// ============================================================================

const Scene2 = memo(function Scene2() {
  return (
    <Scene id="scene-2" className="min-h-[55vh] flex items-center justify-center py-16 border-t border-border/20" delay={100}>
      <div className="max-w-3xl mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight mb-6 text-foreground">
            But everything you do is public.
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Blockchains are public databases. Anyone can replay your entire history. This data never expires.
          </p>
        </div>
        <BlockchainLedger className="mt-8" />
        <div className="mt-12 text-center">
          <div className="inline-flex px-4 py-2 rounded-lg bg-destructive/15 border border-destructive/30">
            <span className="text-sm font-bold tracking-widest text-destructive">PUBLIC FOREVER</span>
          </div>
        </div>
        <div className="mt-12 opacity-60">
          <ArrowDown className="w-5 h-5 mx-auto text-muted-foreground/50 animate-bounce" />
        </div>
      </div>
    </Scene>
  )
})

// ============================================================================
// SCENE 3: Patterns are where identity leaks
// ============================================================================

const Scene3 = memo(function Scene3() {
  return (
    <Scene id="scene-3" className="min-h-[70vh] flex items-center justify-center py-16 border-t border-border/20" delay={100}>
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight mb-6 text-foreground">
            Patterns are where identity leaks.
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Surveillance firms don&apos;t need your name. These three dimensions are enough to fingerprint you.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <PatternRadar values={[0.88, 0.72, 0.91]} />
          <WalletNetwork />
        </div>

        <p className="text-center text-sm text-muted-foreground mt-10 italic">
          Patterns alone are enough to identify you across wallets.
        </p>

        <div className="mt-12 opacity-60">
          <ArrowDown className="w-5 h-5 mx-auto text-muted-foreground/50 animate-bounce" />
        </div>
      </div>
    </Scene>
  )
})

// ============================================================================
// SCENE 4: One action can permanently reduce privacy
// ============================================================================

const Scene4 = memo(function Scene4() {
  return (
    <Scene id="scene-4" className="min-h-[55vh] flex items-center justify-center py-16 border-t border-border/20" delay={100}>
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight mb-6 text-foreground">
            One action can permanently reduce privacy.
          </h2>
          <p className="text-muted-foreground space-y-1">
            One exchange deposit. One interaction with a labeled wallet. One careless transaction.
          </p>
        </div>

        <BeforeAfterLink />

        <p className="text-center text-foreground font-medium mt-10">
          Some links cannot be undone.
        </p>

        <div className="mt-12 opacity-60">
          <ArrowDown className="w-5 h-5 mx-auto text-muted-foreground/50 animate-bounce" />
        </div>
      </div>
    </Scene>
  )
})

// ============================================================================
// SCENE 5: Why starting fresh doesn't fully work
// ============================================================================

const Scene5 = memo(function Scene5() {
  return (
    <Scene id="scene-5" className="min-h-[50vh] flex items-center justify-center py-16 border-t border-border/20" delay={100}>
      <div className="max-w-3xl mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight mb-6 text-foreground">
            Why starting fresh doesn&apos;t fully work.
          </h2>
        </div>

        <div className="space-y-5 max-w-xl mx-auto mb-12">
          <div className="flex items-start gap-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
            <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
            <p className="text-muted-foreground">New wallets inherit behavioral patterns from funding and counterparties</p>
          </div>
          <div className="flex items-start gap-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
            <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
            <p className="text-muted-foreground">Timing and counterparties correlate across wallets—probabilistic matching finds you</p>
          </div>
          <div className="flex items-start gap-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
            <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
            <p className="text-muted-foreground">Surveillance is probabilistic, not naive—patterns betray you</p>
          </div>
        </div>

        <CorrelationChain />

        <div className="mt-12 opacity-60">
          <ArrowDown className="w-5 h-5 mx-auto text-muted-foreground/50 animate-bounce" />
        </div>
      </div>
    </Scene>
  )
})

// ============================================================================
// SCENE 6: What selective privacy actually changes
// ============================================================================

const Scene6 = memo(function Scene6() {
  return (
    <Scene id="scene-6" className="min-h-[80vh] flex items-center justify-center py-16 border-t border-border/20" delay={100}>
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight mb-6 text-foreground">
            What just happened to my privacy?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            How a privacy layer changes your traceability — without hiding or erasing anything.
          </p>
        </div>

        <PrivacyTransformation />

        {/* One-sentence summary */}
        <div className="mt-12 p-6 rounded-2xl bg-primary/5 border-2 border-primary/20">
          <p className="text-sm font-medium text-muted-foreground mb-2 text-center">In one sentence</p>
          <p className="text-base text-foreground text-center max-w-2xl mx-auto">
            encrypt.trade reduces how much others can reliably infer from your future on-chain activity.
          </p>
        </div>

        {/* CTA */}
        <div className="text-center pt-12 mt-12 border-t border-border/20">
          <p className="text-lg text-muted-foreground mb-8">
            See what your wallet already reveals.
          </p>
          <Button
            asChild
            size="lg"
            className="h-12 px-8 rounded-xl font-medium bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_24px_-5px_rgba(8,145,178,0.5)]"
          >
            <a href="/" className="flex items-center gap-2">
              <ScanSearch className="w-5 h-5" />
              Analyze a wallet
              <ArrowRight className="w-4 h-4" />
            </a>
          </Button>
        </div>
      </div>
    </Scene>
  )
})

// ============================================================================
// MAIN EXPORT
// ============================================================================

export const PrivacyStory = memo(function PrivacyStory() {
  return (
    <div className="relative">
      <Scene1 />
      <Scene2 />
      <Scene3 />
      <Scene4 />
      <Scene5 />
      <Scene6 />
    </div>
  )
})

PrivacyStory.displayName = 'PrivacyStory'
