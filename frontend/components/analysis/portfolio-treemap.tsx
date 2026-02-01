'use client'

import { memo, useMemo, useState } from 'react'
import { PieChart, Wallet, ChevronDown } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { cn } from '@/lib/utils'
import type { AnalysisResult, TokenInfo } from './types'

interface PortfolioTreemapProps {
  data: AnalysisResult
}

// Treemap layout algorithm (simple squarified)
function calculateTreemapLayout(
  items: { symbol: string; value: number; percentage: number }[],
  width: number,
  height: number
): { symbol: string; value: number; percentage: number; x: number; y: number; w: number; h: number }[] {
  if (items.length === 0) return []
  
  const total = items.reduce((sum, item) => sum + item.value, 0)
  if (total === 0) return []

  const result: { symbol: string; value: number; percentage: number; x: number; y: number; w: number; h: number }[] = []
  let currentX = 0
  let currentY = 0
  let remainingWidth = width
  let remainingHeight = height
  let isHorizontal = width >= height

  items.forEach((item, index) => {
    const ratio = item.value / total
    let w: number, h: number

    if (isHorizontal) {
      w = remainingWidth * ratio * (items.length / (items.length - index))
      w = Math.min(w, remainingWidth)
      h = remainingHeight
      
      result.push({ ...item, x: currentX, y: currentY, w, h })
      currentX += w
      remainingWidth -= w
    } else {
      w = remainingWidth
      h = remainingHeight * ratio * (items.length / (items.length - index))
      h = Math.min(h, remainingHeight)
      
      result.push({ ...item, x: currentX, y: currentY, w, h })
      currentY += h
      remainingHeight -= h
    }

    // Alternate direction for better layout
    if (index % 2 === 0) {
      isHorizontal = !isHorizontal
    }
  })

  return result
}

// Color based on token type
function getTokenColor(symbol: string, index: number): string {
  const stablecoins = ['USDC', 'USDT', 'DAI', 'BUSD', 'UST', 'FRAX', 'TUSD']
  const majorTokens = ['SOL', 'ETH', 'BTC', 'WBTC', 'WETH', 'WSOL']
  
  if (stablecoins.some(s => symbol.toUpperCase().includes(s))) {
    return 'bg-green-500'
  }
  if (majorTokens.some(m => symbol.toUpperCase().includes(m))) {
    return 'bg-blue-500'
  }
  
  // Memecoins and others get varied colors
  const colors = ['bg-purple-500', 'bg-amber-500', 'bg-pink-500', 'bg-cyan-500', 'bg-orange-500', 'bg-rose-500']
  return colors[index % colors.length]
}

export const PortfolioTreemap = memo(function PortfolioTreemap({ data }: PortfolioTreemapProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [hoveredToken, setHoveredToken] = useState<string | null>(null)

  const portfolioData = useMemo(() => {
    const netWorth = data.net_worth
    const topTokens = netWorth?.top_tokens || []
    const totalUsd = netWorth?.total_usd || 0
    
    if (topTokens.length === 0 || totalUsd === 0) return null

    const items = topTokens
      .filter(t => t.usdValue > 0)
      .map(token => ({
        symbol: token.symbol,
        value: token.usdValue,
        percentage: (token.usdValue / totalUsd) * 100,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10)

    return {
      items,
      totalUsd,
      tokenCount: netWorth?.token_count || 0,
      stableCount: netWorth?.stable_token_count || 0,
      memeCount: netWorth?.meme_token_count || 0,
      solBalance: netWorth?.sol_balance || 0,
    }
  }, [data.net_worth])

  const treemapLayout = useMemo(() => {
    if (!portfolioData) return []
    return calculateTreemapLayout(portfolioData.items, 100, 100)
  }, [portfolioData])

  if (!portfolioData || portfolioData.items.length === 0) return null

  const formatValue = (value: number): string => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(2)}M`
    if (value >= 1000) return `$${(value / 1000).toFixed(1)}k`
    return `$${value.toFixed(2)}`
  }

  return (
    <Card className="border-border/40 overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-violet-500/10">
              <PieChart className="w-4 h-4 text-violet-500" />
            </div>
            <CardTitle className="text-base">Portfolio Composition</CardTitle>
          </div>
          <Badge variant="outline" className="text-primary border-primary/30">
            {formatValue(portfolioData.totalUsd)}
          </Badge>
        </div>
        <CardDescription className="text-xs">
          Token holdings reveal trading patterns and risk profile to surveillance systems
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0 space-y-4">
        {/* Treemap Visualization */}
        <div className="relative aspect-2/1 sm:aspect-3/1 bg-muted/10 rounded-lg overflow-hidden border border-border/30">
          <svg 
            viewBox="0 0 100 100" 
            className="w-full h-full"
            preserveAspectRatio="none"
          >
            {treemapLayout.map((item, index) => {
              const isHovered = hoveredToken === item.symbol
              const color = getTokenColor(item.symbol, index)
              return (
                <g 
                  key={item.symbol}
                  onMouseEnter={() => setHoveredToken(item.symbol)}
                  onMouseLeave={() => setHoveredToken(null)}
                  className="cursor-pointer"
                >
                  <rect
                    x={item.x + 0.5}
                    y={item.y + 0.5}
                    width={Math.max(0, item.w - 1)}
                    height={Math.max(0, item.h - 1)}
                    rx="1"
                    className={cn(
                      color,
                      "transition-all duration-200",
                      isHovered ? "opacity-100" : "opacity-70"
                    )}
                  />
                  {item.w > 15 && item.h > 12 && (
                    <text
                      x={item.x + item.w / 2}
                      y={item.y + item.h / 2}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="fill-white text-[6px] sm:text-[8px] font-medium pointer-events-none"
                    >
                      {item.symbol.slice(0, 6)}
                    </text>
                  )}
                  {item.w > 20 && item.h > 20 && (
                    <text
                      x={item.x + item.w / 2}
                      y={item.y + item.h / 2 + 8}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="fill-white/70 text-[5px] sm:text-[6px] pointer-events-none"
                    >
                      {item.percentage.toFixed(0)}%
                    </text>
                  )}
                </g>
              )
            })}
          </svg>
          
          {/* Hover tooltip */}
          {hoveredToken && (
            <div className="absolute top-2 left-2 bg-background/95 backdrop-blur-sm border border-border/50 rounded-md px-2 py-1 shadow-lg">
              <p className="text-xs font-medium">{hoveredToken}</p>
              <p className="text-[10px] text-muted-foreground">
                {formatValue(portfolioData.items.find(i => i.symbol === hoveredToken)?.value || 0)}
                {' • '}
                {portfolioData.items.find(i => i.symbol === hoveredToken)?.percentage.toFixed(1)}%
              </p>
            </div>
          )}
        </div>

        {/* Token Type Distribution - Donut style mini visualization */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-center">
            <p className="text-lg font-semibold text-green-400 tabular-nums">
              {portfolioData.stableCount}
            </p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Stablecoins</p>
          </div>
          <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20 text-center">
            <p className="text-lg font-semibold text-purple-400 tabular-nums">
              {portfolioData.memeCount}
            </p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Memecoins</p>
          </div>
          <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-center">
            <p className="text-lg font-semibold text-blue-400 tabular-nums">
              {portfolioData.tokenCount - portfolioData.stableCount - portfolioData.memeCount}
            </p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Other</p>
          </div>
        </div>

        {/* Collapsible Token List */}
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleTrigger className="w-full">
            <div className={cn(
              "flex items-center justify-between p-3 rounded-lg border transition-colors cursor-pointer",
              isExpanded 
                ? "bg-muted/20 border-primary/30" 
                : "bg-muted/10 border-border/40 hover:border-border/60"
            )}>
              <div className="flex items-center gap-2">
                <Wallet className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">Top Holdings</span>
                <Badge variant="outline" className="text-[10px] py-0">
                  {portfolioData.items.length}
                </Badge>
              </div>
              <ChevronDown className={cn(
                "w-4 h-4 text-muted-foreground transition-transform duration-200",
                isExpanded && "rotate-180"
              )} />
            </div>
          </CollapsibleTrigger>
          
          <CollapsibleContent>
            <div className="pt-3 space-y-2">
              {portfolioData.items.slice(0, 8).map((item, index) => (
                <div 
                  key={item.symbol}
                  className="flex items-center justify-between p-2 rounded-md bg-muted/15 border border-border/30"
                >
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "w-3 h-3 rounded-sm shrink-0",
                      getTokenColor(item.symbol, index)
                    )} />
                    <span className="text-sm font-medium truncate max-w-[100px] sm:max-w-none">
                      {item.symbol}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground tabular-nums">
                      {formatValue(item.value)}
                    </span>
                    <Badge variant="outline" className="text-[10px] py-0 tabular-nums">
                      {item.percentage.toFixed(1)}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Privacy Note */}
        <div className="p-2.5 rounded bg-muted/20 border-l-2 border-violet-500/40">
          <p className="text-[11px] text-muted-foreground">
            <span className="text-violet-400 font-medium">Why this matters: </span>
            Portfolio concentration and token mix are used to classify wallets and infer trading strategies.
          </p>
        </div>
      </CardContent>
    </Card>
  )
})
