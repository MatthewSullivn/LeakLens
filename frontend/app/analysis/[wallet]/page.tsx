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
import { Badge } from '@/components/ui/badge'
import { Copy, CheckCircle } from 'lucide-react'

// Lazy load below-fold components for performance
const WalletLinkage = lazy(() => import('@/components/analysis/wallet-linkage').then(m => ({ default: m.WalletLinkage })))
const OpsecFailuresSection = lazy(() => import('@/components/analysis/opsec-failures').then(m => ({ default: m.OpsecFailuresSection })))
const ExposureBreakdown = lazy(() => import('@/components/analysis/exposure-breakdown').then(m => ({ default: m.ExposureBreakdown })))
const FinancialContext = lazy(() => import('@/components/analysis/financial-context').then(m => ({ default: m.FinancialContext })))
const ImplicationsSection = lazy(() => import('@/components/analysis/implications').then(m => ({ default: m.ImplicationsSection })))
const MitigationCTA = lazy(() => import('@/components/analysis/implications').then(m => ({ default: m.MitigationCTA })))
const SearchWalletElsewhere = lazy(() => import('@/components/analysis/search-wallet-elsewhere').then(m => ({ default: m.SearchWalletElsewhere })))

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
            if (body?.details) message += ` — ${body.details}`
          } catch {
            /* body not JSON, use statusText */
          }
          throw new Error(message)
        }
        const result = await response.json()
        if (aborted) return
        setData(result)
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
        data={data}
      />

      <main className="relative w-full">
        {/* Header */}
        <div className="w-full px-6 sm:px-8 lg:px-12 pt-24 pb-6">
          <div className="max-w-[1800px] mx-auto">
            <div className="flex items-center gap-3 mb-3">
              <h1 className="font-mono text-base sm:text-lg font-medium text-foreground/90 break-all">
                {wallet}
              </h1>
              <button
                onClick={copyAddress}
                className="shrink-0 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
                title="Copy address"
              >
                {copied ? <CheckCircle className="w-4 h-4 text-cyan-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20 text-xs px-2.5 py-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mr-1.5" />
                Analysis Complete
              </Badge>
              <Badge variant="outline" className="text-xs px-2.5 py-0.5">
                {data.confidence} Confidence
              </Badge>
            </div>
          </div>
        </div>

        {/* Main Content - Full Width Grid */}
        <div className="w-full px-6 sm:px-8 lg:px-12 pb-16">
          <div className="max-w-[1800px] mx-auto">
            
            {/* Hero: Exposure Summary - Centered */}
            <AnimatedSection>
              <div className="max-w-5xl mx-auto mb-10">
                <ExposureSummary data={data} />
              </div>
            </AnimatedSection>

            {/* Analysis Grid - 2 columns, full width */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 xl:gap-8">
              
              {/* Left Column */}
              <div className="space-y-6 xl:space-y-8">
                <AnimatedSection delay={100}>
                  <Suspense fallback={<SectionSkeleton />}>
                    <FinancialContext data={data} />
                  </Suspense>
                </AnimatedSection>

                <AnimatedSection delay={200}>
                  <Suspense fallback={<SectionSkeleton />}>
                    <WalletLinkage data={data.ego_network} />
                  </Suspense>
                </AnimatedSection>

                <AnimatedSection delay={300}>
                  <Suspense fallback={<SectionSkeleton />}>
                    <ExposureBreakdown data={data} />
                  </Suspense>
                </AnimatedSection>
              </div>

              {/* Right Column */}
              <div className="space-y-6 xl:space-y-8">
                <AnimatedSection delay={125}>
                  <WhyTrackable data={data} />
                </AnimatedSection>

                <AnimatedSection delay={225}>
                  <Suspense fallback={<SectionSkeleton />}>
                    <OpsecFailuresSection data={data.opsec_failures} />
                  </Suspense>
                </AnimatedSection>

                <AnimatedSection delay={325}>
                  <Suspense fallback={<SectionSkeleton />}>
                    <SearchWalletElsewhere wallet={wallet} />
                  </Suspense>
                </AnimatedSection>
              </div>
            </div>

            {/* Bottom Narrative Sections */}
            <div className="mt-12 max-w-5xl mx-auto space-y-8">
              <AnimatedSection delay={400}>
                <Suspense fallback={<SectionSkeleton />}>
                  <ImplicationsSection />
                </Suspense>
              </AnimatedSection>

              <AnimatedSection delay={450}>
                <Suspense fallback={<SectionSkeleton />}>
                  <MitigationCTA />
                </Suspense>
              </AnimatedSection>
            </div>

            {/* Footer */}
            <div className="mt-16 pt-8 border-t border-border/20">
              <p className="text-xs text-muted-foreground/70 text-center max-w-2xl mx-auto leading-relaxed">
                This analysis uses heuristic inference based on publicly available on-chain data.
                Results are probabilistic estimates similar to those used by blockchain surveillance platforms.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
