'use client'

import { memo } from 'react'
import { DollarSign, Activity } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import type { IncomeSources } from './types'

interface IncomeSourcesSectionProps {
  data: IncomeSources
}

export const IncomeSourcesSection = memo(function IncomeSourcesSection({ data }: IncomeSourcesSectionProps) {
  return (
    <Card className="border-border/40">
      <CardHeader>
        <div className="flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-primary" />
          <CardTitle>Income Sources</CardTitle>
        </div>
        <CardDescription>Where does value flow into this wallet?</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 bg-muted/30 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <DollarSign className="w-4 h-4 text-primary" />
              </div>
              <span className="text-sm font-medium">SOL Received</span>
            </div>
            <p className="text-2xl font-bold">{data.sol_received.total_sol.toFixed(6)} SOL</p>
            <p className="text-xs text-muted-foreground">{data.sol_received.count} transactions</p>
          </div>

          <div className="p-4 bg-muted/30 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                <DollarSign className="w-4 h-4 text-green-500" />
              </div>
              <span className="text-sm font-medium">Stablecoins Received</span>
            </div>
            <p className="text-2xl font-bold">${data.stable_received.total_stable.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">{data.stable_received.count} transactions</p>
          </div>

          <div className="p-4 bg-muted/30 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center">
                <Activity className="w-4 h-4 text-orange-500" />
              </div>
              <span className="text-sm font-medium">Tokens Received</span>
            </div>
            <p className="text-2xl font-bold">{data.tokens_received.count}</p>
            <p className="text-xs text-muted-foreground">{data.tokens_received.unique_mints} unique mints</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
})
