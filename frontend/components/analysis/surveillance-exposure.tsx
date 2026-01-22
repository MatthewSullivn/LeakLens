'use client'

import { memo, useState, useCallback, useEffect, useRef } from 'react'
import { Eye, HelpCircle, AlertTriangle, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { Tooltip, SignalItem, WhyItMatters } from './shared'
import { getSeverityColor, STROKE_COLORS } from './utils'
import type { SurveillanceExposure } from './types'

interface SurveillanceExposureSectionProps {
  data: SurveillanceExposure
}

export const SurveillanceExposureSection = memo(function SurveillanceExposureSection({ data }: SurveillanceExposureSectionProps) {
  const [showSignals, setShowSignals] = useState(false)
  const [animatedScore, setAnimatedScore] = useState(0)
  const gaugeRef = useRef<HTMLDivElement>(null)
  const hasAnimated = useRef(false)

  const score = Math.round(data.surveillance_score * 10) / 10
  const colors = getSeverityColor(data.risk_level)
  const circumference = 2 * Math.PI * 80
  const strokeDashoffset = circumference - (animatedScore / 100) * circumference
  const strokeColor = STROKE_COLORS[data.risk_level] || STROKE_COLORS.MEDIUM

  const toggleSignals = useCallback(() => setShowSignals(prev => !prev), [])

  // Animate gauge on scroll into view
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    
    if (prefersReducedMotion) {
      setAnimatedScore(score)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true
          // Animate score from 0 to target
          let current = 0
          const step = score / 30
          const interval = setInterval(() => {
            current += step
            if (current >= score) {
              setAnimatedScore(score)
              clearInterval(interval)
            } else {
              setAnimatedScore(current)
            }
          }, 30)
        }
      },
      { threshold: 0.3 }
    )

    if (gaugeRef.current) observer.observe(gaugeRef.current)
    return () => observer.disconnect()
  }, [score])

  return (
    <Card className="border-border/40">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-primary" />
            <CardTitle>Surveillance Exposure</CardTitle>
            <Tooltip content="This score estimates how easily this wallet can be behaviorally profiled by surveillance systems based on transaction patterns, timing, and counterparty analysis.">
              <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
            </Tooltip>
          </div>
          <Badge className={cn(colors.bg, colors.text, colors.border)}>{data.risk_level} RISK</Badge>
        </div>
        <CardDescription>
          How exposed is this wallet to behavioral fingerprinting?
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col lg:flex-row items-center gap-6 lg:gap-8">
          {/* Circular Gauge - Animated */}
          <div ref={gaugeRef} className="relative w-40 h-40 sm:w-48 sm:h-48 shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
              <circle cx="100" cy="100" r="80" fill="none" stroke="currentColor" strokeWidth="12" className="text-border/40" />
              <circle 
                cx="100" cy="100" r="80" 
                fill="none" 
                stroke={strokeColor} 
                strokeWidth="12" 
                strokeLinecap="round"
                strokeDasharray={circumference} 
                strokeDashoffset={strokeDashoffset} 
                className="transition-all duration-700 ease-out" 
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl sm:text-5xl font-bold">{Math.round(animatedScore)}</span>
              <span className="text-xs sm:text-sm text-muted-foreground">OUT OF 100</span>
            </div>
          </div>

          {/* Leak Vectors & Explanation */}
          <div className="flex-1 space-y-4 w-full">
            <div>
              <h4 className="text-sm font-medium mb-2">Top Leak Vectors</h4>
              <div className="flex flex-wrap gap-2">
                {data.top_leak_vectors.map((vector, i) => (
                  <Badge key={i} variant="outline" className="bg-red-500/10 text-red-400 border-red-500/30">
                    <AlertTriangle className="w-3 h-3 mr-1" />{vector}
                  </Badge>
                ))}
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              This wallet exhibits patterns that make it vulnerable to behavioral profiling. 
              Higher scores indicate greater exposure to surveillance systems.
            </p>
            <Button variant="outline" size="sm" onClick={toggleSignals} className="w-full sm:w-auto">
              {showSignals ? 'Hide' : 'Show'} Signal Breakdown
              <ChevronDown className={cn("w-4 h-4 ml-2 transition-transform", showSignals && "rotate-180")} />
            </Button>
          </div>
        </div>

        {/* Expanded Signals */}
        <div className={cn(
          "grid transition-all duration-300 overflow-hidden",
          showSignals ? "grid-rows-[1fr] mt-6 pt-6 border-t border-border/40" : "grid-rows-[0fr]"
        )}>
          <div className="overflow-hidden">
            {showSignals && (
              <>
                <h4 className="text-sm font-medium mb-4">Signal Analysis</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                  <SignalItem label="Swap Count" value={data.signals.swap_count} signal={data.signals.swap_signal} 
                    tooltip="Number of token swaps detected" />
                  <SignalItem label="Repeated Counterparties" value={data.signals.repeated_counterparties} signal={data.signals.counterparty_signal}
                    tooltip="Wallets interacted with multiple times (linkability risk)" />
                  <SignalItem label="Portfolio Concentration" value={`${data.signals.portfolio_concentration}%`} signal={data.signals.concentration_signal}
                    tooltip="How concentrated holdings are in a single asset" />
                  <SignalItem label="Activity Entropy" value={data.signals.active_hours_entropy.toFixed(3)} signal={data.signals.active_hours_entropy}
                    tooltip="Randomness of activity timing (lower = more predictable)" />
                  <SignalItem label="Memecoin Ratio" value={`${data.signals.memecoin_ratio}%`} signal={data.signals.memecoin_signal}
                    tooltip="Percentage of memecoin trading activity" />
                  <SignalItem label="MEV Detected" value={data.signals.mev_execution_detected ? 'Yes' : 'No'} 
                    signal={data.signals.mev_execution_detected ? 1 : 0}
                    tooltip="Whether MEV-style execution was detected" />
                  <SignalItem label="Stablecoin Income" value={data.signals.stablecoin_income_detected ? 'Yes' : 'No'}
                    signal={data.signals.stablecoin_income_detected ? 1 : 0}
                    tooltip="Regular stablecoin inflows detected" />
                </div>
              </>
            )}
          </div>
        </div>

        <WhyItMatters>
          Surveillance exposure indicates how easily chain analysis firms can profile and track this wallet.
          Higher scores mean more behavioral patterns that can be used for identification.
        </WhyItMatters>
      </CardContent>
    </Card>
  )
})
