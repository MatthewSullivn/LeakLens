'use client'

import { memo, useRef, useEffect, useState, useMemo } from 'react'
import { Eye, Shield, Clock, AlertTriangle, Activity, Link2, ArrowDownToLine, ArrowUpFromLine, Cpu, Zap } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { getSeverityColor, formatDate, STROKE_COLORS } from './utils'
import type { AnalysisResult } from './types'

interface ExposureSummaryProps {
  data: AnalysisResult
}

interface FactorSegment {
  id: string
  label: string
  value: number
  rawLabel: string
  rawValue: string | number
  color: string
  stroke: string
  icon: React.ReactNode
}

function getExposureFactors(data: AnalysisResult): FactorSegment[] {
  const score = data.surveillance_exposure?.surveillance_score ?? 0
  const signals = data.surveillance_exposure?.signals
  const opsec = data.opsec_failures
  const sleep = data.sleep_window?.confidence ?? 0
  const botConf = data.reaction_speed?.bot_confidence ?? 0
  const fundingCount = opsec?.funding_sources?.length ?? 0
  const cashoutCount = opsec?.withdrawal_targets?.length ?? 0
  const counterparties = signals?.repeated_counterparties ?? 0
  const swapCount = signals?.swap_count ?? 0
  const mev = signals?.mev_execution_detected ? 1 : 0

  // Dark-theme factor colors (muted, fits near-black background)
  const raw = [
    { id: 'funding', label: 'Funding links', value: Math.min(25, fundingCount * 8), rawLabel: 'sources', rawValue: fundingCount, color: 'oklch(0.6 0.1 195)', stroke: '#0d9488', icon: <ArrowDownToLine className="w-3.5 h-3.5" /> },
    { id: 'cashout', label: 'Cashout links', value: Math.min(25, cashoutCount * 8), rawLabel: 'targets', rawValue: cashoutCount, color: 'oklch(0.55 0.18 25)', stroke: '#b91c1c', icon: <ArrowUpFromLine className="w-3.5 h-3.5" /> },
    { id: 'counterparties', label: 'Counterparties', value: Math.min(25, counterparties * 3), rawLabel: 'repeated', rawValue: counterparties, color: 'oklch(0.6 0.12 85)', stroke: '#a16207', icon: <Link2 className="w-3.5 h-3.5" /> },
    { id: 'reaction', label: 'Reaction speed', value: (botConf / 100) * 25, rawLabel: 'bot %', rawValue: Math.round(botConf), color: 'oklch(0.6 0.14 55)', stroke: '#b45309', icon: <Cpu className="w-3.5 h-3.5" /> },
    { id: 'timing', label: 'Timing patterns', value: (sleep / 100) * 25, rawLabel: 'sleep conf.', rawValue: Math.round(sleep), color: 'oklch(0.55 0.18 280)', stroke: '#6d28d9', icon: <Clock className="w-3.5 h-3.5" /> },
    { id: 'swap', label: 'Swap / MEV', value: Math.min(25, swapCount / 4 + mev * 15), rawLabel: 'swaps', rawValue: swapCount, color: 'oklch(0.55 0.15 250)', stroke: '#1d4ed8', icon: <Zap className="w-3.5 h-3.5" /> },
  ]
  const totalRaw = raw.reduce((a, f) => a + f.value, 0)
  const scale = totalRaw > 0 ? score / totalRaw : 0
  return raw.map((f) => ({
    ...f,
    value: Math.max(0, Math.min(100, f.value * scale)),
  }))
}

const R = 42
const CX = 50
const CY = 50
const STROKE = 8

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

export const ExposureSummary = memo(function ExposureSummary({ data }: ExposureSummaryProps) {
  const gaugeRef = useRef<HTMLDivElement>(null)
  const [animatedScore, setAnimatedScore] = useState(0)
  const hasAnimated = useRef(false)

  const score = Math.round(data.surveillance_exposure?.surveillance_score ?? 0)
  const riskLevel = data.surveillance_exposure?.risk_level ?? 'MEDIUM'
  const colors = getSeverityColor(riskLevel)

  const factors = useMemo(() => getExposureFactors(data), [data])
  const segmentPaths = useMemo(() => {
    if (score <= 0) return []
    let offset = 0
    // Only fill 0..score% of the circle; the rest stays empty (background track)
    return factors
      .filter((f) => f.value > 0)
      .map((f) => {
        const start = offset
        offset += f.value
        return { ...f, start, end: offset, path: segmentPath(start, offset) }
      })
  }, [factors, score])

  useEffect(() => {
    const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) {
      setAnimatedScore(score)
      return
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true
          let current = 0
          const step = score / 40
          const interval = setInterval(() => {
            current += step
            if (current >= score) {
              setAnimatedScore(score)
              clearInterval(interval)
            } else {
              setAnimatedScore(current)
            }
          }, 25)
        }
      },
      { threshold: 0.2 }
    )
    if (gaugeRef.current) observer.observe(gaugeRef.current)
    return () => observer.disconnect()
  }, [score])

  return (
    <Card className="relative border-border/40 bg-linear-to-br from-card via-card to-card/80 overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: 'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />
      <CardContent className="relative pt-6 pb-6">
        <div className="flex items-center gap-2 mb-6">
          <div className="p-1.5 rounded-lg bg-primary/10">
            <Eye className="w-4 h-4 text-primary" />
          </div>
          <h2 className="text-lg font-semibold">Wallet Exposure Overview</h2>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-10 items-start">
          {/* Multi-segment gauge */}
          <div ref={gaugeRef} className="flex flex-col items-center gap-4 shrink-0">
            <div className="relative w-36 h-36">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                <circle cx={CX} cy={CY} r={R} fill="none" stroke="currentColor" strokeWidth={STROKE} className="text-border/20" />
                {segmentPaths.map((seg, i) => (
                  <path
                    key={seg.id}
                    d={seg.path}
                    fill="none"
                    stroke={seg.stroke}
                    strokeWidth={STROKE}
                    strokeLinecap="round"
                    className="transition-all duration-700 ease-out"
                    style={{ opacity: animatedScore > 0 ? 1 : 0 }}
                  />
                ))}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-3xl font-bold tabular-nums text-foreground">{Math.round(animatedScore)}</span>
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">of 100</span>
              </div>
            </div>
            <Badge className={cn(colors.bg, colors.text, colors.border, 'text-xs')}>
              <Shield className="w-3 h-3 mr-1.5" />
              {riskLevel} Risk
            </Badge>
          </div>

          {/* What makes up this score */}
          <div className="flex-1 min-w-0 space-y-4">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              What makes up this score
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {factors.map((f) => (
                <div
                  key={f.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/15 border border-border/30"
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-foreground"
                    style={{ backgroundColor: `${f.stroke}20`, color: f.stroke }}
                  >
                    {f.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground">{f.label}</p>
                    <p className="text-[11px] text-muted-foreground tabular-nums">
                      {f.rawLabel}: {f.rawValue} · contributes ~{Math.round(f.value)} pts
                    </p>
                  </div>
                  <div
                    className="w-2 h-8 rounded-full shrink-0 overflow-hidden bg-muted/30 flex flex-col justify-end"
                    style={{ backgroundColor: `${f.stroke}15` }}
                  >
                    <div
                      className="w-full rounded-full transition-all duration-700"
                      style={{
                        backgroundColor: f.stroke,
                        height: `${Math.min(100, (f.value / 25) * 100)}%`,
                        minHeight: f.value > 0 ? '2px' : 0,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
            {data.surveillance_exposure?.top_leak_vectors && data.surveillance_exposure.top_leak_vectors.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {data.surveillance_exposure.top_leak_vectors.slice(0, 4).map((vector, i) => (
                  <Badge key={i} variant="outline" className="bg-red-500/5 text-red-400 border-red-500/20 text-[10px]">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    {vector}
                  </Badge>
                ))}
              </div>
            )}
            <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-2 border-t border-border/30">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                {formatDate(data.most_recent_transaction)}
              </span>
              <span className="flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5" />
                {data.total_transactions} txns
              </span>
              <span className="uppercase font-medium text-foreground/70">{data.chain}</span>
              <Badge variant="outline" className="text-[10px] border-primary/30 text-primary">
                {data.confidence} Confidence
              </Badge>
            </div>
          </div>
        </div>

        {/* Bottom stats */}
        <div className="mt-8 pt-6 border-t border-border/30">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-3 rounded-lg bg-muted/20 border border-border/30 text-center">
              <p className="text-xl font-semibold text-primary tabular-nums">{data.total_transactions}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide mt-1">Transactions analyzed</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/20 border border-border/30 text-center">
              <p className="text-xl font-semibold text-primary tabular-nums">{data.ego_network?.total_links ?? 0}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide mt-1">Linked Wallets</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/20 border border-border/30 text-center">
              <p className="text-xl font-semibold tabular-nums" style={{ color: (data.opsec_failures?.critical_leaks?.length ?? 0) > 0 ? '#ef4444' : 'inherit' }}>
                {data.opsec_failures?.critical_leaks?.length ?? 0}
              </p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide mt-1">Critical Leaks</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/20 border border-border/30 text-center">
              <p className="text-xl font-semibold tabular-nums">{data.surveillance_exposure?.signals?.repeated_counterparties ?? 0}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide mt-1">Counterparties</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
})
