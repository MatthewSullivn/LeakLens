'use client'

import { memo } from 'react'
import { ShieldAlert, AlertTriangle, Link2, TrendingDown, TrendingUp, Info } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { SolscanLink } from './shared'
import { getSeverityColor } from './utils'
import type { OpsecFailures, CriticalLeak } from './types'

interface OpsecFailuresSectionProps {
  data: OpsecFailures
}

// Map leak types to educational explanations
function getLeakExplanation(leakType: string): { title: string; summary: string; explanation: string; impact: string } {
  const explanations: Record<string, { title: string; summary: string; explanation: string; impact: string }> = {
    'repeat_funding_source': {
      title: 'Repeated Funding Source',
      summary: 'Multiple deposits from same wallet',
      explanation: 'This wallet was funded multiple times by the same address, creating a strong ownership link between the two wallets.',
      impact: 'Surveillance firms use funding patterns as the primary method to cluster wallets. This link is permanent and high-confidence.'
    },
    'repeated_funding_source': {
      title: 'Repeated Funding Source',
      summary: 'Multiple deposits from same wallet',
      explanation: 'This wallet was funded multiple times by the same address, creating a strong ownership link between the two wallets.',
      impact: 'Surveillance firms use funding patterns as the primary method to cluster wallets. This link is permanent and high-confidence.'
    },
    'single_funding_source': {
      title: 'Single Funding Source',
      summary: 'All funds from one address',
      explanation: 'All funds originated from a single external address, strongly suggesting shared ownership.',
      impact: 'A unique funding source is one of the strongest indicators of wallet ownership used by chain analysis.'
    },
    'repeat_cashout_target': {
      title: 'Repeated Cashout Target',
      summary: 'Regular withdrawals to same wallet',
      explanation: 'Funds are repeatedly sent to the same destination, suggesting this is an owned wallet or regular cashout point.',
      impact: 'Withdrawal patterns reveal cashout behavior and can link multiple wallets to the same identity.'
    },
    'exchange_withdrawal': {
      title: 'Exchange Withdrawal',
      summary: 'Funds from KYC exchange',
      explanation: 'Funds were received from a known exchange, which has KYC records linking to real identity.',
      impact: 'Exchanges share data with surveillance firms. Withdrawals from KYC exchanges create permanent identity links.'
    },
    'cex_deposit': {
      title: 'Exchange Deposit',
      summary: 'Funds sent to KYC exchange',
      explanation: 'Funds were sent to a known exchange, creating a link to potential KYC records.',
      impact: 'Deposits to centralized exchanges allow surveillance firms to request identity information through legal processes.'
    }
  }
  
  const key = leakType.toLowerCase().replace(/ /g, '_')
  return explanations[key] || {
    title: leakType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    summary: 'Identifiable pattern detected',
    explanation: 'This pattern creates identifiable links that surveillance systems use to track wallets.',
    impact: 'Any identifiable pattern reduces anonymity and increases the confidence of wallet clustering.'
  }
}

// Leak card (always visible)
const LeakAccordion = memo(function LeakAccordion({ 
  leak, 
  defaultOpen = false 
}: { 
  leak: CriticalLeak
  defaultOpen?: boolean 
}) {
  const explanation = getLeakExplanation(leak.type)
  
  return (
    <div className="rounded-lg border bg-red-500/5 border-red-500/30">
      <div className="flex items-start gap-3 p-4">
        <div className="p-2 rounded-lg bg-red-500/15">
          <AlertTriangle className="w-4 h-4 text-red-400" />
        </div>
        <div className="space-y-2 flex-1">
          <div>
            <h4 className="font-medium text-sm text-red-400">{explanation.title}</h4>
            <p className="text-[11px] text-muted-foreground mt-1">{explanation.summary}</p>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {explanation.explanation}
          </p>
          {leak.detail && (
            <p className="text-[10px] text-muted-foreground/70 font-mono break-all">
              {leak.detail}
            </p>
          )}
          <div className="p-3 rounded bg-red-500/10 border-l-2 border-red-500/40">
            <p className="text-[11px]">
              <span className="font-medium text-red-400">Why this matters: </span>
              <span className="text-muted-foreground">{explanation.impact}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
})

// Sources section (always visible)
const SourcesAccordion = memo(function SourcesAccordion({ 
  title,
  icon,
  sources,
  type,
  explanation
}: { 
  title: string
  icon: React.ReactNode
  sources: { wallet: string; label: string; count: number; total_sol: number }[]
  type: 'funding' | 'withdrawal'
  explanation: string
}) {
  const iconColor = type === 'funding' ? 'text-cyan-400' : 'text-red-500'
  
  if (sources.length === 0) return null
  
  return (
    <div className="rounded-lg border bg-muted/10 border-border/40">
      <div className="flex items-center gap-2 p-3 border-b border-border/30">
        {icon}
        <span className="text-sm font-medium">{title}</span>
        <Badge variant="outline" className="text-xs px-2 py-0.5">{sources.length}</Badge>
      </div>
      <div className="p-3 space-y-2">
        {sources.slice(0, 5).map((source, i) => (
          <div key={i} className="flex items-center justify-between p-2.5 bg-muted/30 rounded-lg">
            <div className="flex items-center gap-2 min-w-0">
              {type === 'funding' ? (
                <TrendingDown className={cn("w-4 h-4 shrink-0", iconColor)} />
              ) : (
                <TrendingUp className={cn("w-4 h-4 shrink-0", iconColor)} />
              )}
              <SolscanLink address={source.wallet} className="font-mono text-xs truncate">
                {source.label}
              </SolscanLink>
            </div>
            <div className="text-right shrink-0 ml-2">
              <p className="text-sm font-semibold tabular-nums text-foreground">{source.total_sol.toFixed(3)} SOL</p>
              <p className="text-[10px] text-muted-foreground">{source.count}x</p>
            </div>
          </div>
        ))}
        <p className="text-xs text-muted-foreground pt-2">
          <span className="font-medium">Why this matters: </span>
          {explanation}
        </p>
      </div>
    </div>
  )
})

export const OpsecFailuresSection = memo(function OpsecFailuresSection({ data }: OpsecFailuresSectionProps) {
  const colors = getSeverityColor(data.cumulative_exposure)
  const hasCriticalLeaks = data.critical_leaks && data.critical_leaks.length > 0
  const hasFundingSources = data.funding_sources && data.funding_sources.length > 0
  const hasWithdrawalTargets = data.withdrawal_targets && data.withdrawal_targets.length > 0

  return (
    <Card className={cn(
      "border transition-colors",
      hasCriticalLeaks ? "border-red-500/30" : "border-border/40"
    )}>
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className={cn(
              "p-1.5 rounded-lg",
              hasCriticalLeaks ? "bg-red-500/10" : "bg-muted/30"
            )}>
              <ShieldAlert className={cn(
                "w-4 h-4",
                hasCriticalLeaks ? "text-red-500" : "text-muted-foreground"
              )} />
            </div>
            <CardTitle className="text-base">Operational Security Failures</CardTitle>
          </div>
          <Badge className={cn(colors.bg, colors.text, colors.border, "text-xs")}>
            {data.cumulative_exposure} Exposure
          </Badge>
        </div>
        <CardDescription className="text-xs">
          Patterns that directly compromise wallet anonymity
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Critical Leaks as Accordion */}
        {hasCriticalLeaks && (
          <div className="space-y-2">
            <h4 className="text-xs font-medium text-red-400 flex items-center gap-1.5 mb-2">
              <AlertTriangle className="w-3.5 h-3.5" />
              Critical Leaks ({data.critical_leaks.length})
            </h4>
            {data.critical_leaks.map((leak, i) => (
              <LeakAccordion key={i} leak={leak} defaultOpen={i === 0} />
            ))}
          </div>
        )}

        {/* Weakest Link */}
        {data.weakest_link && (
          <div className="p-3 rounded-lg bg-orange-500/5 border border-orange-500/20">
            <div className="flex items-start gap-2.5">
              <Link2 className="w-3.5 h-3.5 text-orange-400 shrink-0 mt-0.5" />
              <div className="space-y-1 min-w-0">
                <h4 className="text-xs font-medium text-orange-400">Weakest Link</h4>
                <p className="text-[11px] text-muted-foreground break-all">{data.weakest_link}</p>
              </div>
            </div>
          </div>
        )}

        {/* Funding Sources */}
        <SourcesAccordion
          title="Funding Sources"
          icon={<TrendingDown className="w-4 h-4 text-cyan-400" />}
          sources={data.funding_sources || []}
          type="funding"
          explanation="Repeated funding from the same source is the strongest indicator of wallet ownership."
        />

        {/* Withdrawal Targets */}
        <SourcesAccordion
          title="Withdrawal Targets"
          icon={<TrendingUp className="w-4 h-4 text-red-500" />}
          sources={data.withdrawal_targets || []}
          type="withdrawal"
          explanation="Consistent withdrawal destinations reveal cashout patterns and likely owned wallets."
        />

        {/* Memo Usage */}
        {data.memo_usage > 0 && (
          <div className="p-2.5 rounded-lg bg-yellow-500/5 border border-yellow-500/20">
            <div className="flex items-center justify-between">
              <span className="text-xs">Memo Field Usage</span>
              <Badge variant="outline" className="bg-yellow-500/10 text-yellow-400 border-yellow-500/30 text-[10px]">
                {data.memo_usage} txn{data.memo_usage !== 1 ? 's' : ''}
              </Badge>
            </div>
          </div>
        )}

        {/* No Issues */}
        {!hasCriticalLeaks && !hasFundingSources && !hasWithdrawalTargets && data.memo_usage === 0 && (
          <div className="p-4 rounded-lg bg-cyan-500/5 border border-cyan-500/20 text-center">
            <p className="text-xs text-cyan-400">No critical operational security failures detected</p>
            <p className="text-[10px] text-muted-foreground mt-1">
              Other fingerprinting vectors may still apply.
            </p>
          </div>
        )}

        {/* Educational Footer */}
        <div className="p-3 rounded-lg bg-card border border-border/40 mt-4">
          <div className="flex gap-2.5">
            <Info className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              These failures directly compromise anonymity. Surveillance firms use funding patterns 
              and withdrawal destinations to link wallets to real identities through exchange KYC records.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
})
