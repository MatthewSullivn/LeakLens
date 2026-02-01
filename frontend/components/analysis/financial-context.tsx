'use client'

import { memo, useState } from 'react'
import { Wallet, TrendingUp, TrendingDown, ChevronDown } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { cn } from '@/lib/utils'
import { SolscanLink } from './shared'
import type { TradingPnL, NetWorth } from './types'

interface FinancialContextProps {
  tradingPnl: TradingPnL
  netWorth: NetWorth
}

// Format currency
function formatUSD(value: number): string {
  const abs = Math.abs(value)
  if (abs >= 1000) return `$${(value / 1000).toFixed(1)}k`
  return `$${value.toFixed(2)}`
}

function formatSOL(value: number): string {
  if (Math.abs(value) >= 1000) return `${(value / 1000).toFixed(2)}k SOL`
  return `${value.toFixed(3)} SOL`
}

export const FinancialContext = memo(function FinancialContext({ tradingPnl, netWorth }: FinancialContextProps) {
  const [isExpanded, setIsExpanded] = useState(true)

  const realizedPnlSOL = tradingPnl?.totals?.realized_pnl_sol || 0
  const distinctPairs = tradingPnl?.totals?.distinct_pairs || 0
  const totalTrades = tradingPnl?.window?.transactions_used || 0

  const solPrice = netWorth?.sol_price ?? 0
  const totalUsd = netWorth?.total_usd ?? 0
  const solBalance = netWorth?.sol_balance ?? 0
  const tokenCount = netWorth?.token_count ?? 0
  const hasNetWorth = solPrice > 0 || totalUsd > 0

  // Get top win and loss
  const topWin = tradingPnl?.top_wins?.[0]
  const topLoss = tradingPnl?.top_losses?.[0]

  return (
    <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
      <Card className="border-border/40 w-full">
        <CollapsibleTrigger className="w-full text-left">
          <CardHeader className="pb-3 cursor-pointer hover:bg-muted/10 transition-colors rounded-t-lg">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="p-1.5 rounded-lg bg-primary/10 shrink-0">
                  <Wallet className="w-4 h-4 text-primary" />
                </div>
                <div className="min-w-0">
                  <CardTitle className="text-sm font-medium text-foreground">
                    Financial Activity Context
                  </CardTitle>
                  <CardDescription className="text-[10px] text-muted-foreground hidden sm:block">
                    Trading behavior contributes to exposure patterns
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                <Badge variant="outline" className="text-[9px] sm:text-[10px] py-0 bg-primary/10 text-primary border-primary/30">
                  {formatSOL(solBalance)}
                </Badge>
                <ChevronDown className={cn(
                  "w-4 h-4 text-muted-foreground transition-transform duration-200",
                  isExpanded && "rotate-180"
                )} />
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="pt-0 space-y-4">
            {/* Key Metrics Grid - 4 columns on all screens */}
            <div className="grid grid-cols-4 gap-1.5 sm:gap-3">
              <div className="p-2 sm:p-3 rounded-lg bg-muted/20 border border-border/30 text-center sm:text-left">
                <p className="text-sm sm:text-lg font-semibold tabular-nums text-foreground truncate">
                  {formatSOL(solBalance)}
                </p>
                <p className="text-[8px] sm:text-[10px] text-muted-foreground uppercase tracking-wide mt-0.5">Total SOL</p>
              </div>
              <div className="p-2 sm:p-3 rounded-lg bg-muted/20 border border-border/30 text-center sm:text-left">
                <p className={cn(
                  "text-sm sm:text-lg font-semibold tabular-nums truncate",
                  realizedPnlSOL >= 0 ? "text-cyan-400" : "text-red-400"
                )}>
                  {realizedPnlSOL >= 0 ? '+' : ''}{formatSOL(realizedPnlSOL)}
                </p>
                <p className="text-[8px] sm:text-[10px] text-muted-foreground uppercase tracking-wide mt-0.5">PnL (SOL)</p>
              </div>
              <div className="p-2 sm:p-3 rounded-lg bg-muted/20 border border-border/30 text-center sm:text-left">
                <p className="text-sm sm:text-lg font-semibold tabular-nums">{distinctPairs}</p>
                <p className="text-[8px] sm:text-[10px] text-muted-foreground uppercase tracking-wide mt-0.5">Pairs</p>
              </div>
              <div className="p-2 sm:p-3 rounded-lg bg-muted/20 border border-border/30 text-center sm:text-left">
                <p className="text-sm sm:text-lg font-semibold tabular-nums">{totalTrades}</p>
                <p className="text-[8px] sm:text-[10px] text-muted-foreground uppercase tracking-wide mt-0.5">Trades</p>
              </div>
            </div>

            {/* Net worth / portfolio context */}
            {hasNetWorth && (
              <div className="space-y-2">
                <p className="text-[9px] sm:text-[10px] text-muted-foreground uppercase tracking-wide">Portfolio context</p>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5 sm:gap-3">
                  {solPrice > 0 && (
                    <div className="p-2 sm:p-3 rounded-lg bg-muted/20 border border-border/30 text-center sm:text-left">
                      <p className="text-sm sm:text-lg font-semibold tabular-nums text-foreground">
                        ${solPrice.toFixed(2)}
                      </p>
                      <p className="text-[8px] sm:text-[10px] text-muted-foreground uppercase tracking-wide mt-0.5">SOL price</p>
                    </div>
                  )}
                  {totalUsd > 0 && (
                    <div className="p-2 sm:p-3 rounded-lg bg-muted/20 border border-border/30 text-center sm:text-left">
                      <p className="text-sm sm:text-lg font-semibold tabular-nums text-foreground">
                        {formatUSD(totalUsd)}
                      </p>
                      <p className="text-[8px] sm:text-[10px] text-muted-foreground uppercase tracking-wide mt-0.5">Total (USD)</p>
                    </div>
                  )}
                  {solBalance > 0 && (
                    <div className="p-2 sm:p-3 rounded-lg bg-muted/20 border border-border/30 text-center sm:text-left hidden sm:block">
                      <p className="text-sm sm:text-lg font-semibold tabular-nums text-foreground">
                        {formatSOL(solBalance)}
                      </p>
                      <p className="text-[8px] sm:text-[10px] text-muted-foreground uppercase tracking-wide mt-0.5">SOL balance</p>
                    </div>
                  )}
                  {tokenCount > 0 && (
                    <div className="p-2 sm:p-3 rounded-lg bg-muted/20 border border-border/30 text-center sm:text-left">
                      <p className="text-sm sm:text-lg font-semibold tabular-nums text-foreground">{tokenCount}</p>
                      <p className="text-[8px] sm:text-[10px] text-muted-foreground uppercase tracking-wide mt-0.5">Tokens</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Top Win/Loss */}
            {(topWin || topLoss) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                {topWin && topWin.mint && (
                  <div className="p-2 sm:p-3 rounded-lg bg-cyan-500/5 border border-cyan-500/20">
                    <div className="flex items-center gap-2 mb-1">
                      <TrendingUp className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-cyan-400" />
                      <span className="text-[9px] sm:text-[10px] text-cyan-400 uppercase tracking-wide">Top Performer</span>
                    </div>
                    <p className="text-xs sm:text-sm font-medium truncate font-mono">
                      <SolscanLink address={topWin.mint} className="text-foreground hover:text-cyan-400" showIcon={false}>
                        {topWin.mint.slice(0, 8)}...
                      </SolscanLink>
                    </p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">
                      {formatUSD(topWin.realized_pnl_usd || 0)} • {topWin.trades} trades
                    </p>
                  </div>
                )}
                {topLoss && topLoss.realized_pnl_usd !== topWin?.realized_pnl_usd && topLoss.mint && (
                  <div className="p-2 sm:p-3 rounded-lg bg-red-500/5 border border-red-500/20">
                    <div className="flex items-center gap-2 mb-1">
                      <TrendingDown className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-red-400" />
                      <span className="text-[9px] sm:text-[10px] text-red-400 uppercase tracking-wide">Biggest Loss</span>
                    </div>
                    <p className="text-xs sm:text-sm font-medium truncate font-mono">
                      <SolscanLink address={topLoss.mint} className="text-foreground hover:text-red-400" showIcon={false}>
                        {topLoss.mint.slice(0, 8)}...
                      </SolscanLink>
                    </p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">
                      {formatUSD(topLoss.realized_pnl_usd || 0)} • {topLoss.trades} trades
                    </p>
                  </div>
                )}
              </div>
            )}

          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  )
})
