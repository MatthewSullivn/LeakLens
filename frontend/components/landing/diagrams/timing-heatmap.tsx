'use client'

import { memo, useRef, useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

/** Mini heatmap showing activity concentration by time (e.g. 24h or week) */
interface TimingHeatmapProps {
  className?: string
  /** 24 values for each hour, or 7 for days - intensity 0-1 */
  values?: number[]
  cols?: number
}

export const TimingHeatmap = memo(function TimingHeatmap({
  className,
  values = [0.2, 0.1, 0, 0, 0, 0.1, 0.3, 0.6, 0.8, 0.9, 0.7, 0.8, 0.6, 0.5, 0.7, 0.9, 0.8, 0.6, 0.4, 0.3, 0.5, 0.7, 0.4, 0.2],
  cols = 12,
}: TimingHeatmapProps) {
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

  const rows = Math.ceil(values.length / cols)
  const cellSize = 8
  const gap = 2

  return (
    <div ref={ref} className={cn('relative', className)}>
      <div
        className="grid gap-[2px]"
        style={{
          gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`,
          gridTemplateRows: `repeat(${rows}, ${cellSize}px)`,
        }}
      >
        {values.slice(0, cols * rows).map((v, i) => (
          <div
            key={i}
            className={cn(
              'rounded-sm transition-all duration-500',
              isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
            )}
            style={{
              backgroundColor: `rgba(8, 145, 178, ${0.2 + v * 0.6})`,
              transitionDelay: `${i * 20}ms`,
            }}
          />
        ))}
      </div>
      <div
        className={cn(
          'flex justify-between mt-2 text-[9px] text-muted-foreground transition-opacity duration-500',
          isVisible ? 'opacity-100' : 'opacity-0'
        )}
        style={{ transitionDelay: '300ms' }}
      >
        <span>12a</span>
        <span>6a</span>
        <span>12p</span>
        <span>6p</span>
        <span>12a</span>
      </div>
    </div>
  )
})

TimingHeatmap.displayName = 'TimingHeatmap'
