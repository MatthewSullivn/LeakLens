'use client'

import { Suspense, lazy } from 'react'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { HeroSection, AnimatedWrapper } from '@/components/landing'

// Lazy load non-critical sections for better performance
const FeatureHighlights = lazy(() => 
  import('@/components/landing/feature-highlights').then(module => ({ 
    default: module.FeatureHighlights 
  }))
)

const InvestigationProcess = lazy(() => 
  import('@/components/landing/investigation-process').then(module => ({ 
    default: module.InvestigationProcess 
  }))
)

// Loading fallback for lazy-loaded sections
const FeatureHighlightsSkeleton = () => (
  <div className="py-16 sm:py-20 px-4 sm:px-6">
    <div className="max-w-6xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div 
            key={i} 
            className="h-64 rounded-[18px] bg-card/50 animate-pulse"
            style={{ animationDelay: `${i * 100}ms` }}
          />
        ))}
      </div>
    </div>
  </div>
)

const InvestigationProcessSkeleton = () => (
  <div className="py-16 sm:py-20 px-4 sm:px-6 border-t border-border/40">
    <div className="max-w-5xl mx-auto">
      <div className="text-center mb-12 sm:mb-16">
        <div className="h-10 w-64 mx-auto bg-card/50 rounded animate-pulse mb-4" />
        <div className="h-5 w-96 mx-auto bg-card/30 rounded animate-pulse" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="text-center">
            <div className="w-32 h-32 mx-auto rounded-full bg-card/50 animate-pulse mb-6" />
            <div className="h-6 w-32 mx-auto bg-card/50 rounded animate-pulse mb-3" />
            <div className="h-16 w-full bg-card/30 rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  </div>
)

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background animate-page-fade-in">
      <div className="animate-fade-in">
        <Navbar />
      </div>
      
      {/* Hero Section - Load immediately (critical above the fold) */}
      <HeroSection />

      {/* Feature Highlights - Lazy load for better initial performance */}
      <Suspense fallback={<FeatureHighlightsSkeleton />}>
        <FeatureHighlights />
      </Suspense>

      {/* Investigation Process - Lazy load for better initial performance */}
      <Suspense fallback={<InvestigationProcessSkeleton />}>
        <InvestigationProcess />
      </Suspense>

      {/* Footer with scroll animation */}
      <AnimatedWrapper direction="fade" threshold={0.2}>
        <Footer />
      </AnimatedWrapper>
    </div>
  )
}
