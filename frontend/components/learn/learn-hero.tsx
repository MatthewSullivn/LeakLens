'use client'

import { memo } from 'react'
import { BookOpen, ArrowDown } from 'lucide-react'
import { cn } from '@/lib/utils'

export const LearnHero = memo(function LearnHero() {
  return (
    <section className="relative overflow-hidden py-20 sm:py-28 px-4">
      {/* Ambient gradient orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute left-1/2 top-1/4 -translate-x-1/2 w-[600px] h-[300px] bg-primary/8 rounded-full blur-[80px]" />
        <div className="absolute right-1/4 top-1/2 w-[400px] h-[200px] bg-cyan-500/5 rounded-full blur-[60px]" />
        <div className="absolute left-1/4 bottom-1/4 w-[300px] h-[150px] bg-violet-500/5 rounded-full blur-[50px]" />
      </div>

      <div className="relative max-w-4xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8">
          <BookOpen className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-primary">Educational Guide</span>
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight text-foreground mb-6 leading-[1.1]">
          The privacy story of your
          <span className="block mt-2 bg-gradient-to-r from-primary via-cyan-400 to-primary bg-clip-text text-transparent">
            on-chain activity
          </span>
        </h1>

        <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed">
          Why blockchains make anonymity hard. How patterns leak identity. What changes when you use privacy tools.
        </p>

        <div className="flex justify-center">
          <a
            href="#scene-1"
            className={cn(
              "inline-flex items-center gap-2 px-5 py-2.5 rounded-lg",
              "text-muted-foreground hover:text-foreground transition-colors",
              "border border-border/50 hover:border-primary/30"
            )}
          >
            <ArrowDown className="w-4 h-4 animate-bounce" />
            <span className="text-sm font-medium">Scroll to begin</span>
          </a>
        </div>
      </div>
    </section>
  )
})

LearnHero.displayName = 'LearnHero'
