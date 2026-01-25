'use client'

import { useEffect, useState, use, useCallback, lazy, Suspense } from 'react'
import {
  // Types
  type AnalysisResult,
  // Navigation Components
  TopNavBar,
  LoadingState,
  ErrorState,
  // Section Components (eagerly loaded - above fold)
  ExposureSummary,
  WhyTrackable,
  // Shared
  AnimatedSection,
  SectionSkeleton,
} from '@/components/analysis'

// Lazy load below-fold components for performance
const WalletLinkage = lazy(() => import('@/components/analysis/wallet-linkage').then(m => ({ default: m.WalletLinkage })))
const OpsecFailuresSection = lazy(() => import('@/components/analysis/opsec-failures').then(m => ({ default: m.OpsecFailuresSection })))
const ExposureBreakdown = lazy(() => import('@/components/analysis/exposure-breakdown').then(m => ({ default: m.ExposureBreakdown })))
const FinancialContext = lazy(() => import('@/components/analysis/financial-context').then(m => ({ default: m.FinancialContext })))
const ImplicationsSection = lazy(() => import('@/components/analysis/implications').then(m => ({ default: m.ImplicationsSection })))
const MitigationCTA = lazy(() => import('@/components/analysis/implications').then(m => ({ default: m.MitigationCTA })))

export default function AnalysisPage({ params }: { params: Promise<{ wallet: string }> }) {
  const resolvedParams = use(params)
  const wallet = resolvedParams.wallet
  const [data, setData] = useState<AnalysisResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const abortController = new AbortController()
    let aborted = false

    const fetchAnalysis = async () => {
      try {
        setLoading(true)
        setError('')
        const response = await fetch('/api/analyze-wallet', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ wallet, limit: 100 }),
          signal: abortController.signal,
        })

        if (aborted) return
        if (!response.ok) throw new Error(`Analysis failed: ${response.statusText}`)
        const result = await response.json()
        if (aborted) return
        setData(result)
      } catch (err: any) {
        if (err.name === 'AbortError') {
          aborted = true
          return
        }
        if (aborted) return
        if (process.env.NODE_ENV === 'development') {
          console.error('Analysis error:', err)
        }
        setError(err.message || 'Failed to analyze wallet')
      } finally {
        if (!aborted) setLoading(false)
      }
    }
    fetchAnalysis()

    return () => {
      aborted = true
      abortController.abort()
    }
  }, [wallet])

  const copyAddress = useCallback(() => {
    navigator.clipboard.writeText(wallet)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [wallet])

  if (loading) return <LoadingState wallet={wallet} />
  if (error && !data) return <ErrorState error={error} wallet={wallet} />
  if (!data) return <ErrorState error="No data received" wallet={wallet} />

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <TopNavBar 
        wallet={wallet} 
        copied={copied} 
        onCopy={copyAddress} 
        confidence={data.confidence}
        riskLevel={data.surveillance_exposure?.risk_level || 'MEDIUM'}
      />

      <main className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">

        {/* 1. Exposure Summary (TL;DR) - Always Expanded */}
        <AnimatedSection>
          <ExposureSummary data={data} />
        </AnimatedSection>

        {/* 2. Why This Wallet Can Be Tracked - Collapsible (first expanded) */}
        <AnimatedSection delay={100}>
          <WhyTrackable data={data} />
        </AnimatedSection>

        {/* 3. Wallet Linkage Visualization - Graph visible, details collapsed */}
        <AnimatedSection delay={150}>
          <Suspense fallback={<SectionSkeleton />}>
            <WalletLinkage data={data.ego_network} />
          </Suspense>
        </AnimatedSection>

        {/* 4. Operational Security Failures - Accordion */}
        <AnimatedSection delay={200}>
          <Suspense fallback={<SectionSkeleton />}>
            <OpsecFailuresSection data={data.opsec_failures} />
          </Suspense>
        </AnimatedSection>

        {/* 5. Exposure Score Breakdown - Collapsed by default */}
        <AnimatedSection delay={250}>
          <Suspense fallback={<SectionSkeleton />}>
            <ExposureBreakdown data={data} />
          </Suspense>
        </AnimatedSection>

        {/* 6. Financial Activity Context - Collapsed, secondary */}
        <AnimatedSection delay={300}>
          <Suspense fallback={<SectionSkeleton />}>
            <FinancialContext 
              tradingPnl={data.token_trading_pnl} 
              netWorth={data.net_worth} 
            />
          </Suspense>
        </AnimatedSection>

        {/* 7. What This Means For You - Always Expanded */}
        <AnimatedSection delay={350}>
          <Suspense fallback={<SectionSkeleton />}>
            <ImplicationsSection />
          </Suspense>
        </AnimatedSection>

        {/* 8. Final CTA Section - Minimal, centered */}
        <AnimatedSection delay={400}>
          <Suspense fallback={<SectionSkeleton />}>
            <MitigationCTA />
          </Suspense>
        </AnimatedSection>

        {/* Footer Trust Signal */}
        <div className="text-center py-6 border-t border-border/30">
          <p className="text-[10px] text-muted-foreground/60 leading-relaxed max-w-md mx-auto">
            This analysis uses heuristic inference based on publicly available on-chain data.
            Results are probabilistic estimates similar to those used by blockchain surveillance platforms.
          </p>
        </div>
      </main>
    </div>
  )
}
