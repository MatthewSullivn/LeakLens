'use client'

import { memo } from 'react'
import { Info, Shield, Link } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { formatDate } from './utils'
import { SolscanLink, TrustSignal } from './shared'
import type { AnalysisResult } from './types'

interface WalletOverviewProps {
  data: AnalysisResult
}

export const WalletOverview = memo(function WalletOverview({ data }: WalletOverviewProps) {
  return (
    <Card className="border-border/40 bg-linear-to-r from-card to-card/50">
      <CardContent className="pt-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm text-muted-foreground mb-1">Wallet Address</p>
            <div className="flex items-center gap-2">
              <SolscanLink address={data.wallet} className="font-mono text-sm sm:text-lg break-all">
                {data.wallet}
              </SolscanLink>
            </div>
          </div>
          <div className="flex flex-wrap gap-4 sm:gap-6">
            <div className="text-center">
              <p className="text-xl sm:text-2xl font-bold">{data.total_transactions}</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground">Total Transactions</p>
            </div>
            <div className="text-center">
              <p className="text-xl sm:text-2xl font-bold uppercase">{data.chain}</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground">Chain</p>
            </div>
            <div className="text-center">
              <p className="text-xs sm:text-sm font-medium">{formatDate(data.most_recent_transaction)}</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground">Last Activity</p>
            </div>
          </div>
        </div>

        {/* Trust Signals */}
        <div className="mt-4 flex flex-wrap gap-2">
          <TrustSignal text="Read-only analysis" />
          <TrustSignal text="No wallet connection" />
          <TrustSignal text="Heuristic inference" />
        </div>

        <div className="mt-4 p-3 bg-muted/30 rounded-lg border-l-4 border-primary">
          <p className="text-xs sm:text-sm text-muted-foreground">
            <Info className="w-4 h-4 inline mr-2" />
            This report analyzes on-chain behavior and metadata signals to estimate surveillance exposure. 
            Results are probabilistic inferences, not confirmed identities.
          </p>
        </div>
      </CardContent>
    </Card>
  )
})
