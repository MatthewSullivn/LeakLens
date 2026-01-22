'use client'

import { memo } from 'react'
import { Shield, HelpCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { Tooltip, RiskBar } from './shared'
import { getSeverityColor } from './utils'
import type { RiskAssessment } from './types'

interface RiskAssessmentSectionProps {
  data: RiskAssessment
}

export const RiskAssessmentSection = memo(function RiskAssessmentSection({ data }: RiskAssessmentSectionProps) {
  const total = data.low_risk + data.medium_risk + data.high_risk
  const colors = getSeverityColor(data.level.replace(' Risk', '').toUpperCase())

  return (
    <Card className="border-border/40">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            <CardTitle>Risk Assessment</CardTitle>
            <Tooltip content="This is a heuristic risk classification based on known deanonymization patterns and behavioral analysis.">
              <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
            </Tooltip>
          </div>
          <Badge className={cn(colors.bg, colors.text, colors.border)}>{data.level}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-8">
          <div className="text-center">
            <p className="text-4xl font-bold">{data.score}</p>
            <p className="text-xs text-muted-foreground">Risk Score</p>
          </div>
          <div className="flex-1">
            <p className="text-sm text-muted-foreground mb-3">Risk Distribution ({total} signals analyzed)</p>
            <div className="space-y-2">
              <RiskBar label="Low Risk" value={data.low_risk} total={total} color="bg-green-500" />
              <RiskBar label="Medium Risk" value={data.medium_risk} total={total} color="bg-yellow-500" />
              <RiskBar label="High Risk" value={data.high_risk} total={total} color="bg-red-500" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
})
