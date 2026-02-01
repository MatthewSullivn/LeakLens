'use client'

import { memo, useRef, useEffect, useState } from 'react'
import { Wallet, ArrowRight } from 'lucide-react'
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
      <div className="flex items-center justify-center gap-6 sm:gap-10">
        {/* Wallet 1 */}
        <div
          className={cn(
            'flex flex-col items-center gap-2 transition-all duration-500',
            isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
          )}
        >
          <div className="w-16 h-16 rounded-2xl bg-card border-2 border-border/50 flex items-center justify-center">
            <Wallet className="w-7 h-7 text-muted-foreground" />
          </div>
          <span className="text-xs text-muted-foreground">Old wallet</span>
        </div>

        {/* Connection: dashed line with "pattern match" label */}
        <div
          className={cn(
            'flex flex-col items-center gap-2 transition-all duration-500',
            isVisible ? 'opacity-100' : 'opacity-0'
          )}
          style={{ transitionDelay: '200ms' }}
        >
          <div className="flex items-center gap-1">
            <div className="w-12 sm:w-20 h-px bg-gradient-to-r from-transparent via-amber-500/50 to-transparent border-t-2 border-dashed border-amber-500/40" />
            <ArrowRight className="w-4 h-4 text-amber-500/70" />
            <div className="w-12 sm:w-20 h-px bg-gradient-to-r from-amber-500/50 via-amber-500/50 to-transparent border-t-2 border-dashed border-amber-500/40" />
          </div>
          <span className="text-[10px] font-medium text-amber-500/90 px-2 py-1 rounded bg-amber-500/10">
            Same timing · Same counterparties
          </span>
        </div>

        {/* Wallet 2 */}
        <div
          className={cn(
            'flex flex-col items-center gap-2 transition-all duration-500',
            isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
          )}
          style={{ transitionDelay: '400ms' }}
        >
          <div className="w-16 h-16 rounded-2xl bg-card border-2 border-border/50 flex items-center justify-center">
            <Wallet className="w-7 h-7 text-muted-foreground" />
          </div>
          <span className="text-xs text-muted-foreground">New wallet</span>
        </div>
      </div>

      <p
        className={cn(
          'text-center text-xs text-muted-foreground mt-6 max-w-xs transition-all duration-500',
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
