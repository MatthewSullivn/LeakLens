'use client'

import { memo } from 'react'
import { cn } from '@/lib/utils'

interface AnalysisSectionProps {
  number: number
  title: string
  /** Brief educational blurb (2–4 sentences) explaining the theme of this section */
  education: React.ReactNode
  children: React.ReactNode
  className?: string
}

export const AnalysisSection = memo(function AnalysisSection({
  number,
  title,
  education,
  children,
  className,
}: AnalysisSectionProps) {
  return (
    <section className={cn('space-y-4', className)} aria-labelledby={`section-${number}-title`}>
      <div className="space-y-2">
        <h2
          id={`section-${number}-title`}
          className="text-lg font-semibold text-foreground flex items-center gap-2"
        >
          <span className="flex items-center justify-center w-7 h-7 rounded-md bg-primary/15 text-primary text-sm font-bold tabular-nums">
            {number}
          </span>
          {title}
        </h2>
        <div className="pl-9 text-sm text-muted-foreground leading-relaxed max-w-3xl">
          {education}
        </div>
      </div>
      <div className="space-y-6 pl-0">
        {children}
      </div>
    </section>
  )
})
