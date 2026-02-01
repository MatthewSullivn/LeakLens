'use client'

import { memo, useRef, useEffect, useState } from 'react'
import { Wallet, RefreshCcw, Coins } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TransactionFlowProps {
  className?: string
}

export const TransactionFlow = memo(function TransactionFlow({ className }: TransactionFlowProps) {
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

  const steps = [
    { icon: Wallet, label: 'Wallet', color: 'from-cyan-500/20 to-blue-500/20 border-cyan-500/30' },
    { icon: RefreshCcw, label: 'Swap', color: 'from-primary/20 to-cyan-500/20 border-primary/40' },
    { icon: Coins, label: 'Token', color: 'from-violet-500/20 to-purple-500/20 border-violet-500/30' },
  ]

  return (
    <div ref={ref} className={cn('relative', className)}>
      <div className="flex items-center justify-center gap-4 sm:gap-8">
        {steps.map((step, i) => (
          <div key={i} className="flex items-center gap-4 sm:gap-8">
            <div
              className={cn(
                'flex flex-col items-center gap-3 transition-all duration-600',
                isVisible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-90 translate-y-4'
              )}
              style={{ transitionDelay: `${i * 200}ms` }}
            >
              <div
                className={cn(
                  'w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center',
                  'bg-gradient-to-br border-2 shadow-lg',
                  step.color
                )}
              >
                <step.icon className="w-7 h-7 sm:w-8 sm:h-8 text-foreground/90" />
              </div>
              <span className="text-sm font-medium text-muted-foreground">{step.label}</span>
            </div>

            {i < steps.length - 1 && (
              <div
                className={cn(
                  'flex items-center transition-all duration-500',
                  isVisible ? 'opacity-100' : 'opacity-0'
                )}
                style={{ transitionDelay: `${i * 200 + 150}ms` }}
              >
                <svg width={40} height={24} className="text-muted-foreground/50">
                  <defs>
                    <marker
                      id={`arrow-${i}`}
                      markerWidth="8"
                      markerHeight="8"
                      refX="6"
                      refY="4"
                      orient="auto"
                    >
                      <path d="M0 0 L8 4 L0 8 Z" fill="currentColor" />
                    </marker>
                  </defs>
                  <line
                    x1="0"
                    y1="12"
                    x2="36"
                    y2="12"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeDasharray="4 2"
                    markerEnd={`url(#arrow-${i})`}
                    className={isVisible ? 'animate-pulse' : ''}
                    style={{ animationDuration: '2s' }}
                  />
                </svg>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
})

TransactionFlow.displayName = 'TransactionFlow'
