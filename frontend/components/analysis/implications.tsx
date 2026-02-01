'use client'

import { memo } from 'react'
import { Lightbulb, ArrowRight, Shield, ExternalLink, Link2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export const ImplicationsSection = memo(function ImplicationsSection() {
  return (
    <Card className="border-border/40 bg-linear-to-br from-card via-card to-primary/5 overflow-hidden relative">
      {/* Subtle gradient accent */}
      <div 
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          background: 'linear-gradient(90deg, transparent, oklch(0.75 0.15 195 / 0.5), transparent)'
        }}
      />
      
      <CardContent className="py-8 px-6 relative">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          {/* Icon with glow */}
          <div className="flex justify-center">
            <div 
              className="p-3 rounded-full bg-primary/10 border border-primary/20"
              style={{
                boxShadow: '0 0 20px oklch(0.75 0.15 195 / 0.2)'
              }}
            >
              <Lightbulb className="w-5 h-5 text-primary" />
            </div>
          </div>

          {/* Main Message */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">
              What this means for you
            </h3>
            
            <div className="space-y-3">
              <p className="text-base text-muted-foreground leading-relaxed">
                <span className="text-foreground font-medium">This does not mean your identity is known.</span>
              </p>
              <p className="text-sm leading-relaxed">
                <span className="text-muted-foreground">It means your activity is </span>
                <span 
                  className="text-primary font-medium"
                  style={{ textShadow: '0 0 10px oklch(0.75 0.15 195 / 0.3)' }}
                >
                  classifiable
                </span>
                <span className="text-muted-foreground">.</span>
              </p>
            </div>
          </div>

          {/* Explanation Box */}
          <div className="p-4 rounded-lg bg-muted/20 border border-border/40 text-left">
            <p className="text-sm text-muted-foreground leading-relaxed">
              <span className="text-primary">Classification</span> is the first step in the surveillance pipeline. 
              Once a wallet is classified, it can be <span className="text-foreground">tracked</span>, <span className="text-foreground">labeled</span>, and <span className="text-foreground">profiled</span>. 
              This data is aggregated, sold, and shared with governments, financial institutions, and compliance services.
            </p>
          </div>

          {/* Pipeline Steps */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-4 rounded-lg bg-muted/10 border border-border/30 hover:border-primary/30 transition-colors">
              <p 
                className="text-2xl font-bold text-primary mb-1"
                style={{ textShadow: '0 0 15px oklch(0.75 0.15 195 / 0.3)' }}
              >
                1
              </p>
              <p className="text-xs text-muted-foreground">
                <span className="text-primary font-medium">Classify</span>
                <br />
                <span className="text-muted-foreground/80">Behavioral patterns detected</span>
              </p>
            </div>
            <div className="p-4 rounded-lg bg-muted/10 border border-border/30 hover:border-primary/30 transition-colors">
              <p 
                className="text-2xl font-bold text-primary mb-1"
                style={{ textShadow: '0 0 15px oklch(0.75 0.15 195 / 0.3)' }}
              >
                2
              </p>
              <p className="text-xs text-muted-foreground">
                <span className="text-primary font-medium">Cluster</span>
                <br />
                <span className="text-muted-foreground/80">Wallets grouped by ownership</span>
              </p>
            </div>
            <div className="p-4 rounded-lg bg-muted/10 border border-border/30 hover:border-primary/30 transition-colors">
              <p 
                className="text-2xl font-bold text-primary mb-1"
                style={{ textShadow: '0 0 15px oklch(0.75 0.15 195 / 0.3)' }}
              >
                3
              </p>
              <p className="text-xs text-muted-foreground">
                <span className="text-primary font-medium">Label</span>
                <br />
                <span className="text-muted-foreground/80">Identities inferred or confirmed</span>
              </p>
            </div>
          </div>

          {/* Closing */}
          <p className="text-xs text-muted-foreground/70 pt-2">
            Understanding these mechanisms is the first step toward making <span className="text-primary">informed decisions</span> about on-chain privacy.
          </p>
        </div>
      </CardContent>
    </Card>
  )
})

export const MitigationCTA = memo(function MitigationCTA() {
  return (
    <Card className="border-2 border-primary/30 bg-gradient-to-b from-primary/5 via-card to-card overflow-hidden">
      <CardContent className="py-8 px-6 sm:px-8">
        <div className="max-w-xl mx-auto text-center space-y-6">
          {/* Icon + headline */}
          <div className="flex flex-col items-center gap-3">
            <div className="p-3 rounded-full bg-primary/15 border border-primary/30">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-foreground">
              Reduce your exposure
            </h3>
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed">
            You don&apos;t have to go dark to improve privacy. Selective privacy means reducing linkability where it matters while keeping normal use. Start with better habits, then consider tools built for it.
          </p>

          {/* Before/after visualization: high linkability → selective privacy → lower exposure */}
          <div className="flex items-center justify-center gap-3 sm:gap-4 py-4 px-4 rounded-xl bg-muted/10 border border-border/30">
            <div className="flex flex-col items-center gap-2 min-w-[100px]">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-500/10 border border-red-500/30">
                <Link2 className="w-5 h-5 text-red-400/90" />
              </div>
              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Many links</span>
            </div>
            <ArrowRight className="w-5 h-5 text-muted-foreground/60 shrink-0" />
            <div className="flex flex-col items-center gap-2 min-w-[100px]">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/15 border border-primary/40">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <span className="text-[10px] font-medium text-primary uppercase tracking-wide">Selective privacy</span>
            </div>
            <ArrowRight className="w-5 h-5 text-muted-foreground/60 shrink-0" />
            <div className="flex flex-col items-center gap-2 min-w-[100px]">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-violet-500/15 border border-violet-500/40">
                <Link2 className="w-5 h-5 text-violet-400" />
              </div>
              <span className="text-[10px] font-medium text-violet-400 uppercase tracking-wide">Fewer links</span>
            </div>
          </div>

          {/* CTAs: primary + encrypt.trade */}
          <div className="flex flex-col gap-3 pt-2">
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              <Link
                href="/learn"
                className={cn(
                  "inline-flex items-center justify-center gap-2 w-full sm:w-auto",
                  "px-6 py-3.5 rounded-lg",
                  "bg-primary text-primary-foreground",
                  "hover:bg-primary/90 hover:scale-[1.02] transition-all duration-200",
                  "font-semibold text-sm",
                  "shadow-lg"
                )}
                style={{
                  boxShadow: '0 0 24px oklch(0.75 0.15 195 / 0.35)'
                }}
              >
                Learn how to reduce exposure
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="https://encrypt.trade"
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "inline-flex items-center justify-center gap-2 w-full sm:w-auto",
                  "px-6 py-3.5 rounded-lg",
                  "bg-violet-500/20 text-violet-300 border border-violet-500/40",
                  "hover:bg-violet-500/30 hover:border-violet-500/50 hover:scale-[1.02] transition-all duration-200",
                  "font-semibold text-sm"
                )}
              >
                <Shield className="w-4 h-4" />
                encrypt.trade
                <ExternalLink className="w-3.5 h-3.5 opacity-80" />
              </a>
            </div>
            <p className="text-[11px] text-muted-foreground max-w-sm mx-auto">
              <span className="text-foreground/80 font-medium">encrypt.trade</span> lets you trade with selective privacy on Solana. Fewer permanent links, same chain.
            </p>
          </div>

          {/* Secondary: concepts link */}
          <Link
            href="/learn#privacy-concepts"
            className="inline-block text-xs text-muted-foreground hover:text-primary transition-colors underline-offset-4 hover:underline"
          >
            Explore selective privacy concepts
          </Link>

          {/* Trust note */}
          <p className="text-[10px] text-muted-foreground/50 border-t border-border/30 max-w-sm mx-auto pt-4">
            LeakLens is an educational tool. We do not collect wallet data or store analysis results.
          </p>
        </div>
      </CardContent>
    </Card>
  )
})
