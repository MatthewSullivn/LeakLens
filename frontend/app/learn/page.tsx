'use client'

import { LeakLensNavbar } from '@/components/ui/resizable-navbar'
import { Footer } from '@/components/footer'
import { LearnHero, PrivacyStory, LearnCTA } from '@/components/learn'

export default function LearnPage() {
  return (
    <div className="min-h-screen bg-background animate-page-fade-in">
      <LeakLensNavbar />
      <main className="pt-20">
        <LearnHero />
        <PrivacyStory />
        <LearnCTA />
      </main>
      <Footer />
    </div>
  )
}
