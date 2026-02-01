'use client'

import { memo } from 'react'
import { ArrowRight, Wallet, ArrowDownToLine, ArrowUpFromLine } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { SolscanLink } from './shared'
import type { AnalysisResult } from './types'

interface LeakFlowDiagramProps {
  data: AnalysisResult
}

function formatSOL(value: number): string {
  if (value >= 1000) return `${(value / 1000).toFixed(1)}k`
  return value.toFixed(2)
}

export const LeakFlowDiagram = memo(function LeakFlowDiagram({ data }: LeakFlowDiagramProps) {
  const fundingSources = data.opsec_failures?.funding_sources ?? []
  const withdrawalTargets = data.opsec_failures?.withdrawal_targets ?? []
  const fundingCount = fundingSources.length
  const cashoutCount = withdrawalTargets.length
  const hasFlow = fundingCount > 0 || cashoutCount > 0

  return (
    <Card className="border-border/40 overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-500/10">
            <ArrowRight className="w-4 h-4 text-cyan-500" />
          </div>
          <CardTitle className="text-base">Fund flow = permanent links</CardTitle>
        </div>
        <CardDescription className="text-xs">
          Every funding source and cashout target creates a link surveillance firms use to cluster wallets
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="rounded-lg bg-muted/10 border border-border/30 p-3 sm:p-4 md:p-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 md:gap-6">
            {/* Funding sources */}
            <div className="flex flex-col items-center gap-2 min-w-0 flex-1">
              <div className="p-2 sm:p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 w-full max-w-[110px] sm:max-w-[140px] flex flex-col items-center justify-center min-h-[70px] sm:min-h-[80px]">
                <ArrowDownToLine className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-500 mb-1" />
                <span className="text-xl sm:text-2xl font-bold tabular-nums text-cyan-400">{fundingCount}</span>
                <span className="text-[9px] sm:text-[10px] uppercase tracking-wider text-muted-foreground">Funding</span>
              </div>
            </div>

            <div className="flex items-center justify-center shrink-0 rotate-90 sm:rotate-0">
              <div className="flex items-center gap-0.5 sm:gap-1 text-muted-foreground/60">
                <div className="w-3 sm:w-6 h-0.5 bg-gradient-to-r from-transparent to-cyan-500/50 rounded" />
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                <div className="w-3 sm:w-6 h-0.5 bg-gradient-to-l from-transparent to-cyan-500/50 rounded" />
              </div>
            </div>

            {/* Your wallet (center) */}
            <div className="flex flex-col items-center gap-2 shrink-0">
              <div className="p-2 sm:p-3 rounded-xl bg-primary/15 border-2 border-primary/40 w-full max-w-[100px] sm:max-w-[140px] flex flex-col items-center justify-center min-h-[70px] sm:min-h-[80px] ring-2 ring-primary/20">
                <Wallet className="w-4 h-4 sm:w-5 sm:h-5 text-primary mb-1" />
                <span className="text-[11px] sm:text-xs font-semibold text-foreground">Your wallet</span>
                <span className="text-[9px] sm:text-[10px] text-muted-foreground">exposed</span>
              </div>
            </div>

            <div className="flex items-center justify-center shrink-0 rotate-90 sm:rotate-0">
              <div className="flex items-center gap-0.5 sm:gap-1 text-muted-foreground/60">
                <div className="w-3 sm:w-6 h-0.5 bg-gradient-to-r from-transparent to-red-500/50 rounded" />
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                <div className="w-3 sm:w-6 h-0.5 bg-gradient-to-l from-transparent to-red-500/50 rounded" />
              </div>
            </div>

            {/* Cashout targets */}
            <div className="flex flex-col items-center gap-2 min-w-0 flex-1">
              <div className="p-2 sm:p-3 rounded-xl bg-red-500/10 border border-red-500/30 w-full max-w-[110px] sm:max-w-[140px] flex flex-col items-center justify-center min-h-[70px] sm:min-h-[80px]">
                <ArrowUpFromLine className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 mb-1" />
                <span className="text-xl sm:text-2xl font-bold tabular-nums text-red-400">{cashoutCount}</span>
                <span className="text-[9px] sm:text-[10px] uppercase tracking-wider text-muted-foreground">Cashout</span>
              </div>
            </div>
          </div>
          {hasFlow && (fundingSources.length > 0 || withdrawalTargets.length > 0) && (
            <div className="mt-4 pt-4 border-t border-border/30 grid grid-cols-1 sm:grid-cols-2 gap-4 text-[11px]">
              {fundingSources.length > 0 && (
                <div>
                  <p className="font-medium text-cyan-400/90 mb-1.5 uppercase tracking-wider">Funding sources</p>
                  <ul className="space-y-1 text-muted-foreground">
                    {fundingSources.slice(0, 8).map((s, i) => (
                      <li key={i} className="flex justify-between gap-2 tabular-nums items-center">
                        <SolscanLink address={s.wallet} className="truncate text-foreground hover:text-cyan-400" showIcon={false}>
                          {s.label || `${s.wallet.slice(0, 8)}...`}
                        </SolscanLink>
                        <span className="shrink-0">{s.count} tx · {formatSOL(s.total_sol)} SOL</span>
                      </li>
                    ))}
                    {fundingSources.length > 8 && <li className="text-muted-foreground/70">+{fundingSources.length - 8} more</li>}
                  </ul>
                </div>
              )}
              {withdrawalTargets.length > 0 && (
                <div>
                  <p className="font-medium text-red-400/90 mb-1.5 uppercase tracking-wider">Cashout targets</p>
                  <ul className="space-y-1 text-muted-foreground">
                    {withdrawalTargets.slice(0, 8).map((s, i) => (
                      <li key={i} className="flex justify-between gap-2 tabular-nums items-center">
                        <SolscanLink address={s.wallet} className="truncate text-foreground hover:text-red-400" showIcon={false}>
                          {s.label || `${s.wallet.slice(0, 8)}...`}
                        </SolscanLink>
                        <span className="shrink-0">{s.count} tx · {formatSOL(s.total_sol)} SOL</span>
                      </li>
                    ))}
                    {withdrawalTargets.length > 8 && <li className="text-muted-foreground/70">+{withdrawalTargets.length - 8} more</li>}
                  </ul>
                </div>
              )}
            </div>
          )}
          {!hasFlow && (
            <p className="text-center text-xs text-muted-foreground mt-4">
              No funding or cashout links detected in this sample
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
})
