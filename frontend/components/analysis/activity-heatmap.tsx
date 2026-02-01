'use client'

import { memo, useMemo } from 'react'
import { Clock, Sun, Moon } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { AnalysisResult } from './types'

interface ActivityHeatmapProps {
  data: AnalysisResult
}

export const ActivityHeatmap = memo(function ActivityHeatmap({ data }: ActivityHeatmapProps) {
  const hourly = data.activity_pattern?.hourly ?? []
  const hours = Array.from({ length: 24 }, (_, i) => hourly[i] ?? 0)
  const max = Math.max(1, ...hours)

  const totalTxns = useMemo(() => hours.reduce((a, b) => a + b, 0), [hours])
  const cells = useMemo(() => {
    return hours.map((count, i) => ({
      hour: i,
      count,
      intensity: max > 0 ? count / max : 0,
      label: i === 0 ? '12a' : i === 12 ? '12p' : i < 12 ? `${i}a` : `${i - 12}p`,
    }))
  }, [hours, max])

  const peakHour = max > 0 ? hours.indexOf(max) : 0
  const topHours = useMemo(() => {
    return hours
      .map((count, hour) => ({ hour, count }))
      .filter((x) => x.count > 0)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
  }, [hours])

  const firstActiveHour = hours.findIndex((c) => c > 0)
  const lastActiveHour = firstActiveHour < 0 ? -1 : 23 - [...hours].reverse().findIndex((c) => c > 0)
  const activeWindow = firstActiveHour >= 0 && lastActiveHour >= firstActiveHour
    ? `${firstActiveHour}h–${lastActiveHour}h`
    : null
  const quietHoursCount = hours.filter((c) => c === 0).length
  const activeHoursCount = hours.filter((c) => c > 0).length
  const avgPerActiveHour = activeHoursCount > 0 ? (totalTxns / activeHoursCount).toFixed(1) : '0'

  const geographic = data.geographic_origin
  const timezoneInference = useMemo(() => {
    if (!geographic) return null
    const entries = [
      { key: 'europe', label: 'Europe / Africa', example: 'UTC+0 to UTC+2' },
      { key: 'americas', label: 'Americas', example: 'UTC-3 to UTC-8' },
      { key: 'asia_pacific', label: 'Asia / Pacific', example: 'UTC+5 to UTC+12' },
      { key: 'other', label: 'Unclear', example: 'Mixed or low confidence' },
    ] as const
    const sorted = entries
      .map((e) => ({ ...e, pct: geographic[e.key] ?? 0 }))
      .sort((a, b) => b.pct - a.pct)
    const top = sorted[0]
    if (!top || top.pct <= 0) return null
    return { label: top.label, pct: Math.round(top.pct), example: top.example }
  }, [geographic])

  return (
    <Card className="border-border/40 overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-violet-500/10">
            <Clock className="w-4 h-4 text-violet-500" />
          </div>
          <CardTitle className="text-base">Activity by hour = timezone fingerprint</CardTitle>
        </div>
        <CardDescription className="text-xs">
          When you transact reveals your likely timezone and routine; surveillance systems use this to link wallets and infer location
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="flex items-center justify-between text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <Sun className="w-3 h-3" /> 0h
            </span>
            <span className="flex items-center gap-1">
              <Moon className="w-3 h-3" /> 24h
            </span>
          </div>
          <div className="grid gap-0.5 rounded-lg overflow-hidden bg-muted/20 p-2 border border-border/30" style={{ gridTemplateColumns: 'repeat(24, minmax(0, 1fr))' }}>
            {cells.map((cell) => (
              <div
                key={cell.hour}
                className={cn(
                  'aspect-square min-w-0 rounded-sm transition-colors',
                  cell.intensity === 0 && 'bg-muted/30',
                  cell.intensity > 0 && cell.intensity <= 0.25 && 'bg-violet-500/30',
                  cell.intensity > 0.25 && cell.intensity <= 0.5 && 'bg-violet-500/50',
                  cell.intensity > 0.5 && cell.intensity < 1 && 'bg-violet-500/70',
                  cell.intensity >= 1 && 'bg-violet-500'
                )}
                style={
                  cell.intensity > 0 && cell.intensity < 0.25
                    ? { backgroundColor: 'rgba(139, 92, 246, 0.2)' }
                    : undefined
                }
                title={`${cell.hour}:00 UTC: ${cell.count} txns`}
              />
            ))}
          </div>
          <div className="flex justify-between text-[10px] text-muted-foreground px-0.5">
            {[0, 6, 12, 18, 23].map((h) => (
              <span key={h}>{h}h</span>
            ))}
          </div>
          <div className="space-y-3 pt-1 border-t border-border/30">
            {timezoneInference && (
              <div className="p-3 rounded-lg bg-violet-500/10 border border-violet-500/20">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">Likely timezone (inferred from UTC activity)</p>
                <p className="text-sm font-medium text-foreground">
                  {timezoneInference.label}
                  <span className="text-muted-foreground font-normal ml-1">(~{timezoneInference.pct}% match)</span>
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{timezoneInference.example}</p>
              </div>
            )}
            <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-[10px] text-muted-foreground tabular-nums">
              <span>Transactions analyzed: {totalTxns}</span>
              {max > 0 && (
                <>
                  <span>Peak: {peakHour}h ({max} txns)</span>
                  {activeWindow && <span>Active window: {activeWindow}</span>}
                  <span>Quiet hours: {quietHoursCount}/24 (0 txns)</span>
                  <span>Avg per active hour: {avgPerActiveHour} txns</span>
                  {topHours.length > 1 && (
                    <span>Top: {topHours.map((x) => `${x.hour}h:${x.count}`).join(', ')}</span>
                  )}
                </>
              )}
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1.5">24-hour breakdown (txns per hour)</p>
              <div className="grid grid-cols-12 sm:grid-cols-24 gap-1 text-[10px]">
                {cells.map((cell) => (
                  <div
                    key={cell.hour}
                    className={cn(
                      'rounded px-1 py-0.5 text-center tabular-nums border border-transparent',
                      cell.count > 0 ? 'bg-violet-500/20 text-foreground border-violet-500/30' : 'bg-muted/20 text-muted-foreground'
                    )}
                    title={`${cell.hour}:00 UTC: ${cell.count} txns`}
                  >
                    <span className="font-medium">{cell.hour}h</span>
                    <span className="block text-[9px]">{cell.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
})
