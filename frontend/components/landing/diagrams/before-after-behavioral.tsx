'use client'

import { memo, useRef, useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

/** Visual comparison: Behavioral Clusters (before) vs Fragmented Activity (after) */
export const BeforeAfterDiagram = memo(function BeforeAfterDiagram() {
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true)
      },
      { threshold: 0.15 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  const cx = 50
  const cy = 50
  const centralR = 10
  const peripheralR = 5

  // Before: Dense cluster - many connections
  const beforeNodes = [
    { x: cx, y: cy, r: centralR },
    { x: 25, y: 25, r: peripheralR },
    { x: 75, y: 25, r: peripheralR },
    { x: 75, y: 75, r: peripheralR },
    { x: 25, y: 75, r: peripheralR },
    { x: 50, y: 18, r: peripheralR },
    { x: 82, y: 50, r: peripheralR },
  ]

  // After: Fragmented - fewer/solid links, more isolated
  const afterNodes = [
    { x: cx, y: cy, r: centralR },
    { x: 22, y: 30, r: peripheralR },
    { x: 78, y: 35, r: peripheralR },
    { x: 72, y: 72, r: peripheralR },
    { x: 28, y: 68, r: peripheralR },
  ]

  const beforeLinks = [
    [0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [0, 6], [1, 4], [2, 3],
  ]
  const afterLinks = [
    [0, 1], [0, 3], // Fewer links - fragmented
  ]

  const Link = ({ x1, y1, x2, y2, dashed = false, color }: { x1: number; y1: number; x2: number; y2: number; dashed?: boolean; color: string }) => (
    <line
      x1={x1} y1={y1} x2={x2} y2={y2}
      stroke={color}
      strokeWidth="1.2"
      strokeOpacity={0.6}
      strokeDasharray={dashed ? '3 3' : 'none'}
    />
  )

  return (
    <div ref={ref} className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Before: Clustered */}
      <div
        className={cn(
          'p-6 rounded-2xl border-2 border-destructive/30 bg-card/30',
          'transition-all duration-600',
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        )}
      >
        <div className="flex items-center gap-2 mb-4">
          <span className="w-2 h-2 rounded-full bg-destructive" />
          <span className="text-sm font-bold uppercase text-foreground">Behavioral clusters</span>
        </div>
        <div className="relative h-48">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {beforeLinks.map(([i, j], idx) => (
              <Link
                key={idx}
                x1={beforeNodes[i].x} y1={beforeNodes[i].y}
                x2={beforeNodes[j].x} y2={beforeNodes[j].y}
                color="oklch(0.65 0.2 25 / 0.6)"
              />
            ))}
            {beforeNodes.map((n, i) => (
              <circle
                key={i}
                cx={n.x} cy={n.y} r={n.r}
                fill={i === 0 ? 'oklch(0.65 0.2 25 / 0.3)' : 'oklch(0.35 0.02 240)'}
                stroke={i === 0 ? 'oklch(0.65 0.2 25)' : 'oklch(0.5 0.02 240)'}
                strokeWidth="1.5"
                className={cn(
                  'transition-all duration-500',
                  isVisible ? 'opacity-100' : 'opacity-0'
                )}
                style={{ transitionDelay: `${i * 80}ms` }}
              />
            ))}
          </svg>
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          Dense links = easy to profile
        </p>
      </div>

      {/* After: Fragmented */}
      <div
        className={cn(
          'p-6 rounded-2xl border-2 border-[var(--color-cyan-600)]/40 bg-card/30',
          'transition-all duration-600',
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        )}
        style={{ transitionDelay: '100ms' }}
      >
        <div className="flex items-center gap-2 mb-4">
          <span className="w-2 h-2 rounded-full bg-[var(--color-cyan-600)]" />
          <span className="text-sm font-bold uppercase text-foreground">Fragmented activity</span>
        </div>
        <div className="relative h-48">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {afterLinks.map(([i, j], idx) => (
              <Link
                key={idx}
                x1={afterNodes[i].x} y1={afterNodes[i].y}
                x2={afterNodes[j].x} y2={afterNodes[j].y}
                color="oklch(0.75 0.15 195 / 0.5)"
              />
            ))}
            {afterNodes.map((n, i) => (
              <circle
                key={i}
                cx={n.x} cy={n.y} r={n.r}
                fill={i === 0 ? 'oklch(0.75 0.15 195 / 0.25)' : 'oklch(0.38 0.02 240)'}
                stroke={i === 0 ? 'oklch(0.75 0.15 195)' : 'oklch(0.55 0.02 240)'}
                strokeWidth="1.5"
                className={cn(
                  'transition-all duration-500',
                  isVisible ? 'opacity-100' : 'opacity-0'
                )}
                style={{ transitionDelay: `${200 + i * 80}ms` }}
              />
            ))}
          </svg>
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          Fewer links = harder to correlate
        </p>
      </div>
    </div>
  )
})

BeforeAfterDiagram.displayName = 'BeforeAfterDiagram'
