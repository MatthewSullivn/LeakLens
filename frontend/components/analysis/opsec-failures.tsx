'use client'

import { memo } from 'react'
import { Lock, HelpCircle, AlertCircle, AlertTriangle, Link2, TrendingDown, TrendingUp } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { Tooltip, SolscanLink, WhyItMatters, CollapsibleSection } from './shared'
import { getSeverityColor } from './utils'
import type { OpsecFailures } from './types'

interface OpsecFailuresSectionProps {
  data: OpsecFailures
}

export const OpsecFailuresSection = memo(function OpsecFailuresSection({ data }: OpsecFailuresSectionProps) {
  const colors = getSeverityColor(data.cumulative_exposure)

  return (
    <Card className={cn("border-2", data.critical_leaks.length > 0 ? "border-red-500/50" : "border-border/40")}>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-red-500" />
            <CardTitle>OpSec Failures</CardTitle>
            <Tooltip content="Critical security failures that directly expose wallet identity or create strong links to other wallets.">
              <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
            </Tooltip>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={cn(colors.bg, colors.text, colors.border)}>
              {data.cumulative_exposure} EXPOSURE
            </Badge>
            <Badge variant="outline">Score: {data.exposure_score}/100</Badge>
          </div>
        </div>
        <CardDescription>What directly exposes this wallet?</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Critical Leaks */}
        {data.critical_leaks.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium flex items-center gap-2 text-red-400">
              <AlertCircle className="w-4 h-4" /> Critical Leaks ({data.critical_leaks.length})
            </h4>
            {data.critical_leaks.map((leak, i) => (
              <div key={i} className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{leak.type.replace(/_/g, ' ').toUpperCase()}</p>
                    <p className="text-sm text-muted-foreground mt-1 break-words">{leak.detail}</p>
                    <p className="text-xs text-red-400 mt-2">
                      <strong>Impact:</strong> {leak.deanon_impact}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Weakest Link */}
        <div className="p-4 bg-orange-500/10 border border-orange-500/30 rounded-lg">
          <h4 className="text-sm font-medium flex items-center gap-2 text-orange-400 mb-2">
            <Link2 className="w-4 h-4" /> Weakest Link
          </h4>
          <p className="text-sm break-words">{data.weakest_link}</p>
        </div>

        {/* Funding Sources & Withdrawal Targets */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <CollapsibleSection 
            title={`Funding Sources (${data.funding_sources.length})`}
            description="Wallets that have sent funds to this address"
            defaultOpen={data.funding_sources.length <= 3}
            whyItMatters="Repeated funding from a single source creates strong identity links."
          >
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {data.funding_sources.map((source, i) => (
                <div key={i} className="flex items-center justify-between p-2 bg-muted/30 rounded text-sm">
                  <div className="flex items-center gap-2 min-w-0">
                    <TrendingDown className="w-3 h-3 text-green-500 shrink-0" />
                    <SolscanLink address={source.wallet} className="truncate">
                      {source.label}
                    </SolscanLink>
                  </div>
                  <div className="text-right shrink-0 ml-2">
                    <span className="text-muted-foreground">{source.count}x</span>
                    <span className="ml-2 font-medium">{source.total_sol.toFixed(3)} SOL</span>
                  </div>
                </div>
              ))}
            </div>
          </CollapsibleSection>

          <CollapsibleSection 
            title={`Withdrawal Targets (${data.withdrawal_targets.length})`}
            description="Wallets this address has sent funds to"
            defaultOpen={data.withdrawal_targets.length <= 3}
            whyItMatters="Consistent withdrawal destinations reveal cashout patterns and likely owned wallets."
          >
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {data.withdrawal_targets.map((target, i) => (
                <div key={i} className="flex items-center justify-between p-2 bg-muted/30 rounded text-sm">
                  <div className="flex items-center gap-2 min-w-0">
                    <TrendingUp className="w-3 h-3 text-red-500 shrink-0" />
                    <SolscanLink address={target.wallet} className="truncate">
                      {target.label}
                    </SolscanLink>
                  </div>
                  <div className="text-right shrink-0 ml-2">
                    <span className="text-muted-foreground">{target.count}x</span>
                    <span className="ml-2 font-medium">{target.total_sol.toFixed(3)} SOL</span>
                  </div>
                </div>
              ))}
            </div>
          </CollapsibleSection>
        </div>

        {/* Memo Usage */}
        <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
          <span className="text-sm">Memo Field Usage</span>
          <Badge variant={data.memo_usage > 0 ? "warning" : "success"}>
            {data.memo_usage > 0 ? `${data.memo_usage} transactions` : 'None detected'}
          </Badge>
        </div>

        <WhyItMatters>
          These failures directly compromise anonymity. Surveillance firms use funding patterns and withdrawal destinations
          to link wallets to real identities through exchange KYC records.
        </WhyItMatters>
      </CardContent>
    </Card>
  )
})
