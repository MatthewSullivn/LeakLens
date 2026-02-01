'use client'

import { memo, useRef, useEffect, useState } from 'react'
import { Unlock, Lock, Wallet } from 'lucide-react'
import { cn } from '@/lib/utils'

export const BeforeAfterLink = memo(function BeforeAfterLink() {
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
    <div ref={ref} className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Before: Unlinked */}
      <div
        className={cn(
          'p-8 rounded-2xl border-2 transition-all duration-600',
          'bg-card/30 border-primary/30',
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        )}
      >
        <div className="flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-2xl bg-primary/15 border-2 border-primary/40 flex items-center justify-center mb-4">
            <Unlock className="w-10 h-10 text-primary/80" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">Unlinked</h3>
          <p className="text-sm text-muted-foreground mb-6">Anonymous on-chain identity</p>
          <div className="flex items-center justify-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-card border border-border/50 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="w-12 h-0.5 bg-gradient-to-r from-transparent via-muted-foreground/30 to-transparent" />
            <div className="w-10 h-10 rounded-xl bg-card border border-border/50 flex items-center justify-center opacity-50">
              <Wallet className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="w-12 h-0.5 bg-gradient-to-r from-transparent via-muted-foreground/30 to-transparent" />
            <div className="w-10 h-10 rounded-xl bg-card border border-border/50 flex items-center justify-center opacity-30">
              <Wallet className="w-5 h-5 text-muted-foreground" />
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-4">No traceable path to you</p>
        </div>
      </div>

      {/* After: Linked */}
      <div
        className={cn(
          'p-8 rounded-2xl border-2 transition-all duration-600',
          'bg-destructive/5 border-destructive/40',
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        )}
        style={{ transitionDelay: '150ms' }}
      >
        <div className="flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-2xl bg-destructive/15 border-2 border-destructive/50 flex items-center justify-center mb-4">
            <Lock className="w-10 h-10 text-destructive" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">Linked</h3>
          <p className="text-sm text-muted-foreground mb-6">Permanently connected to identity</p>
          <div className="flex items-center justify-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-destructive/20 border-2 border-destructive/50 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-destructive" />
            </div>
            <div className="w-6 h-0.5 bg-destructive/60" />
            <div className="w-10 h-10 rounded-xl bg-destructive/15 border border-destructive/40 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-destructive/80" />
            </div>
            <div className="w-6 h-0.5 bg-destructive/60" />
            <div className="w-10 h-10 rounded-xl bg-destructive/10 border border-destructive/30 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-destructive/60" />
            </div>
          </div>
          <p className="text-xs text-destructive font-medium mt-4">One deposit = permanent link</p>
        </div>
      </div>
    </div>
  )
})

BeforeAfterLink.displayName = 'BeforeAfterLink'
