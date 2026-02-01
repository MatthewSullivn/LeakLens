'use client'

import { memo, useRef, useEffect, useState } from 'react'
import { Wallet, ArrowRight, ArrowDown } from 'lucide-react'
import { cn } from '@/lib/utils'

/** Shows how two wallets remain correlated via behavioral patterns */
export const CorrelationChain = memo(function CorrelationChain() {
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true)
      },
      { threshold: 0.2 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={ref} className="flex flex-col items-center">
      {/* Mobile: Column layout, Desktop: Row layout */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-10">
        {/* Wallet 1 */}
        <div
          className={cn(
            'flex flex-col items-center gap-2 transition-all duration-500',
            isVisible ? 'opacity-100 translate-y-0 sm:translate-x-0' : 'opacity-0 -translate-y-4 sm:-translate-x-4 sm:translate-y-0'
          )}
        >
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-card border-2 border-border/50 flex items-center justify-center">
            <Wallet className="w-6 h-6 sm:w-7 sm:h-7 text-muted-foreground" />
          </div>
          <span className="text-xs text-muted-foreground">Old wallet</span>
        </div>

        {/* Connection: dashed line with "pattern match" label - adapts for mobile/desktop */}
        <div
          className={cn(
            'flex flex-col items-center gap-2 transition-all duration-500',
            isVisible ? 'opacity-100' : 'opacity-0'
          )}
          style={{ transitionDelay: '200ms' }}
        >
          {/* Vertical connector for mobile */}
          <div className="flex sm:hidden flex-col items-center gap-1">
            <div className="w-px h-6 bg-gradient-to-b from-transparent via-amber-500/50 to-amber-500/50 border-l-2 border-dashed border-amber-500/40" />
            <ArrowDown className="w-4 h-4 text-amber-500/70" />
            <div className="w-px h-6 bg-gradient-to-b from-amber-500/50 via-amber-500/50 to-transparent border-l-2 border-dashed border-amber-500/40" />
          </div>
          {/* Horizontal connector for desktop */}
          <div className="hidden sm:flex items-center gap-1">
            <div className="w-12 sm:w-20 h-px bg-gradient-to-r from-transparent via-amber-500/50 to-transparent border-t-2 border-dashed border-amber-500/40" />
            <ArrowRight className="w-4 h-4 text-amber-500/70" />
            <div className="w-12 sm:w-20 h-px bg-gradient-to-r from-amber-500/50 via-amber-500/50 to-transparent border-t-2 border-dashed border-amber-500/40" />
          </div>
          <span className="text-[9px] sm:text-[10px] font-medium text-amber-500/90 px-2 py-1 rounded bg-amber-500/10 text-center">
            Same timing · Same counterparties
          </span>
        </div>

        {/* Wallet 2 */}
        <div
          className={cn(
            'flex flex-col items-center gap-2 transition-all duration-500',
            isVisible ? 'opacity-100 translate-y-0 sm:translate-x-0' : 'opacity-0 translate-y-4 sm:translate-x-4 sm:translate-y-0'
          )}
          style={{ transitionDelay: '400ms' }}
        >
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-card border-2 border-border/50 flex items-center justify-center">
            <Wallet className="w-6 h-6 sm:w-7 sm:h-7 text-muted-foreground" />
          </div>
          <span className="text-xs text-muted-foreground">New wallet</span>
        </div>
      </div>

      <p
        className={cn(
          'text-center text-[10px] sm:text-xs text-muted-foreground mt-4 sm:mt-6 max-w-xs transition-all duration-500',
          isVisible ? 'opacity-100' : 'opacity-0'
        )}
        style={{ transitionDelay: '600ms' }}
      >
        Connection still visible to probabilistic analysis
      </p>
    </div>
  )
})

CorrelationChain.displayName = 'CorrelationChain'
