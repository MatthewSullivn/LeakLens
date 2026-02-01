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
      <div className="flex items-center justify-center gap-2 sm:gap-4 md:gap-8">
        {steps.map((step, i) => (
          <div key={i} className="flex items-center gap-2 sm:gap-4 md:gap-8">
            <div
              className={cn(
                'flex flex-col items-center gap-2 sm:gap-3 transition-all duration-600',
                isVisible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-90 translate-y-4'
              )}
              style={{ transitionDelay: `${i * 200}ms` }}
            >
              <div
                className={cn(
                  'w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-xl sm:rounded-2xl flex items-center justify-center',
                  'bg-gradient-to-br border-2 shadow-lg',
                  step.color
                )}
              >
                <step.icon className="w-5 h-5 sm:w-7 sm:h-7 md:w-8 md:h-8 text-foreground/90" />
              </div>
              <span className="text-xs sm:text-sm font-medium text-muted-foreground">{step.label}</span>
            </div>

            {i < steps.length - 1 && (
              <div
                className={cn(
                  'flex items-center transition-all duration-500',
                  isVisible ? 'opacity-100' : 'opacity-0'
                )}
                style={{ transitionDelay: `${i * 200 + 150}ms` }}
              >
                {/* Responsive arrow - smaller on mobile */}
                <svg width={24} height={16} className="sm:w-[40px] sm:h-[24px] text-muted-foreground/50">
                  <defs>
                    <marker
                      id={`arrow-${i}`}
                      markerWidth="6"
                      markerHeight="6"
                      refX="4"
                      refY="3"
                      orient="auto"
                    >
                      <path d="M0 0 L6 3 L0 6 Z" fill="currentColor" />
                    </marker>
                  </defs>
                  <line
                    x1="0"
                    y1="8"
                    x2="20"
                    y2="8"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeDasharray="3 2"
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
