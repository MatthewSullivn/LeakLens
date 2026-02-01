'use client'

import { memo, useRef, useEffect, useState } from 'react'
import { Wallet } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Node {
  x: number
  y: number
  size: number
  isCentral?: boolean
  delay: number
}

interface WalletNetworkProps {
  className?: string
  /** Number of peripheral nodes */
  nodeCount?: number
  /** Use smaller radius to fit in tight containers without cropping */
  compact?: boolean
}

export const WalletNetwork = memo(function WalletNetwork({
  className,
  nodeCount = 6,
  compact = false,
}: WalletNetworkProps) {
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

  const centerX = 50
  const centerY = 50
  const radius = compact ? 28 : 38

  const nodes: Node[] = [
    { x: centerX, y: centerY, size: 24, isCentral: true, delay: 0 },
    ...Array.from({ length: nodeCount }, (_, i) => {
      const angle = (i / nodeCount) * 2 * Math.PI - Math.PI / 2 + 0.3
      return {
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
        size: 10,
        delay: 100 + i * 80,
      }
    }),
  ]

  const central = nodes[0]
  const peripherals = nodes.slice(1)

  return (
    <div ref={ref} className={cn('relative', className)}>
      {/* Responsive SVG container */}
      <svg 
        viewBox="0 0 100 100" 
        className={cn(
          'w-full mx-auto aspect-square', 
          !compact && 'max-w-[200px] sm:max-w-[280px]'
        )}
        role="img"
        aria-label="Wallet network diagram showing connections"
      >
        {/* Connection lines */}
        {peripherals.map((p, i) => (
          <line
            key={i}
            x1={centerX}
            y1={centerY}
            x2={p.x}
            y2={p.y}
            stroke="oklch(0.55 0.02 240)"
            strokeOpacity={0.5}
            strokeWidth="0.8"
            strokeDasharray="3 2"
            className={cn(
              'transition-all duration-500',
              isVisible ? 'opacity-100' : 'opacity-0'
            )}
            style={{ transitionDelay: `${i * 50}ms` }}
          />
        ))}

        {/* Peripheral nodes - use visible fills so they don't blend into black background */}
        {peripherals.map((p, i) => (
          <g key={i}>
            <circle
              cx={p.x}
              cy={p.y}
              r={p.size / 2}
              fill="oklch(0.38 0.02 240)"
              stroke="oklch(0.55 0.02 240)"
              strokeWidth="1.5"
              className={cn(
                'transition-all duration-500',
                isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
              )}
              style={{
                transformOrigin: `${p.x}px ${p.y}px`,
                transitionDelay: `${p.delay}ms`,
              }}
            />
          </g>
        ))}

        {/* Central wallet - you (primary cyan for visibility) */}
        <g>
          <circle
            cx={centerX}
            cy={centerY}
            r={central.size / 2}
            fill="oklch(0.75 0.15 195 / 0.25)"
            stroke="oklch(0.75 0.15 195)"
            strokeWidth="2"
            className={cn(
              'transition-all duration-500',
              isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
            )}
            style={{ transitionDelay: '0ms' }}
          />
          <circle
            cx={centerX}
            cy={centerY}
            r="3"
            fill="oklch(0.75 0.15 195)"
            className={cn(
              'transition-opacity duration-500',
              isVisible ? 'opacity-100' : 'opacity-0'
            )}
          />
        </g>
      </svg>

      {!compact && (
        <p
          className={cn(
            'text-center text-[10px] sm:text-xs text-muted-foreground mt-3 sm:mt-4 transition-all duration-500 px-2',
            isVisible ? 'opacity-100' : 'opacity-0'
          )}
          style={{ transitionDelay: '500ms' }}
        >
          <span className="text-primary font-medium">You</span> in the center — every connection is a potential identity link
        </p>
      )}
    </div>
  )
})

WalletNetwork.displayName = 'WalletNetwork'
