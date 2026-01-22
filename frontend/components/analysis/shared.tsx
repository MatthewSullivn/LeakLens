'use client'

import { useState, memo, useRef, useEffect } from 'react'
import { ChevronDown, ExternalLink } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { cn, shortenAddress } from '@/lib/utils'

// ============================================================================
// SOLSCAN LINK COMPONENT - Clickable addresses
// ============================================================================

interface SolscanLinkProps {
  address: string
  type?: 'account' | 'tx'
  children?: React.ReactNode
  className?: string
  showIcon?: boolean
}

export const SolscanLink = memo(function SolscanLink({ 
  address, 
  type = 'account', 
  children, 
  className,
  showIcon = true 
}: SolscanLinkProps) {
  const baseUrl = type === 'tx' 
    ? 'https://solscan.io/tx/' 
    : 'https://solscan.io/account/'
  
  return (
    <a 
      href={`${baseUrl}${address}`}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "inline-flex items-center gap-1 font-mono text-xs hover:text-primary transition-colors group",
        className
      )}
      title="View on Solscan"
    >
      {children || shortenAddress(address, 4)}
      {showIcon && (
        <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground" />
      )}
    </a>
  )
})

// ============================================================================
// TOOLTIP COMPONENT
// ============================================================================

interface TooltipProps {
  children: React.ReactNode
  content: string
}

export const Tooltip = memo(function Tooltip({ children, content }: TooltipProps) {
  return (
    <div className="group relative inline-flex">
      {children}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-popover border border-border rounded-lg text-xs text-popover-foreground opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 w-64 z-50 shadow-lg pointer-events-none">
        {content}
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-border" />
      </div>
    </div>
  )
})

// ============================================================================
// ANIMATED SECTION WRAPPER - Scroll reveal
// ============================================================================

interface AnimatedSectionProps {
  children: React.ReactNode
  className?: string
  delay?: number
}

export const AnimatedSection = memo(function AnimatedSection({ 
  children, 
  className,
  delay = 0 
}: AnimatedSectionProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) {
      setIsVisible(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay)
          observer.disconnect()
        }
      },
      { threshold: 0.1, rootMargin: '50px' }
    )

    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [delay])

  return (
    <div
      ref={ref}
      className={cn(
        "transition-all duration-500 ease-out",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
        className
      )}
    >
      {children}
    </div>
  )
})

// ============================================================================
// SKELETON LOADER COMPONENT
// ============================================================================

interface SkeletonProps {
  className?: string
  variant?: 'text' | 'card' | 'circle' | 'bar'
}

export const Skeleton = memo(function Skeleton({ className, variant = 'text' }: SkeletonProps) {
  const baseClass = "animate-pulse bg-muted/50 rounded"
  
  const variants = {
    text: "h-4 w-full",
    card: "h-32 w-full rounded-lg",
    circle: "h-12 w-12 rounded-full",
    bar: "h-2 w-full rounded-full"
  }
  
  return <div className={cn(baseClass, variants[variant], className)} />
})

// ============================================================================
// SECTION SKELETON - Matches layout to prevent CLS
// ============================================================================

export const SectionSkeleton = memo(function SectionSkeleton() {
  return (
    <Card className="border-border/40">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Skeleton variant="circle" className="w-5 h-5" />
          <Skeleton className="h-5 w-48" />
        </div>
        <Skeleton className="h-4 w-64 mt-2" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Skeleton variant="bar" />
          <Skeleton variant="bar" className="w-3/4" />
          <Skeleton variant="bar" className="w-1/2" />
        </div>
      </CardContent>
    </Card>
  )
})

// ============================================================================
// COLLAPSIBLE SECTION COMPONENT
// ============================================================================

interface CollapsibleSectionProps {
  title: string
  description?: string
  defaultOpen?: boolean
  children: React.ReactNode
  badge?: React.ReactNode
  whyItMatters?: string
}

export const CollapsibleSection = memo(function CollapsibleSection({ 
  title, 
  description,
  defaultOpen = false, 
  children,
  badge,
  whyItMatters
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  
  return (
    <Card className="border-border/40">
      <CardHeader 
        className="cursor-pointer hover:bg-muted/30 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ChevronDown className={cn("w-5 h-5 text-muted-foreground transition-transform", isOpen && "rotate-180")} />
            <div>
              <CardTitle className="text-base">{title}</CardTitle>
              {description && <CardDescription className="mt-1">{description}</CardDescription>}
            </div>
          </div>
          {badge}
        </div>
        {whyItMatters && (
          <p className="text-xs text-muted-foreground mt-2 ml-8 italic">
            {whyItMatters}
          </p>
        )}
      </CardHeader>
      <div className={cn(
        "grid transition-all duration-300",
        isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
      )}>
        <div className="overflow-hidden">
          {isOpen && <CardContent className="pt-0">{children}</CardContent>}
        </div>
      </div>
    </Card>
  )
})

// ============================================================================
// SIGNAL ITEM COMPONENT
// ============================================================================

interface SignalItemProps {
  label: string
  value: string | number
  signal: number
  tooltip: string
}

export const SignalItem = memo(function SignalItem({ label, value, signal, tooltip }: SignalItemProps) {
  const intensity = typeof signal === 'number' ? Math.min(signal, 1) : 0
  return (
    <Tooltip content={tooltip}>
      <div className="p-3 rounded-lg bg-muted/30 cursor-help">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-muted-foreground">{label}</span>
          <div className={cn("w-2 h-2 rounded-full", 
            intensity > 0.7 ? "bg-red-500" : intensity > 0.3 ? "bg-yellow-500" : "bg-green-500"
          )} />
        </div>
        <p className="font-semibold">{value}</p>
      </div>
    </Tooltip>
  )
})

// ============================================================================
// RISK BAR COMPONENT
// ============================================================================

interface RiskBarProps {
  label: string
  value: number
  total: number
  color: string
}

export const RiskBar = memo(function RiskBar({ label, value, total, color }: RiskBarProps) {
  const pct = total > 0 ? (value / total) * 100 : 0
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-muted-foreground w-24">{label}</span>
      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
        <div className={cn("h-full rounded-full transition-all", color)} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-medium w-8 text-right">{value}</span>
    </div>
  )
})

// ============================================================================
// CLASSIFICATION BAR COMPONENT - No emojis, icons only
// ============================================================================

interface ClassificationBarProps {
  label: string
  value: number
  icon?: React.ReactNode
}

export const ClassificationBar = memo(function ClassificationBar({ label, value, icon }: ClassificationBarProps) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="flex items-center gap-1.5">
          {icon}
          {label}
        </span>
        <span className="font-medium">{value}%</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div className="h-full bg-primary/60" style={{ width: `${value}%` }} />
      </div>
    </div>
  )
})

// ============================================================================
// PROFILE BAR COMPONENT
// ============================================================================

interface ProfileBarProps {
  label: string
  value: number
  description: string
  color: string
}

export const ProfileBar = memo(function ProfileBar({ label, value, description, color }: ProfileBarProps) {
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <Tooltip content={description}>
          <span className="cursor-help">{label}</span>
        </Tooltip>
        <span className="font-medium">{value}%</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div className={cn("h-full rounded-full", color)} style={{ width: `${value}%` }} />
      </div>
    </div>
  )
})

// ============================================================================
// STAT CARD COMPONENT
// ============================================================================

interface StatCardProps {
  label: string
  value: string
  icon: React.ReactNode
}

export const StatCard = memo(function StatCard({ label, value, icon }: StatCardProps) {
  return (
    <div className="p-3 bg-muted/30 rounded-lg">
      <div className="flex items-center gap-2 text-muted-foreground mb-1">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <p className="font-semibold">{value}</p>
    </div>
  )
})

// ============================================================================
// WHY IT MATTERS BOX - Inline explanation
// ============================================================================

interface WhyItMattersProps {
  children: React.ReactNode
}

export const WhyItMatters = memo(function WhyItMatters({ children }: WhyItMattersProps) {
  return (
    <div className="mt-4 p-3 bg-muted/20 rounded-lg border-l-2 border-primary/50">
      <p className="text-xs text-muted-foreground">
        <span className="font-medium text-foreground">Why this matters: </span>
        {children}
      </p>
    </div>
  )
})

// ============================================================================
// TRUST SIGNAL BADGE
// ============================================================================

interface TrustSignalProps {
  text: string
}

export const TrustSignal = memo(function TrustSignal({ text }: TrustSignalProps) {
  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded text-[10px] bg-muted/30 text-muted-foreground">
      {text}
    </span>
  )
})
