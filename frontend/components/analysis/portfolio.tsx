'use client'

import { memo } from 'react'
import { PieChart, Wallet } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import type { PortfolioSummary, NetWorth } from './types'

interface PortfolioSectionProps {
  portfolio: { tokens: any[]; totalValue: number }
  summary: PortfolioSummary
  netWorth: NetWorth
}

export const PortfolioSection = memo(function PortfolioSection({ portfolio, summary, netWorth }: PortfolioSectionProps) {
  const hasTokens = summary.topTokens.length > 0

  return (
    <Card className="border-border/40">
      <CardHeader>
        <div className="flex items-center gap-2">
          <PieChart className="w-5 h-5 text-primary" />
          <CardTitle>Portfolio & Net Worth</CardTitle>
        </div>
        <CardDescription>Current holdings and asset distribution</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Net Worth Summary */}
          <div className="p-4 bg-linear-to-br from-primary/10 to-transparent rounded-lg">
            <h4 className="text-sm text-muted-foreground mb-2">Total Net Worth</h4>
            <p className="text-3xl font-bold">${netWorth.total_usd.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground mt-1">
              SOL Price: ${netWorth.sol_price.toFixed(2)}
            </p>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>SOL Balance</span>
                <span className="font-medium">{netWorth.sol_balance.toFixed(6)} SOL</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Token Count</span>
                <span className="font-medium">{netWorth.token_count}</span>
              </div>
            </div>
          </div>

          {/* Portfolio Composition */}
          <div>
            <h4 className="text-sm font-medium mb-3">Composition</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Stablecoins</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-green-500" style={{ width: `${summary.stablePct}%` }} />
                  </div>
                  <span className="text-sm font-medium w-12">{summary.stablePct}%</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Memecoins</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-orange-500" style={{ width: `${summary.memePct}%` }} />
                  </div>
                  <span className="text-sm font-medium w-12">{summary.memePct}%</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Top Concentration</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: `${summary.topConcentration}%` }} />
                  </div>
                  <span className="text-sm font-medium w-12">{summary.topConcentration}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Top Tokens */}
          <div>
            <h4 className="text-sm font-medium mb-3">Top Holdings</h4>
            {hasTokens ? (
              <div className="space-y-2">
                {summary.topTokens.map((token, i) => (
                  <div key={i} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                    <span className="font-medium">{token.symbol}</span>
                    <span className="text-sm">${token.usdValue.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 bg-muted/20 rounded-lg text-center">
                <Wallet className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No fungible tokens detected beyond SOL</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
})
