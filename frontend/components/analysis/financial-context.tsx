'use client'

import { memo, useMemo } from 'react'
import { Activity, Zap, Clock, Layers, TrendingUp, Info, Coins } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { AnalysisResult } from './types'

interface TradingBehaviorProps {
  data: AnalysisResult
}

// Format time duration
function formatDuration(seconds: number): string {
  if (seconds < 60) return `${Math.round(seconds)}s`
  if (seconds < 3600) return `${Math.round(seconds / 60)}m`
  const hours = Math.floor(seconds / 3600)
  const mins = Math.round((seconds % 3600) / 60)
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
}

// Estimate unique trading pairs from swap count and tokens
function estimateUniquePairs(swapCount: number, uniqueTokens: number): number {
  // Rough estimate: if you have N tokens and M swaps, pairs ≈ min(M, N*(N-1)/2)
  const maxPairs = (uniqueTokens * (uniqueTokens - 1)) / 2
  return Math.min(swapCount, Math.max(uniqueTokens - 1, Math.round(maxPairs * 0.3)))
}

export const FinancialContext = memo(function FinancialContext({ data }: TradingBehaviorProps) {
  // Extract trading behavior data
  const signals = data.surveillance_exposure?.signals
  const swapCount = signals?.swap_count || 0
  const mevDetected = signals?.mev_execution_detected || false
  const portfolioSummary = data.portfolio_summary
  const netWorth = data.net_worth
  const totalTransactions = data.total_transactions || 0
  
  // Calculate unique tokens
  const uniqueTokens = useMemo(() => {
    // Try portfolio first
    if (portfolioSummary?.topTokens && portfolioSummary.topTokens.length > 0) {
      return portfolioSummary.topTokens.length
    }
    // Fallback to net worth token count
    return netWorth?.token_count || 0
  }, [portfolioSummary, netWorth])

  // Estimate unique pairs
  const uniquePairs = useMemo(() => {
    return estimateUniquePairs(swapCount, uniqueTokens)
  }, [swapCount, uniqueTokens])

  // Portfolio concentration
  const concentration = portfolioSummary?.topConcentration || 0
  const concentrationLabel = concentration >= 80 ? 'Very High' :
                             concentration >= 60 ? 'High' :
                             concentration >= 40 ? 'Moderate' :
                             'Low'

  // Trading frequency (swaps per day estimate, based on total transactions)
  // Rough estimate: if swaps are X% of transactions, and we have Y transactions
  const swapRatio = totalTransactions > 0 ? (swapCount / totalTransactions) : 0
  const estimatedDays = Math.max(1, totalTransactions / 10) // Rough estimate
  const swapsPerDay = estimatedDays > 0 ? (swapCount / estimatedDays) : 0

  // DEX detection (infer from swap activity)
  const dexCount = swapCount > 0 ? (mevDetected ? 2 : 1) : 0
  const dexLabel = mevDetected ? 'Multiple DEXs' : swapCount > 0 ? 'DEX detected' : 'No swaps'

  // Burst trading detection (heuristic: if swap count is high relative to total transactions)
  const burstDetected = swapRatio > 0.5 && swapCount > 5

  // Calculate median time between swaps (heuristic based on activity pattern)
  // If we have hourly activity data, we can estimate burstiness
  const activityPattern = data.activity_pattern?.hourly || []
  const hasBurstPattern = activityPattern.some((count, i) => {
    // Check if there are hours with significantly higher activity
    const avg = activityPattern.reduce((a, b) => a + b, 0) / activityPattern.length || 1
    return count > avg * 2
  })

  return (
    <Card className="border-border/40 h-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Activity className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold">Trading Behavior Profile</CardTitle>
              <CardDescription className="text-xs mt-1">
                Trading patterns contribute to behavioral fingerprinting
              </CardDescription>
            </div>
          </div>
          <Badge 
            variant="outline" 
            className="text-xs px-3 py-1 bg-primary/10 text-primary border-primary/30"
          >
            {swapCount} swaps
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-0 space-y-5">
            {/* Important Note */}
            <div className="p-3 rounded-lg bg-muted/20 border border-border/30">
              <div className="flex gap-2.5">
                <Info className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  <span className="font-medium text-foreground">This section does not measure profit.</span>
                  {' '}It measures how trading behavior creates identifiable patterns. Frequency, timing, and execution style are used by surveillance platforms to classify wallet sophistication.
                </p>
              </div>
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-lg bg-muted/20 border border-border/30">
                <div className="flex items-center gap-1.5 mb-1">
                  <Zap className="w-3.5 h-3.5 text-primary" />
                  <p className="text-lg font-semibold tabular-nums text-foreground">{swapCount}</p>
                </div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Total Swaps</p>
              </div>

              <div className="p-3 rounded-lg bg-muted/20 border border-border/30">
                <div className="flex items-center gap-1.5 mb-1">
                  <Coins className="w-3.5 h-3.5 text-primary" />
                  <p className="text-lg font-semibold tabular-nums text-foreground">{uniqueTokens}</p>
                </div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Unique Tokens</p>
              </div>

              <div className="p-3 rounded-lg bg-muted/20 border border-border/30">
                <div className="flex items-center gap-1.5 mb-1">
                  <Layers className="w-3.5 h-3.5 text-primary" />
                  <p className="text-lg font-semibold tabular-nums text-foreground">{uniquePairs}</p>
                </div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Trading Pairs</p>
              </div>

              <div className="p-3 rounded-lg bg-muted/20 border border-border/30">
                <div className="flex items-center gap-1.5 mb-1">
                  <Activity className="w-3.5 h-3.5 text-primary" />
                  <p className="text-lg font-semibold tabular-nums text-foreground">
                    {swapsPerDay > 0 ? swapsPerDay.toFixed(1) : '0'}
                  </p>
                </div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Swaps/Day</p>
              </div>

              <div className="p-3 rounded-lg bg-muted/20 border border-border/30">
                <div className="flex items-center gap-1.5 mb-1">
                  <Zap className="w-3.5 h-3.5 text-primary" />
                  <p className="text-sm font-semibold text-foreground">{dexLabel}</p>
                </div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">DEXs Used</p>
              </div>

              <div className="p-3 rounded-lg bg-muted/20 border border-border/30">
                <div className="flex items-center gap-1.5 mb-1">
                  <TrendingUp className="w-3.5 h-3.5 text-primary" />
                  <p className="text-sm font-semibold text-foreground">
                    {burstDetected || hasBurstPattern ? 'Yes' : 'No'}
                  </p>
                </div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Burst Trading</p>
              </div>
            </div>

            {/* Portfolio Concentration */}
            {concentration > 0 && (
              <div className="p-3 rounded-lg bg-card border border-border/40">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Layers className="w-3.5 h-3.5 text-primary" />
                    <span className="text-xs font-medium">Portfolio Concentration</span>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={cn(
                      "text-[10px] py-0",
                      concentration >= 80 ? "bg-red-500/10 text-red-400 border-red-500/20" :
                      concentration >= 60 ? "bg-orange-500/10 text-orange-400 border-orange-500/20" :
                      "bg-cyan-500/10 text-cyan-400 border-cyan-500/20"
                    )}
                  >
                    {concentrationLabel}
                  </Badge>
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-muted-foreground">Top token concentration</span>
                    <span className="text-xs font-semibold text-foreground tabular-nums">
                      {Math.round(concentration)}%
                    </span>
                  </div>
                  <div className="h-1.5 bg-muted/30 rounded-full overflow-hidden">
                    <div 
                      className={cn(
                        "h-full rounded-full transition-all",
                        concentration >= 80 ? "bg-red-500" :
                        concentration >= 60 ? "bg-orange-500" :
                        "bg-cyan-500"
                      )}
                      style={{ width: `${concentration}%` }}
                    />
                  </div>
                  <p className="text-[9px] text-muted-foreground/80 mt-1">
                    {concentration >= 60 
                      ? "Low diversification = stronger fingerprint" 
                      : "Higher diversification reduces pattern strength"}
                  </p>
                </div>
              </div>
            )}

            {/* Trading Style Indicators */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {mevDetected && (
                <div className="p-3 rounded-lg bg-purple-500/5 border border-purple-500/20">
                  <div className="flex items-center gap-2 mb-1">
                    <Zap className="w-3.5 h-3.5 text-purple-400" />
                    <span className="text-[10px] text-purple-400 uppercase tracking-wide font-medium">MEV Detected</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    Advanced execution patterns detected. This indicates sophisticated trading behavior.
                  </p>
                </div>
              )}

              {(burstDetected || hasBurstPattern) && (
                <div className="p-3 rounded-lg bg-yellow-500/5 border border-yellow-500/20">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="w-3.5 h-3.5 text-yellow-400" />
                    <span className="text-[10px] text-yellow-400 uppercase tracking-wide font-medium">Burst Trading</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    Clusters of swaps detected. Rapid-fire trading creates distinct timing patterns.
                  </p>
                </div>
              )}
            </div>

            {/* Context Note */}
            <div className="p-3 rounded-lg bg-muted/20 border border-border/30">
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                <span className="font-medium text-foreground">Surveillance relevance: </span>
                Trading frequency, token selection, and execution style (MEV awareness, burst patterns) are used by blockchain analysis firms to classify wallet sophistication and link related addresses.
              </p>
            </div>
      </CardContent>
    </Card>
  )
})
