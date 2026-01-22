'use client'

import { memo, useMemo } from 'react'
import { Globe, HelpCircle, Info } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tooltip } from './shared'
import type { GeographicOrigin } from './types'

interface GeographicSectionProps {
  data: GeographicOrigin
}

export const GeographicSection = memo(function GeographicSection({ data }: GeographicSectionProps) {
  const regions = useMemo(() => [
    { key: 'asia_pacific', label: 'Asia Pacific', value: data.asia_pacific },
    { key: 'europe', label: 'Europe', value: data.europe },
    { key: 'americas', label: 'Americas', value: data.americas },
    { key: 'other', label: 'Other', value: data.other },
  ].sort((a, b) => b.value - a.value), [data])

  return (
    <Card className="border-border/40">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-primary" />
          <CardTitle>Geographic Probability</CardTitle>
          <Tooltip content="Estimated from transaction timing patterns and network metadata analysis.">
            <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
          </Tooltip>
        </div>
        <CardDescription>Where is this wallet likely located?</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {regions.map(region => (
          <div key={region.key}>
            <div className="flex justify-between text-sm mb-1">
              <span>{region.label}</span>
              <span className="font-medium">{region.value}%</span>
            </div>
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-linear-to-r from-primary to-primary/60 rounded-full transition-all"
                style={{ width: `${region.value}%` }}
              />
            </div>
          </div>
        ))}
        <p className="text-xs text-muted-foreground pt-2 border-t border-border/40">
          <Info className="w-3 h-3 inline mr-1" />
          Probabilities based on activity timing correlation with regional business hours.
        </p>
      </CardContent>
    </Card>
  )
})
