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
  WalletOverview,
  KeyInsightsSection,
  SurveillanceExposureSection,
  // Shared
  AnimatedSection,
  SectionSkeleton,
} from '@/components/analysis'

// Lazy load below-fold components for performance
const RiskAssessmentSection = lazy(() => import('@/components/analysis/risk-assessment').then(m => ({ default: m.RiskAssessmentSection })))
const TemporalFingerprintSection = lazy(() => import('@/components/analysis/temporal-fingerprint').then(m => ({ default: m.TemporalFingerprintSection })))
const GeographicSection = lazy(() => import('@/components/analysis/geographic').then(m => ({ default: m.GeographicSection })))
const BehavioralClassificationSection = lazy(() => import('@/components/analysis/behavioral-classification').then(m => ({ default: m.BehavioralClassificationSection })))
const MempoolForensicsSection = lazy(() => import('@/components/analysis/mempool-forensics').then(m => ({ default: m.MempoolForensicsSection })))
const OpsecFailuresSection = lazy(() => import('@/components/analysis/opsec-failures').then(m => ({ default: m.OpsecFailuresSection })))
const PortfolioSection = lazy(() => import('@/components/analysis/portfolio').then(m => ({ default: m.PortfolioSection })))
const TradingPnLSection = lazy(() => import('@/components/analysis/trading-pnl').then(m => ({ default: m.TradingPnLSection })))
const IncomeSourcesSection = lazy(() => import('@/components/analysis/income-sources').then(m => ({ default: m.IncomeSourcesSection })))
const EgoNetworkSection = lazy(() => import('@/components/analysis/ego-network').then(m => ({ default: m.EgoNetworkSection })))
const AdvancedDataSection = lazy(() => import('@/components/analysis/advanced-data').then(m => ({ default: m.AdvancedDataSection })))

export default function AnalysisPage({ params }: { params: Promise<{ wallet: string }> }) {
  const resolvedParams = use(params)
  const wallet = resolvedParams.wallet
  const [data, setData] = useState<AnalysisResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/analyze-wallet', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ wallet, limit: 100 }),
        })

        if (!response.ok) throw new Error(`Analysis failed: ${response.statusText}`)
        const result = await response.json()
        setData(result)
      } catch (err: any) {
        console.error('Analysis error:', err)
        setError(err.message || 'Failed to analyze wallet')
      } finally {
        setLoading(false)
      }
    }
    fetchAnalysis()
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">

        {/* 1. Wallet Overview - Always visible first */}
        <AnimatedSection>
          <WalletOverview data={data} />
        </AnimatedSection>

        {/* 2. Portfolio & Net Worth - User wants to see value first */}
        <AnimatedSection delay={50}>
          <Suspense fallback={<SectionSkeleton />}>
            <PortfolioSection
              portfolio={data.portfolio}
              summary={data.portfolio_summary}
              netWorth={data.net_worth}
            />
          </Suspense>
        </AnimatedSection>

        {/* 3. Trading Performance */}
        <AnimatedSection delay={100}>
          <Suspense fallback={<SectionSkeleton />}>
            <TradingPnLSection data={data.token_trading_pnl} />
          </Suspense>
        </AnimatedSection>

        {/* 4. Income Sources */}
        <AnimatedSection delay={150}>
          <Suspense fallback={<SectionSkeleton />}>
            <IncomeSourcesSection data={data.income_sources} />
          </Suspense>
        </AnimatedSection>

        {/* 5. Key Insights (Executive Summary) */}
        <AnimatedSection delay={200}>
          <KeyInsightsSection insights={data.key_insights} />
        </AnimatedSection>

        {/* 6. Surveillance Exposure - PRIMARY */}
        <AnimatedSection delay={250}>
          <SurveillanceExposureSection data={data.surveillance_exposure} />
        </AnimatedSection>

        {/* 7. Risk Assessment */}
        <AnimatedSection delay={300}>
          <Suspense fallback={<SectionSkeleton />}>
            <RiskAssessmentSection data={data.risk_assessment} />
          </Suspense>
        </AnimatedSection>

        {/* Grid Layout for temporal/geographic */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 8. Temporal Fingerprinting */}
          <AnimatedSection delay={350}>
            <Suspense fallback={<SectionSkeleton />}>
              <TemporalFingerprintSection
                activityPattern={data.activity_pattern}
                sleepWindow={data.sleep_window}
              />
            </Suspense>
          </AnimatedSection>

          {/* 9. Geographic Probability */}
          <AnimatedSection delay={400}>
            <Suspense fallback={<SectionSkeleton />}>
              <GeographicSection data={data.geographic_origin} />
            </Suspense>
          </AnimatedSection>
        </div>

        {/* 10. Behavioral & Profile Classification */}
        <AnimatedSection delay={450}>
          <Suspense fallback={<SectionSkeleton />}>
            <BehavioralClassificationSection
              trader={data.trader_classification}
              profile={data.profile_classification}
              reactionSpeed={data.reaction_speed}
            />
          </Suspense>
        </AnimatedSection>

        {/* 11. Mempool & Execution Analysis */}
        <AnimatedSection delay={500}>
          <Suspense fallback={<SectionSkeleton />}>
            <MempoolForensicsSection data={data.mempool_forensics} />
          </Suspense>
        </AnimatedSection>

        {/* 12. OpSec Failures - HIGH PRIORITY */}
        <AnimatedSection delay={550}>
          <Suspense fallback={<SectionSkeleton />}>
            <OpsecFailuresSection data={data.opsec_failures} />
          </Suspense>
        </AnimatedSection>

        {/* 13. Ego Network */}
        <AnimatedSection delay={600}>
          <Suspense fallback={<SectionSkeleton />}>
            <EgoNetworkSection data={data.ego_network} />
          </Suspense>
        </AnimatedSection>

        {/* 14. Advanced / Raw Data - Collapsed by default */}
        <AnimatedSection delay={650}>
          <Suspense fallback={<SectionSkeleton />}>
            <AdvancedDataSection
              transactionComplexity={data.transaction_complexity}
              notableTransactions={data.notable_transactions}
            />
          </Suspense>
        </AnimatedSection>

        {/* Footer Trust Signal */}
        <div className="text-center py-6 border-t border-border/40">
          <p className="text-xs text-muted-foreground">
            This analysis uses heuristic inference based on publicly available on-chain data.
            <br className="hidden sm:block" />
            Results are probabilistic estimates, not confirmed identities or financial advice.
          </p>
        </div>
      </main>
    </div>
  )
}
