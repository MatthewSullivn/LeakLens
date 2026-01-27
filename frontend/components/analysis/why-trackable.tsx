'use client'

import { memo, useMemo } from 'react'
import { Fingerprint, Clock, Users, Activity, Zap, Moon, Globe, Bot, User, Link2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { AnalysisResult, GeographicOrigin, RepeatedCounterparty } from './types'

interface WhyTrackableProps {
  data: AnalysisResult
}

// ============================================================================
// VISUALIZATION: 24-Hour Activity Chart with Sleep Window
// ============================================================================

interface ActivityChartProps {
  hourlyData: number[]
  sleepStart: number
  sleepEnd: number
  sleepConfidence: number
  peakHour: number
}

const ActivityChart = memo(function ActivityChart({ 
  hourlyData, 
  sleepStart, 
  sleepEnd, 
  sleepConfidence,
  peakHour
}: ActivityChartProps) {
  // Normalize data for display (0-100 scale)
  const maxActivity = Math.max(...hourlyData, 1)
  const normalizedData = hourlyData.map(v => (v / maxActivity) * 100)
  
  // Determine if an hour is in the sleep window
  const isInSleepWindow = (hour: number): boolean => {
    if (sleepStart <= sleepEnd) {
      return hour >= sleepStart && hour < sleepEnd
    }
    // Handle wrap-around (e.g., 22:00 - 06:00)
    return hour >= sleepStart || hour < sleepEnd
  }

  return (
    <div className="mt-4 mb-2">
      {/* Chart Container */}
      <div className="relative h-20 bg-muted/10 rounded-lg border border-border/30 p-2 overflow-hidden">
        {/* Sleep window overlay */}
        {sleepConfidence > 20 && (
          <div 
            className="absolute top-0 bottom-0 bg-indigo-500/10 border-x border-indigo-500/20"
            style={{
              left: `${(sleepStart / 24) * 100}%`,
              width: sleepStart <= sleepEnd 
                ? `${((sleepEnd - sleepStart) / 24) * 100}%`
                : `${((24 - sleepStart + sleepEnd) / 24) * 100}%`
            }}
          />
        )}
        
        {/* Bars */}
        <div className="relative h-full flex items-end gap-[2px]">
          {normalizedData.map((height, hour) => {
            const isSleep = isInSleepWindow(hour)
            const isPeak = hour === peakHour
            
            return (
              <div
                key={hour}
                className="flex-1 relative group"
                style={{ height: '100%' }}
              >
                <div
                  className={cn(
                    "absolute bottom-0 w-full rounded-t-sm transition-all duration-200",
                    isPeak 
                      ? "bg-primary shadow-[0_0_8px_rgba(34,211,238,0.4)]" 
                      : isSleep 
                        ? "bg-indigo-400/40" 
                        : "bg-primary/60",
                    "group-hover:bg-primary"
                  )}
                  style={{ height: `${Math.max(height, 3)}%` }}
                />
                {/* Tooltip on hover */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-1.5 py-0.5 bg-card border border-border rounded text-[9px] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                  {hour}:00 UTC
                </div>
              </div>
            )
          })}
        </div>
      </div>
      
      {/* X-axis labels */}
      <div className="flex justify-between mt-1 px-1">
        <span className="text-[9px] text-muted-foreground">0:00</span>
        <span className="text-[9px] text-muted-foreground">6:00</span>
        <span className="text-[9px] text-muted-foreground">12:00</span>
        <span className="text-[9px] text-muted-foreground">18:00</span>
        <span className="text-[9px] text-muted-foreground">24:00</span>
      </div>
      
      {/* Legend */}
      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-3">
          {sleepConfidence > 20 && (
            <div className="flex items-center gap-1.5">
              <Moon className="w-3 h-3 text-indigo-400" />
              <span className="text-[10px] text-muted-foreground">
                Sleep {sleepStart}:00–{sleepEnd}:00
              </span>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-sm bg-primary" />
            <span className="text-[10px] text-muted-foreground">
              Peak: {peakHour}:00 UTC
            </span>
          </div>
        </div>
        {sleepConfidence > 0 && (
          <Badge variant="outline" className="text-[9px] py-0 bg-muted/30">
            {Math.round(sleepConfidence)}% pattern confidence
          </Badge>
        )}
      </div>
    </div>
  )
})

// ============================================================================
// VISUALIZATION: Geographic Region Chart
// ============================================================================

interface GeographicChartProps {
  data: GeographicOrigin
}

const GeographicChart = memo(function GeographicChart({ data }: GeographicChartProps) {
  // Sort regions by confidence and get as array
  const regions = useMemo(() => {
    const regionLabels: Record<string, { name: string; color: string }> = {
      europe: { name: 'Europe', color: 'bg-cyan-500' },
      americas: { name: 'Americas', color: 'bg-blue-500' },
      asia_pacific: { name: 'Asia-Pacific', color: 'bg-purple-500' },
      other: { name: 'Other', color: 'bg-muted-foreground/50' }
    }
    
    return Object.entries(data || {})
      .map(([key, value]) => ({
        key,
        value: value as number,
        ...regionLabels[key] || { name: key, color: 'bg-muted-foreground/50' }
      }))
      .sort((a, b) => b.value - a.value)
  }, [data])

  const total = regions.reduce((sum, r) => sum + r.value, 0) || 1
  const topRegion = regions[0]

  if (!data || total === 0) {
    return (
      <div className="mt-4 p-3 rounded-lg bg-muted/20 border border-border/30">
        <p className="text-[11px] text-muted-foreground text-center">
          Insufficient data for geographic inference
        </p>
      </div>
    )
  }

  return (
    <div className="mt-4 mb-2">
      {/* Segmented bar */}
      <div className="relative h-6 bg-muted/20 rounded-full overflow-hidden border border-border/30">
        <div className="absolute inset-0 flex">
          {regions.map((region, i) => {
            const percentage = (region.value / total) * 100
            if (percentage < 2) return null
            return (
              <div
                key={region.key}
                className={cn(
                  region.color,
                  "h-full transition-all duration-500",
                  i === 0 && "rounded-l-full",
                  i === regions.length - 1 && "rounded-r-full"
                )}
                style={{ 
                  width: `${percentage}%`,
                  opacity: i === 0 ? 1 : 0.6
                }}
              />
            )
          })}
        </div>
      </div>
      
      {/* Legend */}
      <div className="flex flex-wrap gap-3 mt-3">
        {regions.map((region) => {
          const percentage = Math.round((region.value / total) * 100)
          if (percentage < 5) return null
          return (
            <div key={region.key} className="flex items-center gap-1.5">
              <div className={cn("w-2 h-2 rounded-sm", region.color)} />
              <span className="text-[10px] text-muted-foreground">
                {region.name}
              </span>
              <span className="text-[10px] font-medium text-foreground">
                {percentage}%
              </span>
            </div>
          )
        })}
      </div>

      {/* Probabilistic note */}
      <div className="mt-2 flex items-center gap-1.5">
        <Globe className="w-3 h-3 text-muted-foreground/60" />
        <span className="text-[9px] text-muted-foreground/80 italic">
          Inferred from activity timing patterns — probabilistic, not deterministic
        </span>
      </div>
    </div>
  )
})

// ============================================================================
// VISUALIZATION: Bot Confidence Scale
// ============================================================================

interface BotConfidenceScaleProps {
  botConfidence: number
  humanPct: number
  fastestReaction: number
}

const BotConfidenceScale = memo(function BotConfidenceScale({ 
  botConfidence, 
  humanPct,
  fastestReaction 
}: BotConfidenceScaleProps) {
  // Clamp confidence to 0-100
  const confidence = Math.min(100, Math.max(0, botConfidence))
  
  // Determine label based on confidence
  const getLabel = () => {
    if (confidence > 80) return { text: 'Likely Automated', color: 'text-red-400' }
    if (confidence > 60) return { text: 'Possibly Automated', color: 'text-orange-400' }
    if (confidence > 40) return { text: 'Mixed Signals', color: 'text-yellow-400' }
    if (confidence > 20) return { text: 'Mostly Human', color: 'text-cyan-400' }
    return { text: 'Human-like', color: 'text-green-400' }
  }
  const label = getLabel()

  return (
    <div className="mt-4 mb-2">
      {/* Scale container */}
      <div className="relative">
        {/* Background track */}
        <div className="h-3 rounded-full bg-gradient-to-r from-green-500/20 via-yellow-500/20 to-red-500/20 border border-border/30" />
        
        {/* Filled portion */}
        <div 
          className="absolute top-0 left-0 h-3 rounded-full transition-all duration-500"
          style={{ 
            width: `${confidence}%`,
            background: confidence > 60 
              ? 'linear-gradient(90deg, oklch(0.7 0.15 145), oklch(0.65 0.2 30))'
              : 'linear-gradient(90deg, oklch(0.7 0.15 145), oklch(0.75 0.15 195))'
          }}
        />
        
        {/* Indicator */}
        <div 
          className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-background border-2 border-primary shadow-lg transition-all duration-500"
          style={{ left: `calc(${confidence}% - 8px)` }}
        />
      </div>
      
      {/* Labels */}
      <div className="flex justify-between mt-1.5 px-1">
        <div className="flex items-center gap-1">
          <User className="w-3 h-3 text-green-400" />
          <span className="text-[9px] text-muted-foreground">Human</span>
        </div>
        <span className={cn("text-[10px] font-medium", label.color)}>
          {label.text}
        </span>
        <div className="flex items-center gap-1">
          <Bot className="w-3 h-3 text-red-400" />
          <span className="text-[9px] text-muted-foreground">Bot</span>
        </div>
      </div>
      
      {/* Stats row */}
      <div className="flex items-center justify-center gap-4 mt-2">
        <div className="text-center">
          <span className="text-sm font-semibold text-primary tabular-nums">
            {Math.round(confidence)}%
          </span>
          <p className="text-[9px] text-muted-foreground">bot score</p>
        </div>
        <div className="w-px h-6 bg-border/50" />
        <div className="text-center">
          <span className="text-sm font-semibold text-foreground tabular-nums">
            {humanPct}%
          </span>
          <p className="text-[9px] text-muted-foreground">human-speed txns</p>
        </div>
        <div className="w-px h-6 bg-border/50" />
        <div className="text-center">
          <span className="text-sm font-semibold text-foreground tabular-nums">
            {fastestReaction < 1000 ? `${fastestReaction}ms` : `${(fastestReaction / 1000).toFixed(1)}s`}
          </span>
          <p className="text-[9px] text-muted-foreground">fastest reaction</p>
        </div>
      </div>
    </div>
  )
})

// ============================================================================
// FLAT (NON-COLLAPSIBLE) INSIGHT CARDS — reduce scroll + friction
// ============================================================================

type ImpactLevel = 'low' | 'medium' | 'high'

const impactColors: Record<ImpactLevel, { badge: string; accent: string }> = {
  low: { badge: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20', accent: 'border-cyan-500/30' },
  medium: { badge: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20', accent: 'border-yellow-500/30' },
  high: { badge: 'bg-red-500/10 text-red-400 border-red-500/20', accent: 'border-red-500/30' },
}

interface InsightCardProps {
  icon: React.ReactNode
  title: string
  impactLevel: ImpactLevel
  explanation: string
  evidence: { label: string; value: string }[]
  impact: string
  visualization?: React.ReactNode
}

const InsightCard = memo(function InsightCard({
  icon,
  title,
  impactLevel,
  explanation,
  evidence,
  impact,
  visualization,
}: InsightCardProps) {
  return (
    <div className="rounded-xl border border-border/40 bg-muted/10 overflow-hidden">
      <div className="p-4 flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className="p-2 rounded-lg bg-primary/10 border border-primary/20 shrink-0">
            {icon}
          </div>
          <div className="min-w-0">
            <h4 className="font-medium text-sm leading-tight">{title}</h4>
            <Badge variant="outline" className={cn("mt-2 text-[10px] py-0", impactColors[impactLevel].badge)}>
              {impactLevel} impact
            </Badge>
          </div>
        </div>
      </div>

      <div className="px-4 pb-4 space-y-3">
        {visualization && <div className="pt-1">{visualization}</div>}

        <p className="text-sm text-muted-foreground leading-relaxed">
          {explanation}
        </p>

        <div className="flex flex-wrap gap-2">
          {evidence.map((item, i) => (
            <div key={i} className="px-2.5 py-1 rounded bg-muted/40 border border-border/40">
              <span className="text-[10px] text-muted-foreground uppercase tracking-wide">{item.label}</span>
              <span className="text-xs font-medium ml-1.5 text-primary tabular-nums">{item.value}</span>
            </div>
          ))}
        </div>

        <div className={cn("p-3 rounded-lg border-l-2 bg-muted/20", impactColors[impactLevel].accent)}>
          <p className="text-xs text-muted-foreground leading-relaxed">
            <span className="font-medium text-foreground">Why this matters: </span>
            {impact}
          </p>
        </div>
      </div>
    </div>
  )
})

// ============================================================================
// CREATIVE (BUT ACCURATE) VIS: Counterparty Linkability Mini-Graph
// ============================================================================

interface CounterpartyLinksVizProps {
  repeatedCounterparties: number
  strongestLinks: number
  fundingSources: number
  withdrawalTargets: number
  topCounterparties: RepeatedCounterparty[]
}

const CounterpartyLinksViz = memo(function CounterpartyLinksViz({
  repeatedCounterparties,
  strongestLinks,
  fundingSources,
  withdrawalTargets,
  topCounterparties,
}: CounterpartyLinksVizProps) {
  const rows = (topCounterparties || []).slice(0, 4)
  const maxInteractions = Math.max(...rows.map(r => r.interactions), 1)

  return (
    <div className="rounded-lg bg-card/30 border border-border/40 p-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-primary/10 border border-primary/20">
            <Link2 className="w-3.5 h-3.5 text-primary" />
          </div>
          <p className="text-[11px] text-muted-foreground">
            Links strengthen when you repeat the same paths
          </p>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
          <span className="px-2 py-0.5 rounded bg-muted/30 border border-border/40">
            repeated: <span className="text-foreground tabular-nums">{repeatedCounterparties}</span>
          </span>
          <span className="px-2 py-0.5 rounded bg-muted/30 border border-border/40">
            strong: <span className="text-foreground tabular-nums">{strongestLinks}</span>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mt-3">
        <div className="rounded-md bg-muted/20 border border-border/30 p-2">
          <p className="text-[9px] text-muted-foreground uppercase tracking-wide">Funding paths</p>
          <p className="text-sm font-semibold text-foreground tabular-nums">{fundingSources}</p>
        </div>
        <div className="rounded-md bg-muted/20 border border-border/30 p-2">
          <p className="text-[9px] text-muted-foreground uppercase tracking-wide">Cashout paths</p>
          <p className="text-sm font-semibold text-foreground tabular-nums">{withdrawalTargets}</p>
        </div>
      </div>

      {rows.length > 0 ? (
        <div className="mt-3 space-y-2">
          {rows.map((r) => (
            <div key={r.address} className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary/80 shadow-[0_0_10px_rgba(34,211,238,0.25)]" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[10px] text-muted-foreground truncate">
                    {r.label || r.address}
                  </p>
                  <p className="text-[10px] text-muted-foreground tabular-nums">
                    {Math.round((r.confidence || 0) * 100)}%
                  </p>
                </div>
                <div className="h-1.5 bg-muted/30 rounded-full overflow-hidden border border-border/30">
                  <div
                    className="h-full bg-primary/70"
                    style={{ width: `${Math.min(100, (r.interactions / maxInteractions) * 100)}%` }}
                  />
                </div>
              </div>
              <div className="text-[10px] text-foreground tabular-nums w-10 text-right">
                {r.interactions}×
              </div>
            </div>
          ))}
          <p className="text-[9px] text-muted-foreground/80 italic">
            Bars show relative interaction frequency; confidence is probabilistic.
          </p>
        </div>
      ) : (
        <p className="mt-3 text-[10px] text-muted-foreground">
          No repeated counterparties were confidently identified in the analyzed window.
        </p>
      )}
    </div>
  )
})

export const WhyTrackable = memo(function WhyTrackable({ data }: WhyTrackableProps) {
  // Extract relevant data
  const reactionSpeed = data.reaction_speed
  const geographic = data.geographic_origin
  const sleepWindow = data.sleep_window
  const activityPattern = data.activity_pattern
  const surveillanceSignals = data.surveillance_exposure?.signals
  const egoNetwork = data.ego_network

  // Determine trader type for explanation
  const isLikelyBot = (reactionSpeed?.bot_confidence || 0) > 60
  const fastestReaction = reactionSpeed?.fastest_reaction || 0
  const humanReactions = reactionSpeed?.human_reactions || 0
  const totalReactions = reactionSpeed?.total_pairs || 1
  const humanPct = Math.round((humanReactions / totalReactions) * 100)

  // Geographic inference
  const topRegion = Object.entries(geographic || {})
    .sort(([,a], [,b]) => (b as number) - (a as number))[0]
  const regionName = {
    europe: 'Europe',
    americas: 'Americas', 
    asia_pacific: 'Asia-Pacific',
    other: 'Unknown'
  }[topRegion?.[0] || 'other'] || 'Unknown'
  const regionConfidence = (topRegion?.[1] as number) || 0

  // Sleep window
  const sleepStart = sleepWindow?.start_hour ?? 0
  const sleepEnd = sleepWindow?.end_hour ?? 8
  const sleepConfidence = sleepWindow?.confidence || 0

  // Counterparty data
  const repeatedCounterparties = surveillanceSignals?.repeated_counterparties || 0
  const strongestLinks = egoNetwork?.summary?.strongest_links?.length || 0
  const fundingSources = data.opsec_failures?.funding_sources?.length || 0
  const withdrawalTargets = data.opsec_failures?.withdrawal_targets?.length || 0
  const topRepeated = egoNetwork?.summary?.repeated_counterparties || []

  // Peak activity calculation
  const hourlyPattern = activityPattern?.hourly || []
  const peakHour = hourlyPattern.length > 0 ? hourlyPattern.indexOf(Math.max(...hourlyPattern)) : 0

  return (
    <Card className="border-border/40">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/10">
            <Fingerprint className="w-4 h-4 text-primary" />
          </div>
          <CardTitle className="text-base">Why this wallet can be tracked</CardTitle>
        </div>
        <CardDescription className="text-xs">
          Understanding how blockchain surveillance systems identify and classify wallets
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Flat card grid: 2-up on desktop to reduce scroll */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InsightCard
            icon={<Activity className="w-4 h-4 text-primary" />}
            title="Behavior creates a fingerprint"
            explanation={
              isLikelyBot
                ? "This wallet shows automated execution patterns. Reaction times and consistency suggest algorithmic trading or bot usage, which creates a distinct behavioral signature."
                : "Reaction speed, execution consistency, and repetitive patterns distinguish human traders from bots. Your trading rhythm is identifiable."
            }
            evidence={[
              {
                label: 'Fastest',
                value: fastestReaction < 1000 ? `${fastestReaction}ms` : `${(fastestReaction / 1000).toFixed(1)}s`,
              },
              { label: 'Human-speed', value: `${humanPct}%` },
              { label: 'Bot Score', value: `${Math.round(reactionSpeed?.bot_confidence || 0)}%` },
            ]}
            impact="Surveillance firms use reaction speed analysis to classify wallets as human, bot, or institutional. Consistent patterns make wallets easier to track across chains."
            impactLevel={isLikelyBot || humanPct < 30 ? 'high' : humanPct < 60 ? 'medium' : 'low'}
            visualization={
              <BotConfidenceScale
                botConfidence={reactionSpeed?.bot_confidence || 0}
                humanPct={humanPct}
                fastestReaction={fastestReaction}
              />
            }
          />

          <InsightCard
            icon={<Clock className="w-4 h-4 text-primary" />}
            title="Timing reveals routines"
            explanation="Transaction timestamps reveal your timezone, sleep schedule, and daily activity patterns. This temporal fingerprint narrows geographic location."
            evidence={[
              { label: 'Region', value: `${regionName} (${Math.round(regionConfidence)}%)` },
              { label: 'Sleep', value: `${sleepStart}:00-${sleepEnd}:00` },
              { label: 'Peak', value: `${peakHour}:00 UTC` },
            ]}
            impact="Regular timing patterns allow surveillance systems to infer your approximate location and identify you across multiple wallets by matching activity windows."
            impactLevel={sleepConfidence > 70 ? 'high' : sleepConfidence > 40 ? 'medium' : 'low'}
            visualization={
              <>
                <ActivityChart
                  hourlyData={hourlyPattern.length === 24 ? hourlyPattern : Array(24).fill(0)}
                  sleepStart={sleepStart}
                  sleepEnd={sleepEnd}
                  sleepConfidence={sleepConfidence}
                  peakHour={peakHour}
                />
                <GeographicChart data={geographic} />
              </>
            }
          />

          <InsightCard
            icon={<Users className="w-4 h-4 text-primary" />}
            title="Repeated counterparties create links"
            explanation="Every time you interact with the same wallet—for funding, trading, or withdrawals—you strengthen the link between those addresses. Surveillance systems cluster wallets based on these patterns."
            evidence={[
              { label: 'Repeated', value: repeatedCounterparties.toString() },
              { label: 'Strong Links', value: strongestLinks.toString() },
              { label: 'Funding', value: fundingSources.toString() },
              { label: 'Cashouts', value: withdrawalTargets.toString() },
            ]}
            impact="Repeated interactions are the primary method surveillance firms use to infer wallet ownership. Even one shared funding source can permanently link wallets."
            impactLevel={repeatedCounterparties > 5 || strongestLinks > 3 ? 'high' : repeatedCounterparties > 2 ? 'medium' : 'low'}
            visualization={
              <CounterpartyLinksViz
                repeatedCounterparties={repeatedCounterparties}
                strongestLinks={strongestLinks}
                fundingSources={fundingSources}
                withdrawalTargets={withdrawalTargets}
                topCounterparties={topRepeated}
              />
            }
          />

          {(surveillanceSignals?.mev_execution_detected || (surveillanceSignals?.swap_count || 0) > 20) ? (
            <InsightCard
              icon={<Zap className="w-4 h-4 text-primary" />}
              title="Transaction patterns reveal sophistication"
              explanation="The complexity of your transactions—MEV awareness, swap frequency, and execution style—creates a profile of your trading sophistication and likely wallet type."
              evidence={[
                { label: 'MEV', value: surveillanceSignals?.mev_execution_detected ? 'Yes' : 'No' },
                { label: 'Swaps', value: (surveillanceSignals?.swap_count || 0).toString() },
                { label: 'Concentration', value: `${surveillanceSignals?.portfolio_concentration || 0}%` },
              ]}
              impact="Sophisticated trading patterns classify you as a professional or institutional trader, which triggers enhanced monitoring by surveillance platforms."
              impactLevel={surveillanceSignals?.mev_execution_detected ? 'high' : 'medium'}
            />
          ) : (
            <div className="rounded-xl border border-border/40 bg-muted/5 p-4 flex items-center justify-center text-center">
              <p className="text-xs text-muted-foreground">
                Not enough swap/MEV activity in the analyzed window to confidently label transaction sophistication.
              </p>
            </div>
          )}
        </div>

        {/* Educational Footer */}
        <div className="p-4 rounded-lg bg-card border border-border/50">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <span className="text-primary font-medium">How surveillance works: </span>
            Blockchain analysis firms combine these signals to build probabilistic identity clusters.
            No single factor reveals identity—but patterns compound over time.
          </p>
        </div>
      </CardContent>
    </Card>
  )
})
