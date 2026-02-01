'use client'

import { memo, useMemo, useState } from 'react'
import { Activity, Zap, ChevronDown } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { cn } from '@/lib/utils'
import type { AnalysisResult } from './types'

interface TransactionSparklineProps {
  data: AnalysisResult
}

// Generate smooth SVG path using cubic bezier curves
function generateSmoothPath(
  dataPoints: number[]
): { linePath: string; areaPath: string; points: { x: number; y: number; value: number }[] } {
  if (dataPoints.length === 0) return { linePath: '', areaPath: '', points: [] }
  
  const width = 100
  const height = 32
  const top = 2
  const bottom = 30
  const maxValue = Math.max(...dataPoints, 1)

  const points = dataPoints.map((value, i) => ({
    x: (i / (dataPoints.length - 1 || 1)) * width,
    y: top + (1 - value / maxValue) * (bottom - top),
    value,
  }))

  if (points.length < 2) {
    return { linePath: '', areaPath: '', points }
  }

  // Catmull-rom to bezier
  let linePath = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`
  
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)]
    const p1 = points[i]
    const p2 = points[i + 1]
    const p3 = points[Math.min(points.length - 1, i + 2)]
    
    const t = 0.35
    const cp1x = p1.x + (p2.x - p0.x) * t
    const cp1y = p1.y + (p2.y - p0.y) * t
    const cp2x = p2.x - (p3.x - p1.x) * t
    const cp2y = p2.y - (p3.y - p1.y) * t
    
    linePath += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`
  }
  
  const areaPath = `${linePath} L ${points[points.length - 1].x.toFixed(1)} ${height} L ${points[0].x.toFixed(1)} ${height} Z`
  
  return { linePath, areaPath, points }
}

export const TransactionSparkline = memo(function TransactionSparkline({ 
  data 
}: TransactionSparklineProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [hoveredHour, setHoveredHour] = useState<number | null>(null)

  const chartData = useMemo(() => {
    const complexity = data.transaction_complexity || []
    const hourly = data.activity_pattern?.hourly || []
    
    // Aggregate compute units by hour
    const hourlyComplexity = Array(24).fill(0)
    const hourlyCount = Array(24).fill(0)
    
    complexity.forEach(tx => {
      if (tx.hour >= 0 && tx.hour < 24) {
        hourlyComplexity[tx.hour] += tx.compute_units
        hourlyCount[tx.hour]++
      }
    })
    
    // Calculate averages
    const avgComplexity = hourlyComplexity.map((total, i) => 
      hourlyCount[i] > 0 ? total / hourlyCount[i] : 0
    )
    
    const maxActivity = Math.max(...hourly, 1)
    
    // Statistics
    const totalTxns = hourly.reduce((a, b) => a + b, 0)
    const avgComputeUnits = complexity.length > 0
      ? complexity.reduce((sum, tx) => sum + tx.compute_units, 0) / complexity.length
      : 0
    const peakHour = hourly.indexOf(Math.max(...hourly))
    const quietHours = hourly.filter(h => h === 0).length
    
    return {
      hourlyActivity: hourly,
      avgComplexity,
      maxActivity,
      totalTxns,
      avgComputeUnits,
      peakHour,
      quietHours,
      txTypes: complexity.reduce((acc, tx) => {
        acc[tx.type] = (acc[tx.type] || 0) + 1
        return acc
      }, {} as Record<string, number>),
    }
  }, [data.transaction_complexity, data.activity_pattern])

  // Generate smooth paths
  const { linePath: activityLine, areaPath: activityArea, points: activityPoints } = useMemo(
    () => generateSmoothPath(chartData.hourlyActivity),
    [chartData.hourlyActivity]
  )

  // Transaction type distribution
  const txTypeEntries = Object.entries(chartData.txTypes)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
  const totalTyped = txTypeEntries.reduce((sum, [, count]) => sum + count, 0)

  return (
    <Card className="border-border/40 overflow-hidden">
      <CardHeader className="pb-2 sm:pb-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="p-1.5 rounded-lg bg-primary/10 shrink-0">
              <Activity className="w-4 h-4 text-primary" />
            </div>
            <div className="min-w-0">
              <CardTitle className="text-sm sm:text-base">Transaction Activity</CardTitle>
              <CardDescription className="text-[10px] sm:text-xs hidden sm:block">
                24-hour activity pattern reveals behavioral fingerprint
              </CardDescription>
            </div>
          </div>
          <Badge variant="outline" className="text-[10px] sm:text-xs text-primary border-primary/30 shrink-0">
            {chartData.totalTxns} txns
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-3 sm:space-y-4">
        {/* Area Chart */}
        <div className="relative w-full">
          <div className="w-full h-28 sm:h-36 lg:h-44">
            <svg 
              viewBox="0 0 100 32" 
              className="w-full h-full"
              preserveAspectRatio="none"
              onMouseLeave={() => setHoveredHour(null)}
            >
              <defs>
                <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="oklch(0.75 0.15 195)" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="oklch(0.75 0.15 195)" stopOpacity="0.02" />
                </linearGradient>
              </defs>
              
              {/* Area fill */}
              {activityArea && (
                <path d={activityArea} fill="url(#areaFill)" />
              )}
              
              {/* Line */}
              {activityLine && (
                <path
                  d={activityLine}
                  fill="none"
                  stroke="oklch(0.75 0.15 195)"
                  strokeWidth="0.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}
              
              {/* Hover indicator - small dot */}
              {hoveredHour !== null && activityPoints[hoveredHour] && (
                <circle
                  cx={activityPoints[hoveredHour].x}
                  cy={activityPoints[hoveredHour].y}
                  r="0.8"
                  fill="#fff"
                  className="drop-shadow-sm"
                />
              )}
              
              {/* Touch targets */}
              {Array.from({ length: 24 }).map((_, i) => (
                <rect
                  key={i}
                  x={(i / 23) * 100 - 2.1}
                  y="0"
                  width="4.2"
                  height="32"
                  fill="transparent"
                  onMouseEnter={() => setHoveredHour(i)}
                  onTouchStart={() => setHoveredHour(i)}
                  className="cursor-crosshair"
                />
              ))}
            </svg>
          </div>
          
          {/* Hour labels */}
          <div className="flex justify-between mt-1.5 text-[8px] sm:text-[9px] text-muted-foreground/40 tabular-nums select-none">
            <span>0h</span>
            <span>6h</span>
            <span>12h</span>
            <span>18h</span>
            <span>24h</span>
          </div>
          
          {/* Tooltip */}
          {hoveredHour !== null && (
            <div className="absolute top-1 right-1 bg-card/95 backdrop-blur border border-border/50 rounded px-2 py-1 shadow-lg text-right">
              <p className="text-[9px] text-muted-foreground">{hoveredHour}:00</p>
              <p className="text-sm font-semibold text-primary tabular-nums">{chartData.hourlyActivity[hoveredHour]}</p>
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
          <div className="p-2 sm:p-2.5 rounded-lg bg-primary/10 border border-primary/20 text-center">
            <p className="text-sm sm:text-base font-bold text-primary tabular-nums">{chartData.peakHour}:00</p>
            <p className="text-[8px] sm:text-[9px] text-primary/70 uppercase tracking-wide">Peak Hour</p>
          </div>
          <div className="p-2 sm:p-2.5 rounded-lg bg-muted/10 border border-border/20 text-center">
            <p className="text-sm sm:text-base font-semibold text-foreground tabular-nums">{chartData.quietHours}/24</p>
            <p className="text-[8px] sm:text-[9px] text-muted-foreground uppercase tracking-wide">Quiet</p>
          </div>
          <div className="p-2 sm:p-2.5 rounded-lg bg-muted/10 border border-border/20 text-center">
            <p className="text-sm sm:text-base font-semibold text-foreground tabular-nums">
              {chartData.avgComputeUnits > 1000 
                ? `${(chartData.avgComputeUnits / 1000).toFixed(0)}k` 
                : Math.round(chartData.avgComputeUnits)}
            </p>
            <p className="text-[8px] sm:text-[9px] text-muted-foreground uppercase tracking-wide">Avg CU</p>
          </div>
          <div className="p-2 sm:p-2.5 rounded-lg bg-muted/10 border border-border/20 text-center">
            <p className="text-sm sm:text-base font-semibold text-foreground tabular-nums">{chartData.maxActivity}</p>
            <p className="text-[8px] sm:text-[9px] text-muted-foreground uppercase tracking-wide">Peak Vol</p>
          </div>
        </div>

        {/* Transaction Types Distribution */}
        {txTypeEntries.length > 0 && (
          <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
            <CollapsibleTrigger className="w-full">
              <div className={cn(
                "flex items-center justify-between p-2 sm:p-2.5 rounded-lg border transition-colors cursor-pointer",
                isExpanded 
                  ? "bg-muted/15 border-border/40" 
                  : "bg-muted/5 border-border/20 hover:border-border/40"
              )}>
                <div className="flex items-center gap-2">
                  <Zap className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-xs sm:text-sm font-medium">Transaction Types</span>
                  <Badge variant="outline" className="text-[9px] py-0">
                    {txTypeEntries.length}
                  </Badge>
                </div>
                <ChevronDown className={cn(
                  "w-3.5 h-3.5 text-muted-foreground transition-transform duration-200",
                  isExpanded && "rotate-180"
                )} />
              </div>
            </CollapsibleTrigger>
            
            <CollapsibleContent>
              <div className="pt-2 space-y-1.5">
                {txTypeEntries.map(([type, count], index) => {
                  const percentage = (count / totalTyped) * 100
                  const colors = ['bg-primary', 'bg-purple-500', 'bg-amber-500', 'bg-green-500', 'bg-pink-500']
                  return (
                    <div key={type} className="space-y-0.5">
                      <div className="flex items-center justify-between text-[10px] sm:text-xs">
                        <span className="text-muted-foreground truncate max-w-[120px] sm:max-w-none">
                          {type}
                        </span>
                        <span className="text-foreground tabular-nums">{count} ({percentage.toFixed(0)}%)</span>
                      </div>
                      <div className="h-1 bg-muted/20 rounded-full overflow-hidden">
                        <div 
                          className={cn("h-full rounded-full", colors[index % colors.length])}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Privacy Note */}
        <div className="p-2 rounded-lg bg-primary/5 border-l-2 border-primary/30">
          <p className="text-[10px] sm:text-[11px] text-muted-foreground leading-relaxed">
            <span className="text-primary font-medium">Pattern analysis: </span>
            Consistent activity at specific hours indicates routine; irregular patterns suggest manual trading.
          </p>
        </div>
      </CardContent>
    </Card>
  )
})
