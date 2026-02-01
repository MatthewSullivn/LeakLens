'use client'

import { memo, useRef, useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

/** Shows how a single transaction creates a permanent link in the chain */
export const LeakChain = memo(function LeakChain({ className }: { className?: string }) {
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

  const nodes = [
    { label: 'You', highlight: true },
    { label: 'Bridge', highlight: false },
    { label: 'Protocol', highlight: false },
    { label: 'Label', highlight: true },
  ]

  return (
    <div ref={ref} className={cn('flex items-center justify-center gap-1', className)}>
      {nodes.map((node, i) => (
        <div key={i} className="flex items-center">
          <div
            className={cn(
              'w-9 h-9 sm:w-10 sm:h-10 rounded-lg border-2 flex items-center justify-center text-[9px] font-semibold transition-all duration-500',
              node.highlight
                ? 'bg-primary/20 border-primary/60 text-primary'
                : 'bg-card/80 border-border/50 text-muted-foreground',
              isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
            )}
            style={{ transitionDelay: `${i * 120}ms` }}
          >
            {node.label}
          </div>
          {i < nodes.length - 1 && (
            <div
              className={cn(
                'w-3 sm:w-4 h-px bg-primary/40 transition-all duration-500',
                isVisible ? 'opacity-100' : 'opacity-0'
              )}
              style={{ transitionDelay: `${i * 120 + 60}ms` }}
            />
          )}
        </div>
      ))}
    </div>
  )
})

LeakChain.displayName = 'LeakChain'
