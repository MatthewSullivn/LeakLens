'use client'

import { useEffect, useState, use, useCallback, lazy, Suspense } from 'react'
import {
  type AnalysisResult,
  TopNavBar,
  LoadingState,
  ErrorState,
  AnalysisSection,
  ExposureSummary,
  OneTransactionHighlight,
  AnimatedSection,
  SectionSkeleton,
} from '@/components/analysis'
import { getCachedAnalysis, setCachedAnalysis } from '@/lib/analysis-cache'
import { Badge } from '@/components/ui/badge'
import { Copy, CheckCircle } from 'lucide-react'

// Lazy load components for better performance
const WhyTrackable = lazy(() => import('@/components/analysis/why-trackable').then(m => ({ default: m.WhyTrackable })))
const LeakFlowDiagram = lazy(() => import('@/components/analysis/leak-flow-diagram').then(m => ({ default: m.LeakFlowDiagram })))
const ReactionDonut = lazy(() => import('@/components/analysis/reaction-donut').then(m => ({ default: m.ReactionDonut })))
const ActivityHeatmap = lazy(() => import('@/components/analysis/activity-heatmap').then(m => ({ default: m.ActivityHeatmap })))
const ExposureRadar = lazy(() => import('@/components/analysis/exposure-radar').then(m => ({ default: m.ExposureRadar })))
const WalletLinkage = lazy(() => import('@/components/analysis/wallet-linkage').then(m => ({ default: m.WalletLinkage })))
const OpsecFailuresSection = lazy(() => import('@/components/analysis/opsec-failures').then(m => ({ default: m.OpsecFailuresSection })))
const FinancialContext = lazy(() => import('@/components/analysis/financial-context').then(m => ({ default: m.FinancialContext })))
const ImplicationsSection = lazy(() => import('@/components/analysis/implications').then(m => ({ default: m.ImplicationsSection })))
const MitigationCTA = lazy(() => import('@/components/analysis/implications').then(m => ({ default: m.MitigationCTA })))
const SearchWalletElsewhere = lazy(() => import('@/components/analysis/search-wallet-elsewhere').then(m => ({ default: m.SearchWalletElsewhere })))
const PortfolioTreemap = lazy(() => import('@/components/analysis/portfolio-treemap').then(m => ({ default: m.PortfolioTreemap })))
const TransactionSparkline = lazy(() => import('@/components/analysis/transaction-sparkline').then(m => ({ default: m.TransactionSparkline })))

/** Minimum time to show the loading screen (ms) so it doesn’t flash away when data is fast/cached */
const MIN_LOADING_MS = 3000

export default function AnalysisPage({ params }: { params: Promise<{ wallet: string }> }) {
  const resolvedParams = use(params)
  const wallet = resolvedParams.wallet
  const [data, setData] = useState<AnalysisResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    const abortController = new AbortController()
    let aborted = false
    let minDelayTimerId: ReturnType<typeof setTimeout> | null = null
    const startTime = Date.now()

    const showResultAfterMinDelay = () => {
      const remaining = Math.max(0, MIN_LOADING_MS - (Date.now() - startTime))
      minDelayTimerId = setTimeout(() => {
        minDelayTimerId = null
        if (!aborted) setLoading(false)
      }, remaining)
    }

    const fetchAnalysis = async () => {
      const cached = retryCount === 0 ? getCachedAnalysis(wallet) : null
      if (cached) {
        setData(cached)
        setError('')
        showResultAfterMinDelay()
        return
      }
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
        if (!response.ok) {
          let message = `Analysis failed: ${response.statusText}`
          try {
            const body = await response.json() as { error?: string; details?: string }
            let msg = body?.error ?? ''
            if (msg && typeof msg === 'string' && (msg.startsWith('{') || msg.startsWith('['))) {
              try {
                const parsed = JSON.parse(msg) as { detail?: string; error?: string }
                msg = parsed.detail ?? parsed.error ?? msg
              } catch {
                /* keep msg as-is */
              }
            }
            if (msg) message = msg
            if (body?.details) message += ` - ${body.details}`
          } catch {
            /* body not JSON, use statusText */
          }
          throw new Error(message)
        }
        const result = await response.json()
        if (aborted) return
        setCachedAnalysis(wallet, result)
        setData(result)
        showResultAfterMinDelay()
      } catch (err: any) {
        if (err.name === 'AbortError') {
          aborted = true
          return
        }
        if (aborted) return
        
        // Log full error details in development
        if (process.env.NODE_ENV === 'development') {
          console.error('Analysis error:', err)
          console.error('Error name:', err.name)
          console.error('Error message:', err.message)
          console.error('Error stack:', err.stack)
        }
        
        // Provide more helpful error messages
        let errorMessage = err.message || 'Failed to analyze wallet'
        if (err.message === 'fetch failed' || err.name === 'TypeError') {
          errorMessage = 'Backend server is not responding. Please ensure the Python backend is running on http://localhost:8000'
        }
        
        setError(errorMessage)
      } finally {
        if (!aborted && !minDelayTimerId) setLoading(false)
      }
    }
    fetchAnalysis()

    return () => {
      aborted = true
      abortController.abort()
      if (minDelayTimerId) clearTimeout(minDelayTimerId)
    }
  }, [wallet, retryCount])

  const handleRetry = useCallback(() => {
    setError('')
    setLoading(true)
    setRetryCount((c) => c + 1)
  }, [])

  const copyAddress = useCallback(() => {
    navigator.clipboard.writeText(wallet)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [wallet])

  if (loading) return <LoadingState wallet={wallet} />
  if (error && !data) return <ErrorState error={error} wallet={wallet} onRetry={handleRetry} />
  if (!data) return <ErrorState error="No data received" wallet={wallet} onRetry={handleRetry} />

  return (
    <div className="min-h-screen bg-background">
      <TopNavBar 
        wallet={wallet} 
        copied={copied} 
        onCopy={copyAddress} 
        confidence={data.confidence}
        riskLevel={data.surveillance_exposure?.risk_level || 'MEDIUM'}
        data={data}
      />

      <main className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-6 pt-16 sm:pt-18 pb-8 space-y-5 sm:space-y-8">
        {/* Header */}
        <header className="pt-2">
          <div className="flex items-center gap-2">
            <h1 className="font-mono text-sm sm:text-lg font-medium text-foreground truncate">
              <span className="hidden sm:inline">{wallet}</span>
              <span className="sm:hidden">{wallet.slice(0, 6)}...{wallet.slice(-4)}</span>
            </h1>
            <button
              onClick={copyAddress}
              className="shrink-0 p-1 rounded text-muted-foreground hover:text-foreground transition-colors"
              title="Copy"
            >
              {copied ? <CheckCircle className="w-3.5 h-3.5 text-primary" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
          <div className="flex items-center gap-1.5 mt-1.5">
            <Badge className="bg-primary/15 text-primary border-primary/20 text-[9px] sm:text-[10px] py-0 gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              COMPLETE
            </Badge>
            <Badge variant="outline" className="text-[9px] sm:text-[10px] py-0 text-muted-foreground">
              {data.confidence}
            </Badge>
          </div>
        </header>

        {/* Section 1 */}
        <AnimatedSection>
          <AnalysisSection
            number={1}
            title="Why wallets aren't anonymous"
            education={<>Wallets are <strong className="text-foreground">pseudonymous</strong>. Every transaction is public and permanent.</>}
          >
            <ExposureSummary data={data} />
            <OneTransactionHighlight data={data} />
          </AnalysisSection>
        </AnimatedSection>

        {/* Section 2 */}
        <AnimatedSection delay={50}>
          <AnalysisSection
            number={2}
            title="How activity is tracked"
            education={<>Activity is tracked by clustering <strong className="text-foreground">flows, timing, and counterparties</strong>.</>}
          >
            <Suspense fallback={<SectionSkeleton />}>
              <WhyTrackable data={data} />
            </Suspense>
            
            <Suspense fallback={<SectionSkeleton />}>
              <LeakFlowDiagram data={data} />
            </Suspense>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              <Suspense fallback={<SectionSkeleton />}>
                <ReactionDonut data={data} />
              </Suspense>
              <Suspense fallback={<SectionSkeleton />}>
                <ExposureRadar data={data} />
              </Suspense>
            </div>
            
            <Suspense fallback={<SectionSkeleton />}>
              <TransactionSparkline data={data} />
            </Suspense>
            
            <Suspense fallback={<SectionSkeleton />}>
              <ActivityHeatmap data={data} />
            </Suspense>
            
            <Suspense fallback={<SectionSkeleton />}>
              <WalletLinkage data={data.ego_network} />
            </Suspense>
          </AnalysisSection>
        </AnimatedSection>

        {/* Section 3 */}
        <AnimatedSection delay={100}>
          <AnalysisSection
            number={3}
            title="Exposure details"
            education={<>Specific <strong className="text-foreground">links and failures</strong> that increase exposure.</>}
          >
            <Suspense fallback={<SectionSkeleton />}>
              <OpsecFailuresSection data={data.opsec_failures} />
            </Suspense>
            
            <Suspense fallback={<SectionSkeleton />}>
              <PortfolioTreemap data={data} />
            </Suspense>
            
            <Suspense fallback={<SectionSkeleton />}>
              <FinancialContext tradingPnl={data.token_trading_pnl} netWorth={data.net_worth} />
            </Suspense>
            
            <Suspense fallback={<SectionSkeleton />}>
              <SearchWalletElsewhere wallet={wallet} />
            </Suspense>
          </AnalysisSection>
        </AnimatedSection>

        {/* Section 4 */}
        <AnimatedSection delay={150}>
          <AnalysisSection
            number={4}
            title="Reducing exposure"
            education={<><strong className="text-foreground">Selective privacy</strong> reduces linkability without sacrificing usability.</>}
          >
            <Suspense fallback={<SectionSkeleton />}>
              <ImplicationsSection />
            </Suspense>
            <Suspense fallback={<SectionSkeleton />}>
              <MitigationCTA />
            </Suspense>
          </AnalysisSection>
        </AnimatedSection>

        {/* Footer */}
        <footer className="text-center pt-4 border-t border-border/20">
          <p className="text-[8px] sm:text-[9px] text-muted-foreground/50 max-w-sm mx-auto">
            Analysis based on publicly available on-chain data. Results are probabilistic estimates.
          </p>
        </footer>
      </main>
    </div>
  )
}
