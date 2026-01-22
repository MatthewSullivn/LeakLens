'use client'

import { memo } from 'react'
import { TrendingUp, HelpCircle, BarChart3, Info } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { Tooltip } from './shared'
import type { TradingPnL } from './types'

interface TradingPnLSectionProps {
  data: TradingPnL
}

export const TradingPnLSection = memo(function TradingPnLSection({ data }: TradingPnLSectionProps) {
  const hasPnL = data.totals.distinct_pairs > 0 || data.totals.realized_pnl_sol !== 0

  return (
    <Card className="border-border/40">
      <CardHeader>
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          <CardTitle>Trading Performance (PnL)</CardTitle>
          <Tooltip content={data.note}>
            <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
          </Tooltip>
        </div>
        <CardDescription>Realized profit and loss from token trading</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="p-3 bg-muted/30 rounded-lg text-center">
            <p className="text-xs text-muted-foreground">Transactions Used</p>
            <p className="text-xl font-bold">{data.window.transactions_used}</p>
          </div>
          <div className="p-3 bg-muted/30 rounded-lg text-center">
            <p className="text-xs text-muted-foreground">Distinct Pairs</p>
            <p className="text-xl font-bold">{data.totals.distinct_pairs}</p>
          </div>
          <div className="p-3 bg-muted/30 rounded-lg text-center">
            <p className="text-xs text-muted-foreground">Realized PnL (SOL)</p>
            <p className={cn("text-xl font-bold", 
              data.totals.realized_pnl_sol > 0 ? "text-green-500" : 
              data.totals.realized_pnl_sol < 0 ? "text-red-500" : "text-foreground"
            )}>
              {data.totals.realized_pnl_sol >= 0 ? '+' : ''}{data.totals.realized_pnl_sol.toFixed(4)}
            </p>
          </div>
          <div className="p-3 bg-muted/30 rounded-lg text-center">
            <p className="text-xs text-muted-foreground">USD Available</p>
            <p className="text-xl font-bold">{data.totals.usd_available ? 'Yes' : 'No'}</p>
          </div>
        </div>

        {!hasPnL && (
          <div className="p-4 bg-muted/20 rounded-lg text-center">
            <BarChart3 className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No significant trading activity detected in the analysis window</p>
          </div>
        )}

        <p className="text-xs text-muted-foreground mt-4 p-3 bg-muted/20 rounded">
          <Info className="w-3 h-3 inline mr-1" />
          {data.note}
        </p>
      </CardContent>
    </Card>
  )
})
