'use client'

import { memo, useRef, useEffect, useState } from 'react'
import { Wallet, Building2, Fingerprint, Link2, Shield, Link2Off } from 'lucide-react'
import { cn } from '@/lib/utils'

type Stage = 'before' | 'transition' | 'after'

// Memoized node data to prevent recreation on each render
const PERIPHERAL_NODES = [
  { x: 22, y: 30, label: 'A', breaks: false },
  { x: 78, y: 30, label: 'B', breaks: true },
  { x: 78, y: 70, label: 'C', breaks: true },
  { x: 22, y: 70, label: 'D', breaks: false },
] as const

export const PrivacyTransformation = memo(function PrivacyTransformation() {
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [stage, setStage] = useState<Stage>('before')

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) {
      setStage('after')
      setIsVisible(true)
      return
    }

    let t1: ReturnType<typeof setTimeout> | null = null
    let t2: ReturnType<typeof setTimeout> | null = null

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          t1 = setTimeout(() => setStage('transition'), 1400)
          t2 = setTimeout(() => setStage('after'), 3200)
        }
      },
      { threshold: 0.15 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => {
      observer.disconnect()
      if (t1) clearTimeout(t1)
      if (t2) clearTimeout(t2)
    }
  }, [])

  const nodeFill = 'oklch(0.38 0.02 240)'
  const nodeStroke = 'oklch(0.55 0.02 240)'
  const centralFill = 'oklch(0.75 0.15 195 / 0.3)'
  const centralStroke = 'oklch(0.75 0.15 195)'
  const solidLine = 'oklch(0.5 0.02 240)'
  const brokenLine = 'oklch(0.65 0.2 25)'

  return (
    <div ref={ref} className="space-y-12">
      {/* Before: Dense connection web */}
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Before — tracking was trivial
          </h3>
          <p className="text-sm text-muted-foreground max-w-xl mx-auto">
            Every link from your wallet to exchanges, counterparties, or labeled addresses made you easier to identify.
          </p>
        </div>

        <div
          className={cn(
            'p-4 sm:p-8 rounded-2xl border border-border/40 transition-all duration-600',
            'bg-card/20',
            isVisible ? 'opacity-100' : 'opacity-0'
          )}
        >
          {/* Mobile: Column layout, Desktop: Row layout */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 md:gap-12">
            {/* Your Wallet */}
            <div className="flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-xl bg-primary/15 border-2 border-primary/50 flex items-center justify-center">
                <Wallet className="w-7 h-7 text-primary" />
              </div>
              <span className="text-xs font-medium text-foreground">Your wallet</span>
            </div>
            
            {/* Connection indicator - rotates on mobile */}
            <div className="flex items-center gap-2 text-muted-foreground/50">
              <Link2 className="w-5 h-5 rotate-90 sm:rotate-0" />
              <span className="text-xs">connected to</span>
            </div>
            
            {/* Connected entities - horizontal row on both mobile and desktop */}
            <div className="flex flex-row justify-center gap-4 sm:gap-6">
              <div className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-muted/80 border border-border/50 flex items-center justify-center">
                  <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                </div>
                <span className="text-[10px] sm:text-xs text-muted-foreground">Exchanges</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-muted/80 border border-border/50 flex items-center justify-center">
                  <Wallet className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                </div>
                <span className="text-[10px] sm:text-xs text-muted-foreground">Other wallets</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-muted/80 border border-border/50 flex items-center justify-center">
                  <Fingerprint className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                </div>
                <span className="text-[10px] sm:text-xs text-muted-foreground">Past behavior</span>
              </div>
            </div>
          </div>
          <p className="text-center text-xs sm:text-sm text-muted-foreground mt-4 sm:mt-6">
            Clustering algorithms used these links to build a profile of you.
          </p>
        </div>
      </div>

      {/* Privacy layer intervention */}
      <div
        className={cn(
          'p-6 sm:p-8 rounded-2xl border-2 transition-all duration-600',
          'bg-primary/5 border-primary/25',
          isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-[0.98]'
        )}
        style={{ transitionDelay: '200ms' }}
      >
        <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
          <div className="p-3 rounded-xl bg-primary/10 border border-primary/30 shrink-0">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-1">
              A privacy layer enters the picture
            </h3>
            <p className="text-sm text-muted-foreground mb-2">
              <span className="text-primary font-medium">encrypt.trade</span> doesn&apos;t hide or erase anything. It breaks some of the links that make you traceable.
            </p>
            <p className="text-sm text-foreground">
              Same history. Fewer ways to connect it back to you.
            </p>
          </div>
        </div>
      </div>

      {/* After: Network with broken links */}
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-foreground mb-2">
            After — tracking gets harder
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-xl mx-auto px-2">
            Fewer links mean noisier clustering. Labels become less confident. Profiles stay incomplete.
          </p>
        </div>

        <div className="p-4 sm:p-8 rounded-2xl bg-card/20 border border-border/40">
          {/* SVG Network visualization - responsive sizing */}
          <div className="relative mx-auto w-full max-w-[240px] sm:max-w-[320px] aspect-square">
            <svg viewBox="0 0 100 100" className="w-full h-full" role="img" aria-label="Network diagram showing tracking connections">
              {/* Central node */}
              <circle
                cx="50"
                cy="50"
                r="12"
                fill={centralFill}
                stroke={centralStroke}
                strokeWidth="2"
              />
              <text x="50" y="52" textAnchor="middle" dominantBaseline="middle" fill={centralStroke} fontSize="6" fontWeight="bold">
                YOU
              </text>

              {/* Peripheral nodes - using memoized data */}
              {PERIPHERAL_NODES.map((p, i) => {
                const isBroken = stage === 'after' && p.breaks
                return (
                  <g key={i}>
                    {/* Connection line */}
                    <line
                      x1="50"
                      y1="50"
                      x2={p.x}
                      y2={p.y}
                      stroke={isBroken ? brokenLine : solidLine}
                      strokeWidth={isBroken ? 1.2 : 1.5}
                      strokeDasharray={isBroken ? '3 3' : 'none'}
                      strokeOpacity={isBroken ? 0.6 : 0.5}
                      className="transition-all duration-700"
                    />
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r="6"
                      fill={nodeFill}
                      stroke={nodeStroke}
                      strokeWidth="1"
                      opacity={isBroken ? 0.5 : 1}
                      className="transition-opacity duration-700"
                    />
                  </g>
                )
              })}
            </svg>

            {/* Legend overlay - responsive text */}
            <div className="absolute -bottom-2 left-0 right-0 flex justify-center gap-3 sm:gap-6 text-[9px] sm:text-[10px]">
              <span className="flex items-center gap-1 sm:gap-1.5 text-muted-foreground">
                <span className="w-2.5 sm:w-3 h-0.5 bg-border rounded" />
                Intact link
              </span>
              <span className="flex items-center gap-1 sm:gap-1.5 text-destructive/80">
                <span className="w-2.5 sm:w-3 h-0.5 border border-dashed border-destructive/60 rounded" />
                Broken link
              </span>
            </div>
          </div>

          {/* Stats grid - responsive */}
          <div className="mt-8 sm:mt-6 grid grid-cols-3 gap-2 sm:gap-4 text-center">
            <div className="p-2 sm:p-3 rounded-xl bg-muted/30 border border-border/30">
              <p className="text-[10px] sm:text-xs font-medium text-foreground">Clustering</p>
              <p className="text-[9px] sm:text-xs text-muted-foreground">Noisier, less reliable</p>
            </div>
            <div className="p-2 sm:p-3 rounded-xl bg-muted/30 border border-border/30">
              <p className="text-[10px] sm:text-xs font-medium text-foreground">Labels</p>
              <p className="text-[9px] sm:text-xs text-muted-foreground">Lower confidence</p>
            </div>
            <div className="p-2 sm:p-3 rounded-xl bg-muted/30 border border-border/30">
              <p className="text-[10px] sm:text-xs font-medium text-foreground">Profiles</p>
              <p className="text-[9px] sm:text-xs text-muted-foreground">Stay incomplete</p>
            </div>
          </div>
        </div>
      </div>

      {/* Takeaway */}
      <div
        className={cn(
          'p-4 sm:p-6 rounded-2xl border transition-all duration-600',
          'bg-primary/5 border-primary/20',
          isVisible ? 'opacity-100' : 'opacity-0'
        )}
        style={{ transitionDelay: '400ms' }}
      >
        <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
          <div className="p-2 rounded-lg bg-primary/10 shrink-0">
            <Link2Off className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-2">The bottom line</h4>
            <p className="text-xs sm:text-sm text-muted-foreground mb-2">
              Your past stays public. What changes is how hard it is to reliably link future activity back to you.
            </p>
            <p className="text-xs sm:text-sm text-foreground font-medium">
              That&apos;s selective privacy — fewer traceable links, not a rewritten history.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
})

PrivacyTransformation.displayName = 'PrivacyTransformation'
