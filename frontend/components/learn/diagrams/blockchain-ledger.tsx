'use client'

import { memo, useRef, useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

interface BlockchainLedgerProps {
  className?: string
  /** Index of the block to highlight as "yours" (0 = most recent) */
  yourBlockIndex?: number
}

export const BlockchainLedger = memo(function BlockchainLedger({
  className,
  yourBlockIndex = 2,
}: BlockchainLedgerProps) {
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

  const blocks = [
    { label: 'Genesis', highlight: false },
    { label: '…', highlight: false },
    { label: 'Week 1', highlight: false },
    { label: 'Today', highlight: true },
    { label: 'Forever', highlight: false },
  ]

  return (
    <div ref={ref} className={cn('relative', className)}>
      <div className="flex flex-col items-center">
        {/* Chain of blocks - vertical stack */}
        <div className="flex flex-col items-center gap-0">
          {blocks.map((block, i) => (
            <div key={i} className="flex flex-col items-center">
              <div
                className={cn(
                  'w-36 sm:w-44 h-11 rounded-lg border flex items-center justify-center text-xs font-medium transition-all duration-500',
                  block.highlight
                    ? 'bg-primary/20 border-primary/50 text-primary shadow-[0_0_24px_-5px_rgba(8,145,178,0.5)]'
                    : 'bg-card/80 border-border/50 text-muted-foreground',
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
                )}
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                {block.label}
              </div>
              {i < blocks.length - 1 && (
                <div
                  className={cn(
                    'w-px h-3 bg-gradient-to-b from-border/50 via-primary/20 to-border/50 transition-opacity duration-500',
                    isVisible ? 'opacity-100' : 'opacity-0'
                  )}
                  style={{ transitionDelay: `${i * 100 + 50}ms` }}
                />
              )}
            </div>
          ))}
        </div>

        {/* "Immutable" badge */}
        <div
          className={cn(
            'mt-8 px-5 py-2.5 rounded-xl border transition-all duration-700',
            isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95',
            'bg-destructive/10 border-destructive/40'
          )}
          style={{ transitionDelay: '500ms' }}
        >
          <span className="text-sm font-bold tracking-widest text-destructive">IMMUTABLE · NEVER EXPIRES</span>
        </div>
      </div>
    </div>
  )
})

BlockchainLedger.displayName = 'BlockchainLedger'
