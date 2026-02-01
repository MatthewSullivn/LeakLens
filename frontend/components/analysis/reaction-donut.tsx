'use client'

import { memo, useMemo } from 'react'
import { Zap, Clock, User } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { AnalysisResult } from './types'

interface ReactionDonutProps {
  data: AnalysisResult
}

const R = 40
const CX = 50
const CY = 50
const STROKE = 10

function segmentPath(startPercent: number, endPercent: number): string {
  const start = (startPercent / 100) * 2 * Math.PI - Math.PI / 2
  const end = (endPercent / 100) * 2 * Math.PI - Math.PI / 2
  const x1 = CX + R * Math.cos(start)
  const y1 = CY + R * Math.sin(start)
  const x2 = CX + R * Math.cos(end)
  const y2 = CY + R * Math.sin(end)
  const large = endPercent - startPercent > 50 ? 1 : 0
  return `M ${x1} ${y1} A ${R} ${R} 0 ${large} 1 ${x2} ${y2}`
}

export const ReactionDonut = memo(function ReactionDonut({ data }: ReactionDonutProps) {
  const rs = data.reaction_speed
  const total = rs?.total_pairs ?? 1
  const instant = (rs?.instant_reactions ?? 0) / total
  const fast = (rs?.fast_reactions ?? 0) / total
  const human = (rs?.human_reactions ?? 0) / total

  const instantCount = rs?.instant_reactions ?? 0
  const fastCount = rs?.fast_reactions ?? 0
  const humanCount = rs?.human_reactions ?? 0
  const avgMs = rs?.avg_reaction_time ?? 0
  const medianMs = rs?.median_reaction_time ?? 0
  const fastestMs = rs?.fastest_reaction ?? 0

  const segments = useMemo(() => {
    const i = Math.round(instant * 100)
    const f = Math.round(fast * 100)
    const h = Math.round(human * 100)
    return [
      { label: 'Instant (<5s)', pct: i, count: instantCount, color: 'rgb(239, 68, 68)', icon: Zap },
      { label: 'Fast (5–30s)', pct: f, count: fastCount, color: 'rgb(234, 179, 8)', icon: Clock },
      { label: 'Human (>30s)', pct: h, count: humanCount, color: 'rgb(34, 211, 238)', icon: User },
    ].filter((s) => s.pct > 0 || s.count > 0)
  }, [instant, fast, human, instantCount, fastCount, humanCount])

  let offset = 0
  const paths = segments.map((s) => {
    const start = offset
    offset += s.pct
    return { ...s, start, end: offset, path: segmentPath(start, offset) }
  })

  const isLinkable = (instant * 100 + fast * 100) > 50

  return (
    <Card className="border-border/40 overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-500/10">
            <Zap className="w-4 h-4 text-amber-500" />
          </div>
          <CardTitle className="text-base">Reaction speed = timing fingerprint</CardTitle>
        </div>
        <CardDescription className="text-xs">
          Fast reactions (&lt;30s) between receive and send are easy to link to the same operator; selective privacy uses delays to break this
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="relative shrink-0 flex items-center justify-center" style={{ width: 120, height: 120 }}>
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90 absolute inset-0">
              {paths.map((p, i) => (
                <path
                  key={i}
                  d={p.path}
                  fill="none"
                  stroke={p.color}
                  strokeWidth={STROKE}
                  strokeLinecap="round"
                  className="transition-opacity hover:opacity-90"
                />
              ))}
              <circle cx={CX} cy={CY} r={R - STROKE} fill="hsl(var(--card))" />
            </svg>
            <span className="relative z-10 text-[10px] text-muted-foreground tabular-nums">
              {total} pairs
            </span>
          </div>
          <div className="flex-1 space-y-2 min-w-0">
            {segments.map((s, i) => {
              const Icon = s.icon
              return (
                <div key={i} className="flex items-center gap-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: s.color }}
                  />
                  <Icon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                  <span className="text-xs text-muted-foreground">{s.label}</span>
                  <span className="text-sm font-semibold tabular-nums ml-auto">
                    {s.count} · {s.pct}%
                  </span>
                </div>
              )
            })}
            <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-[10px] text-muted-foreground pt-1.5 border-t border-border/30 tabular-nums">
              {avgMs > 0 && <span>Avg: {avgMs < 1000 ? `${avgMs}ms` : `${(avgMs / 1000).toFixed(1)}s`}</span>}
              {medianMs > 0 && <span>Median: {medianMs < 1000 ? `${medianMs}ms` : `${(medianMs / 1000).toFixed(1)}s`}</span>}
              {fastestMs > 0 && <span>Fastest: {fastestMs < 1000 ? `${fastestMs}ms` : `${(fastestMs / 1000).toFixed(1)}s`}</span>}
            </div>
            {isLinkable && (
              <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-2 pt-2 border-t border-border/40">
                Over half of reactions were under 30s; strong timing link
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
})
