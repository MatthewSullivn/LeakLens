'use client'

import { useEffect, useState, use, useCallback, lazy, Suspense } from 'react'
import {
  // Types
  type AnalysisResult,
  // Navigation Components
  TopNavBar,
  LoadingState,
  ErrorState,
  // Section wrapper
  AnalysisSection,
  // Section Components (eagerly loaded - above fold)
  ExposureSummary,
  OneTransactionHighlight,
  WhyTrackable,
  LeakFlowDiagram,
  ReactionDonut,
  ActivityHeatmap,
  ExposureRadar,
  // Shared
  AnimatedSection,
  SectionSkeleton,
} from '@/components/analysis'
import { getCachedAnalysis, setCachedAnalysis } from '@/lib/analysis-cache'
import { Badge } from '@/components/ui/badge'
import { Copy, CheckCircle } from 'lucide-react'

// Lazy load below-fold components for performance
const WalletLinkage = lazy(() => import('@/components/analysis/wallet-linkage').then(m => ({ default: m.WalletLinkage })))
const OpsecFailuresSection = lazy(() => import('@/components/analysis/opsec-failures').then(m => ({ default: m.OpsecFailuresSection })))
const FinancialContext = lazy(() => import('@/components/analysis/financial-context').then(m => ({ default: m.FinancialContext })))
const ImplicationsSection = lazy(() => import('@/components/analysis/implications').then(m => ({ default: m.ImplicationsSection })))
const MitigationCTA = lazy(() => import('@/components/analysis/implications').then(m => ({ default: m.MitigationCTA })))
const SearchWalletElsewhere = lazy(() => import('@/components/analysis/search-wallet-elsewhere').then(m => ({ default: m.SearchWalletElsewhere })))

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
      {/* Navigation */}
      <TopNavBar 
        wallet={wallet} 
        copied={copied} 
        onCopy={copyAddress} 
        confidence={data.confidence}
        riskLevel={data.surveillance_exposure?.risk_level || 'MEDIUM'}
        data={data}
      />

      <main className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-6 sm:pb-8 space-y-10">

        {/* Page title: wallet address + SCAN COMPLETE / Confidence */}
        <div className="pb-2">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="font-mono text-xl sm:text-2xl font-semibold text-foreground break-all pr-2">
              {wallet}
            </h1>
            <button
              onClick={copyAddress}
              className="shrink-0 p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
              title="Copy address"
            >
              {copied ? <CheckCircle className="w-4 h-4 text-cyan-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <Badge className="bg-primary/20 text-primary border-primary/30 gap-1.5">
              <div className="w-2 h-2 rounded-full bg-primary" />
              SCAN COMPLETE
            </Badge>
            <Badge variant="outline" className="text-xs">
              {data.confidence} Confidence
            </Badge>
          </div>
        </div>

        {/* Section 1: Why wallets aren't anonymous */}
        <AnimatedSection>
          <AnalysisSection
            number={1}
            title="Why wallets aren't anonymous"
            education={
              <>
                Wallets are <strong className="text-foreground">pseudonymous, not anonymous</strong>. Every transaction is public and permanent. A single link (a CEX deposit, an NFT mint, or a social tie) can tie an address to a person. Surveillance firms and platforms (e.g. Arkham, Blockscanner, chain analytics) use this to cluster and label wallets. Below: your exposure at a glance and how one transaction can permanently reduce privacy.
              </>
            }
          >
            <ExposureSummary data={data} />
            <OneTransactionHighlight data={data} />
          </AnalysisSection>
        </AnimatedSection>

        {/* Section 2: How your activity is tracked & clustered */}
        <AnimatedSection delay={100}>
          <AnalysisSection
            number={2}
            title="How your activity is tracked & clustered"
            education={
              <>
                On-chain activity is tracked by clustering <strong className="text-foreground">flows, timing, and counterparties</strong>. Firms like Arkham, Nansen, and chain analytics label wallets and build graphs. Your timing, funding sources, cashout targets, and reaction patterns create a permanent fingerprint that can be linked across chains and to real-world data (e.g. from X or Blockscanner). The cards below show why this wallet is classifiable and how it links to others.
              </>
            }
          >
            <WhyTrackable data={data} />
            <LeakFlowDiagram data={data} />
            <ReactionDonut data={data} />
            <ActivityHeatmap data={data} />
            <ExposureRadar data={data} />
            <Suspense fallback={<SectionSkeleton />}>
              <WalletLinkage data={data.ego_network} />
            </Suspense>
          </AnalysisSection>
        </AnimatedSection>

        {/* Section 3: Your exposure in detail */}
        <AnimatedSection delay={200}>
          <AnalysisSection
            number={3}
            title="Your exposure in detail"
            education={
              <>
                This section breaks down the <strong className="text-foreground">specific links and failures</strong> that increase exposure (funding sources, cashouts, critical leaks) and how your wallet can appear on platforms like Arkham, 0xppl, or Blockscanner. Understanding these vectors is the first step to reducing them.
              </>
            }
          >
            <Suspense fallback={<SectionSkeleton />}>
              <OpsecFailuresSection data={data.opsec_failures} />
            </Suspense>
            <Suspense fallback={<SectionSkeleton />}>
              <SearchWalletElsewhere wallet={wallet} />
            </Suspense>
            <Suspense fallback={<SectionSkeleton />}>
              <FinancialContext
                tradingPnl={data.token_trading_pnl}
                netWorth={data.net_worth}
              />
            </Suspense>
          </AnalysisSection>
        </AnimatedSection>

        {/* Section 4: Reducing exposure (selective privacy) */}
        <AnimatedSection delay={300}>
          <AnalysisSection
            number={4}
            title="Reducing exposure (selective privacy)"
            education={
              <>
                <strong className="text-foreground">Selective privacy</strong> means reducing linkability where it matters, without giving up normal use. Data from X, Blockscanner, Arkham, and 0xppl shows how exposure is visible; the same levers (address hygiene, timing, and tooling) can be used to reduce it while keeping usability.
              </>
            }
          >
            <Suspense fallback={<SectionSkeleton />}>
              <ImplicationsSection />
            </Suspense>
            <Suspense fallback={<SectionSkeleton />}>
              <MitigationCTA />
            </Suspense>
          </AnalysisSection>
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
