'use client'

import { memo } from 'react'
import { Lightbulb } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

interface KeyInsightsSectionProps {
  insights: string[]
}

// Remove emojis from insights text
function cleanInsightText(text: string): string {
  // Remove common emojis and emoji-like patterns
  return text.replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|⚡|🔍|📊|💡|🎯|⚠️|✅|❌|🔒|🔓/gu, '').trim()
}

export const KeyInsightsSection = memo(function KeyInsightsSection({ insights }: KeyInsightsSectionProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
      {insights.map((insight, i) => (
        <Card key={i} className="border-border/40 bg-linear-to-br from-primary/5 to-transparent">
          <CardContent className="pt-4">
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                <Lightbulb className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
              </div>
              <p className="text-sm leading-relaxed">{cleanInsightText(insight)}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
})
