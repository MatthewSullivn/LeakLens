'use client'

import { memo, useRef, useEffect, useState } from 'react'
import { Unlock, Lock, Wallet, Building2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LinkBreakProps {
  className?: string
  /** Show the "broken" state after animation */
  showBroken?: boolean
  /** Delay before showing broken state (ms) */
  breakDelay?: number
}

export const LinkBreak = memo(function LinkBreak({
  className,
  showBroken = false,
  breakDelay = 1500,
}: LinkBreakProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [linksBroken, setLinksBroken] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          if (showBroken) {
            const t = setTimeout(() => setLinksBroken(true), breakDelay)
            return () => clearTimeout(t)
          }
        }
      },
      { threshold: 0.2 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [showBroken, breakDelay])

  const links = [
    { id: 1, breaks: true },
    { id: 2, breaks: true },
    { id: 3, breaks: false },
  ]

  return (
    <div ref={ref} className={cn('relative', className)}>
      <div className="flex items-center justify-center gap-8 sm:gap-12">
        {/* Left: Identity / Exchange */}
        <div
          className={cn(
            'flex flex-col items-center gap-3 transition-all duration-500',
            isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
          )}
        >
          <div className="w-14 h-14 rounded-xl bg-muted/80 border border-border/50 flex items-center justify-center">
            <Building2 className="w-6 h-6 text-muted-foreground" />
          </div>
          <span className="text-xs text-muted-foreground">Exchange / KYC</span>
        </div>

        {/* Center: Your wallet with links */}
        <div
          className={cn(
            'flex flex-col items-center gap-4 transition-all duration-500',
            isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          )}
          style={{ transitionDelay: '100ms' }}
        >
          <div className="w-16 h-16 rounded-2xl bg-primary/20 border-2 border-primary flex items-center justify-center">
            <Wallet className="w-8 h-8 text-primary" />
          </div>
          <span className="text-xs font-medium text-foreground">Your wallet</span>

          {/* Link lines */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <svg width="100%" height="100%" className="absolute" viewBox="0 0 200 100" preserveAspectRatio="none">
              {links.map((link, i) => {
                const isBroken = showBroken && linksBroken && link.breaks
                const angle = -60 + i * 60
                const rad = (angle * Math.PI) / 180
                const x2 = 100 + 60 * Math.cos(rad)
                const y2 = 50 + 60 * Math.sin(rad)
                return (
                  <line
                    key={link.id}
                    x1="100"
                    y1="50"
                    x2={x2}
                    y2={y2}
                    stroke={isBroken ? 'hsl(var(--destructive))' : 'hsl(var(--border))'}
                    strokeWidth="2"
                    strokeDasharray={isBroken ? '4 4' : 'none'}
                    strokeOpacity={isBroken ? 0.5 : 0.6}
                    className="transition-all duration-700"
                  />
                )
              })}
            </svg>
          </div>
        </div>

        {/* Right: Anonymous wallets */}
        <div
          className={cn(
            'flex flex-col items-center gap-3 transition-all duration-500',
            isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
          )}
          style={{ transitionDelay: '200ms' }}
        >
          <div className="flex gap-2">
            {[1, 2].map((i) => (
              <div
                key={i}
                className={cn(
                  'w-10 h-10 rounded-lg bg-card border flex items-center justify-center',
                  showBroken && linksBroken && i === 1 ? 'border-border/30 opacity-50' : 'border-border/50'
                )}
              >
                <Wallet className="w-4 h-4 text-muted-foreground" />
              </div>
            ))}
          </div>
          <span className="text-xs text-muted-foreground">Other wallets</span>
        </div>
      </div>
    </div>
  )
})

LinkBreak.displayName = 'LinkBreak'
