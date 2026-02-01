'use client'

import { memo } from 'react'
import { AlertTriangle, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SolscanLink } from './shared'
import type { AnalysisResult, CriticalLeak, FundingSource } from './types'

interface OneTransactionHighlightProps {
  data: AnalysisResult
}

function getLeakTitle(type: string): string {
  const titles: Record<string, string> = {
    repeat_funding_source: 'Repeated funding from one address',
    repeated_funding_source: 'Repeated funding from one address',
    single_funding_source: 'All funds from one address',
    repeat_cashout_target: 'Repeated withdrawals to same address',
    exchange_withdrawal: 'Funds from a KYC exchange',
    cex_deposit: 'Funds sent to a KYC exchange',
  }
  const key = type.toLowerCase().replace(/ /g, '_')
  return titles[key] ?? type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

function pickHighlight(data: AnalysisResult): {
  title: string
  explanation: string
  impact: string
  wallet?: string
  label?: string
  count?: number
  total_sol?: number
  leakType?: string
  criticalLeakCount?: number
} | null {
  const opsec = data.opsec_failures
  if (!opsec) return null

  const firstLeak: CriticalLeak | undefined = opsec.critical_leaks?.[0]
  if (firstLeak) {
    const title = getLeakTitle(firstLeak.type)
    return {
      title,
      explanation: firstLeak.detail || 'This on-chain pattern creates a permanent link used by surveillance systems.',
      impact: firstLeak.deanon_impact || 'This single pattern permanently increased linkability.',
      wallet: undefined,
      leakType: firstLeak.type,
      criticalLeakCount: opsec.critical_leaks?.length ?? 0,
    }
  }

  const firstFunding: FundingSource | undefined = opsec.funding_sources?.[0]
  if (firstFunding) {
    return {
      title: 'Funding from a linked address',
      explanation: `This wallet received funds from ${firstFunding.label || 'an external address'} (${firstFunding.count} transfer${firstFunding.count !== 1 ? 's' : ''}).`,
      impact: 'Surveillance firms use funding patterns as the primary method to cluster wallets. This link is permanent.',
      wallet: firstFunding.wallet,
      label: firstFunding.label,
      count: firstFunding.count,
      total_sol: firstFunding.total_sol,
    }
  }

  const firstCashout: FundingSource | undefined = opsec.withdrawal_targets?.[0]
  if (firstCashout) {
    return {
      title: 'Withdrawals to a linked address',
      explanation: `Funds were sent to ${firstCashout.label || 'the same address'} (${firstCashout.count} withdrawal${firstCashout.count !== 1 ? 's' : ''}).`,
      impact: 'Withdrawal patterns reveal cashout behavior and can link multiple wallets to the same identity.',
      wallet: firstCashout.wallet,
      label: firstCashout.label,
      count: firstCashout.count,
      total_sol: firstCashout.total_sol,
    }
  }

  return null
}

export const OneTransactionHighlight = memo(function OneTransactionHighlight({ data }: OneTransactionHighlightProps) {
  const highlight = pickHighlight(data)
  if (!highlight) return null

  return (
    <div className="rounded-xl border border-red-500/30 bg-red-500/5 overflow-hidden">
      <div className="px-4 py-3 border-b border-red-500/20 flex items-center gap-2">
        <Zap className="w-4 h-4 text-red-400" />
        <p className="text-xs font-semibold text-red-400 uppercase tracking-wider">
          One transaction that changed everything
        </p>
      </div>
      <div className="p-4 space-y-3">
        <h3 className="font-medium text-foreground flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
          {highlight.title}
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {highlight.explanation}
        </p>
        <p className={cn('text-xs leading-relaxed', 'text-red-400/90')}>
          {highlight.impact}
        </p>
        {highlight.wallet && (
          <p className="text-xs text-muted-foreground">
            Linked address:{' '}
            <SolscanLink address={highlight.wallet} className="text-primary hover:text-red-400" showIcon={false}>
              {highlight.label || `${highlight.wallet.slice(0, 8)}...`}
            </SolscanLink>
          </p>
        )}
        <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-[10px] text-muted-foreground pt-2 border-t border-red-500/20 tabular-nums">
          {highlight.count != null && <span>Transfers: {highlight.count}</span>}
          {highlight.total_sol != null && highlight.total_sol > 0 && (
            <span>Total: {highlight.total_sol >= 1000 ? `${(highlight.total_sol / 1000).toFixed(1)}k` : highlight.total_sol.toFixed(2)} SOL</span>
          )}
          {highlight.criticalLeakCount != null && highlight.criticalLeakCount > 0 && (
            <span>Critical leaks: {highlight.criticalLeakCount}</span>
          )}
          {highlight.leakType && <span>Type: {highlight.leakType.replace(/_/g, ' ')}</span>}
        </div>
      </div>
    </div>
  )
})
