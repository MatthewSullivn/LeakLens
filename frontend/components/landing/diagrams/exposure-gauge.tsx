'use client'

import { memo, useRef, useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

interface ExposureGaugeProps {
  className?: string
  /** 0-100 exposure value */
  value?: number
  size?: number
}

export const ExposureGauge = memo(function ExposureGauge({
  className,
  value = 72,
  size = 120,
}: ExposureGaugeProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [animatedValue, setAnimatedValue] = useState(0)

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

  useEffect(() => {
    if (!isVisible) return
    const duration = 800
    const start = 0
    const startTime = Date.now()

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 2)
      setAnimatedValue(start + (value - start) * eased)
      if (progress < 1) requestAnimationFrame(animate)
    }
    requestAnimationFrame(animate)
  }, [isVisible, value])

  const r = 45
  const cx = 50
  const cy = 55
  const strokeWidth = 8
  const circumference = Math.PI * r
  const dashOffset = circumference - (animatedValue / 100) * circumference

  const getColor = (v: number) => {
    if (v < 30) return 'oklch(0.6 0.15 145)' // green
    if (v < 60) return 'oklch(0.75 0.15 85)' // yellow/amber
    return 'oklch(0.65 0.2 25)' // red
  }

  return (
    <div ref={ref} className={cn('flex flex-col items-center', className)}>
      <svg
        viewBox="0 0 100 70"
        className="w-full max-w-[140px]"
        style={{ width: size, height: size * 0.7 }}
      >
        <defs>
          <linearGradient id="gauge-bg" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" stopColor="oklch(0.3 0.02 240)" />
            <stop offset="1" stopColor="oklch(0.25 0.02 240)" />
          </linearGradient>
          <linearGradient id="gauge-fill" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" stopColor="oklch(0.6 0.15 145)" />
            <stop offset="0.5" stopColor="oklch(0.75 0.15 85)" />
            <stop offset="1" stopColor="oklch(0.65 0.2 25)" />
          </linearGradient>
        </defs>
        {/* Background arc */}
        <path
          d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
          fill="none"
          stroke="url(#gauge-bg)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          className="opacity-60"
        />
        {/* Value arc */}
        <path
          d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
          fill="none"
          stroke={getColor(animatedValue)}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          className={cn(
            'transition-all duration-300',
            isVisible ? 'opacity-100' : 'opacity-0'
          )}
        />
        {/* Value text */}
        <text
          x={cx}
          y={cy + 5}
          textAnchor="middle"
          className={cn(
            'text-[14px] font-bold fill-foreground transition-opacity duration-500',
            isVisible ? 'opacity-100' : 'opacity-0'
          )}
          style={{ fill: 'var(--foreground)' }}
        >
          {Math.round(animatedValue)}%
        </text>
      </svg>
    </div>
  )
})

ExposureGauge.displayName = 'ExposureGauge'
