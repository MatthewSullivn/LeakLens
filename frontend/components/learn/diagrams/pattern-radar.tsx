'use client'

import { memo, useRef, useEffect, useState } from 'react'
import { Clock, Fingerprint, Users } from 'lucide-react'
import { cn } from '@/lib/utils'

const AXES = 3
const R = 50
const CX = 50
const CY = 50

function polarToCart(angleDeg: number, radius: number): { x: number; y: number } {
  const a = (angleDeg / 360) * 2 * Math.PI - Math.PI / 2
  return {
    x: CX + radius * Math.cos(a),
    y: CY + radius * Math.sin(a),
  }
}

interface PatternRadarProps {
  className?: string
  /** Values 0-1 for each dimension: timing, amounts, connections */
  values?: [number, number, number]
}

export const PatternRadar = memo(function PatternRadar({
  className,
  values = [0.85, 0.7, 0.9],
}: PatternRadarProps) {
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

  const dimensions = [
    { label: 'Timing', shortLabel: 'Time', icon: Clock, value: values[0] },
    { label: 'Amounts', shortLabel: 'Amount', icon: Fingerprint, value: values[1] },
    { label: 'Connections', shortLabel: 'Links', icon: Users, value: values[2] },
  ]

  const polygonPoints = dimensions
    .map((d, i) => {
      const angle = (i / AXES) * 360
      const { x, y } = polarToCart(angle, R * d.value)
      return `${x},${y}`
    })
    .join(' ')

  const gridLevels = [0.33, 0.66, 1]
  const gridPolygons = gridLevels.map((scale) =>
    dimensions
      .map((_, i) => {
        const angle = (i / AXES) * 360
        const { x, y } = polarToCart(angle, R * scale)
        return `${x},${y}`
      })
      .join(' ')
  )

  return (
    <div ref={ref} className={cn('flex flex-col items-center gap-6', className)}>
      {/* Radar chart */}
      <div className="relative" style={{ width: 200, height: 200 }}>
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {/* Grid rings */}
          {gridPolygons.map((points, i) => (
            <polygon
              key={i}
              points={points}
              fill="none"
              stroke="currentColor"
              strokeOpacity={0.15}
              strokeWidth="0.5"
              className="transition-opacity duration-500"
              style={{ opacity: isVisible ? 1 : 0 }}
            />
          ))}

          {/* Axis lines */}
          {dimensions.map((_, i) => {
            const angle = (i / AXES) * 360
            const end = polarToCart(angle, R)
            return (
              <line
                key={i}
                x1={CX}
                y1={CY}
                x2={end.x}
                y2={end.y}
                stroke="currentColor"
                strokeOpacity={0.2}
                strokeWidth="0.5"
                className="transition-opacity duration-500"
                style={{ opacity: isVisible ? 1 : 0 }}
              />
            )
          })}

          {/* Data polygon */}
          <polygon
            points={polygonPoints}
            fill="oklch(0.75 0.15 195 / 0.2)"
            stroke="oklch(0.75 0.15 195)"
            strokeWidth="2"
            className={cn(
              'transition-all duration-700',
              isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
            )}
          />
        </svg>

        {/* Center "you" indicator */}
        <div
          className={cn(
            'absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full',
            'bg-primary/30 border-2 border-primary flex items-center justify-center',
            'transition-all duration-500',
            isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
          )}
        >
          <span className="text-[10px] font-bold text-primary">?</span>
        </div>
      </div>

      {/* Legend with icons */}
      <div className="grid grid-cols-3 gap-4 w-full max-w-sm">
        {dimensions.map((d, i) => (
          <div
            key={i}
            className={cn(
              'flex flex-col items-center gap-2 p-3 rounded-xl border transition-all duration-500',
              'bg-card/50 border-border/40',
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
            )}
            style={{ transitionDelay: `${400 + i * 100}ms` }}
          >
            <d.icon className="w-5 h-5 text-primary" />
            <span className="text-xs font-medium text-foreground">{d.label}</span>
            <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-700"
                style={{
                  width: `${d.value * 100}%`,
                  transitionDelay: `${600 + i * 100}ms`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
})

PatternRadar.displayName = 'PatternRadar'
