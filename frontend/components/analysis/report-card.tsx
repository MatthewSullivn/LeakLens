'use client'

import { memo } from 'react'
import { Gauge, Shield, Link2, ArrowDownToLine, ArrowUpFromLine, Cpu, Wallet } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getSeverityColor } from './utils'
import type { AnalysisResult } from './types'

interface ReportCardProps {
  data: AnalysisResult
}

function formatSOL(value: number): string {
  if (Math.abs(value) >= 1000) return `${(value / 1000).toFixed(2)}k SOL`
  return value.toFixed(2)
}

function formatUSD(value: number): string {
  const abs = Math.abs(value)
  if (abs >= 1000) return `$${(value / 1000).toFixed(1)}k`
  return `$${value.toFixed(0)}`
}

export const ReportCard = memo(function ReportCard({ data }: ReportCardProps) {
  const score = Math.round(data.surveillance_exposure?.surveillance_score ?? 0)
  const riskLevel = data.surveillance_exposure?.risk_level ?? 'MEDIUM'
  const colors = getSeverityColor(riskLevel)
  const linkedWallets = data.ego_network?.total_links ?? 0
  const fundingCount = data.opsec_failures?.funding_sources?.length ?? 0
  const cashoutCount = data.opsec_failures?.withdrawal_targets?.length ?? 0
  const botConfidence = data.reaction_speed?.bot_confidence ?? 0
  const reactionLabel = botConfidence >= 60 ? 'Bot-like' : 'Human-like'
  const solBalance = data.net_worth?.sol_balance ?? 0
  const totalUsd = data.net_worth?.total_usd ?? 0
  const worthLabel = totalUsd > 0 ? formatUSD(totalUsd) : `${formatSOL(solBalance)} SOL`

  const swapCount = data.surveillance_exposure?.signals?.swap_count ?? 0
  const counterparties = data.surveillance_exposure?.signals?.repeated_counterparties ?? 0
  const criticalLeaks = data.opsec_failures?.critical_leaks?.length ?? 0
  const totalTxns = data.total_transactions ?? 0
  const tokenCount = data.net_worth?.token_count ?? 0

  const items = [
    { icon: Gauge, label: 'Exposure', value: `${score}`, sub: 'score', className: colors.text },
    { icon: Shield, label: 'Risk', value: riskLevel, sub: '', className: colors.text },
    { icon: Link2, label: 'Linked', value: `${linkedWallets}`, sub: 'wallets', className: 'text-foreground' },
    { icon: ArrowDownToLine, label: 'Funding', value: `${fundingCount}`, sub: 'sources', className: 'text-foreground' },
    { icon: ArrowUpFromLine, label: 'Cashout', value: `${cashoutCount}`, sub: 'targets', className: 'text-foreground' },
    { icon: Cpu, label: 'Reaction', value: reactionLabel, sub: `${botConfidence}% bot`, className: 'text-foreground' },
    { icon: Wallet, label: 'Worth', value: worthLabel, sub: tokenCount ? `${tokenCount} tokens` : '', className: 'text-foreground' },
  ]

  return (
    <div className="rounded-xl border border-border/40 bg-card/80 overflow-hidden">
      <div className="p-4 space-y-3">
        <div className="flex flex-wrap gap-3 sm:gap-4">
          {items.map(({ icon: Icon, label, value, sub, className }, i) => (
            <div
              key={i}
              className={cn(
                'flex items-center gap-2 min-w-0 rounded-lg px-3 py-2 bg-muted/20 border border-border/30',
                'sm:flex-1 sm:min-w-[0]'
              )}
            >
              <Icon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              <div className="min-w-0">
                <p className={cn('text-sm font-semibold tabular-nums truncate', className)}>
                  {value}
                </p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide truncate">
                  {label}{sub ? ` · ${sub}` : ''}
                </p>
              </div>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-muted-foreground border-t border-border/30 pt-3">
          <span className="tabular-nums">Swaps: {swapCount}</span>
          <span className="tabular-nums">Counterparties: {counterparties}</span>
          <span className="tabular-nums">Critical leaks: {criticalLeaks}</span>
          <span className="tabular-nums">Txns analyzed: {totalTxns}</span>
        </div>
      </div>
    </div>
  )
})
