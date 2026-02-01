'use client'

import { memo, useMemo } from 'react'
import { Radar } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { AnalysisResult } from './types'

interface ExposureRadarProps {
  data: AnalysisResult
}

const AXES = 6
const R = 45
const CX = 50
const CY = 50

function polarToCart(angle: number, radius: number): { x: number; y: number } {
  const a = (angle / 360) * 2 * Math.PI - Math.PI / 2
  return {
    x: CX + radius * Math.cos(a),
    y: CY + radius * Math.sin(a),
  }
}

export const ExposureRadar = memo(function ExposureRadar({ data }: ExposureRadarProps) {
  const fundingCount = data.opsec_failures?.funding_sources?.length ?? 0
  const cashoutCount = data.opsec_failures?.withdrawal_targets?.length ?? 0
  const linkedWallets = data.ego_network?.total_links ?? 0
  const counterparties = data.surveillance_exposure?.signals?.repeated_counterparties ?? 0
  const botConfidence = data.reaction_speed?.bot_confidence ?? 0
  const hourly = data.activity_pattern?.hourly ?? []
  const activityEntropy = hourly.length > 0
    ? (() => {
        const sum = hourly.reduce((a, b) => a + b, 0)
        if (sum === 0) return 0
        const p = hourly.map((h) => h / sum)
        const entropy = -p.reduce((acc, pi) => (pi > 0 ? acc + pi * Math.log2(pi) : acc), 0)
        return Math.min(100, (entropy / Math.log2(24)) * 100)
      })()
    : 0

  const dimensions = useMemo(() => {
    const raw = [
      { label: 'Funding links', value: Math.min(100, fundingCount * 25), raw: fundingCount },
      { label: 'Cashout links', value: Math.min(100, cashoutCount * 25), raw: cashoutCount },
      { label: 'Linked wallets', value: Math.min(100, linkedWallets * 4), raw: linkedWallets },
      { label: 'Counterparties', value: Math.min(100, counterparties * 10), raw: counterparties },
      { label: 'Reaction link', value: botConfidence, raw: Math.round(botConfidence) },
      { label: 'Activity pattern', value: activityEntropy, raw: Math.round(activityEntropy) },
    ]
    return raw.map((d) => ({ ...d, value: d.value / 100 }))
  }, [fundingCount, cashoutCount, linkedWallets, counterparties, botConfidence, activityEntropy])

  const polygonPoints = useMemo(() => {
    return dimensions
      .map((d, i) => {
        const angle = (i / AXES) * 360
        const { x, y } = polarToCart(angle, R * d.value)
        return `${x},${y}`
      })
      .join(' ')
  }, [dimensions])

  const gridLines = useMemo(() => {
    return [0.25, 0.5, 0.75, 1].map((scale) =>
      dimensions
        .map((_, i) => {
          const angle = (i / AXES) * 360
          const { x, y } = polarToCart(angle, R * scale)
          return `${x},${y}`
        })
        .join(' ')
    )
  }, [dimensions])

  const axisLines = useMemo(() => {
    const rad = (deg: number) => (deg * Math.PI) / 180
    return dimensions.map((_, i) => {
      const angle = (i / AXES) * 360
      const end = polarToCart(angle, R)
      const labelPos = polarToCart(angle, R + 6)
      const shortLabel = dimensions[i].label
        .replace('Funding links', 'Funding')
        .replace('Cashout links', 'Cashout')
        .replace('Linked wallets', 'Linked')
        .replace('Reaction link', 'Reaction')
        .replace('Activity pattern', 'Activity')
      // Outward offset in px so label sits outside chart; text stays horizontal (no rotation)
      const outwardPx = 10
      const offsetX = outwardPx * Math.sin(rad(angle))
      const offsetY = -outwardPx * Math.cos(rad(angle))
      return {
        x1: CX, y1: CY, x2: end.x, y2: end.y,
        label: shortLabel,
        labelLeftPct: Math.max(8, Math.min(92, labelPos.x)),
        labelTopPct: Math.max(8, Math.min(92, labelPos.y)),
        offsetPx: { x: offsetX, y: offsetY },
      }
    })
  }, [dimensions])

  return (
    <Card className="border-border/40 overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/10">
            <Radar className="w-4 h-4 text-primary" />
          </div>
          <CardTitle className="text-base">Exposure fingerprint</CardTitle>
        </div>
        <CardDescription className="text-xs">
          How much you “stick out” across six dimensions; larger shape means more linkable
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
          <div className="relative shrink-0 w-[150px] h-[150px] sm:w-[180px] sm:h-[180px]">
            {/* Axis labels as HTML overlay so they stay readable */}
            {axisLines.map((line, i) => (
              <span
                key={`label-${i}`}
                className="absolute text-[9px] sm:text-[11px] font-medium text-foreground whitespace-nowrap pointer-events-none"
                style={{
                  left: `${line.labelLeftPct}%`,
                  top: `${line.labelTopPct}%`,
                  transform: `translate(calc(-50% + ${line.offsetPx.x}px), calc(-50% + ${line.offsetPx.y}px))`,
                }}
              >
                {line.label}
              </span>
            ))}
            <svg viewBox="0 0 100 100" className="w-full h-full">
              {/* Grid polygons */}
              {gridLines.map((points, i) => (
                <polygon
                  key={i}
                  points={points}
                  fill="none"
                  stroke="currentColor"
                  strokeOpacity="0.12"
                  strokeWidth="0.5"
                />
              ))}
              {/* Axis lines */}
              {axisLines.map((line, i) => (
                <line
                  key={i}
                  x1={line.x1}
                  y1={line.y1}
                  x2={line.x2}
                  y2={line.y2}
                  stroke="currentColor"
                  strokeOpacity="0.2"
                  strokeWidth="0.5"
                />
              ))}
              {/* Data polygon */}
              <polygon
                points={polygonPoints}
                fill="oklch(0.75 0.15 195 / 0.25)"
                stroke="oklch(0.75 0.15 195)"
                strokeWidth="1.5"
                className="transition-all duration-500"
              />
            </svg>
          </div>
          <div className="flex-1 grid grid-cols-2 gap-x-4 gap-y-1.5 text-[11px] min-w-0">
            {dimensions.map((d, i) => (
              <div key={i} className="flex items-center justify-between gap-2">
                <span className="text-muted-foreground truncate">{d.label}</span>
                <span className="font-medium tabular-nums shrink-0">
                  {Math.round(d.value * 100)}%
                  {d.raw != null && <span className="text-muted-foreground font-normal"> ({d.raw})</span>}
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
})
