'use client'

import { useState, useCallback, memo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Search, ArrowRight, Lock, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { isValidSolanaAddress } from '@/lib/utils'
import { DEMO_WALLET } from './constants'

export const HeroSection = memo(function HeroSection() {
  const router = useRouter()
  const [wallet, setWallet] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Trigger animations on mount
    const timer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  const handleAnalyze = useCallback(async () => {
    setError('')
    
    if (!wallet.trim()) {
      setError('Please enter a wallet address')
      return
    }

    if (!isValidSolanaAddress(wallet.trim())) {
      setError('Invalid Solana address format')
      return
    }

    setIsLoading(true)
    router.push(`/analysis/${wallet.trim()}`)
  }, [wallet, router])

  const handleDemoWallet = useCallback(() => {
    setIsLoading(true)
    router.push(`/analysis/${DEMO_WALLET}`)
  }, [router])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setWallet(e.target.value)
    setError('')
  }, [])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleAnalyze()
  }, [handleAnalyze])

  return (
    <section className="pt-32 pb-20 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto text-center">
        {/* Badge */}
        <div 
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border/60 bg-card/50 mb-8 transition-all duration-700 ease-out ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
          }`}
          style={{ transitionDelay: '0ms' }}
        >
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="text-xs uppercase tracking-widest text-muted-foreground">
            Solana Metadata Analytics Engine v2.0
          </span>
        </div>

        {/* Headline - Fixed width for LEAKS */}
        <h1 
          className={`text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight mb-6 leading-tight transition-all duration-700 ease-out ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
          style={{ transitionDelay: '150ms' }}
        >
          <span className="text-foreground block sm:inline">SEE WHAT YOUR</span>
          <span className="text-foreground whitespace-nowrap"> WALLET </span>
          <span className="text-gradient italic pr-4">LEAKS </span>
        </h1>

        {/* Subheadline */}
        <p 
          className={`text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 px-4 transition-all duration-700 ease-out ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
          style={{ transitionDelay: '300ms' }}
        >
          Advanced blockchain surveillance analytics for Solana. Identify IP leaks, 
          metadata exposure, and OpSec failures before they de-anonymize you.
        </p>

        {/* Wallet Input */}
        <div 
          className={`max-w-xl mx-auto px-2 transition-all duration-700 ease-out ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
          style={{ transitionDelay: '450ms' }}
        >
          <div className="relative flex flex-col sm:flex-row gap-3 p-2 rounded-xl bg-card/80 border border-border/60 backdrop-blur-sm">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                value={wallet}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Enter Solana Wallet Address"
                className="pl-12 h-14 text-base bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>
            <Button 
              onClick={handleAnalyze}
              disabled={isLoading}
              size="lg"
              className="h-14 px-6 sm:px-8 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold gap-2 transition-all duration-200 hover:scale-[1.02]"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Scanning...
                </>
              ) : (
                <>
                  Analyze Wallet
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>

          {/* Helper text */}
          <div 
            className={`flex items-center justify-center mt-3 px-2 transition-all duration-700 ease-out ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
            style={{ transitionDelay: '600ms' }}
          >
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Lock className="w-3 h-3 text-primary" />
              <span>End-to-end encrypted query</span>
            </div>
          </div>

          {/* Divider */}
          <div 
            className={`flex items-center gap-4 my-6 transition-all duration-700 ease-out ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
            style={{ transitionDelay: '750ms' }}
          >
            <div className="flex-1 h-px bg-border/60" />
            <span className="text-xs text-muted-foreground uppercase tracking-wider">or try a demo</span>
            <div className="flex-1 h-px bg-border/60" />
          </div>
            
          {/* Demo Wallet Button - More Prominent */}
          <button
            onClick={handleDemoWallet}
            disabled={isLoading}
            className={`group w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 border border-primary/30 hover:border-primary/60 hover:from-primary/20 hover:via-primary/10 hover:to-primary/20 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
            style={{ transitionDelay: '900ms' }}
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-foreground">Try Demo Wallet</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-card/80 border border-border/40">
              <code className="font-mono text-xs text-primary">
                {DEMO_WALLET.slice(0, 6)}...{DEMO_WALLET.slice(-4)}
              </code>
              <ArrowRight className="w-3.5 h-3.5 text-primary group-hover:translate-x-0.5 transition-transform" />
            </div>
          </button>

          {/* Error message */}
          {error && (
            <p className="mt-3 text-sm text-red-400 text-center animate-shake">{error}</p>
          )}
        </div>
      </div>
    </section>
  )
})

HeroSection.displayName = 'HeroSection'
