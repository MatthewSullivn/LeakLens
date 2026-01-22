'use client'

import { memo, useMemo } from 'react'
import { Clock, HelpCircle, Timer } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { Tooltip } from './shared'
import { DAYS_OF_WEEK } from './utils'
import type { ActivityPattern, SleepWindow } from './types'

interface TemporalFingerprintSectionProps {
  activityPattern: ActivityPattern
  sleepWindow: SleepWindow
}

export const TemporalFingerprintSection = memo(function TemporalFingerprintSection({ 
  activityPattern, 
  sleepWindow 
}: TemporalFingerprintSectionProps) {
  const maxHourly = useMemo(() => Math.max(...activityPattern.hourly, 1), [activityPattern.hourly])
  const maxDaily = useMemo(() => Math.max(...activityPattern.daily, 1), [activityPattern.daily])

  return (
    <Card className="border-border/40">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary" />
          <CardTitle>Temporal Fingerprint</CardTitle>
          <Tooltip content="Consistent activity windows can be used to infer timezone and lifestyle patterns, potentially revealing geographic location.">
            <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
          </Tooltip>
        </div>
        <CardDescription>When does this wallet transact?</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Hourly Activity Heatmap */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium">Hourly Activity (UTC)</h4>
            <span className="text-xs text-muted-foreground">0-23h</span>
          </div>
          <div className="flex gap-0.5">
            {activityPattern.hourly.map((count, hour) => {
              const intensity = count / maxHourly
              const isSleep = hour >= sleepWindow.start_hour || hour < sleepWindow.end_hour
              return (
                <Tooltip key={hour} content={`${hour}:00 UTC - ${count} transactions`}>
                  <div 
                    className={cn("flex-1 h-8 rounded-sm cursor-help transition-colors",
                      isSleep && "ring-1 ring-violet-500/50"
                    )}
                    style={{
                      backgroundColor: intensity > 0 
                        ? `oklch(0.75 0.15 175 / ${Math.max(0.2, intensity)})`
                        : 'oklch(0.2 0 0)'
                    }}
                  />
                </Tooltip>
              )
            })}
          </div>
          <div className="flex justify-between mt-1 text-[10px] text-muted-foreground">
            <span>00:00</span><span>06:00</span><span>12:00</span><span>18:00</span><span>23:00</span>
          </div>
        </div>

        {/* Daily Activity */}
        <div>
          <h4 className="text-sm font-medium mb-2">Daily Activity</h4>
          <div className="flex gap-2">
            {activityPattern.daily.map((count, i) => (
              <div key={i} className="flex-1 text-center">
                <div className="h-16 bg-muted/30 rounded-lg relative overflow-hidden">
                  <div 
                    className="absolute bottom-0 left-0 right-0 bg-primary/60 transition-all"
                    style={{ height: `${(count / maxDaily) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">{DAYS_OF_WEEK[i]}</p>
                <p className="text-xs font-medium">{count}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Sleep Window */}
        <div className="p-4 bg-violet-500/10 rounded-lg border border-violet-500/30">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium flex items-center gap-2">
                <Timer className="w-4 h-4 text-violet-400" />
                Detected Sleep Window
              </h4>
              <p className="text-xs text-muted-foreground mt-1">Inactive period suggests probable timezone</p>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold">{sleepWindow.start_hour}:00 - {sleepWindow.end_hour}:00 UTC</p>
              <p className="text-xs text-violet-400">{sleepWindow.confidence}% confidence</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
})
