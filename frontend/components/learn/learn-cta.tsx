'use client'

import { memo } from 'react'
import { Shield, ArrowRight, Link2Off, Eye, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export const LearnCTA = memo(function LearnCTA() {
  const benefits = [
    {
      icon: Link2Off,
      title: 'Break the links',
      description: 'Reduce traceable connections between your wallet and exchanges or labeled addresses.',
    },
    {
      icon: Eye,
      title: 'Reduce surveillance accuracy',
      description: 'Make clustering and profiling harder so tracking becomes less reliable.',
    },
    {
      icon: Zap,
      title: 'Selective privacy',
      description: 'Protect future activity without hiding or erasing your existing on-chain history.',
    },
  ]

  return (
    <section className="relative py-16 sm:py-20 md:py-24 px-4 overflow-hidden border-t border-border/30">
      {/* Distinct background - gradient card to break up the black */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" aria-hidden="true" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_50%,oklch(0.75_0.15_195_/_0.06),transparent)]" aria-hidden="true" />

      <div className="relative max-w-4xl mx-auto">
        <div className="text-center mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-primary/10 border border-primary/20 mb-4 sm:mb-6">
            <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
            <span className="text-xs sm:text-sm font-medium text-primary">Take back control</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-foreground mb-4 sm:mb-6">
            Why switch to{' '}
            <span className="bg-gradient-to-r from-primary to-cyan-400 bg-clip-text text-transparent">
              encrypt.trade
            </span>
            ?
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto px-2">
            Your wallet already reveals more than you think. encrypt.trade helps you reduce future exposure without changing the past.
          </p>
        </div>

        <div className="grid gap-4 sm:gap-6 mb-8 sm:mb-12">
          {benefits.map((item, i) => (
            <div
              key={i}
              className={cn(
                'flex gap-3 sm:gap-4 p-4 sm:p-6 rounded-xl sm:rounded-2xl border bg-card/50 backdrop-blur-sm',
                'border-border/40 hover:border-primary/30 transition-colors',
                'flex-row items-start'
              )}
            >
              <div className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-primary/10 border border-primary/20 shrink-0">
                <item.icon className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-sm sm:text-base text-foreground mb-0.5 sm:mb-1">{item.title}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">{item.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Button
            asChild
            size="lg"
            className={cn(
              'h-11 sm:h-14 px-6 sm:px-10 rounded-xl font-semibold text-sm sm:text-base',
              'bg-primary hover:bg-primary/90 text-primary-foreground',
              'shadow-[0_0_30px_-5px_rgba(8,145,178,0.4)] hover:shadow-[0_0_40px_-5px_rgba(8,145,178,0.5)]',
              'transition-all duration-300'
            )}
          >
            <a
              href="https://encrypt.trade"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 sm:gap-3"
            >
              <span className="text-sm sm:text-base">Learn more at encrypt.trade</span>
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </a>
          </Button>
          <p className="text-[10px] sm:text-xs text-muted-foreground mt-3 sm:mt-4">
            LeakLens shows you the problem. encrypt.trade helps you address it.
          </p>
        </div>
      </div>
    </section>
  )
})

LearnCTA.displayName = 'LearnCTA'
